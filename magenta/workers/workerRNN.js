/**
 * We need to use a TFJS version < 3.0.0
 * see https://github.com/magenta/magenta-js/issues/578
 */
 importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.8.6/dist/tf.min.js");
 //importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.7.0/dist/tf.min.js");

 importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.22.1/es6/core.js");
 importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.22.1/es6/music_rnn.js");
 importScripts("https://cdn.jsdelivr.net/npm/@tonaljs/tonal/browser/tonal.min.js");
 importScripts("../../core/SequenceUtils.js");
 importScripts("workerUtils.js");

/**
 * A 36-class onehot MelodyRNN model. Converted from http://download.magenta.tensorflow.org/models/basic_rnn.mag.
 */
basic_rnn = new music_rnn.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn");

/**
 * A 128-class onehot MelodyRNN model.
 */
melody_rnn = new music_rnn.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn");

/**
 * A 9-class onehot DrumsRNN model. Converted from http://download.magenta.tensorflow.org/models/drum_kit_rnn.mag.
 */
drums_rnn = new music_rnn.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn");

/**
 * A 36-class onehot melody ImprovRNN model conditioned on chords as described at https://github.com/tensorflow/magenta/tree/master/magenta/models/improv_rnn#chord-pitches-improv. Converted from http://download.magenta.tensorflow.org/models/chord_pitches_improv.mag.
*/
melody_rnn_chord_pitches_improv = new music_rnn.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv");


const modelNamesMap = Object.freeze({
    "basic_rnn": basic_rnn,
    "melody_rnn": melody_rnn,
    "drums_rnn": drums_rnn,
    "melody_rnn_chord_pitches_improv": melody_rnn_chord_pitches_improv,
});

console.log("%cInitializing workerRNN.js", `background-color:black;
                                            color:magenta;padding:0.5em;
                                            font-weight:bold;`);

self.onmessage = async (e) => {
    switch (e.data.msg) {
        case "initialize":
            let models = e.data.models.map( modelName => modelNamesMap[modelName] );

            let f = e.data.chain ? chainInitialization : initOrWaitModels;
            f(models).then( () => {
                e.ports[0].postMessage({
                    msg: "Model initialization completed",
                    models: e.data.models
                })
            });
            break;
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
    if( SequenceUtils.isDrumSequence(data.seq) ){
        model = drums_rnn;
    } else {
        if( e.data.chordProgression ){
            model = melody_rnn_chord_pitches_improv;

        } else {
            model = melody_rnn;
        }
    }
    await initOrWaitModels(model);
    let seq = await model.continueSequence(data.seq, data.steps,
                                           data.temperature, data.chordProgression );
    e.ports[0].postMessage({
        msg: "continuationReply",
        seq: seq
    });
}