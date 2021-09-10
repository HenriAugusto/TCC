import PianoEditor from '../SequenceEditors/PianoEditor/PianoEditor.js'

async function initialize(){
    initGUI();

    PLAYER_HAND.addCards( [
        new EditorCard(),
        new ContinueCard(),
        new SequenceCard(BEETH_9TH ,"Beethoven", "Melody"),
        new SequenceCard(DRUM_SEQ_1 ,"Drums", "Drums"),
        new MelodyGenerator(MELODY_1, "Melody Generator"),
        new MelodyGenerator(BASS_1, "Melody Generator"),
        new MelodyGenerator(MELODY_2, "Melody Generator"),
        new MelodyGenerator(MELODY_3, "Melody Generator"),
        new MelodyGenerator(MELODY_4, "Melody Generator"),
        new DrumsGenerator(DRUM_SEQ_1, "Drum Generator 1"),
        new DrumsGenerator(DRUM_SEQ_2, "Drum Generator 2"),
        new DrumsGenerator(DRUM_SEQ_3, "Drum Generator 3"),
        new DrumsGenerator(DRUM_SEQ_3, "Drum Generator 3")
    ] );

    EditorCard.pianoEditor = new PianoEditor();

    /* The first models we are gonna need are the ones that
     * are capable of generating melodies. To speed up initialization
     * we initialize them first and only then initialize the rest */
    await VAE.initializeWorker();
    await RNN.initializeWorker(true);
    await VAE_MidiMe.initializeWorker(true);
    for(let i = 0; i<Game.deckSize; i++){
        let card = await CardGenerator.getCard();
        MAIN_DECK.addCardsToTop(card);
    }
}

window.addEventListener("load", initialize);