var beingInitialized = new Map();

/**
 * This function can be used to initialize a model
 * or wait for it to be initialized in case it is
 * being initialized already.
 *
 * @async
 * @param {MusicVAE|MusicVAE[]|MusicRNN|MusicRNN[]} m - A single model or an array of
 * models to be initialized.
 * @returns {Promise<void[]>} A promise resolved when all of the models are initialized.
 */
 async function initOrWaitModels(m){
    if(!Array.isArray(m)) m = [m];
    let initPromises = [];
    let initModelStyle = `font-weight:bold;color:lawngreen;
                            background-color:black; padding:0.5em`;
    let initializedStyle = "color: #ff3aff;font-weight: bolder";

    m.forEach( model => {
        let modelName = model.checkpointURL.match(/\w+$/);
        if ( model.isInitialized() ){
            initPromises.push( Promise.resolve() );
            return;
        }
        if( beingInitialized.has(model)){
            console.log("%cwaiting model initialization: "+modelName);
        } else {
            console.log("%cinitializing model: "+modelName, initModelStyle);
            beingInitialized.set(model, model.initialize());
            beingInitialized.get(model).then(() => {
                beingInitialized.delete(model);
                console.log("Model initialized: %c"+modelName, initializedStyle);
            });
        }
        initPromises.push( beingInitialized.get(model) );
    });
    return Promise.all(initPromises);
}

/**
 * Initialize models sequentially (one at a time).
 *
 * @async
 * @param {MusicVAE[]|MusicRNN[]} models
 * @returns {Promise<void>} a promise resolved when the final model is initialized
 */
async function chainInitialization(models){
    return new Promise(async (resolve, reject) => {
        for(let i=0; i<models.length; i++){
            await initOrWaitModels(models[i]);
        }
        resolve();
    });
}