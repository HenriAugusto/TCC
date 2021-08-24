import Lane from "./Lane.js";
import Note from "./Note.js";

const WHITE_KEYS = [0,2,4,5,7,9,11];
var CSS_INITIALIZED = false;

/**
 * A Piano Roll {@link NoteSequence} editor.
 */
export default class PianoEditor {
    div;
    zIndex=1;
    midiMin = 21; //A0, piano lowest note
    midiMax = 108; //C8, piano highest note
    lanes = [];
    /** Not to be confused with {@link INote}'s quantization info */
    numSteps = 64;
    notePreview = false;
    mouseDownStepIndex;
    mouseOverStepIndex;
    originalSequence;
    isDrumSequence;
    keydownListener = this.keydown.bind(this);
    selection = {
        notes: [],
        selecting: false,
        mouseStartEvent: null,
        mouseTargetLaneStep: null
    };

    constructor(){
        if(!CSS_INITIALIZED){
            initializeCSS();
        }
        this.div = document.createElement("div");
        this.div.classList.add("PianoEditor")
        this.hide();

        let bkg = document.createElement("div");
            bkg.classList.add("pianoEditorBkg");

        let editorWindow = document.createElement("div");
            editorWindow.classList.add("pianoEditorWindow");

        let pianoRollWindow = document.createElement("div");
            pianoRollWindow.classList.add("pianoRollWindow");

        editorWindow.append( this.createMenu(), pianoRollWindow);

        this.div.append(bkg, editorWindow);

        this.createLanes();

        document.querySelector("body").prepend(this.div);
        this.addKeyboardListeners();
    }

    createLanes(){
        this.lanes = [];
        Tonal.Range.chromatic([this.midiMin, this.midiMax]).forEach( note => {
            let pitch = Tonal.Midi.toMidi(note);
            let lane = new Lane(this, pitch, note.startsWith("C") ? note : "");
            this.lanes.push( lane );
        });
    }

    createMenu(){
        let editorMenu = document.createElement("div");
            editorMenu.classList.add("pianoEditorMenu");

        let playBtn = document.createElement("button");
            playBtn.classList.add("pianoEditorBtn", "playBtn");
            playBtn.addEventListener("click", this.play.bind(this) );
            playBtn.innerText = "Play";
        let stopBtn = document.createElement("button");
            stopBtn.classList.add("pianoEditorBtn", "stopBtn");
            stopBtn.addEventListener("click", Playback.stop );
            stopBtn.innerText = "Stop";
        let applyBtn = document.createElement("button");
            applyBtn.classList.add("pianoEditorBtn", "applyBtn");
            applyBtn.innerText = "Apply";
        let cancelBtn = document.createElement("button");
            cancelBtn.classList.add("pianoEditorBtn", "cancelBtn");
            cancelBtn.innerText = "Cancel";
        editorMenu.append(cancelBtn, applyBtn, stopBtn, playBtn);
        return editorMenu;
    }

    /**
     * Edits a note sequence
     * @param {INoteSequence} seq
     * @returns {Promise<INoteSequence>|Promise<void>} - If the user
     * applies the changes the Promise is resolved with the note sequence.
     * If the user cancels, a promise is resolved without any argument.
     */
    edit(seq=undefined){
        this.originalSequence = mm.sequences.clone(seq);
        this.show();
        if(seq) this.loadSequence(seq);
        // remove all listeners
        let applyBtn = this.div.querySelector(".applyBtn");
        let applyBtnClone = applyBtn.cloneNode(true);
            applyBtn.replaceWith(applyBtnClone);
            applyBtn = applyBtnClone;

        let cancelBtn = this.div.querySelector(".cancelBtn");
        return new Promise( (resolve, reject) => {
            applyBtn.addEventListener("click", () => {
                this.hide();
                resolve( this.buildNoteSequence() );
            });
            cancelBtn.addEventListener("click", () => {
                this.hide();
                reject("User canceled");
            });
        });
    }

