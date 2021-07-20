/**
 * A card that can generate Melodies.
 * @extends SequenceGenerator
 */
class MelodyGenerator extends SequenceGenerator {

    /**
     * Constructs a MelodyGenerator
     * @param {INoteSequence} noteSequence - initial INoteSequence
     * @param {string} title - The card's title
     */
    constructor(noteSequence, title){
        super( noteSequence, title, "MelodyGenerator");
    }

    /**
     * Generate a new {@link INoteSequence} which is a Melody
     * @async
     * @override
     * @returns {INoteSequence} The generated INoteSequence
     */
    async generateSequence(){
        //let seq = (await music_vae_mel_4bar_q2.sample(1, vae_temperature))[0];
        let seq = await VAE.getNew4BarMelody();
        return seq;
    }
}