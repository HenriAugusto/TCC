import PianoEditor from '../SequenceEditors/PianoEditor/PianoEditor.js'

async function initialize(){
    initGUI();

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