    loadSequence(seq){
        this.clear();
        this.resize(seq.totalQuantizedSteps);
        this.isDrumSequence = SequenceUtils.isDrumSequence(seq);
        seq.notes.forEach( note => {
            let lane = this.lanes.filter( l => l.pitch == note.pitch)[0];
            lane.addNote(this, note.quantizedStartStep, note.quantizedEndStep, note.isDrum);
        });
        let allNotes = [];
        this.lanes.forEach( lane => {
           allNotes = allNotes.concat(lane.notes);
        });
        let firstNote = allNotes.reduce( (first, note) => {
            return first.start >= note.start ? note : first;
        });
        this.scrollToNote(firstNote);
    }

    /**
     * Delete all notes from the editor.
     */
    clear(){
        this.lanes.forEach( lane => lane.clear() );
    }

    buildNoteSequence(){
        let noteSeq = {
            notes: [],
            quantizationInfo: {stepsPerQuarter: 4},
            totalQuantizedSteps: this.numSteps
        }
        this.lanes.forEach( lane => {
            lane.notes.forEach( note => {
                noteSeq.notes.push({
                    pitch: note.pitch,
                    quantizedStartStep: note.start,
                    quantizedEndStep: note.end,
                    isDrum: note.isDrum,
                    velocity: note.velocity,
                });
            })
        });
        return noteSeq;
    }

    play(){
        Playback.play( this.buildNoteSequence() );
    }

    hide(){
        this.removeKeyboardListeners();
        this.div.style.display = "none";
    }

    show(){
        this.addKeyboardListeners();
        this.div.style.display = "";
    }

    mouseDownOnStep(downEv, laneStep, lane){
        // left button
        if( downEv.buttons & 1){
            this.mouseDownStepIndex = laneStep.step;
            this.notePreview = true;
            this.deselectAllNotes();
        }
        //right button
        if (downEv.buttons & 2){
            this.selection.selecting = true;
            this.selection.mouseStartEvent = downEv;
            let selectionRect = document.createElement("div");
                selectionRect.classList.add("selectionRectangle");
                selectionRect.style.left = downEv.pageX+"px";
                selectionRect.style.top = downEv.pageY+"px";
                selectionRect.style.width = "1px";
                selectionRect.style.height = "1px";
            /* First We make notes ignore our mouse events otherwise the
             * .pianoEditorNote <div>s would be captured (since they have
             * a parent .laneStep) and thus their parent laneStep would be
             * considered (mistakingly) the target laneStep for the selection
             * rectangle.
             *
             * That means that if you release the right button over a
             * .pianoEditorNote's <div>, the `mousemove` event would be fired
             * in the starting laneStep of that note.
             */
            document.querySelectorAll(".pianoEditorNote").forEach( n => n.classList.add("ignoreMouse") );

            document.querySelector("body").append(selectionRect);

            window.addEventListener("contextmenu", (upEv) => {
                document.querySelectorAll(".pianoEditorNote.ignoreMouse").forEach( n => n.classList.remove("ignoreMouse") );
                upEv.preventDefault();
                selectionRect.remove();
                if(!upEv.shiftKey) this.deselectAllNotes();
                let targetLaneStep = this.selection.mouseTargetLaneStep;
                let notesToBeSelected = this.getNotesInRectangle(laneStep, targetLaneStep );
                this.selectNotes(notesToBeSelected);
                this.selection.selecting = false;
            }, {once: true});
        }
    }

    mouseUpOnStep(ev, laneStep, lane){
        if(!this.notePreview) return;
        this.notePreview = false;
        this.resetNotePreview();
        let stepStart = Math.min(this.mouseDownStepIndex, laneStep.step)
        let stepEnd = Math.max(this.mouseDownStepIndex, laneStep.step)
        lane.addNote(this, stepStart, stepEnd+1, this.isDrumSequence);
    }

    mouseOverStep(ev, laneStep, lane){
        // holding left button:
        if( ev.buttons & 1 ){
                if(!this.notePreview) return;
                this.resetNotePreview();

                this.mouseOverStepIndex = laneStep.step;
                let diff = laneStep.step-this.mouseDownStepIndex;
                let unitDiff = diff >= 0 ? 1 : -1;

                for(let i=this.mouseDownStepIndex; i!=laneStep.step+unitDiff ; i+=unitDiff ){
                    lane.steps[i].div.classList.add("preview");
                }
        }
        if( ev.buttons & 2 && this.selection.selecting ){
            this.selection.mouseTargetLaneStep = laneStep;
        }
    }

