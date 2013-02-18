// Create AudioContext and destination (audio.io.masterOut)
audio.io.initialize();


var volumeControl = new audio.io.VolumeControlController({
	curve: 'x*x',
	value: 100
});
volumeControl.connect(audio.io.masterOut);
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
eq.setPoint(4, 'gain', 50.0);

var utility = new audio.io.Utility();
utility.connect( eq );
utility.setLeftPhase(true);
utility.setRightPhase(true);

var reverb = new audio.io.Reverb(null, 50);
reverb.connect( utility );

var delay = new audio.io.StereoDelay(0.7, 0.2, 0.4, 50);
delay.connect( reverb );

var ringmod = new audio.io.RingMod( 20, 50);
ringmod.connect(delay);



// Lets make us a multi-osc.... ;)
var playableOsc = new audio.io.MultiOscillator({
	type: 'sawtooth',
	numOscs: 1,
	detune: 0,
	detuneType: 'center'
});
playableOsc.connect( ringmod );