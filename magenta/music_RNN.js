/**
 * A 36-class onehot MelodyRNN model. Converted from http://download.magenta.tensorflow.org/models/basic_rnn.mag.
 */
basic_rnn = new mm.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn");
// basic_rnn.initialize();

/**
 * A 128-class onehot MelodyRNN model.
 */
melody_rnn = new mm.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn");
// melody_rnn.initialize();

/**
 * A 9-class onehot DrumsRNN model. Converted from http://download.magenta.tensorflow.org/models/drum_kit_rnn.mag.
 */
drums_rnn = new mm.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn");
// drums_rnn.initialize();

/**
 * A 36-class onehot melody ImprovRNN model conditioned on chords as described at https://github.com/tensorflow/magenta/tree/master/magenta/models/improv_rnn#chord-pitches-improv. Converted from http://download.magenta.tensorflow.org/models/chord_pitches_improv.mag.
 */
melody_rnn_chord_pitches_improv = new mm.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv");
// melody_rnn_chord_pitches_improv.initialize();

rnn_steps = 32;
rnn_temperature = 1;