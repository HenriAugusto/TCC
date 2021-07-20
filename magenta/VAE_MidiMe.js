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

    static initializeWorker(){
        console.log("initializing workerMidiMe.js");
        VAE_MidiMe.worker = new Worker("magenta/workers/workerMidiMe.js");
    }
}