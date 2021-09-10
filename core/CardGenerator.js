class CardGenerator {
    static weights = {
        "MelodyGenerator": 1,
        "Melody": 1,
        "Drums": 1,
        "DrumsGenerator": 1,
        "EditorCard": 1,
        "ContinueCard": 1
    }

    static async getCard(){
        let cardType = CardGenerator.pickType();
        let card = await CardGenerator.generate(cardType);
        return card;
    }

    static async generate(cardType){
        let seq;
        switch(cardType){
            case "EditorCard":
                return new EditorCard();
            case "ContinueCard":
                return new ContinueCard();
            case "Melody":
                seq = await VAE.getNew4BarMelody();
                return new SequenceCard(seq, "Melody", "Melody");
            case "Drums":
                seq = await VAE.getNew4BarDrums();
                return new SequenceCard(seq, "Drums", "Drums");
            case "MelodyGenerator":
                seq = await VAE.getNew4BarMelody();
                return new MelodyGenerator(seq, "Melody");
            case "DrumsGenerator":
                seq = await VAE.getNew4BarDrums();
                return new DrumsGenerator(seq, "Drums");
            default:
                throw new Error("Implement "+cardType+" in CardDealer.deal()");
        }
    }

    static pickType(){
        let lottery = [];
        for (let t in CardGenerator.weights){
            for (let i = 0; i < CardGenerator.weights[t]; i++){
                lottery.push(t);
            }
        }
        return lottery[Math.floor(Math.random()*lottery.length)];
    }
}