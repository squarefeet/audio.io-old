
// Create AudioContext and destination (audio.io.masterOut)
audio.io.initialize();

// Create the master volume control and connect its output
// "port" to the destination node.
var volume = (new audio.io.VolumeControl( 'linear', 10 )).connect('out', audio.io.masterOut);


// Create a single-shot sine osc at 150hz,
// and connect it to the volume node above.
var osc = new audio.io.MonoOscillator('sine', 150, 16);
osc.connect('out', volume);

// Put your hands up for Detroit...
osc.start();


setTimeout(function() {
	// ...Or not. Spoilsport.
	osc.stop();
}, 1000);





// Attempt to do the MIDI dance.
var midi = new audio.io.MIDI();

// Create a playable oscillator (not single-shot) and
// allow it to have up to 16 voices, using a sine wave,
// and set the retriggering argument to true.
var playableOsc = new audio.io.Oscillator( 'sine', 16, true );

playableOsc.connect('out', volume);

midi.events.on('noteOn', function(channel, freq, velocity) {

	freq = audio.io.utils.midiNoteToFreq( freq );

	if(velocity === 0) {
		playableOsc.stop( freq );
	}
	else {
		playableOsc.start( freq );
	}
});