/**
 * Class with static methods to handle with basic Playback
 * controls.
 */
class Playback {
    static activeTimeline;
    static player;
    static playerSF;
    //static playerDrums = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/jazz_kit');
    static activePlayer;
    static tempo = 120;
    static initialized = false;

    static initialize(timeline) {
        console.log("Initializing playback");
        Playback.initialized = true;
        Playback.activeTimeline = timeline;
        Playback.player = new mm.Player(timeline);
        Playback.playerSF = new mm.SoundFontPlayer(
                        'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus',
                        undefined, undefined, undefined, timeline);
        Playback.activePlayer = Playback.playerSF;
    }

    static play(seq){
        if(!Playback.initialized){
            console.log("Trying to play non-initialized Playback");
            return;
        }
        let newSeq = mm.sequences.clone(seq);
        newSeq.tempos = [ {qpm: Playback.tempo } ];
        Playback.stop();
        Playback.activePlayer.start(newSeq);
    }

    static stop(){
        if(!Playback.initialized){
            console.log("Trying to stop non-initialized Playback");
            return;
        }
        Playback.activePlayer.stop();
    }
}