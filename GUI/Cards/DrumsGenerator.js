/**
 * A card that can generate Melodies.
 * @extends SequenceGenerator
 */
class DrumsGenerator extends SequenceGenerator {

    /**
     * Constructs a DrumsGenerator
     * @param {INoteSequence} noteSequence - initial INoteSequence
     * @param {string} title - The card's title
     */
    constructor( noteSequence, title){
        super( noteSequence, title, "DrumsGenerator");
    }

    /**
     * Generate a new percussive {@link INoteSequence}
     * @async
     * @override
     * @returns {INoteSequence} The generated INoteSequence
     */
    async generateSequence(){
        let seq = await VAE.getNew4BarDrums();
        return seq;
    }

    /**
     * Reconstructs a object from it snapshot. Meant to be used with {@link SaveLoad}.
     * @static
     * @param {Object} obj - As returned from the {@link save()} method.
     * @returns
     */
    static load(obj){
        return new DrumsGenerator(obj.noteSequence, obj.title);
    }
}

