var MAIN_TIMELINE;

function initGUI(){
    MAIN_TIMELINE = new Timeline( document.getElementById("timeline") );
    initTemperatureSlider();
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