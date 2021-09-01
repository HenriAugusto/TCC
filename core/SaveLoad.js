/**
 * Class used to save and load game states.
 */
class SaveLoad {

    static save(){
        let game = {
            playerHand: PLAYER_HAND.save()
        }
        let gameJSON = JSON.stringify(game, null, 2);
        SaveLoad.download(gameJSON, "game.json");
    }

    static async load(){
        PLAYER_HAND.clear();
        let fileSystemHandles = await window.showOpenFilePicker();
        let file = await fileSystemHandles[0].getFile();
        let contentJSON = await file.text();
        let game = JSON.parse(contentJSON);
        PLAYER_HAND = CardHolder.load(game.playerHand, PLAYER_HAND.div);
    }

    static download(JSONString, filename){
        const a = document.createElement("a");
        a.href = URL.createObjectURL(
            new Blob( [JSONString], { type: "text/plain" } )
        );
        a.setAttribute("download", filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
            default:
                throw new Error("SaveLoad.loadCard() error: wrong card class: "+obj.class);
        }
    }
}