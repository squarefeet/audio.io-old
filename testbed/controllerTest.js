// Create AudioContext and destination (audio.io.masterOut)
audio.io.initialize();

var analyser = new audio.io.AnalyserController({
    width: 500,
    height: 150,

    updateRate: 20,
    granularity: 2048,
    smoothing: 0.7,

    frequencyScaling: 'log',
    dBScaling: 'linear',
    display: 'line',
    drawPeak: true,
    mindB: -192,
    maxdB: 40,

    backgroundColor: 'rgba(50, 50, 50, 1)',
    bandColor: 'rgba(237, 112, 32, 1)',
    peakColor: 'rgba(237, 112, 32, 0.3)',
    barColor: 'rgba(100, 100, 100, 0.3)',
    accentuatedBarColor: 'rgba(150, 150, 150, 1)',
    textColor: 'rgba(150, 150, 150, 1)'
});

analyser.connect(audio.io.masterOut);
analyser.appendTo(document.body);


var volumeControl = new audio.io.VolumeControlController({
	curve: 'x*x',
	value: 50
});
volumeControl.connect(analyser);
volumeControl.appendTo(document.body);

var panPotController = new audio.io.PanPotController({
    width: 30,
    height: 30,
    from: -50,
    to: 50,
    value: 0,
    label: 'Panpot'
});
panPotController.appendTo(document.body);
panPotController.connect( volumeControl );


function onNoteOn(channel, freq, velocity) {
	if(velocity === 0) {
		playableOsc.stop( freq );
	}
	else {
        console.log(freq);
		playableOsc.start( freq, velocity );
	}
}

function onNoteOff(channel, freq, velocity) {
	playableOsc.stop( freq );
}


// Attempt to do the MIDI dance on channel 1,
// with no event debugging.
var midi = new audio.io.MIDI( 1, false );
midi.events.on('noteOn', onNoteOn);
midi.events.on('noteOff', onNoteOff);


// Also hook up the computer keyboard, just incase
// the MIDI above fails to connect.
var keyboard = new audio.io.Keyboard();
keyboard.events.on('noteOn', onNoteOn);
keyboard.events.on('noteOff', onNoteOff);

// Listen to the `pitchbend` event from the MIDI node and scale the
// input (0-127) to the panpot's accepted value range of -50 to 50.
midi.events.on('pitchbend', function(channel, something, value) {
	panPotController.node.setPosition( audio.io.utils.scaleNumber(value, 0, 127, -50, 50) );
});


var eq = new audio.io.Equalizer(10);
eq.connect(panPotController);
// eq.setPoint(1, 'gain', 50);
// eq.setPoint(1, 'Q', 10);

// eq.setPoint(2, 'gain', -50);
// eq.setPoint(2, 'Q', 100);


var utility = new audio.io.Utility();
utility.connect( eq );
utility.setLeftPhase(true);
utility.setRightPhase(true);

var reverb = new audio.io.Reverb('impulse_rev.wav', 30);
reverb.connect( utility );

var delay = new audio.io.StereoDelay(0.7, 0.2, 0.3, 0);
delay.connect( reverb );

var ringmod = new audio.io.RingMod( 5, 0);
ringmod.connect(delay);



// Lets make us a multi-osc...
var playableOsc = new audio.io.MultiOscillator({
	type: 'square',
	numOscs: 2,
	detune: 10,
	detuneType: 'up'
});
playableOsc.connect( ringmod );




// Some small views
var select = new audio.io.SelectBoxController({
    options: ['sine', 'square', 'sawtooth', 'triangle']
});
select.appendTo(document.body);

var button = new audio.io.ButtonController({
    label: 'Some label:'
});
button.appendTo(document.body);

var range = new audio.io.HorizontalRangeController({

});
range.appendTo(document.body);