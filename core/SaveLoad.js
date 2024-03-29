/**
 * Class used to save and load game states.
 */
class SaveLoad {
    static get GAME_SERIALIZATION_VERSION() { return "0.1"; } //major.bugfix

    static save(){
        let game = {
            serializationVersion: SaveLoad.GAME_SERIALIZATION_VERSION,
            gameSettings: Game.save(),
            playerHand: PLAYER_HAND.save(),
            timeline: MAIN_TIMELINE.save()
        }
        let gameJSON = JSON.stringify(game, null, 2);
        SaveLoad.download(gameJSON, Game.gameName+".json");
    }

    static async load(){
        PLAYER_HAND.clear();
        let fileSystemHandles = await window.showOpenFilePicker();
        let file = await fileSystemHandles[0].getFile();
        let contentJSON = await file.text();
        let game = JSON.parse(contentJSON);
        Game.load(game.gameSettings);
        document.querySelector("#nameInput").value = Game.gameName;
        PLAYER_HAND = CardHolder.load(game.playerHand, PLAYER_HAND.div);
        while (MAIN_TIMELINE.node.firstChild) {
            MAIN_TIMELINE.node.removeChild(MAIN_TIMELINE.node.firstChild);
        }
        MAIN_TIMELINE = Timeline.load(game.timeline, MAIN_TIMELINE.node);
    }

    static download(JSONString, filename){
        const a = document.createElement("a");
        let blob = new Blob( [JSONString], { type: "text/plain" } );
        a.href = URL.createObjectURL(blob);
        a.setAttribute("download", filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // https://stackoverflow.com/questions/64179468/how-to-convert-a-magenta-js-note-sequence-to-a-midi-file
        // https://stackoverflow.com/questions/29200256/wait-for-user-to-finish-downloading-a-blob-in-javascript/66905746
        setTimeout( () => URL.revokeObjectURL(a.href), 0);

    }

    static loadCard(obj){
        switch(obj.class){
            case "SequenceCard":
                return SequenceCard.load(obj);
            case "MelodyGenerator":
                return MelodyGenerator.load(obj);
            case "DrumsGenerator":
                return DrumsGenerator.load(obj);
            case "EditorCard":
                return EditorCard.load(obj);
            case "ContinueCard":
                return ContinueCard.load(obj);
            case "InterpolationCard":
                return InterpolationCard.load(obj);
            case "VariationsCard":
                return VariationsCard.load(obj);
            default:
                throw new Error("SaveLoad.loadCard() error: wrong card class: "+obj.class);
        }
    }
}