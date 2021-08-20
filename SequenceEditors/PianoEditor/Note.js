import Lane from "./Lane.js";

/**
 * A class representing a single Note.
 * Note's end position is exclusive. For ex:
 * A note at the beggining of a bar which lasts
 * for one step has `start=0` and `end=1`.
 */
export default class Note {
    div;
    pitch;
    start;
    end;
    velocity;
    isDrum;

    /**
     * Constructs a Note
     * @param {number} pitch
     * @param {number} start
     * @param {number} end
     * @param {boolean} isDrum
     * @param {number} velocity
     */
    constructor(pitch, start, end, isDrum, velocity=100){
        this.pitch = pitch;
        this.start = start;
        this.end = end;
        this.isDrum = isDrum;
        this.velocity = velocity;
    }

    /**
     * Create and returns the <div> that will be used
     * display the Note.
     * @param {Lane} lane - the lane which will contain the Note
     * @returns {Element}
     */
    createDiv(editor, lane){
        let start = this.start;
        let end = this.end;
        let diff = end-start;

        let length = (end-start)*100;

        let noteDiv = document.createElement("div");
            noteDiv.classList.add("pianoEditorNote");
            noteDiv.style.width = length+"%";
            noteDiv.addEventListener("mousedown", (ev) => {
                editor.clickOnNote(this, ev);
                ev.preventDefault();
                ev.stopPropagation();
            });
        noteDiv.addEventListener("contextmenu", e => e.preventDefault() );
        this.div = noteDiv;
        return noteDiv;
    }
}