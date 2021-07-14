/**
 * A card that is able to interpolate between two sequences
 * using magenta's {@link MusicVae} with a slider.
 * @extends SequenceCard
 */
class InterpolationCard extends SequenceCard {
    /**
     * @public
     * @property {[INoteSequence]} InterpolationCard - Array of {@link InoteSequence}s
     */
    InterpolationCard;
    slider;

    /**
     * Constructs an InterpolationCard
     * @param {INoteSequence} seq1 - The first INoteSequence
     * @param {INoteSequence} seq2 - The second INoteSequence
     * @param {number} steps - How much steps in the interpolation, counting the original sequences
     * @param {string} title - Card's title
     * @public
     */
    constructor( seq1, seq2, steps,  title){
        super(seq1, title, "MelodyInterpolator");
        
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

        this.interpolateSequences(seq1, seq2, steps).then( (seqs) => {
            this.InterpolationCard = seqs;
            this.setNoteSequence(seqs[Math.round(steps/2)]);
        });
    }

    /**
     * Usies MusicVAE to interpolate between two given sequences.
     * @async
     * @param {INoteSequence} seq1 - First NoteSequence
     * @param {InoteSequence} seq2 - Second NoteSequence
     * @param {number} n - number of interpolation steps, including the two originals.
     * @returns {[INoteSequence]}
     */
    async interpolateSequences(seq1, seq2, n=4){      
        let seq1_quantized = SequenceUtils.quantizeIfNeeded( seq1, 4);
        let seq2_quantized = SequenceUtils.quantizeIfNeeded( seq2, 4);
        var InterpolationCard = await music_vae_mel_4bar_q2.interpolate([seq1_quantized, seq2_quantized], n, vae_temperature);
        return InterpolationCard;
    }

    /**
     * Interpolate's between the card's {@link INoteSequence}s.
     * @param {number} stepIndex - The index of the step in the interpolation.
     */
    selectInterpolatedSequence(i){
        i = Math.max(0, i);
        i = Math.min(this.InterpolationCard.length-1, i);
        console.log("selecting interpolated sequence: "+i);
        this.setNoteSequence( this.InterpolationCard[i] );
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
}