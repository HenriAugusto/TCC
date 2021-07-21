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
     * @param {Element} element - the element that is going to be used to display the cards
     */
    constructor(element){
        this.div = element;
        element.classList.add("cardHolder");
    }

    /**
     * Add a card to the CardHolder.
     * @param {Card} card
     */
    addCard(card){
        this.cards.push(card);
        this.div.appendChild(card.cardDiv);
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
}