/**
 * An object describing a NoteSequence position in an Track.
 * @typedef {Object} TrackPosition
 * @property {number} left - leftmost position of the NoteSequence
 * @property {number} right - rightmost position of the NoteSequence
*/

/**
 * Class representing a track inside an {@link Timeline} object
 */
class Track {
    description;
    nSteps;
    steps = [];
    index;
    timeline;
    node;
    cards = {};

    /**
     * Creates a Track object.
     * @param {Timline} timeline - The timeline containing this track
     * @param {number} index - The index of the track
     * @param {string} description - The displayed description of the track
     * @param {number} nSteps - Number of quantized steps the track will have.
     */
    constructor(timeline, index, description, nSteps){
        this.timeline = timeline;
        this.index = index;
        this.description = description;
        this.nSteps = nSteps;
        this.createNode();
    }

    /**
     * Creates the HTML Node for the track and append it to the Timeline's node.
     */
    createNode(){
        this.node = document.createElement("div");
        this.node.classList.add("track");
        for(let i = 0; i < this.nSteps; i++){
            this.steps.push( new TimelineStep(this, i) );
        }      
        this.timeline.node.appendChild(this.node);
    }

    /**
     * Given a NoteSequence, find a position for it in the track.
     * This method works by preventing the NoteSequence to be placed partially in the
     * outside of the Track (position < 0 || position > nSteps), or overlapping another
     * NoteSequence already on the track.
     * It also works according to the {@link Timeline}'s snapping configuration.
     * @param {NoteSequence} seq - The NoteSequence to be positioned
     * @param {number} centeredPosition the position where the user is trying to place it
     * @returns {TrackPosition} An {@link TrackPosition} object describing where the
     * NoteSequence would be placed.
     * @throws {Error} When the Note Sequence could not be placed in the Track.
     */
    positionNoteSequence(seq, centeredPosition){
        let snap = this.timeline.snap;
        let sequenceSteps = seq.totalQuantizedSteps;
        let left  = centeredPosition-Math.ceil(sequenceSteps/2)+1;
        let right = centeredPosition+Math.floor(sequenceSteps/2);
        // First: we snap the position to the grid
        let mod = left % snap;
        left -= mod;
        right -= mod;
        /* Second: we put it back on the Track when left or right
         * falls outside */
        if( left < 0 ){
            right -= left;
            left = 0;
        }
        if ( right > this.nSteps-1){
            left = this.nSteps-1-sequenceSteps;
            right = this.nSteps-1;
        }
        /* At last we must check if it overlaps with other placed
         Cards */
        let leftOverlap = false;
        let rightOverlap = false;
        /* Do exactly two passes, because if the sequence overlaps another, 
         * say, from the left, after adjusting it's position it might
         * overlap another sequence from the right.
         */ 
        let movedLeft = false; //those are used to avoid the same adjustment on the 2nd pass
        let movedRight = false;
        for( let pass=0; pass<=1; pass++){
            for(let key in this.cards){
                let testLeft = parseInt(key, 10);
                let testRight = testLeft+this.cards[key].noteSequence.totalQuantizedSteps-1;
                
                leftOverlap = leftOverlap || left < testRight && left >= testLeft;
                if(leftOverlap && !movedRight){
                    console.log("MOVING RIGHT");
                    movedRight = true;
                    leftOverlap = true;
                    let offset = testRight+1 - left;
                    left  += offset;
                    right += offset;
                    continue;
                }
                rightOverlap = rightOverlap || right > testLeft && right <= testRight;
                if(rightOverlap && !movedLeft){
                    console.log("MOVING LEFT");
                    movedLeft = true;
                    rightOverlap = true;
                    let offset = testLeft-1 - right;
                    left  += offset;
                    right += offset;
                    continue;
                }
                // If the Card would overlap another one entirely
                if(    left  <= testLeft 
                    && left  <= testRight
                    && right >= testLeft
                    && right >= testRight){
                        throw new Error("Can't place sequence");            
                    }
            }
        }
        // If after adjustments the Card overlaps with another
        if(leftOverlap && rightOverlap){
            throw new Error("Can't place sequence");
        }
        // If after the ajusts the Card falls outside the Track
        if(left <0 || right > this.nSteps-1){
            throw new Error("Can't place sequence");
        }
        
        return {
            left: left,
            right: right
        }
    }

    /**
     * Highlight the {@link TimelineSteps} showing where a NoteSequence would be placed.
     * @param {Card} seq - The NoteSequence to be placed into the Track
     * @param {number} position - The desired position of the NoteSequence
     * @returns {boolean} - if the NoteSequence can be placed
     */
    previewCard(card, position){
        
        this.unhighlightAllSteps();

        let finalPos;
        try {
            finalPos = this.positionNoteSequence(card.noteSequence, position);    
        } catch (error) {
            console.log("Can't place sequence (preview)");
            return false;
        }

        let left = finalPos.left;
        let right = finalPos.right;        
        for(let i=left; i<=right; ++i){
            this.highlightStep(i);
        }
        return true;
    }

    /**
     * Places a {@link SequenceCard} on the Track
     * @param {SequenceCard} card - The card to be placed
     * @param {number} centeredPosition - The center position of the card
     * @returns {boolean} If the Card could be placed in the Track
     */
    placeCard(card, centeredPosition){
        this.unhighlightAllSteps();
        let finalPos;
        try {
            finalPos = this.positionNoteSequence(card.noteSequence, centeredPosition);    
        } catch (error) {
            return false;
        }
        this.cards[finalPos.left] = card;
        console.log(this.cards);

        let startTimelineStep = this.steps[finalPos.left];
        
        let canvas = document.createElement("canvas");
        startTimelineStep.node.appendChild( canvas );
        let vis = new mm.PianoRollCanvasVisualizer( card.noteSequence, canvas );
        startTimelineStep.node.style.position = "relative";
        canvas.style.position = "absolute";
        canvas.style.name = "absolute";
        canvas.style.width = card.noteSequence.totalQuantizedSteps*TimelineStep.pixelWidth+"px";
        canvas.style.height = startTimelineStep.node.getBoundingClientRect().height+"px";
        canvas.style.backgroundColor = "white";
        canvas.style.borderColor = window.getComputedStyle(card.cardDiv).getPropertyValue("background-color");
        canvas.style.borderStyle = "solid";
        canvas.style.borderWidth = "2px";
        canvas.style.boxSizing = "border-box";
        canvas.setAttribute("card", card.index);

        canvas.addEventListener("click", () => {
            PLAYER_HAND.addCards(card);
            this.removeCardInPosition(finalPos.left);
        });
        PLAYER_HAND.removeCard(card);
        return true;
    }

    /**
     * Removes the {@link Card} placed in the given {@link TimelineStep}.
     * @param {number} step - The step position where the card is placed
     */
    removeCardInPosition(step){
        let deletedCard = this.cards[step];
        delete this.cards[step];
        document.querySelector("canvas[card='"+deletedCard.index+"']").remove();
        this.steps[step].node.style.position = "";
    }

    /**
     * Highlights a single {@link TimelineStep} on the Track
     * @param {number} idx - The index of the step to be highlighted
     */
    highlightStep(idx){
        this.steps[idx].node.classList.add("highlighted");
    }

    /**
     * Removes the highlighting from all the steps in the Track.
     */
    unhighlightAllSteps(){
        let highlighted = document.querySelectorAll(".timelineStep.highlighted");
        for(let h = 0; h<highlighted.length; h++){
            highlighted[h].classList.remove("highlighted");
        }
    }

}