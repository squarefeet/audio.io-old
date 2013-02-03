
// Create AudioContext and destination (audio.io.masterOut)
audio.io.initialize();

// Create the master volume control and connect its output
// "port" to the destination node.
var volume = (new audio.io.VolumeControl( 'x*x', 50 )).connectTo(audio.io.masterOut);


// Attempt to do the MIDI dance on channel 1,
// with no event debugging.
var midi = new audio.io.MIDI( 1, false );


// Create a panpot...
var panpot = new audio.io.PanPot(0);

// ..and connect it to master out
panpot.connectTo(volume);

// Listen to the `pitchbend` event from the MIDI node and scale the
// input (0-127) to the panpot's accepted value range of -50 to 50.
midi.events.on('pitchbend', function(channel, something, value) {
	panpot.setPosition( audio.io.utils.scaleNumber(value, 0, 127, -50, 50) );
});


// Create a playable oscillator (not single-shot) and
// allow it to have up to 16 voices, using a sine wave,
// and set the retriggering argument to true, and
// volumeControl curve to x*x
var playableOsc = new audio.io.Oscillator( 'sine', 16, true, 'x*x' );
playableOsc.connectTo(panpot);

midi.events.on('noteOn', function(channel, freq, velocity) {
	if(velocity === 0) {
		playableOsc.stop( freq );
	}
	else {
		playableOsc.start( freq, velocity );
	}
});

var lfo = new audio.io.LFO( 'sine', 1 );

lfo.connectTo( volume );

lfo.start();


