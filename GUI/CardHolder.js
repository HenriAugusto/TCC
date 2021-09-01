var PLAYER_HAND;

/**
 * A class for containing and displaying Cards. It is primarily used to display the
 * cards in the player's "hand".
 */
class CardHolder {
    cards = [];
    div;

    /**
     * Constructs a CardHolder object.
     * @param {Element} element - the element that is going to be used to display
     * the cards
     */
    constructor(element){
        this.div = element;
        element.classList.add("cardHolder");
    }

    /**
     * Adds or more Cards to the CardHolder
     * @param {Card|Card[]} c - A single Card or an array of Cards to be added.
     * @returns {number} - The resulting number of cards in the CardHolder.
     */
    addCards(c){
        if(!Array.isArray(c)) c = [c];
        c.forEach( card => {
            this.div.appendChild(card.cardDiv);
        });
        return this.cards.push(...c);
    }

    /**
     * Renives a card fromn the CardHolder.
     * @param {Card} card - the Card to be removed.
     * @throws {Error} - Throws an error if the card is not in the CardHolder.
     */
    removeCard(card){
        if( this.cards.indexOf(card) == -1 ){
            throw new Error("Can't remove Card because it is not in the CardHolder."
                                +"Card index: "+card.index);
        }
        this.cards = this.cards.filter( x => x !== card);
        card.cardDiv.remove();
    }

    /**
     * Remove all cards from the holder
     * @returns {Card[]} All the removed cards
     */
    clear(){
        let temp = [...this.cards];
        this.cards.forEach(x => this.removeCard(x));
        return temp;
    }

    /**
     * Creates an snapshot containing all the information needed
     * to recreate this object later. Meant to be used with {@link SaveLoad}.
     * @returns {Object} snapshot
     */
    save(){
        let out = {
            cards: []
        };
        this.cards.forEach(card => out.cards.push(card.save() ) );
        return out;
    }

    /**
     * Reconstructs a object from it snapshot. Meant to be used with {@link SaveLoad}.
     * @static
     * @param {Object} obj - As returned from the {@link save()} method.
     * @returns
     */
    static load(obj, element){
        let ch = new CardHolder(element);
        obj.cards.forEach( c => {
            let card;
            switch(c.class){
                case "SequenceCard":
                    card = SequenceCard.load(c);
                    break;
                case "MelodyGenerator":
                    card = MelodyGenerator.load(c);
                    break;
                case "DrumsGenerator":
                    card = DrumsGenerator.load(c);
                    break;
                case "EditorCard":
                    card = EditorCard.load(c);
                    break;
                case "ContinueCard":
                    card = ContinueCard.load(c);
                    break;
                case "InterpolationCard":
                    card = InterpolationCard.load(c);
                    break;
                default:
                    throw new Error("CardHolder.load() error: wrong card class: "+c.class);
            }
            if(card) ch.addCards(card);
        });
        return ch;
    }
}