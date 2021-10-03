/**
 * Class with static methods to handle with basic Playback
 * controls.
 */
class Playback {
    static player = new mm.Player();
    static playerSF = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
    //static playerDrums = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/jazz_kit');
    static activePlayer = Playback.playerSF;
    static tempo = 120;
    
    static play(seq){
        let newSeq = Object.assign ({}, seq);
        newSeq.tempos = [ {qpm: Playback.tempo } ];
        Playback.stop();
        Playback.activePlayer.start(newSeq);
    }

    static stop(){
        Playback.activePlayer.stop();
    }
}