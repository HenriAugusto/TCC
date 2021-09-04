/**
 * A card that is able to interpolate between two sequences
 * using magenta's {@link MusicVae} with a slider.
 * @extends SequenceCard
 */
class InterpolationCard extends SequenceCard {
    /**
     * @public
     * @property {[INoteSequence]} interpolatedSequences - Array of {@link InoteSequence}s
     */
    interpolatedSequences;
    slider;
    seq1;
    seq2;
    steps;
    selectedSequence;

    /**
     * Constructs an InterpolationCard
     * @param {INoteSequence} seq1 - The first INoteSequence
     * @param {INoteSequence} seq2 - The second INoteSequence
     * @param {number} steps - How much steps in the interpolation, counting the original sequences
     * @param {string} title - Card's title
     * @public
     */
    constructor(seq1, seq2, steps, title){
        super(seq1, title, "MelodyInterpolator");
        this.seq1 = seq1;
        this.seq2 = seq2;
        this.steps = steps;

        let sliderContainer = document.createElement("div");
        this.slider = document.createElement("input");
        this.slider.setAttribute("type", "range");
        this.slider.setAttribute("min", "1");
        this.slider.setAttribute("max", steps);
        this.slider.setAttribute("value", Math.round(steps/2));
        this.slider.classList.add("interpolationSlider");
        this.#setSliderEventHandlers(this.slider);

        let thisCard = this;
        this.slider.oninput = function() {
            let int = Math.round( this.value );
            thisCard.selectInterpolatedSequence( int );
        }

        sliderContainer.appendChild(this.slider);
        this.cardDiv.appendChild(sliderContainer);
        this.requestInterpolations(seq1, seq2, steps);
    }

    /**
     * Interpolate's between the card's {@link INoteSequence}s.
     * @param {number} stepIndex - The index of the step in the interpolation.
     */
    selectInterpolatedSequence(i){
        i = Math.max(0, i);        i = Math.min(this.interpolatedSequences.length-1, i);
        this.setNoteSequence( this.interpolatedSequences[i] );
    }

    /**
     * Since our slider will be inside a draggable container, the whole card would be
     * dragged with it when interacting with the slider. To solve that we must
     * temporarily set the draggable attribute to false while changing the slider and
     * reverse the change after releasing the slider.
     */
    #setSliderEventHandlers(slider){
        slider.addEventListener("mousedown", (event) => {
            event.stopPropagation();
            let p = event.target;
            while( p = p.parentElement ){
                if(p.getAttribute("draggable")=="true"){
                    p.setAttribute("draggable","false");
                }
                console.log(p);
            }
            /* Inside the mousedown listener, set a one-time event to
               revert the draggable=false change */
            window.addEventListener("mouseup", (event) => {
                let paused = document.querySelectorAll("[draggable='false']");
                for(let i=0; i<paused.length; i++){
                    paused[i].setAttribute("draggable","true");
                }
                }, {once:true});
        });
    }

    /**
     * Requests MusicVAE for interpolations
     * @async
     * @param {NoteSequence} seq1
     * @param {NoteSequence} seq2
     * @param {number} steps - How much steps in the interpolation, counting the original sequences
     */
    async requestInterpolations(seq1, seq2, steps){
        this.slider.disabled = true;
        let seqs = await VAE.interpolateSequences([seq1, seq2], steps);
        this.interpolatedSequences = seqs;
        this.setNoteSequence(seqs[Math.round(steps/2)]);
        this.selectedSequence = Math.round(steps/2);
        this.slider.disabled = false;
        if(this.selectedSequence) this.selectInterpolatedSequence(this.selectedSequence);
    }

    /**
     * Creates an snapshot containing all the information needed
     * to recreate this object later. Meant to be used with {@link SaveLoad}.
     * @returns {Object} snapshot
     */
    save(){
        let s = super.save();
        s.seq1 = this.seq1;
        s.seq2 = this.seq2;
        s.steps = this.steps;
        s.selectedSequence = this.selectedSequence;
        s.interpolatedSequences = this.interpolatedSequences;
        return s;
    }

    /**
     * Reconstructs a object from it snapshot. Meant to be used with {@link SaveLoad}.
     * @static
     * @param {Object} obj - As returned from the {@link save()} method.
     * @returns
     */
    static load(obj){
        let ic = new InterpolationCard(obj.seq1, obj.seq2, obj.steps, obj.title);
        ic.setNoteSequence(obj.noteSequence);
        ic.selectedSequence = obj.selectedSequence;
        return ic;
    }
}