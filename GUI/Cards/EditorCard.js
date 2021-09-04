class EditorCard extends Card {
    static pianoEditor;

    constructor(){
        super("Editor", "EditorCard");
        let icon = document.createElement("img");
            icon.setAttribute("src", "GUI/Cards/CardIcons/PianoEditor.svg");
            icon.setAttribute("alt", "Editor Card Icon");
            icon.classList.add("editorCardIcon");
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
        return new EditorCard();
    }

}