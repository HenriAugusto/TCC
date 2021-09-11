class Game {
    static maxHandSize = 10;
    static deckSize = 60;
    static weights = {
        "Melody": 20,
        "Drums": 20,
        "MelodyGenerator": 6,
        "DrumsGenerator": 6,
        "EditorCard": 1,
        "ContinueCard": 10
    }

    /**
    * Creates an snapshot containing all the information needed
    * to recreate this object later. Meant to be used with {@link SaveLoad}.
    * @returns {Object} snapshot
    */
    static save(){
        return {
            maxHandSize: Game.maxHandSize,
            deckSize: Game.deckSize,
            weights: Game.weights
        }
    }

    /**
     * Reconstructs a object from it snapshot. Meant to be used with {@link SaveLoad}.
     * @static
     * @param {Object} obj - As returned from the {@link save()} method.
     * @returns
     */
    static load(obj){
        Game.maxHandSize = obj.maxHandSize;
        Game.deckSize = obj.deckSize;
        Game.weights = obj.weights;
    }
}