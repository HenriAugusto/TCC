import Lane from "./Lane.js";
import Note from "./Note.js";

/**
 * A single step inside a Lane.
 */
 export default class LaneStep {
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
            separator.classList.add("laneStepSeparator");
            separator.classList.add( "mod"+step % 4);

        lane.div.querySelector(".laneStepsContainer").append(this.div, separator);
        this.addEventHandlers(editor, lane);
    }

    /**
     * Add all the event handlers related to that LaneStep.
     * The events will be redirected to the {@link PianoEditor}.
     * Those events are going to be used to determine where to
     * place {@link Note}s.
     * @param {PianoEditor} editor
     * @param {Lane} lane
     */
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