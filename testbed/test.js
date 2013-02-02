
// Create AudioContext and destination (audio.io.masterOut)
audio.io.initialize();

// Create the master volume control and connect its output
// "port" to the destination node.
var volume = (new audio.io.VolumeControl( 'x*x', 50 )).connect('out', audio.io.masterOut);


// Create a single-shot sine osc at 150hz,
// and connect it to the volume node above.
// Note that the 3rd argument here lets the class know to
// create a volume control as well.
var osc = new audio.io.MonoOscillator('sine', 150, 'x*x', 50);
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

// Create a playable oscillator (not single-shot) and
// allow it to have up to 16 voices, using a sine wave,
// and set the retriggering argument to true.
var playableOsc = new audio.io.Oscillator( 'sine', 2, true, 'x*x' );
playableOsc.connect('out', volume);

midi.events.on('noteOn', function(channel, freq, velocity) {

	freq = audio.io.utils.midiNoteToFreq( freq );

	if(velocity === 0) {
		playableOsc.stop( freq );
	}
	else {
		playableOsc.start( freq, velocity );
	}
});