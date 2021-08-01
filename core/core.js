async function initialize(){
    initGUI();
    
    PLAYER_HAND.addCards( [
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
    
    //VAE_MidiMe.initializeWorker();
}