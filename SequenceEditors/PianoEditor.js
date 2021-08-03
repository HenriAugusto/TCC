const WHITE_KEYS = [0,2,4,5,7,9,11];
var CSS_INITIALIZED = false;

/**
 * A Piano Roll {@link NoteSequence} editor.
 */
export default class PianoEditor {
    div;
    zIndex=1;
    midiMin = 21; //A0, piano lowest note
    midiMax = 108; //C8, piano highest note
    lanes = [];
    /** Not to be confused with {@link INote}'s quantization info */
    steps = 16;


    constructor(){
        if(!CSS_INITIALIZED){
            initializeCSS();
        }
        this.div = document.createElement("div");
        this.div.classList.add("PianoEditor")

        let bkg = document.createElement("div");
            bkg.classList.add("pianoEditorBkg");

        let editorWindow = document.createElement("div");
            editorWindow.classList.add("editorWindow");

        this.div.append(bkg, editorWindow);


        Tonal.Range.chromatic([this.midiMin, this.midiMax]).forEach( note => {
            let pitch = Tonal.Midi.toMidi(note);
            let lane = new Lane(this, pitch, note.startsWith("C") ? note : "");
            this.lanes.push( lane );
        });
        console.log( this.lanes );

        document.querySelector("body").prepend(this.div);
    }



    edit(seq){
        return new Promise( (resolve, reject) => {
            seq.notes.forEach( note => {
                note.pitch -= 24;
            });
            resolve(seq);
        });
    }
}

/**
 * Each lane is a row to input notes of a single pitch
 */
class Lane {
    div;
    pitch;
    name;

    constructor(pianoEditor, pitch, name){
        const WHITE_KEYS = [0,2,4,5,7,9,11];

        let pitchClass = Tonal.Midi.midiToNoteName(pitch, { pitchClass: true });
        let lane = document.createElement("div");
            lane.classList.add("noteLane");
            lane.classList.add(pitchClass);

        let key = document.createElement("div");
            key.classList.add( "pianoKey" );
            key.classList.add( WHITE_KEYS.includes(pitch % 12) ? "whiteKey" : "blackKey" );
            key.classList.add(pitchClass);
            if( name ) key.innerText = name;

        if( pitch==pianoEditor.midiMin) key.classList.add("bottomKey");
        if( pitch==pianoEditor.midiMax) key.classList.add("topKey");

        let laneBkg = document.createElement("div");
            laneBkg.classList.add("laneBkg");
            laneBkg.classList.add(pitchClass);
            laneBkg.addEventListener("mouseover", () => {
                key.classList.add("highlighted");
            });
            laneBkg.addEventListener("mouseleave", () => {
                key.classList.remove("highlighted");
            });

        lane.append(key, laneBkg);
        pianoEditor.div.querySelector(".editorWindow").prepend(lane);

    }
}

function initializeCSS(){
    CSS_INITIALIZED = true;
    let fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", "SequenceEditors/PianoEditor.css");
    document.getElementsByTagName("head")[0].appendChild(fileref);
}