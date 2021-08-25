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
}