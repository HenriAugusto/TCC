import LaneStep from "./LaneStep.js"
import Note from "./Note.js"

/**
 * Each lane is a row to input notes of a single pitch
 */
 export default class Lane {
    div;
    pitch;
    name;
    /**
     * Two-dimensional array.Contains arrays of type `[noteStart, noteEnd]`
     * Observe that `noteEnd` is exclusive. For example:
     * A note that right on the beggining of a sequence that occupies only
     * a single step `[0, 1]`, not `[0, 0]`.
     * @type {number[][]}
     */
    notes = [];
    /** @type {LaneStep[]} */
    steps = [];
    /* Notice we don't store an editor reference to save memory.
       Instead we pass it down from PianoEditor to LaneStep */

    constructor(pianoEditor, pitch, name){
        const WHITE_KEYS = [0,2,4,5,7,9,11];
        this.pitch = pitch;
        this.name = name;

        let pitchClass = Tonal.Midi.midiToNoteName(pitch, { pitchClass: true });
        let lane = document.createElement("div");
            lane.classList.add("noteLane");
            lane.classList.add(pitchClass);
        this.div = lane;

        let key = document.createElement("div");
            key.classList.add( "pianoKey" );
            key.classList.add( WHITE_KEYS.includes(pitch % 12) ? "whiteKey" : "blackKey" );
            key.classList.add(pitchClass);
            if( name ) key.innerText = name;

        if( pitch==pianoEditor.midiMin) key.classList.add("bottomKey");
        if( pitch==pianoEditor.midiMax) key.classList.add("topKey");

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

        lane.append(key, laneBkg, laneStepsContainer);
        pianoEditor.div.querySelector(".pianoRollWindow").prepend(lane);

        for(let i=0; i<pianoEditor.numSteps; i++){
            let step = new LaneStep(this, i, pianoEditor);
            this.steps.push(step);
        }
    }

    /**
     * Adds a note to the given lane.
     * (There is no pitch argument since the lane determines the pitch)
     * @param {number} start
     * @param {number} end
     */
    addNote(start, end, isDrum, velocity){
        let note = new Note(this.pitch, start, end, isDrum, velocity);
        let noteDiv = note.createDiv(this);
        this.notes.push(note);
        this.steps[start].div.append(noteDiv);
    }

    removeNote(note){
        this.notes = this.notes.filter( el => el!=note );
        note.div.remove();
    }
}