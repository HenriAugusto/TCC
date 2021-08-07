import Lane from "./Lane.js";

export default class Note {
    div;
    pitch;
    start;
    end;
    isDrum;

    constructor(pitch, start, end, isDrum, velocity=100){
        this.pitch = pitch;
        this.start = start;
        this.end = end;
        this.isDrum = isDrum;
        this.velocity = velocity;
    }

    createDiv(lane){
        let start = this.start;
        let end = this.end;
        let diff = end-start;

        let length = (end-start)*100;

        let noteDiv = document.createElement("div");
            noteDiv.classList.add("pianoEditorNote");
            noteDiv.style.width = length+"%";
        let deleteNoteFunc = lane.removeNote.bind(lane, this);
            noteDiv.addEventListener("mousedown", (ev) => {
                deleteNoteFunc.call();
                ev.preventDefault();
                ev.stopPropagation();
            });
        this.div = noteDiv;
        return noteDiv;
    }
}