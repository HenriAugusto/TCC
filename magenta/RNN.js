/**
 * A class to do {@link MusicRNN} operations using Web Workers.
 */
 class RNN {
    static temperature = 0.8;
    static worker;

    /**
     * Generate a continuation for a given {@link INoteSequence}
     * @param {INoteSequence} seq - the original sequence to be continued
     * @param {number} steps - how many steps the continuation should have
     * @param {number} temperature
     * @param {string[]} chordProgression
     * @returns {Promise<INoteSequence>} Promise of an {@link INoteSequence}.
     */
    static async continuationRequest(seq, steps, temperature=RNN.temperature, chordProgression=null) {
        return new Promise((resolve, reject) => {
            let ch = new MessageChannel();
            ch.port1.onmessage = (event) => {
                console.log("Message received on RNN.continuationRequest()");
                console.log(event.data);
                resolve(event.data.seq);
            }
            RNN.#getWorker().postMessage({
                msg: "continuationRequest",
                seq: seq,
                steps: steps,
                temperature: temperature,
                chordProgression: chordProgression
            }, [ch.port2]);
        });
    }

    static#getWorker(){
        if(!RNN.worker){
            RNN.initializeWorker();
        }
        return RNN.worker;
    }

    static initializeWorker(){
        console.log("initializing workerRNN.js");
        RNN.worker = new Worker("magenta/workers/workerRNN.js");
    }
}