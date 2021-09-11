class Game {
    static maxHandSize = 10;
    static deckSize = 60;

    /**
    * Creates an snapshot containing all the information needed
    * to recreate this object later. Meant to be used with {@link SaveLoad}.
    * @returns {Object} snapshot
    */
    static save(){
        return {
            maxHandSize: Game.maxHandSize,
            deckSize: Game.deckSize
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
    }
}