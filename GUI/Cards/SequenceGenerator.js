/**
 * An abstract class for a generator card. It contains a button to generate
 * new {@link INoteSequence}s.
 * @abstract
 * @extends SequenceCard
 */
class SequenceGenerator extends SequenceCard {
    generateBtn;

    /**
     * @hideconstructor
     * @param {*} noteSequence 
     * @param {*} title 
     * @param {*} type 
     */
    constructor(noteSequence, title, type){
        super(noteSequence, title, type);
        /* mimic abstact class */
        if(this.constructor.name == "SequenceGenerator"){
            throw new Error("SequenceGenerator is an abstract class and cannot be instantiated");
        };
        
        this.generateBtn = document.createElement("button");
        this.generateBtn.innerText = "generate";
        this.generateBtn.addEventListener("click", async () => {
            let seq = await this.generateSequence();
            this.setNoteSequence( seq );
        });

        this.cardDiv.appendChild(this.generateBtn);
    }

    /**
     * Generate a new {@link INoteSequence}
     * @async
     * @abstract
     * @returns {INoteSequence} The generated INoteSequence
     */
    async generateSequence(){
        /* mimic abstact method */
        throw new Error('generateSequence must be implemented in class '+this.constructor.name);
    }
}