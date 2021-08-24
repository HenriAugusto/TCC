/**
 * This class provides DoUndo functionality to
 * a {@link PianoEditor} using states.
 */
export default class DoUndo {
    editor;
    past = [];
    present;
    future = [];

    /**
     * Constructs a DoUndo that is attached to the given editor.
     * @param {PianoEditor} editor
     */
    constructor(editor){
        this.editor = editor;
    }

    clear(){
        this.future.length = 0;
        this.past.length = 0;
        this.present = null;
    }

    /**
     * Snapshots the current state of the editor.
     * This should be called **after** the changes.
     */
    snapshot(){
        if(this.present) this.past.push(this.present);
        this.present = new PianoEditorState(this.editor);
        this.future.length = 0;
    }

    redo(){
        if( this.future.length == 0) return;
        this.past.push( this.present );
        this.present = this.future.pop();
        this.#applyState( this.present );
    }

    undo(){
        if( this.past.length == 0) return;
        this.future.push( this.present );
        this.present = this.past.pop();
        this.#applyState( this.present );
    }

    /**
     * Returns the {@link Editor} to the given state.
     * @private
     * @param {PianoEditorState} state
     */
    #applyState(state){
        this.editor.resize( state.numSteps );
        this.editor.isDrumSequence = state.isDrumSequence;
        this.editor.loadSequence( state.noteSequence );
        let editorWindow = this.editor.div.querySelector(".pianoEditorWindow");
        editorWindow.scrollTop = state.scrollTop;
        editorWindow.scrollLeft = state.scrollLeft;
    }

}

class PianoEditorState {
    numSteps;
    noteSequence;
    selectedNotes;
    isDrumSequence;
    scrollTop;
    scrollLeft;

    constructor(editor){
        this.numSteps = editor.numSteps;
        this.noteSequence = editor.buildNoteSequence();
        this.selectedNotes = [...editor.selection.notes];
        this.isDrumSequence = editor.isDrumSequence;
        this.scrollTop = editor.div.querySelector(".pianoEditorWindow").scrollTop;
        this.scrollLeft = editor.div.querySelector(".pianoEditorWindow").scrollLeft;
    }
}