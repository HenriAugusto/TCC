var MAIN_DECK;

/**
 * A Deck of Cards
 */
class Deck {
    /**
     * An array containing the cards in the deck.
     * Index 0 means top of the deck.
     */
    cards = [];
    div;

    /**
     * Constructs an Deck, optionally initializing it's cards
     * @param {Card[]} [cards] - An array of cards to add to the deck.
     */
    constructor(cards=null){
        if(cards){
            this.addCardsToTop(cards);
        }
    }

    addDeckIcon(element){
        this.div = document.createElement("div");
        this.div.classList.add("deckIcon");
        let cards = 4;
        for(let i=0; i <cards; i++){
            let card = document.createElement("div");
            card.classList.add("deckIconComponent");
            this.div.append(card);
        }
        element.append(this.div);
        this.div.addEventListener("click", this.drawCardsToPlayersHand.bind(this) );
    }

    /**
     * Adds a single Card or an array of Cards on TOP of the deck
     * 
     * @param {Card|Card[]} cards A Card or an array of Cards to add
     * @returns {number} the resulting number of cards in the deck
     */
    addCardsToTop(cards){
        if(!Array.isArray(cards)) cards = [cards];
        if(!this.cards.length) this.enable();
        return this.cards.unshift(...cards);
    }

    /**
     * Adds a single Card or an array of Cards on the BOTTOM of the deck
     * 
     * @param {Card|Card[]} cards A Card or an array of Cards to add
     * @returns {number} the resulting number of cards in the deck
     */
    addCardsToBottom(cards){
        if(!Array.isArray(cards)) cards = [cards];
        if(!this.cards.length) this.enable();
        return this.cards.push(...cards);
    }
    
    /**
     * Utility method that Ddaws a single Card from the TOP of the deck.
     * @returns {Card|null} The drawn Card or null if the deck is empty.
     */
     drawCardFromTop(){
        return this.cards.length ? this.drawCardsFromTop(1)[0] : null;
    }

    /**
     * Draws Cards from the TOP of the deck.
     * @param {number} n - how many cards to draw
     * @returns {Card[]|null} The drawn Cards or `null` if the deck is empty.
     */
    drawCardsFromTop(n){
        let drawn = [];
        for(var i=0; i<n; i++){
            let card = this.cards.shift();
            if(card){
                drawn.push(card);
            } else {
                break;
            }
        }
        if( !this.cards.length) this.disable();
        return drawn.length ? drawn : null;
    }

    /**
     * Utility method that draws a single Card from the BOTTOM of the deck.
     * @returns {Card|null} The drawn Card or null if the deck is empty.
     */
    drawCardFromBottom(){
        return this.cards.length ? this.drawCardsFromBottom(1)[0] : null;
    }

    /**
     * Draws Cards from the BOTTOM of the deck.
     * @param {number} n - how many cards to draw
     * @returns {Card[]|null} The drawn Cards or `null` if the deck is empty.
     */
    drawCardsFromBottom(n){
        let drawn = [];
        for(var i=0; i<n; i++){
            let card = this.cards.pop();
            if(card){
                drawn.push(card);
            } else {
                break;
            }
        }
        if( !this.cards.length) this.disable();
        return drawn.length ? drawn : null;
    }

    /**
     * Utility method to draw cards directly to the player's hand.
     * @param {number} n - how many Cards to draw
     */
    drawCardsToPlayersHand(n=1){
        if(!this.cards.length) return;
        PLAYER_HAND.addCards( this.drawCardFromTop() );
    }

    /**
     * Shuffles the Deck
     */
    shuffle(){
        //https://stackoverflow.com/a/12646864/5818209
        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }
        this.cards = shuffleArray(this.cards);
    }

    /**
     * Signals to the user the deck has Cards
     */
    enable(){
        this.div.classList.remove("outOfCards");
    }

    /**
     * Signals to the user the deck is empty
     */
    disable(){
        this.div.classList.add("outOfCards");
    }
}