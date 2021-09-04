/**
 * Global {@link Card} container.
 */
CARDS = {};

/**
 * Enumerator for types of {@link Card} objects.
 * @typedef {Object} CARD_TYPES
 * @const
 */
const CARD_TYPES = Object.freeze({
    "MelodyGenerator": "Melody Generator",
    "Melody": "Melody Card",
    "Drums": "Drums Card",
    "DrumsGenerator": "Drums Generator",
    "ContinueRNN": "Continue with RNN",
    "MelodyInterpolator": "Melody Interpolator",
    "EditorCard": "Editor Card",
    "ContinueCard": "Continue Card",
});

/**
 * An class representing a single Card.
 * @abstract
 */
class Card {
    static cardsIndexing = 0;
    title;
    type;
    cardDiv;
    index;

    /**
     * Contructs a Card
     * @hideconstructor
     * @param {string} title - Card's title
     * @param {CARD_TYPES} type - Card's type as defined in {@link CARD_TYPES}
     */
    constructor(title, type){
        /* mimic abstact class */
        if(this.constructor.name == "Card"){
            throw new Error("Card is an abstract class and cannot be instantiated");
        };
        this.title = title;
        if( !CARD_TYPES.hasOwnProperty(type) ){
            throw new Error("invalid type for card: "+type);
        }
        this.type = type;
        this.index = Card.#getUniqueIndex();

        this.cardDiv = document.createElement("div");
        this.cardDiv.classList.add("card");
        this.cardDiv.classList.add(type);
        this.cardDiv.id = "cardDiv_"+this.index;
        CARDS[this.cardDiv.id] = this;

        let titleEl = document.createElement("p");
        titleEl.innerHTML = title;
        this.cardDiv.appendChild(titleEl);

        this.makeCardDraggable();
        this.makeCardDroppable();
    }

    /**
     * Makes the Card draggable (as in the HTML Drag and Drop API),
     * also adding default code for the 'dragstart' an 'dragend' visual
     * feedback.
     */
    makeCardDraggable(){
        let card = this.cardDiv;
        card.setAttribute("draggable", true);

        // DRAG START
        card.addEventListener("dragstart", (event) => {
            card.style.opacity = 0.4;
            event.dropEffect = "link";
            DragAndDrop.dragPayload = this;
        });

        // DRAG END
        card.addEventListener("dragend", (ev) => {
            card.style.opacity = 1;
            this.#resetStyle();
        });
    }

    /**
     * Makes the Card droppable (as in the HTML Drag and Drop API),
     * also adding default code for the 'dragenter', 'dragleave',
     * 'dragover' and 'drop' events.
     * The code includes visual feedback and passing of the Card
     * being dropped to the target Card (through the {@link Card.receiveDroppedCard} method
     */
    makeCardDroppable(){
        let cardDiv = this.cardDiv;

        // DRAG ENTER
        cardDiv.addEventListener("dragenter", (event) => {
            if( !(this==DragAndDrop.dragPayload) && event.preventDefault) {
                event.preventDefault(); //prevents bubbling (accept drop)
                cardDiv.classList.add("highlighted");
            }
        });

        // DRAG LEAVE
        cardDiv.addEventListener("dragleave", (event) => {
            this.#resetStyle();
        });

        // DRAG OVER
        cardDiv.addEventListener("dragover", (event) => {
            if( !(this==DragAndDrop.dragPayload) && event.preventDefault) {
                event.preventDefault(); //prevents bubbling (accept drop)
            }
        });

        // DROP
        cardDiv.addEventListener("drop", (event) => {
            if (event.stopPropagation) {
                event.stopPropagation(); // stops the browser from redirecting.
            }
            this.#resetStyle();
            
            let draggedCard = DragAndDrop.dragPayload;
            DragAndDrop.dragPayload = null;
            console.log( draggedCard);
            this.receiveDroppedCard(draggedCard);

            if (event.preventDefault) { event.preventDefault(); } //prevents bubbling
        });
    }

    /**
     * This abstract method must be overridden in every extending class.
     * It is called when a Card is dropped into another.
     * @abstract
     * @param {Card} card
     */
    receiveDroppedCard(card){
        /* mimic abstact method */
        throw new Error('receiveDroppedCard must be implemented in class '+this.constructor.name);
    }

    /**
     * Returns a new unique index for a Card
     * @returns {number} the new index
     */
    static #getUniqueIndex(){
        return ++Card.cardsIndexing;
    }

    /**
     * Resets the element.style of the card.
     * Used to revert the visual feedback of Drag and Drop operations;
     */
    #resetStyle(){
        this.cardDiv.classList.remove("highlighted");
    }

    /**
     * Creates an snapshot containing all the information needed
     * to recreate this object later. Meant to be used with {@link SaveLoad}.
     * @returns {Object} snapshot
     */
    save(){
        return {
            title: this.title,
            type: this.type,
            index: this.index,
            class: this.constructor.name
        }
    }
}