/**
 * A Timline is a linear representation of the song. It contains {@link Track}s
 * where the user can place {@link SequenceCard}s.
 * @implements {BasePlayerCallback}
 */
class Timeline {
    node;
    tracks = {};
    trackCounter = 0;
    steps = 64*4*4;
    snap = 16;
    timelineRuler;
    stepsPerQuarter = 4;

    /**
     * Constructs a Timeline
     * @param {Node} node - The HTML Node where the timeline will be created.
     */
    constructor(node){
        this.node = node;
        this.node.classList.add("timeline");
        this.addPlaybackControls();
        this.timelineRuler = new TimelineRuler(this);
    }

    addPlaybackControls(){
        let playbackControls = document.createElement("div");
            playbackControls.classList.add("playbackControlsContainer");
        let stopBtn = document.createElement("button");
        let playBtn = document.createElement("button");

        stopBtn.innerText = "■";
        playBtn.innerText = "►";

        stopBtn.classList.add("timelinePlaybackBtn")
        playBtn.classList.add("timelinePlaybackBtn");

        stopBtn.classList.add("timelinePlaybackStop")
        playBtn.classList.add("timelinePlaybackPlay");

        stopBtn.addEventListener("click", () => {
            Playback.stop();
            this.timelineRuler.stop();
        });
        playBtn.addEventListener("click", () => {
            this.play();
            this.timelineRuler.start(0);
        });

        playbackControls.append(stopBtn, playBtn);
        this.node.append(playbackControls);
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
            quantizationInfo: {stepsPerQuarter: this.stepsPerQuarter},
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
     * This is called by a callback in Playback.activePlayer.
     * We use it y keeping the playhead in sync with the playback
     * in case some hiccup happens or if SF Player needs some time to load
     * some samples before playing (which would cause a delay)
     * @param {INote} note
     * @param {number} time
     */
    run(note, time){
        /* I don't know why but each unit in the notes startTime and endTime
         * corresponds to a half note instead of a quarter note.
         *
         * So a note ending a 4 by 4 bar would have endTime equals 8 and not 16
         * as i would expect.
         *
         * For that reason to get those values in a quarter note reference we
         * multiply by 2 (besides the stepsPerQuarter multiplication)
         */

        /*
         * Also for some strange reason the object that receives the callback
         * Doesn't seems to be the one that is passed as an argument to
         * new mm.SoundFontPlayer() ... wtf?
         *
         * ୧( •̀ o •́ )୨
         *
         * For that reason for now we will access MAIN_TIMELINE directly, ugh...
         * Later if we decide to actually allow with multiple timelines we will
         * will need to fix that mess
         */
        let currPos = note.startTime*2*MAIN_TIMELINE.stepsPerQuarter;
        let startPos = MAIN_TIMELINE.timelineRuler.startingPos;
        MAIN_TIMELINE.timelineRuler.setPos(currPos+startPos);
    }

    stop(){
        MAIN_TIMELINE.timelineRuler.stop();
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