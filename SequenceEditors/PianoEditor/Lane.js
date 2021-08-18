import LaneStep from "./LaneStep.js";
import Note from "./Note.js";

/**
 * Each lane is a row to input notes of a single pitch
 */
 export default class Lane {
    div;
    pitch;
    name;
    /** @type {Note[]} */
    notes = [];
    /** @type {LaneStep[]} */
    steps = [];

    /**
     * Constructs a Lane
     * @param {PianoEditor} pianoEditor
     * @param {number} pitch - a pitch number
     * @param {string} name - The name of the note (ex: "C4")
     */
    constructor(pianoEditor, pitch, name){
        const WHITE_KEYS = [0,2,4,5,7,9,11];
        this.pitch = pitch;
        this.name = name;

        let pitchClass = Tonal.Midi.midiToNoteName(pitch, { pitchClass: true });
        let lane = document.createElement("div");
            lane.classList.add("noteLane");
            lane.classList.add(pitchClass);
        this.div = lane;

        let keyStickyContainer = document.createElement("div");
            keyStickyContainer.classList.add("pianoKeyStickyContainer");
            keyStickyContainer.classList.add(WHITE_KEYS.includes(pitch % 12) ? "whiteKey" : "blackKey");

        let key = document.createElement("div");
            key.classList.add( "pianoKey" );
            key.classList.add( WHITE_KEYS.includes(pitch % 12) ? "whiteKey" : "blackKey" );
            key.classList.add(pitchClass);
            if( name ) key.innerText = name;
            key.addEventListener("mousedown", (ev) => {
                key.classList.add("playing");
                Playback.play({
                    notes: [{
                        pitch: this.pitch,
                        startTime: 0,
                        endTime: 2,
                        isDrum: pianoEditor.isDrumSequence
                    }],
                    totalTime: 2
                });
                let eh = () => {
                    Playback.stop();
                    key.classList.remove("playing");
                }
                document.addEventListener("mouseup", eh, {once: true});
            });

        if( pitch==pianoEditor.midiMin) key.classList.add("bottomKey");
        if( pitch==pianoEditor.midiMax) key.classList.add("topKey");

        keyStickyContainer.append(key);

        let laneBkg = document.createElement("div");
            laneBkg.classList.add("laneBkg");
            laneBkg.classList.add(pitchClass);

            let laneStepsContainer = document.createElement("div");
            laneStepsContainer.classList.add("laneStepsContainer");
            laneStepsContainer.addEventListener("mouseover", () => {
                key.classList.add("highlighted");
            });
            laneStepsContainer.addEventListener("mouseleave", () => {
                key.classList.remove("highlighted");
            });

        lane.append(keyStickyContainer, laneBkg, laneStepsContainer);
        pianoEditor.div.querySelector(".pianoRollWindow").prepend(lane);

        for(let i=0; i<pianoEditor.numSteps; i++){
            let step = new LaneStep(this, i, pianoEditor);
            this.steps.push(step);
        }
    }

    /**
     * Adds a note to the given lane.
     * (There is no pitch argument since the lane determines the pitch)
     * @param {PianoEditor} editor - the piano editor containing the {@link Lane}
     * @param {number} start - start step
     * @param {number} end - end step
     * @param {boolean} isDrum - if it is a drum note
     * @param {number} velocity - note velocity (0 <= vel <= 127)
     */
    addNote(editor, start, end, isDrum, velocity){
        let note = new Note(this.pitch, start, end, isDrum, velocity);
        let noteDiv = note.createDiv(editor, this);
        this.notes.push(note);
        this.steps[start].div.append(noteDiv);
    }

    /**
     * Removes a {@link Note} from the lane.
     * @param {Note} note
     */
    removeNote(note){
        this.notes = this.notes.filter( el => el!=note );
        note.div.remove();
    }

    /**
     * Delete all notes from the lane.
     */
    clear(){
        this.notes.forEach( note => this.removeNote(note) );
    }
}