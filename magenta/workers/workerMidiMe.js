/**
 * Notice we have one worker for MusicVAE and another for MidiMe because
 * we use different versions of magenta.js on each.
 * See issues #578 and #579 in magenta.js' github repo.
 */

importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.7.0/dist/tf.min.js");
importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.22.1/es6/core.js");

 /**
  * We need to use magenta <= 1.20
  * Bug: Otherwise we will get an error when calling
  * MidiMe.initialize()
  * see https://github.com/magenta/magenta-js/issues/579
  */
 importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.20.0/es6/music_vae.js");
 importScripts("/core/SequenceUtils.js");
 importScripts("/magenta/workers/workerUtils.js");

/**
 * A medium-sized 4-bar, 90-class onehot melody model. Quantized to 2-byte weights.
 */
 music_vae_mel_4bar_q2 = new music_vae.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2");
 music_vae_mel_4bar_q2.initialize();

 /**
 * A medium-sized 2-bar, 9-class onehot drum model with a weak prior (higher KL divergence),
 * which is better for reconstructions and interpolations. Quantized to 2-byte weights.
 */
drums_4bar_med_q2 = new music_vae.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_4bar_med_q2");
drums_4bar_med_q2.initialize();

let vaelModel;
let midime = new music_vae.MidiMe({epochs: 100});
 midime.initialize();

 console.log("Initializing MidiMe");

 self.onmessage = async (e) => {
    let data = e.data;
    switch (data.msg) {
        case "trainRequest":
            vaeModel = SequenceUtils.isDrumSequence(data.seq) ?
                        drums_4bar_med_q2 :
                        music_vae_mel_4bar_q2;
            await waitModelInitialization(midime);
            await waitModelInitialization(vaeModel);
            midime.config.epochs = data.epochs;
            let z = await vaeModel.encode([data.seq]);
            console.log("training MidiMe...");
            await midime.train(z, async (epoch, logs) =>{ });
            console.log("training finished.");
            e.ports[0].postMessage({
                msg: "trainReply",
                success: true
            });
            break;
        case "samplesRequest":
            if(!midime.trained){
                e.ports[0].postMessage({
                    msg: "trainReply",
                    success: false,
                    err: "MidiMe is not trained yet"
                });
                return;
            }
            let samples = await midime.sample(data.numSamples);
            let seqs = await vaeModel.decode(samples);
            e.ports[0].postMessage({
                msg: "samplesReply",
                success: true,
                seqs: seqs
            });
            break;
        default:
            throw new Error(`wrong "msg" on message for workerMidiMe.js: ${data}`);
    }
 };