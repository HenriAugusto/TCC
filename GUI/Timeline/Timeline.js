/**
 * A Timline is a linear representation of the song. It contains {@link Track}s
 * where the user can place {@link SequenceCard}s.
 */
class Timeline {
    node;
    tracks = {};
    trackCounter = 0;
    steps = 64*4*4;
    snap = 16;

    /**
     * Constructs a Timeline
     * @param {Node} node - The HTML Node where the timeline will be created.
     */
    constructor(node){
        this.node = node;
        this.node.classList.add("timeline");
    }

    /**
     * Add a track to the timeline.
     */
    addEmptyTrack(){
        this.tracks[this.trackCounter] = new Track(
            this, this.trackCounter, "(Unnamed Track)", this.steps
            );
        this.trackCounter++;
    }

    addTrack(track){
        this.tracks[this.trackCounter++] = track;
    }

    /**
     * Consolidates all the tracks into a single {@link INoteSequence} so it
     * can be be played by magenta's Player.
     * @returns {INoteSequence} The resulting NoteSequence.
     */
    timelineToNoteSequence(){
        let seq = {
            notes: [],
            quantizationInfo: {stepsPerQuarter: 4},
            tempos: [{time: 0, qpm: 120}],
            totalQuantizedSteps: 0
        };

        for(let s=0; s<this.steps; s++){
            for( let track of Object.values(this.tracks) ){
                // If a Card is placed in the current step
                if( track.cards.hasOwnProperty(s) ){
                    let currCard = track.cards[s];
                    let currSeq = currCard.noteSequence;
                    let currNotes = currSeq.notes;
                    /* copies the notes, adding an offset according to
                     * the step in which the Card was placed */
                    for( let n of Object.values(currNotes) ){
                        let newNote = Object.assign({}, n);
                        /* magenta can generate strings as values for
                           the quantized steps so we convert before doing arithmetic */
                        newNote.quantizedStartStep = Number.parseInt(newNote.quantizedStartStep) + Number.parseInt(s);
                        newNote.quantizedEndStep = Number.parseInt(newNote.quantizedEndStep) + Number.parseInt(s);
                        //console.log(newNote);
                        seq.notes.push(newNote);
                        //adjust the resulting sequence length
                        let totalSeqLength = Math.max(seq.totalQuantizedSteps, newNote.quantizedEndStep);
                        seq.totalQuantizedSteps = totalSeqLength;
                    }
                }
            }
        }
        console.log("Timeline consolidated");
        console.log(seq);
        return seq;
    }

    /**
     * Plays the Timeline, from the start.
     */
    play(){
        let seq = this.timelineToNoteSequence();
        Playback.play(seq);
    }

    /**
     * Creates an snapshot containing all the information needed
     * to recreate this object later. Meant to be used with {@link SaveLoad}.
     * @returns {Object} snapshot
     */
     save(){
        let tl = {
            tracks: [],
            trackCounter: this.trackCounter,
            steps: this.steps,
            snap: this.snap
        }
        for(let track of Object.values(this.tracks)){
            tl.tracks.push(track.save());
        }
        return tl;
    }

    /**
     * Reconstructs a object from it snapshot. Meant to be used with {@link SaveLoad}.
     * @static
     * @param {Object} obj - As returned from the {@link save()} method.
     * @returns
     */
    static load(obj, element){
        let tl = new Timeline(element);
        console.log(obj)
        obj.tracks.forEach( track => {
            tl.addTrack(Track.load(track, tl));
        });
        console.log(tl.tracks);
        return tl;
    }
}