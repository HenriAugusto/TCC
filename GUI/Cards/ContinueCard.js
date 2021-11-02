/**
 * An class representing a single Card.
 * @extends SequenceCard
 */
class ContinueCard extends SequenceCard {
    originalSequence;
    recreateBtn;

    constructor(){
        super(SequenceUtils.getEmtpySequence(), "ContinueCard", "ContinueCard");
        let icon = document.createElement("img");
            icon.setAttribute("src", "GUI/Cards/CardIcons/ContinueCard.svg");
            icon.setAttribute("alt", "Continue Card Icon");
            icon.classList.add("continueCardIcon");
        // this.cardDiv.querySelector("p").remove();

        this.recreateBtn = document.createElement("button");
        this.recreateBtn.innerText = "recreate";
        let handler = (e) => this.requestContinuation();
        this.recreateBtn.addEventListener("click", handler);

        this.cardDiv.append(icon, this.recreateBtn);

        this.showIconFace();
    }

    async requestContinuation(seq = null){
        if(seq) this.originalSequence = seq;
        let cont = await RNN.continuationRequest(this.originalSequence,
                                                 this.originalSequence.totalQuantizedSteps);
        this.setNoteSequence(cont);
    }

    /**
     * @override
     * @param {INoteSequence}} seq
     */
    setNoteSequence(seq){
        super.setNoteSequence(seq);
        this.showSequenceFace();
    }

    showIcon(){
        if(!this.cardDiv.querySelector("img")) return;
        this.cardDiv.querySelector("img").style.display = "";
    }

    hideIcon(){
        if(!this.cardDiv.querySelector("img")) return;
        this.cardDiv.querySelector("img").style.display = "none";

    }

    showIconFace(){
        if(!this.recreateBtn) return;
        super.hideUI();
        this.recreateBtn.style.display = "none";
        this.showIcon();
        this.cardDiv.style.display = "";
    }

    showSequenceFace(){
        if(!this.recreateBtn) return;
        super.showUI();
        this.hideIcon();
        this.recreateBtn.style.display = "";
        this.cardDiv.style.display = "block";
    }

    /**
     * Creates an snapshot containing all the information needed
     * to recreate this object later. Meant to be used with {@link SaveLoad}.
     * @returns {Object} snapshot
     */
     save(){
        let s = super.save();
        s.originalSequence = this.originalSequence;
        return s;
    }

    /**
     * Reconstructs a object from it snapshot. Meant to be used with {@link SaveLoad}.
     * @static
     * @param {Object} obj - As returned from the {@link save()} method.
     * @returns
     */
    static load(obj){
        let cc = new ContinueCard();
        if(obj.originalSequence) cc.originalSequence = obj.originalSequence;
        if(obj.originalSequence) cc.setNoteSequence(obj.noteSequence);
        return cc;
    }
}