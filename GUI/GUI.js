var MAIN_TIMELINE;

function initGUI(){
    MAIN_TIMELINE = new Timeline( document.getElementById("timeline") );
    initTemperatureSlider();
}

function initTemperatureSlider(){
    var slider = document.getElementById("temperatureSlider");
        slider.value = rnn_temperature;
    var output = document.getElementById("temperatureDisplay");
        output.innerHTML = slider.value;

    slider.oninput = function() {
        output.innerHTML = this.value;
        rnn_temperature = parseFloat(this.value);
        vae_temperature = parseFloat(this.value);
    }
}