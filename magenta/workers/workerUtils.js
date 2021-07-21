/**
 * Wait for the model's initialization.
 *
 * Since we initialize all models on startup it
 * is better to wait for the initialization.
 * If you try to use the model while it is initialized
 * it gets initialized more than once.
 * @param {MusicVAE|MusicRNN} model
 * @returns {Promise<void>} promise
 */
 async function waitModelInitialization(model){
    console.log("waiting model initialization: "+model.checkpointURL.match(/\w+$/) );
    return new Promise( (resolve, reject) => {
        let loop = setInterval( () => {
            // MusicVAE, MusicRNN
            if( typeof model.isInitialized === 'function'){
                if( !model.isInitialized() ){
                } else {
                    resolve();
                    clearInterval(loop);
                }
            // MidiMe doesn't have isInitialized()...
            } else {
                if( !model.initialized ){
                    console.log("waiting model initialization");
                } else {
                    resolve();
                    clearInterval(loop);
                }
            }
        }, 250)
    });
}