    mouseMoveStep(ev, laneStep, lane){
        // holding right button:
        if( ev.buttons & 2 && this.selection.selecting){
            if(this.selection.selecting){
                let downEv = this.selection.mouseStartEvent;
                let selectionRect = document.querySelector(".selectionRectangle");
                let topLeft = {
                    "x": Math.min(downEv.pageX, ev.pageX ),
                    "y": Math.min(downEv.pageY, ev.pageY )
                };
                let bottomRight = {
                    "x": Math.max(downEv.pageX, ev.pageX ),
                    "y": Math.max(downEv.pageY, ev.pageY )
                };
                selectionRect.style.top = topLeft.y+"px";
                selectionRect.style.left = topLeft.x+"px";
                selectionRect.style.width = (bottomRight.x-topLeft.x)+"px";
                selectionRect.style.height = (bottomRight.y-topLeft.y)+"px";
            }
        }
    }

    addKeyboardListeners(){
        window.addEventListener("keydown", this.keydownListener);
    }

    removeKeyboardListeners(){
        window.removeEventListener("keydown", this.keydownListener);
    }

    keydown(ev){
        switch (ev.code) {
            case "Space":
                ev.preventDefault();
                this.play();
                break;
            case "Delete":
                    this.deleteSelectedNotes();
                    break;
            case "Escape":
                this.div.querySelector(".cancelBtn").click();
                break;
            case "ArrowUp":
                let transposedUpNotes = this.transpose( this.getSelectedNotes(), 1 );
                this.setSelection(transposedUpNotes);
                ev.preventDefault();
                break;
            case "ArrowDown":
                let transposedDownNotes = this.transpose( this.getSelectedNotes(), -1 );
                this.setSelection(transposedDownNotes);
                ev.preventDefault();
                break;
            case "ArrowLeft":
                let shiftedLeft = this.shiftNotes( this.getSelectedNotes(), -1 );
                this.setSelection(shiftedLeft);
                ev.preventDefault();
                break;
            case "ArrowRight":
                let shiftedRight = this.shiftNotes( this.getSelectedNotes(), 1 );
                this.setSelection(shiftedRight);
                ev.preventDefault();
                break;
            default:
                break;
        }
    }

    resetNotePreview(){
        this.div.querySelectorAll(".laneStep.preview").forEach( x => {
            x.classList.remove("preview");
        })
    }

