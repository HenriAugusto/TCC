/**
 * We need to use a TFJS version < 3.0.0
 * see https://github.com/magenta/magenta-js/issues/578
 */
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.8.6/dist/tf.min.js");
//importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.7.0/dist/tf.min.js");

importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.22.1/es6/core.js");
importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.22.1/es6/music_vae.js");
importScripts("../../core/SequenceUtils.js");
importScripts("workerUtils.js");

/**
 * A medium-sized 4-bar, 90-class onehot melody model. Quantized to 2-byte weights.
 */
music_vae_mel_4bar_q2 = new music_vae.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2");

/**
 * A 2-bar, 90-class onehot melody model with chord conditioning. Quantized to 2-byte weights.
 */
music_vae_2bar_chords = new music_vae.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_chords");
//music_vae_2bar_chords.initialize();

/**
 * A 2-bar, 90-class onehot melody model. Less accurate, but smaller in size than full model.
 */
music_vae_2bar_small = new music_vae.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small");
//music_vae_2bar_small.initialize();

/**
 * A 2-bar, 9-class multilabel drum model with a NADE decoder. Quantized to 2-byte weights.
 */
drums_vae_2bar_nade_9_q2 = new music_vae.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_2bar_nade_9_q2");
//drums_vae_2bar_nade_9_q2.initialize();

/**
 * A medium-sized 2-bar, 9-class onehot drum model with a weak prior (higher KL divergence),
 * which is better for reconstructions and interpolations. Quantized to 2-byte weights.
 */
drums_vae_4bar_med_q2 = new music_vae.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_4bar_med_q2");
//drums_vae_4bar_med_q2.initialize();

/**
 * A medium-sized 2-bar, 9-class onehot drum model with a strong prior (lower KL divergence),
 * which is better for sampling. Quantized to 2-byte weights.
 */
drums_4bar_med_lokl_q2 = new music_vae.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_4bar_med_lokl_q2");

/**
 * A medium-sized 2-bar, 9-class onehot drum model with a weak prior (higher KL divergence),
 * which is better for reconstructions and interpolations. Quantized to 2-byte weights.
 */
drums_4bar_med_q2 = new music_vae.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_4bar_med_q2");

const modelNamesMap = Object.freeze({
    "music_vae_mel_4bar_q2": music_vae_mel_4bar_q2,
    "music_vae_2bar_chords": music_vae_2bar_chords,
    "music_vae_2bar_small": music_vae_2bar_small,
    "drums_vae_2bar_nade_9_q2": drums_vae_2bar_nade_9_q2,
    "drums_vae_4bar_med_q2": drums_vae_4bar_med_q2,
    "drums_4bar_med_lokl_q2": drums_4bar_med_lokl_q2,
    "drums_4bar_med_q2": drums_4bar_med_q2
});

console.log("%cInitializing workerVAE.js", `background-color:black;
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
        case "sampleRequest":
            sampleRequest(e);
            break;
        case "interpolationRequest":
            interpolationRequest(e);
            break;
        case "similarSequencesRequest":
            similarSequencesRequest(e);
            break;
        default:
            throw new Error(`wrong "msg" on message for workerVAE.js: ${e.data}`);
    }
};

/**
 * Parse a "interpolationRequest" message.
 * This methods interpolates between 2 or 4 sequences from and sends them
 * back to the main script.
 * @param {MessageEvent} msg The message received from the main script
 */
async function interpolationRequest(e){
    e.data.seqs.map( seq => SequenceUtils.quantizeIfNeeded(seq, 4) );
    let model;
    if( SequenceUtils.isDrumSequence(e.data.seqs) ){
        model = drums_4bar_med_q2;
    } else {
        model = music_vae_mel_4bar_q2;
    }
    await initOrWaitModels(model);
    let interpolated = await model.interpolate(e.data.seqs, e.data.n, e.data.temperature);
    e.ports[0].postMessage({
        type: "interpolationReply",
        interpolatedSeqs: interpolated
    });
}

/**
 * Parse a "sampleRequest" message.
 * This methods samples sequences from the model prior and sends them
 * back to the main script.
 * @param {MessageEvent} msg The message received from the main script
 */
async function sampleRequest(e){
    let model;
    switch(e.data.type){
        case "melody":
            switch(e.data.bars){
                case 4:
                    model = music_vae_mel_4bar_q2;
                    break;
                default:
                    throw new Error(`wrong value for "bars" in message: ${data}`)
            }
            break;
        case "drums":
            switch(e.data.bars){
                case 4:
                    model = drums_4bar_med_lokl_q2;
                    break;
                default:
                    throw new Error(`wrong value for "bars" in message: ${data}`)
            }
            break;
        default:
            throw new Error(`wrong "type" on message for workerVAE.js: ${data}`);
    }
    await initOrWaitModels(model);
    let data = e.data;
    sequences = await model.sample(e.data.numSamples, data.temperature, data.controlArgs,
                                   data.stepsPerQuarter, data.qpm );
    e.ports[0].postMessage({
        type: "sampleReply",
        sequences: sequences
    });
}

/**
 * Parse a "similarSequencesRequest" message.
 * This methods generates new sequences similar to the original.
 * @param {MessageEvent} e The message event received from the main script
 */
async function similarSequencesRequest(e){
    let data = e.data;
    await initOrWaitModels(music_vae_mel_4bar_q2);
    let s = await music_vae_mel_4bar_q2.similar(data.seq, data.numSamples,
                                                data.similarity, data.temperature);
    e.ports[0].postMessage({
        type: "similarSequencesReply",
        similarSequences: s
    });
}