class Game {
    static gameName = "untitled";
    static maxHandSize = 20;
    static deckSize = 60;
    static weights = {
        "Melody": 1,
        "Drums": 1,
        "MelodyGenerator": 8,
        "DrumsGenerator": 8,
        "EditorCard": 1,
        "ContinueCard": 20,
        "VariationsCard": 20
    }

    static setName(str){
        Game.gameName = str;
    }

    /**
    * Creates an snapshot containing all the information needed
    * to recreate this object later. Meant to be used with {@link SaveLoad}.
    * @returns {Object} snapshot
    */
    static save(){
        return {
            gameName: Game.gameName,
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
        Game.gameName = obj.gameName;
        Game.maxHandSize = obj.maxHandSize;
        Game.deckSize = obj.deckSize;
        Game.weights = obj.weights;
    }
}