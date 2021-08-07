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
        let applyBtn = document.createElement("button");
            applyBtn.classList.add("pianoEditorBtn", "applyBtn");
            applyBtn.innerText = "Apply";
        editorMenu.append(playBtn, applyBtn);
        return editorMenu;
    }

    edit(seq=undefined){
        this.originalSequence = mm.sequences.clone(seq);
        this.show();
        if(seq) this.loadSequence(seq);
        let applyBtn = this.div.querySelector(".applyBtn");
        return new Promise( (resolve, reject) => {
            applyBtn.addEventListener("click", () => {
                this.hide();
                resolve( this.buildNoteSequence() );
            });
        });
    }

    loadSequence(seq){
        this.resize(seq.totalQuantizedSteps);
        this.isDrumSequence = SequenceUtils.isDrumSequence(seq);
        seq.notes.forEach( note => {
            let lane = this.lanes.filter( l => l.pitch == note.pitch)[0];
            lane.addNote(note.quantizedStartStep, note.quantizedEndStep, note.isDrum);
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
        this.div.style.display = "none";
    }

    show(){
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
        lane.addNote(stepStart, stepEnd+1, this.isDrumSequence);
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
}


/**
 * A single step inside a Lane.
 */
class LaneStep {
    div;
    step;

    constructor(lane, step, editor){
        this.step = step;
        this.div = document.createElement("div");
        this.div.classList.add("laneStep");
        let w = `${100/editor.numSteps}%`;
        this.div.style.width = w;

        /* we must add a separator because the notes are going to get a
           x*100% width. So we must not use borders on our laneStep divs
           because the % unit is always based on the content box's width */
        let separator = document.createElement("div");
            separator.style.width = "0";
            separator.style.outline = "black solid 1px";

        lane.div.querySelector(".laneStepsContainer").append(this.div, separator);
        this.addEventHandlers(editor, lane);
    }

    addEventHandlers(editor, lane){
        this.div.addEventListener("mousedown", (ev) => {
            if(ev.which===1){
                editor.mouseDownOnStep(ev, this, lane);
            }
        });
        this.div.addEventListener("mouseover", (ev) => {
            if(ev.which===1){
                editor.mouseOverStep(ev, this, lane);
            }
        });
        this.div.addEventListener("mouseup", (ev) => {
            if(ev.which===1){
                editor.mouseUpOnStep(ev, this, lane);
            }
        });
    }
}


function initializeCSS(){
    CSS_INITIALIZED = true;
    let fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", "SequenceEditors/PianoEditor.css");
    document.getElementsByTagName("head")[0].appendChild(fileref);
}