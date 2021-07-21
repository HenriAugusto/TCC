var MAIN_TIMELINE;

function initGUI(){
    MAIN_TIMELINE = new Timeline( document.getElementById("timeline") );
    initTemperatureSlider();
    PLAYER_HAND = new CardHolder( document.getElementById("cardHolder") );
    MAIN_DECK = new Deck();
    MAIN_DECK.addDeckIcon( document.querySelector("body") );
    
    MAIN_DECK.addCardsToTop( new SequenceCard(MELODY_3, "Drawer 6", "Melody"));
    MAIN_DECK.addCardsToTop( [
        new MelodyGenerator(MELODY_1, "Drawer 1"),
        new SequenceCard(MELODY_2, "Drawer 2", "Melody"),
        new DrumsGenerator(DRUM_SEQ_3, "Drawer 3"),
        new SequenceCard(BEETH_9TH, "Drawer 4", "Melody"),
        new MelodyGenerator(MELODY_4, "Drawer 5")
    ]);
}

function initTemperatureSlider(){
    var sliderVAE = document.getElementById("temperatureSliderVAE");
        sliderVAE.value = VAE.temperature;
    var displayVAE = document.getElementById("temperatureDisplayVAE");
        displayVAE.innerHTML = sliderVAE.value;

    sliderVAE.oninput = function() {
        displayVAE.innerHTML = this.value;
        VAE.temperature = parseFloat(this.value);
    }

    var sliderRNN = document.getElementById("temperatureSliderRNN");
        sliderRNN.value = VAE.temperature;
    var displayRNN = document.getElementById("temperatureDisplayRNN");
        displayRNN.innerHTML = sliderRNN.value;

    sliderRNN.oninput = function() {
        displayRNN.innerHTML = this.value;
        RNN.temperature = parseFloat(this.value);
    }
}