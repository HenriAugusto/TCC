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
    selectedNotes = [];

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

    mouseDownOnStep(ev, laneStep, lane){
        this.mouseDownStepIndex = laneStep.step;
        this.notePreview = true;
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
        if(!this.notePreview) return;
        this.resetNotePreview();

        this.mouseOverStepIndex = laneStep.step;
        let diff = laneStep.step-this.mouseDownStepIndex;
        let unitDiff = diff >= 0 ? 1 : -1;

        for(let i=this.mouseDownStepIndex; i!=laneStep.step+unitDiff ; i+=unitDiff ){
            lane.steps[i].div.classList.add("preview");
        }
    }

    addKeyboardListeners(){
        window.addEventListener("keydown", this.keydownListener);
    }

    removeKeyboardListeners(){
        window.removeEventListener("keydown", this.keydownListener);
    }

    keydown(ev){
        if(ev.code==="Space"){
            this.play();
        }
        switch (ev.code) {
            case "Space":
                this.play();
                break;
            case "Delete":
                    this.deleteSelectedNotes();
                    break;
            case "Escape":
                this.div.querySelector(".cancelBtn").click();
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
    async scrollToNote(note, smooth=false){
        /* We wait a little just in case edit() is called
           right before the constructor. In thoses cases
           the editor would not be visible yet when this method
           runs, which i cannot explain. */
        await new Promise(resolve => setTimeout(resolve, 100));
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
     * Selects the given note
     * @param {Note} note
     */
    selectNote(note){
        this.selectedNotes.push(note);
        note.div.classList.add("selected");
    }

    /**
     * Deselects the given note
     * @param {Note} note
     */
    deselectNote(note){
        this.selectedNotes = this.selectedNotes.filter( x => x != note);
        note.div.classList.remove("selected");
    }

    /**
     * Deselects all selected notes
     */
    deselectAllNotes(){
        this.selectedNotes.forEach( note => note.div.classList.remove("selected") );
        this.selectedNotes = [];
    }

    /**
     * Delete all the selected notes
     */
    deleteSelectedNotes(){
        this.selectedNotes.forEach( (note) => {
            this.lanes.forEach( (lane) => {
                if( note.pitch == lane.pitch ){
                    lane.removeNote(note);
                }
            });
        });
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