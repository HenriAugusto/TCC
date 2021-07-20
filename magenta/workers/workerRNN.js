/**
 * We need to use a TFJS version < 3.0.0
 * see https://github.com/magenta/magenta-js/issues/578
 */
 importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.8.6/dist/tf.min.js");
 //importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.7.0/dist/tf.min.js");
 
 importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.22.1/es6/core.js");
 importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.22.1/es6/music_rnn.js");
 importScripts("https://cdn.jsdelivr.net/npm/@tonaljs/tonal/browser/tonal.min.js");
 importScripts("/core/SequenceUtils.js");
 importScripts("/magenta/workers/workerUtils.js");

/**
 * A 36-class onehot MelodyRNN model. Converted from http://download.magenta.tensorflow.org/models/basic_rnn.mag.
 */
basic_rnn = new music_rnn.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn");
basic_rnn.initialize();
 
/**
 * A 128-class onehot MelodyRNN model.
 */
melody_rnn = new music_rnn.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn");
melody_rnn.initialize();
 
/**
 * A 9-class onehot DrumsRNN model. Converted from http://download.magenta.tensorflow.org/models/drum_kit_rnn.mag.
 */
drums_rnn = new music_rnn.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn");
drums_rnn.initialize();
 
/**
 * A 36-class onehot melody ImprovRNN model conditioned on chords as described at https://github.com/tensorflow/magenta/tree/master/magenta/models/improv_rnn#chord-pitches-improv. Converted from http://download.magenta.tensorflow.org/models/chord_pitches_improv.mag.
*/
melody_rnn_chord_pitches_improv = new music_rnn.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv");
melody_rnn_chord_pitches_improv.initialize();

console.log("Initializing MusicRNN models...");

self.onmessage = async (e) => {
    switch (e.data.msg) {
        case "continuationRequest":
            continuationRequest(e);
            break;
        default:
            throw new Error(`wrong "msg" on message for workerRNN.js: ${e.data}`);
    }
};

async function continuationRequest(e){
    let data = e.data;
    data.seq = SequenceUtils.quantizeIfNeeded(data.seq, 4);
    let model;
    if( data.seq.notes.every( note => note.isDrum) ){
        model = drums_rnn;
    } else {
        if( e.data.chordProgression ){
            model = melody_rnn_chord_pitches_improv;

        } else {
            model = melody_rnn;
        }
    }
    await waitModelInitialization(model);
    let seq = await model.continueSequence(data.seq, data.steps,
                                           data.temperature, data.chordProgression );
    e.ports[0].postMessage({
        msg: "continuationReply",
        seq: seq
    });
}