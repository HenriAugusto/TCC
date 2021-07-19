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
    return new Promise( (resolve, reject) => {
        let loop = setInterval( () => {
            if( !model.isInitialized() ){
                console.log("waiting model initialization");
            } else {
                resolve();
                clearInterval(loop);
            }
        }, 100)
    });
}