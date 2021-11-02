class TimelineRuler {
    div;
    timeline;
    snap = 4;
    playbackLoop;
    startingPos;
    currPos;

    constructor(timeline){
        this.timeline = timeline;
        this.addRulerSteps();
    }

    start(pos){
        this.startingPos = pos;
        this.currPos = pos;
        let interval = 1000*60/(Playback.tempo*4); //4 steps per quarter note
        this.stop();
        this.playbackLoop = setInterval(() => {
            this.clearPlayheads();
            try{
                this.div.children[this.currPos++].classList.add("playhead");
            } catch(e) {
                this.stop();
            }
        } , interval);
    }

    stop(){
        if(this.playbackLoop) clearInterval(this.playbackLoop);
        this.clearPlayheads();
    }

    setPos(pos){
        this.currPos = pos;
    }

    clearPlayheads(){
        let ph = this.div.querySelectorAll(".playhead");
        ph.forEach( x => x.classList.remove("playhead") );
    }

    addRulerSteps(){
        let tl = this.timeline;
        let tln = this.timeline.node;
        let container = document.createElement("div");
            container.classList.add("timelineRuler");
        this.div = container;
        for(let i = 0; i < tl.steps; i++){
            let step = document.createElement("div");
                step.classList.add("timelineRulerStep");
                step.classList.add("mod16_"+(i % 16));
                step.classList.add("mod64_"+(i % 64));
            let snapStep = Math.round(i/this.snap)*this.snap;
                snapStep  = Math.min(tl.steps-1, snapStep);
            let pos = snapStep;
            step.addEventListener("click", () => {
                this.start(pos);
                let seq = SequenceUtils.startingAt(MAIN_TIMELINE.timelineToNoteSequence(), pos);
                Playback.play(seq);
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