class CardGenerator {

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
            case "VariationsCard":
                seq = Math.random()<=0.5 ? await VAE.getNew4BarMelody() : seq = await VAE.getNew4BarDrums();
                return new VariationsCard("Variations");
            default:
                throw new Error("Implement "+cardType+" in CardDealer.deal()");
        }
    }

    static pickType(){
        let lottery = [];
        for (let t in Game.weights){
            for (let i = 0; i < Game.weights[t]; i++){
                lottery.push(t);
            }
        }
        return lottery[Math.floor(Math.random()*lottery.length)];
    }
}