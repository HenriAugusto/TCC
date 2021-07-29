/**
 * A card that contains a {@link INoteSequence} that can be placed
 * in a {@link Timeline}.
 * @extends Card
 */
class SequenceCard extends Card {
    //static seqCardsID = 0;
    noteSequence;
    visualizerCanvas;
    visualizer;
    playBtn;

    /**
     * Constructs a SequenceCard.
     * @param {INoteSequence} noteSequence - the note sequence to be contained in the Card
     * @param {string} title - Card's title
     * @param {CARD_TYPES} type - Card's type as defined in {@link CARD_TYPES}
     */
    constructor(noteSequence, title, type){
        super(title, type);

        this.cardDiv.classList.add("sequenceCard");

        // VISUALIZER
        let vis = document.createElement("canvas");
            vis.classList.add("visualizer");
            vis.id = "visualizer_card_"+this.index;
            this.cardDiv.appendChild(vis);
            this.visualizerCanvas = vis;

        // PLAY BUTTON
        let btn = document.createElement("button")
            btn.innerText = "play";
            this.cardDiv.appendChild(btn);
            this.playBtn = btn;
            this.playBtn.addEventListener("click", this.playSequence.bind(this) );

        this.setNoteSequence(noteSequence);
    }

    /**
     * Makes the SequenceCard contain the given {@link INoteSequence}.
     * @param {INoteSequence} seq - The new {@link INoteSequence} to be contained in the card.
     */
    setNoteSequence(seq){
        this.noteSequence = seq;
        this.visualizer = new mm.PianoRollCanvasVisualizer(seq, this.visualizerCanvas)
        /* remove element style width and height that are set by PianoRollCanvasVisualizer
           so our CSS can be applied */
        this.visualizerCanvas.style.removeProperty("width");
        this.visualizerCanvas.style.removeProperty("height");
        this.resizeVisualizerCanvas();
    }

    /**
     * Plays the card's NoteSequence
     */
    playSequence(){
        Playback.play(this.noteSequence);
    }

    /**
     * Called when a another Card is dropped on this one.
     * @async
     * @override
     * @param {Card} card - The Card being dropped
     */
    async receiveDroppedCard(card){
        console.log("receiving card");
        new InterpolationCard(card.noteSequence, this.noteSequence, 16, "Interpolated");
    }

    /**
     * Resize the card's {@link PianoRollCanvasVisualizer} so it better fits its size.
     */
    resizeVisualizerCanvas(){
        if(true){
            return;
        }
        let boundingRect = this.visualizerCanvas.getBoundingClientRect();
        let targetWidth = 160;
        let proportion = targetWidth/boundingRect.width;
        //this.visualizerCanvas.style.transform = "scale("+proportion+")";
        //this.visualizerCanvas.style.transformOrigin = "top left";
        let w = boundingRect.width*proportion;
        let h = boundingRect.height*proportion;
        let minH = 90;
            h = Math.max(h,minH);
        this.visualizerCanvas.style.width = w+"px";
        this.visualizerCanvas.style.height = h+"px";
    }
}