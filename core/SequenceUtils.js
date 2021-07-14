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
}