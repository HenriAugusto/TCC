/**
 * A class to do {@link MusicVAE} operations using Web Workers.
 */
class VAE {
    static temperature = 0.1;
    static worker;

    /**
     * Generate a 4-bar Melody NoteSequence with MusicVAE.
     * @returns {Promise<INoteSequence>} NoteSequence
     */
    static async getNew4BarMelody(){
        return VAE.requestSamples("melody", 4).then( (seqs) => seqs[0] );
    }

    /**
     * Generate a 4-bar Drum NoteSequence with MusicVAE.
     * @returns {Promise<INoteSequence>} NoteSequence
     */
    static async getNew4BarDrums(){
        return VAE.requestSamples("drums", 4).then( (seqs) => seqs[0] );
    }

    /**
     * Generate NoteSequences by sampling the model's prior.
     * @param {string} type
     * @param {number} nOfBars - size, in bars, of the samples
     * @param {number} numSamples - how much {@link INoteSequence}s to return
     * @param {number} [temperature=VAE.temperature]
     * @param {MusicVAEControlArgs} [controlArgs=null]
     * @param {number} [stepsPerQuarter=4]
     * @param {number} [qpm=120]
     * @returns {Promise<[INoteSequence]>} Promise of an array of NoteSequences.
     */
    static async requestSamples(type, nOfBars,
                                numSamples, temperature=VAE.temperature, controlArgs=null,
                                stepsPerQuarter=4, qpm=Playback.qpm) {
        return new Promise((resolve, reject) => {
            let ch = new MessageChannel();
            ch.port1.onmessage = (event) => {
                resolve(event.data.sequences);
            }
            VAE.#getWorker().postMessage({
                msg: "sampleRequest",
                type: type,
                bars: nOfBars,
                numSamples: numSamples,
                temperature: temperature,
                controlArgs: controlArgs,
                stepsPerQuarter: stepsPerQuarter,
                qpm: qpm
            }, [ch.port2]);
        });
    }

    /**
     * Uses MusicVAE to interpolate between 2 or 4 given sequences.
     *
     * From the magenta's JSDoc:
     *
     * If 2 sequences are given, a single linear interpolation is computed,
     * with the first output sequence being a reconstruction of sequence A and
     * the final output being a reconstruction of sequence B, with
     * `numInterps` total sequences.
     *
     * If 4 sequences are given, bilinear interpolation is used. The results
     * are returned in row-major order for a matrix with the following layout:
     *   | A . . C |
     *   | . . . . |
     *   | . . . . |
     *   | B . . D |
     * where the letters represent the reconstructions of the four inputs, in
     * alphabetical order, with the number of output columns and rows specified
     * by `numInterps`.
     * @async
     * @static
     * @param {[INoteSequence]} seqs - Array with 2 or 4 note sequences
     * @param {number|number[]} n - The number of pairwise interpolation sequences to
     * return, including the reconstructions. If 4 inputs are given, this can be
     * either a single number specifying the side length of a square, or a
     * `[columnCount, rowCount]` array to specify a rectangle.
     * @returns {Promise<[INoteSequence]>}
     */
    static async interpolateSequences(seqs, numInterps=4){
        if(seqs.length!=2 && seqs.length!=4){
            throw new Error(`Parameter "seqs" must be an array containing exactly 2 or 4 note sequences`);
        }
        return new Promise((resolve, reject) => {
            let ch = new MessageChannel();
            ch.port1.onmessage = (event) => {
                resolve(event.data.interpolatedSeqs);
            }
            VAE.#getWorker().postMessage({
                msg: "interpolationRequest",
                seqs: seqs,
                n: numInterps,
                temperature: VAE.temperature
            }, [ch.port2]);
        });
    }

    /**
     * Given a note sequence, generates new sequences that are similar to it.
     * @param {INoteSequence} seq - the source note sequence
     * @param {number} numSamples - number of note sequences
     * @param {number} similarity - a number between 0 and 1 (with 1 being the most similar)
     * @param {number} [temperature=VAE.temperature]
     * @param {MusicVAEControlArgs} [controlArgs=null]
     * @returns {Promise<[InoteSequence]>}
     */
    static async similarSequencesRequest(seq, numSamples, similarity, temperature=VAE.temperature, controlArgs=null){
        return new Promise((resolve, reject) => {
            let ch = new MessageChannel();
            ch.port1.onmessage = (event) => {
                resolve(event.data.similarSequences);
            }
            VAE.#getWorker().postMessage({
                msg: "similarSequencesRequest",
                seq: seq,
                numSamples: numSamples,
                similarity: similarity,
                temperature: temperature,
                controlArgs
            }, [ch.port2]);
        });
    }

    static#getWorker(){
        if(!VAE.worker){
            VAE.initializeWorker();
        }
        return VAE.worker;
    }

    static initializeWorker(){
        console.log("initializing workerVAE.js");
        VAE.worker = new Worker("magenta/workers/workerVAE.js");
    }
}