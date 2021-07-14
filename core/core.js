function initialize(){
    initGUI();
    new SequenceCard(BEETH_9TH ,"Beethoven", "Melody");
    new SequenceCard(DRUM_SEQ_1 ,"Drums", "Drums");
    new MelodyGenerator(MELODY_1, "Melody Generator");
    new MelodyGenerator(BASS_1, "Melody Generator");
    new MelodyGenerator(MELODY_2, "Melody Generator");
    new MelodyGenerator(MELODY_3, "Melody Generator");
    new MelodyGenerator(MELODY_4, "Melody Generator");
    new DrumsGenerator(DRUM_SEQ_1, "Drum Generator 1");
    new DrumsGenerator(DRUM_SEQ_2, "Drum Generator 2");
    new DrumsGenerator(DRUM_SEQ_3, "Drum Generator 3");
    new DrumsGenerator(DRUM_SEQ_3, "Drum Generator 3");
}