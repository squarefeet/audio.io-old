
// Create AudioContext and destination (audio.io.masterOut)
audio.io.initialize();

// Create the master volume control and connect its output
// "port" to the destination node.
var volume = (new audio.io.VolumeControl( 'x*x', 50 )).connect('out', audio.io.masterOut);


// Create a single-shot sine osc at 150hz,
// and connect it to the volume node above.
// Note that the 3rd argument here lets the class know to
// create a volume control as well.
var osc = new audio.io.MonoOscillator('square', 150, 'x*x', 50);
osc.connect('out', volume);

// Put your hands up for Detroit...
osc.start();


setTimeout(function() {
	// ...Or not. Spoilsport.
	osc.stop();
}, 1000);





// Attempt to do the MIDI dance on channel 1,
// with no event debugging.
var midi = new audio.io.MIDI( 1, false );


// Create a panpot
var panpot = new audio.io.PanPot(0);

// Listen to the `pitchbend` event from the MIDI node and scale the
// input (0-127) to the panpot's accepted value range of -50 to 50.
midi.events.on('pitchbend', function(channel, something, value) {
	value = audio.io.utils.scaleNumber(value, 0, 127, -50, 50);

	panpot.setPosition(value);
});

// Connect the panpot to master out
panpot.connect('out', volume);

// Create a playable oscillator (not single-shot) and
// allow it to have up to 16 voices, using a sine wave,
// and set the retriggering argument to true.
var playableOsc = new audio.io.Oscillator( 'sine', 16, true, 'x*x' );
playableOsc.connect('out', panpot);

midi.events.on('noteOn', function(channel, freq, velocity) {
	if(velocity === 0) {
		playableOsc.stop( freq );
	}
	else {
		playableOsc.start( freq, velocity );
	}
});


