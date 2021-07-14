/**
 *  Class representing a single step in a {@link Track}.
 */
class TimelineStep {
    idx;
    node;
    track;
    /**
     * Pixel width of each TimelineStep <div> tag.
     * For now it must match css.syle (for now...)
     */
    static pixelWidth = 8;
    
     /**
     * Create a TimelineStep.
     * @param {Track} track - The Track that will contain this TimelineStep.
     * @param {number} index - The index representint the step position.
     */
    constructor(track, index){
        this.track = track;
        this.idx = index;
        this.createNode();
    }

    /**
     * Creates the Node representing the TimelineStep and appends it to
     * it's Track's Node.
     */
    createNode(){
        let timelineStep = document.createElement("div");
            timelineStep.classList.add("timelineStep")
            timelineStep.setAttribute("idx", this.idx);
            timelineStep.setAttribute("track_id", this.track.index);
        this.node = timelineStep;
        this.addDragAndDropEventListeners();
        this.track.node.appendChild( this.node );
    }

    /**
     * Add event listeners to make it accept {@link Card}s drops.
     */
    addDragAndDropEventListeners(){
        // DRAG ENTER
        this.node.addEventListener("dragenter", (event) => {
            let b = this.track.previewCard(DragAndDrop.dragPayload, this.idx);
            if( b && event.preventDefault ) {
                event.preventDefault(); //prevents bubbling (accept drop)
            }
            
        });

        // DRAG LEAVE
        this.node.addEventListener("dragleave", (event) => {
            //nothing
        });

        // DRAG OVER
        this.node.addEventListener("dragover", (event) => {
            let b = this.track.previewCard(DragAndDrop.dragPayload, this.idx);
            if( b && event.preventDefault ) {
                event.preventDefault(); //prevents bubbling (accept drop)
            }
        });

        // DROP
        this.node.addEventListener("drop", (event) => {
            console.log( "---------data dropped on timelineStep-----------");
            console.log(event);
            if (event.stopPropagation) {
                event.stopPropagation(); // stops the browser from redirecting.
            }
            
            let source = event.dataTransfer.getData("text/plain");
            console.log("source = ");
            console.log(source);

            this.track.placeCard(DragAndDrop.dragPayload, this.idx);
            
            if (event.preventDefault) { event.preventDefault(); } //prevents bubbling
        });
    }

    /** Reads the css rule for .timelineStep and replaces it with
    *  a another one that is simular but with the min-width property
    *  changed. I'm just saving that here but it would be probably better
    *  to change all elements at once with the Node.style property.
    *  @param {number} widthInPixels new width for all TimelineStep nodes.
    * 
    */
    static resizeAllInCss(widthInPixels){
        let rules = document.styleSheets[0].cssRules;
        let oldRule;

        for( let i=0; i<rules.length; i++){
            let rule = rules[i];
            if( rule.selectorText == ".timelineStep" ){
                oldRule = rule.cssText;
                console.log("deleting rule "+rule.selectorText+" "+oldRule);
                document.styleSheets[0].deleteRule(i);
            }
        }

        document.styleSheets[0].insertRule(oldRule.replace(/min-width: \d+px/,"min-width: "+widthInPixels+"px"));
    }
}