/**
 * An class representing a single Card.
 * @extends Card
 */
class ContinueCard extends Card {

    constructor(){
        super("Continue", "ContinueCard");
        let icon = document.createElement("img");
            icon.setAttribute("src", "GUI/Cards/CardIcons/ContinueCard.svg");
            icon.setAttribute("alt", "Continue Card Icon");
            icon.classList.add("continueCardIcon");
        this.cardDiv.querySelector("p").remove();
        this.cardDiv.append(icon);
    }

    /**
     * Reconstructs a object from it snapshot. Meant to be used with {@link SaveLoad}.
     * @static
     * @param {Object} obj - As returned from the {@link save()} method.
     * @returns
     */
    static load(obj){
        return new ContinueCard();
    }
}