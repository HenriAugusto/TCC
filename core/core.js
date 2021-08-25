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

    try {
        await new Promise( (r) => setTimeout( () => r(), 150) );
        let editedSeq = await EditorCard.pianoEditor.edit(MELODY_1);
        let editedCard = new SequenceCard(editedSeq, "EDITED", "Melody");
        PLAYER_HAND.addCards(editedCard);
    } catch (e){
        console.log("catch user cancel action");
    }


    /*editedSeq = await EditorCard.pianoEditor.edit(DRUM_SEQ_1);
    editedCard = new SequenceCard(editedSeq, "EDITED 2", "Drums");
    PLAYER_HAND.addCards(editedCard);*/

    /* The first models we are gonna need are the ones that
     * are capable of generating melodies. To speed up initialization
     * we initialize them first and only then initialize the rest */
    await VAE.initializeWorker();
    let seqs = await VAE.requestSamples("melody", 4, 10);
    seqs.forEach( seq => {
        console.log("card generated");
        MAIN_DECK.addCardsToTop(new SequenceCard(seq, "Deck", "Melody"))
    });
    await RNN.initializeWorker(true);
    await VAE_MidiMe.initializeWorker(true);

    //VAE_MidiMe.initializeWorker();
}

window.addEventListener("load", initialize);