function initialize(){
    initGUI();
    PLAYER_HAND.addCard( new SequenceCard(BEETH_9TH ,"Beethoven", "Melody") );
    PLAYER_HAND.addCard( new SequenceCard(DRUM_SEQ_1 ,"Drums", "Drums") );
    PLAYER_HAND.addCard( new MelodyGenerator(MELODY_1, "Melody Generator") );
    PLAYER_HAND.addCard( new MelodyGenerator(BASS_1, "Melody Generator") );
    PLAYER_HAND.addCard( new MelodyGenerator(MELODY_2, "Melody Generator") );
    PLAYER_HAND.addCard( new MelodyGenerator(MELODY_3, "Melody Generator") );
    PLAYER_HAND.addCard( new MelodyGenerator(MELODY_4, "Melody Generator") );
    PLAYER_HAND.addCard( new DrumsGenerator(DRUM_SEQ_1, "Drum Generator 1") );
    PLAYER_HAND.addCard( new DrumsGenerator(DRUM_SEQ_2, "Drum Generator 2") );
    PLAYER_HAND.addCard( new DrumsGenerator(DRUM_SEQ_3, "Drum Generator 3") );
    PLAYER_HAND.addCard( new DrumsGenerator(DRUM_SEQ_3, "Drum Generator 3") );
    VAE.initializeWorker();
    RNN.initializeWorker();
    VAE_MidiMe.initializeWorker();
}