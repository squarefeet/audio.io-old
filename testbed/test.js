
// Create AudioContext and destination (audio.io.masterOut)
audio.io.initialize();

// Create the master volume control and connect its output
// "port" to the destination node.
var volume = (new audio.io.VolumeControl( 'linear', 50 )).connect('out', audio.io.masterOut);


// Create a sine osc (current Oscillator class is crappy) at 150hz,
// and connect it to the volume node above.
var osc = new audio.io.Oscillator('sine', 150, 16);
osc.connect('out', volume);

// Put your hands up for Detroit...
osc.start();


setTimeout(function() {
	// ...Or not. Spoilsport.
	osc.stop();
}, 1000);


// Attempt to do the MIDI dance.
var midi = new audio.io.MIDI();