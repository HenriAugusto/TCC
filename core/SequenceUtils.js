/**
 * Class with miscelaneous statics methods for dealing with {@link INoteSequence}s.
 */
class SequenceUtils {
    /**
     * The MusicMagenta.sequences.quantizeNoteSequence() method has a bug where
     * it returns a chord when quantizing an already quantized melody.
     * This function tests if the sequence is already quantized before
     * quantizing.
     * @param {INoteSequence} seq - the sequence to be quantized
     * @param {number} stepsPerQuarter - the desired number of steps per quarter note
     */
    static quantizeIfNeeded(seq, stepsPerQuarter){
        if( seq.notes.length && !seq.notes[0].hasOwnProperty("quantizedStartStep") ){
            return mm.sequences.quantizeNoteSequence(seq1, stepsPerQuarter);
        } else {
            return seq;
        }
    }

    /**
     * Checks if one or more sequences only contains drum notes.
     * @param {INoteSequence|INoteSequence[]}} A sequence or an array of sequences
     * @returns {boolean} If the sequence only have notes with the `isDrum` property
     */
    static isDrumSequence(s){
        if( !Array.isArray(s) ){
            return s.notes.every( note => note.isDrum );
        } else {
            return s.every( seq => seq.notes.every( note => note.isDrum) );
        }
    }

    static getEmtpySequence(){
        return {
            notes: [],
            quantizationInfo: {stepsPerQuarter: 4},
            totalQuantizedSteps: 64
          };
    }

    /**
     * Given a NoteSequence returns another sequence starting at the specified
     * position of the original
     * @param {INoteSequence} seq
     * @param {number} start
     * @returns {INoteSequence}
     */
    static startingAt(seq, start){
        let out = mm.sequences.clone(seq);
        out.notes = out.notes.filter( note => {
            return note.quantizedStartStep >= start;
        });
        out.notes.forEach( note => {
            note.quantizedStartStep -= start;
            note.quantizedEndStep -= start;
        });
        out.totalQuantizedSteps -= start;
        return out;
    }
}
