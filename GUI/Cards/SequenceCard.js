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

    showVisualizer(){ this.visualizerCanvas.style.display = ""; }

    hideVisualizer(){ this.visualizerCanvas.style.display = "none"; }

    showBtn(){ this.cardDiv.querySelector("button").style.display = ""; }

    hideBtn(){ this.cardDiv.querySelector("button").style.display = "none"; }

    showTitle(){ this.cardDiv.querySelector("p").style.display = ""; }

    hideTitle(){ this.cardDiv.querySelector("p").style.display = "none"; }

    showUI(){
        this.showVisualizer();
        this.showBtn();
        this.showTitle();
    }

    hideUI(){
        this.hideVisualizer();
        this.hideBtn();
        this.hideTitle();
    }

    /**
     * Makes the SequenceCard contain the given {@link INoteSequence}.
     * @param {INoteSequence} seq - The new {@link INoteSequence} to be contained in the card.
     */
    setNoteSequence(seq){
        this.noteSequence = mm.sequences.clone(seq);
        this.visualizer = new mm.PianoRollCanvasVisualizer(this.noteSequence, this.visualizerCanvas)
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
        if(card instanceof ContinueCard){
            card.requestContinuation(this.noteSequence);
        } else if(card instanceof VariationsCard){
            card.requestVariations(this.noteSequence);
        } else if(card instanceof EditorCard){
            let seq = await EditorCard.pianoEditor.edit(this.noteSequence);
            console.log("RECEIVED SEQUENCE FROM EDITOR PROMISE");
            console.log(seq);
            this.setNoteSequence(seq);
        } else if(card instanceof SequenceCard){
            let interpCard = new InterpolationCard(card.noteSequence,
                this.noteSequence, 16, "Interpolated");
            PLAYER_HAND.addCards(interpCard);
        }
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

    /**
     * Creates an snapshot containing all the information needed
     * to recreate this object later. Meant to be used with {@link SaveLoad}.
     * @returns {Object} snapshot
     */
    save(){
        let s = super.save();
        s.noteSequence = this.noteSequence;
        return s;
    }

    /**
     * Reconstructs a object from it snapshot. Meant to be used with {@link SaveLoad}.
     * @static
     * @param {Object} obj - As returned from the {@link save()} method.
     * @returns
     */
    static load(obj){
        return new SequenceCard(obj.noteSequence, obj.title, obj.type);
    }
}