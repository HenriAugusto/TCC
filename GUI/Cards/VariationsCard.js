/**
 * A card that contains variations on a {@link INoteSequence}.
 * The variations are selected through a circle.
 * @extends SequenceCard
 */
 class VariationsCard extends SequenceCard {
     originalSequence;
    /**
     * Two-dimensional array.
     * First dimension means distance: closes means more similar (similarityDepths)
     * Second dimension is just different variations: differente angle means different variation (variationsPerDepth)
     */
    variations = [];
    similarityDepths = 5;
    variationsPerDepth = 10;
    similarityMinimum = 0.66;
    similarityMaximum = 0.90;
    currentFace = null;

    /**
     * @param {} seq
     */
    constructor(title){
        super(SequenceUtils.getEmtpySequence(), title, "VariationsCard");
        let icon = document.createElement("img");
            icon.setAttribute("src", "GUI/Cards/CardIcons/VariationsCard.svg");
            icon.setAttribute("alt", "Continue Card Icon");
            icon.classList.add("variationsCardIcon");
        this.cardDiv.append(icon);
        this.initSliders();
        this.showIconFace();
    }

    initSliders(){
        this.sliderContainer = document.createElement("div");
        this.similaritySlider = document.createElement("input");
        this.similaritySlider.setAttribute("type", "range");
        this.similaritySlider.setAttribute("min", "0");
        this.similaritySlider.setAttribute("max", this.similarityDepths-1);
        this.similaritySlider.setAttribute("value", 0);
        this.similaritySlider.classList.add("variationSlider");

        this.sliderContainer = document.createElement("div");
        this.variationSlider = document.createElement("input");
        this.variationSlider.setAttribute("type", "range");
        this.variationSlider.setAttribute("min", "0");
        this.variationSlider.setAttribute("max", this.variationsPerDepth-1);
        this.variationSlider.setAttribute("value", 0);
        this.variationSlider.classList.add("variationSlider");

        this.sliderContainer.append(this.similaritySlider, this.variationSlider);
        this.cardDiv.append(this.sliderContainer);

        let evHandler = () => {
            let similarity = this.similaritySlider.value;
            let variationIndex = this.variationSlider.value;
            this.setNoteSequence(this.variations[similarity][variationIndex]);
            console.log("similarity: "+similarity)
            console.log("variationIndex: "+variationIndex)
        };
        this.similaritySlider.addEventListener("input", evHandler);
        this.variationSlider.addEventListener("input", evHandler);
        this.#setSliderEventHandlers(this.similaritySlider);
        this.#setSliderEventHandlers(this.variationSlider);

        this.similaritySlider.setAttribute("tooltip", "less or more similar");
        this.variationSlider.setAttribute("tooltip", "different variations");

        let tooltipHandler = (e) => {
            let tt = new Tooltip(e.srcElement.getAttribute("tooltip"),
                                Math.round(
                                  e.srcElement.getBoundingClientRect().x+
                                  e.srcElement.getBoundingClientRect().width/2
                                ),
                                e.srcElement.getBoundingClientRect().y);
            e.srcElement.addEventListener("mouseleave", (event) => {
                tt.destroy();
            }, {once:true});
        }

        this.similaritySlider.addEventListener("mouseover", tooltipHandler);
        this.variationSlider.addEventListener("mouseover", tooltipHandler);


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

    async requestVariations(seq){
        for(let i=0; i<this.similarityDepths; i++){
            let similarity = this.similarityMaximum+(i/(this.similarityDepths-1)*(this.similarityMinimum-this.similarityMaximum));
            console.log("similarity: "+similarity);
            let depth = await VAE.similarSequencesRequest(seq, this.variationsPerDepth, similarity);
            this.variations.push( depth );
        }
        this.setNoteSequence(this.variations[0][0]);
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
        this.currentFace = "icon";
        super.hideUI();
        this.showIcon();
        this.sliderContainer.style.display = "none";
        this.cardDiv.style.display = "";
    }

    showSequenceFace(){
        this.currentFace = "sequence";
        super.showUI();
        this.hideIcon();
        this.sliderContainer.style.display = "";
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
        s.variations = this.variations;
        s.similarityDepths = this.similarityDepths;
        s.variationsPerDepth = this.variationsPerDepth;
        s.similarityMinimum = this.similarityMinimum;
        s.similarityMaximum = this.similarityMaximum;
        s.similaritySliderValue = this.similaritySlider.value;
        s.variationSliderValue = this.variationSlider.value;
        s.currentFace = this.currentFace;
        return s;
    }

    /**
     * Reconstructs a object from it snapshot. Meant to be used with {@link SaveLoad}.
     * @static
     * @param {Object} obj - As returned from the {@link save()} method.
     * @returns
     */
    static load(obj){
        let vc = new VariationsCard(obj.title);
        vc.setNoteSequence(obj.noteSequence);
        vc.variations = obj.variations;
        vc.similarityDepths = obj.similarityDepths;
        vc.variationsPerDepth = obj.variationsPerDepth;
        vc.similarityMinimum = obj.similarityMinimum;
        vc.similarityMaximum = obj.similarityMaximum;
        vc.initSliders();
        vc.similaritySlider.value = obj.similaritySliderValue;
        vc.variationSlider.value = obj.variationSliderValue;
        switch(obj.currentFace){
            case "icon":
                vc.showIconFace();
                break;
            case "sequence":
                vc.showSequenceFace();
                break;
            default:
                throw new Error("Invalid face: " + obj.currentFace);
        }
        return vc;
    }
}