    /**
     * Scrolls the Piano Roll so the given note is visible
     * @param {Note} note
     */
    scrollToNote(note, smooth=false){
        note.div.scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
            block: "center"
        });
    }

    resize(numSteps){
        if(numSteps == this.numSteps) return;
        console.log("resizing "+numSteps);
        this.numSteps = numSteps;
        this.lanes.forEach( lane => lane.div.remove() );
        this.createLanes();
    }

    /**
     * Handles a click on a {@link Note}
     * @param {Note} note - the clicked note
     * @param {MouseEvent} ev - the mouse event object
     */
    clickOnNote(note, ev){
        console.log(ev);
        if(!ev.shiftKey) this.deselectAllNotes();
        this.selectNote(note);
    }


    /**
     * Set the selection to the specified notes.
     * @param {Note[]} notes
     */
    setSelection(notes){
        this.deselectAllNotes();
        this.selectNotes(notes);
    }

    /**
     * Add the given note to the selection.
     * @param {Note} note
     */
    selectNote(note){
        this.selection.notes.push(note);
        note.div.classList.add("selected");
    }

    /**
     * Add all the given notes to the selection.
     * @param {Note[]} notes
     */
    selectNotes(notes){
        notes.forEach( n => this.selectNote(n) );
    }

    /**
     * Get all selected notes
     * @returns {Note[]} - An array containing the selected notes
     */
    getSelectedNotes(){
        return [...this.selection.notes];
    }

    /**
     * Deselects the given note
     * @param {Note} note
     */
    deselectNote(note){
        this.selection.notes = this.selection.notes.filter( x => x != note);
        note.div.classList.remove("selected");
    }

    /**
     * Deselects all selected notes
     */
    deselectAllNotes(){
        this.selection.notes.forEach( note => note.div.classList.remove("selected") );
        this.selection.notes = [];
    }

    /**
     * Delete all the selected notes
     */
    deleteSelectedNotes(){
        this.selection.notes.forEach( (note) => {
            this.lanes.forEach( (lane) => {
                if( note.pitch == lane.pitch ){
                    lane.removeNote(note);
                }
            });
        });
    }

    /**
     * Get all notes that are in a rectangular area. This area is given by two
     * {@link LaneStep} objects.
     * @param {LaneStep} laneStep1
     * @param {LaneStep} laneStep2
     * @returns {Note[]}
     */
    getNotesInRectangle(laneStep1, laneStep2){
        let out = [];
        let lane1 = this.lanes.find( l => l.steps.includes(laneStep1) );
        let lane2 = this.lanes.find( l => l.steps.includes(laneStep2) );

        let stepMin = Math.min( laneStep1.step, laneStep2.step);
        let stepMax = Math.max( laneStep1.step, laneStep2.step);
        let pitchMin = Math.min( lane1.pitch, lane2.pitch);
        let pitchMax = Math.max( lane1.pitch, lane2.pitch);
        this.lanes.forEach( l => {
            l.notes.forEach( n => {
                if(    n.pitch >= pitchMin
                    && n.pitch <= pitchMax
                    && n.start >= stepMin
                    && n.end-1   <= stepMax){
                        out.push(n);
                }
            });
        });
        return out;
    }

    /**
     * Transpose the given notes
     * @param {Note[]} notes - the notes to be transposed
     * @param {number} amount - how much semitones to transpose
     * @return {Note[]} - An array with the new, transposed notes.
     */
    transpose( notes , amount ){
        let transposed = [];
        notes.forEach( transpNote => {
            let sourceLane = this.lanes.find( lane => lane.pitch === transpNote.pitch );
            let targetLane = this.lanes.find( lane => lane.pitch === transpNote.pitch+amount );
            if( targetLane ){
                sourceLane.notes.forEach( laneNote => {
                    if( transpNote.start === laneNote.start &&
                        transpNote.end === laneNote.end){
                        sourceLane.removeNote(transpNote);
                        let newNote = targetLane.addNote(this,
                                                         transpNote.start,
                                                         transpNote.end,
                                                         this.isDrumSequence,
                                                         transpNote.velocity);
                        transposed.push(newNote);
                    };
                });
            }
        });
        console.log( this.selection.notes);
        return transposed;
    }

    /**
     * Shift all notes to the left or right.
     * If any note would fall outside of the sequence, nothing happens.
     * @param {*} notes
     * @param {*} amount
     * @return {Note[]} - An array with the new, shifted notes.
     */
    shiftNotes( notes, amount ){
        let shifted = [];

        let leftmostNote = notes.reduce( (min, n) => min.start <= n.start ? min : n);
        if( leftmostNote.start+amount < 0) return notes;

        let rightmostNote = notes.reduce( (max, n) => max.end >= n.end ? max : n);
        if( rightmostNote.end+amount > this.numSteps) return notes;

        notes.forEach( shiftedNote => {
            let lane = this.lanes.find( lane => lane.pitch === shiftedNote.pitch );
            lane.removeNote(shiftedNote);
            let newNote = lane.addNote(this,
                                  shiftedNote.start+amount,
                                  shiftedNote.end+amount,
                                  this.isDrumSequence,
                                  shiftedNote.velocity);
            shifted.push(newNote);
        });
        return shifted;
    }
}

function initializeCSS(){
    CSS_INITIALIZED = true;
    let fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", "SequenceEditors/PianoEditor/PianoEditor.css");
    document.getElementsByTagName("head")[0].appendChild(fileref);
}