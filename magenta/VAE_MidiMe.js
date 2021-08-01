/**
 * A class to use a MusicVAE's {@link MidiMe} model using Web Workers.
 */
 class VAE_MidiMe {
    static temperature = 0.8;
    static worker;

    /**
     * Train MidiMe using the given sequence.
     * @param {INoteSequence} seq - The note sequence used to train MidiMe
     * @param {number} epochs - Number of epochs to use in training
     * @returns {Promise<void>}
     */
    static async train(seq, epochs=100){
        return new Promise((resolve, reject) => {
            let ch = new MessageChannel();
            ch.port1.onmessage = (e) => {
                resolve();
            }
            VAE_MidiMe.#getWorker().postMessage({
                msg: "trainRequest",
                seq: seq,
                epochs: epochs
            }, [ch.port2]);
        });
    }

    /**
     * Generates note sequences with MidiMe.
     * @param {number} numSamples
     * @returns {Promise<[INoteSequence]>} Array of NoteSequences
     */
    static async samplesRequest(numSamples){
        return new Promise((resolve, reject) => {
            let ch = new MessageChannel();
            ch.port1.onmessage = (e) => {
                if(e.data.success){
                    resolve(e.data.seqs);
                } else{
                    reject("VAE_ME.samplesRequest() error: "+e.data.err);
                }
            }
            VAE_MidiMe.#getWorker().postMessage({
                msg: "samplesRequest",
                numSamples: numSamples
            }, [ch.port2]);
        });
    }

    static#getWorker(){
        if(!VAE_MidiMe.worker){
            VAE_MidiMe.initializeWorker();
        }
        return VAE_MidiMe.worker;
    }

    /**
     * Initialize the MidiMe worker with a default set of models
     * @param {boolean} chain - Initialize models one at a time, in sequence
     * @returns {Promise<Object>} - A promise that resolves when the models are initialized.
     */
    static initializeWorker(chain=false){
        return new Promise((resolve, reject) => {

            VAE_MidiMe.worker = new Worker("magenta/workers/workerMidiMe.js");

            let ch = new MessageChannel();
            /* The values in the models array must match
             the ones in modelNamesMap as declared in workerMidiMe.js */
            VAE_MidiMe.worker.postMessage({
                msg: "initialize",
                models: ["music_vae_mel_4bar_q2",
                        "drums_4bar_med_q2"],
                chain: chain
            }, [ch.port2]);

            ch.port1.onmessage = (event) => {
                resolve(event.data);
            };
        });

    }
}