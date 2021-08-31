/**
 * Class used to save and load game states.
 */
class SaveLoad {

    static save(){

    }

    static load(){

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

}