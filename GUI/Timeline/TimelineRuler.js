class TimelineRuler {
    timeline;
    snap = 4;
    playbackLoop;

    constructor(timeline){
        this.timeline = timeline;
        this.addRulerSteps();
    }

    addRulerSteps(){
        let tl = this.timeline;
        let tln = this.timeline.node;
        let container = document.createElement("div");
            container.classList.add("timelineRuler");
        for(let i = 0; i < tl.steps; i++){
            let step = document.createElement("div");
                step.classList.add("timelineRulerStep");
                step.classList.add("mod16_"+(i % 16));
                step.classList.add("mod64_"+(i % 64));
            let snapStep = Math.round(i/this.snap)*this.snap;
                snapStep  = Math.min(tl.steps-1, snapStep);
            let pos = snapStep;
            step.addEventListener("click", () => {
                let seq = SequenceUtils.startingAt(MAIN_TIMELINE.timelineToNoteSequence(), snapStep);
                Playback.play(seq);
                let interval = 1000*60/(Playback.tempo*4); //4 steps per quarter note
                this.playbackLoop = setInterval(() => {
                    let ph = container.querySelectorAll(".playhead");
                    ph.forEach( x => {
                        x.classList.remove("playhead");
                    });
                    try{
                        container.children[pos++].classList.add("playhead");
                    } catch(e) {
                        clearInterval(this.playbackLoop);
                    }

                } , interval);
            });
            step.addEventListener("mouseenter", (ev) => {
                container.children[snapStep].classList.add("mouseOver");
            });
            step.addEventListener("mouseleave", (ev) => {
                let h = container.querySelectorAll(".timelineRulerStep.mouseOver");
                h.forEach( x => {
                    x.classList.remove("mouseOver");
                })
            });
            container.append(step);
        }
        tln.append(container);
    }
}