
// Create AudioContext and destination (audio.io.masterOut)
audio.io.initialize();

// Create the master volume control and connect its output
// "port" to the destination node.
var masterChannelStrip = new audio.io.BasicChannelStrip();
masterChannelStrip.connect(audio.io.masterOut);


function onNoteOn(channel, freq, velocity) {
	if(velocity === 0) {
		playableOsc.stop( freq );
	}
	else {
		playableOsc.start( freq, velocity );
	}
}


// Attempt to do the MIDI dance on channel 1,
// with no event debugging.
var midi = new audio.io.MIDI( 1, false );
midi.events.on('noteOn', onNoteOn);

// Also hook up the computer keyboard, just incase
// the MIDI above fails to connect.
var keyboard = new audio.io.Keyboard();
keyboard.events.on('noteOn', onNoteOn);

// Listen to the `pitchbend` event from the MIDI node and scale the
// input (0-127) to the panpot's accepted value range of -50 to 50.
midi.events.on('pitchbend', function(channel, something, value) {
	masterChannelStrip.panPot.setPosition( audio.io.utils.scaleNumber(value, 0, 127, -50, 50) );
});


// Create a playable oscillator (not single-shot) and
// allow it to have up to 16 voices, using a sine wave,
// and set the retriggering argument to true, and
// volumeControl curve to x*x
var playableOsc = new audio.io.Oscillator( 'sine', 16, true, 'x*x' );
playableOsc.connect( masterChannelStrip );




// Create a new LFO instance and tell it to modulate the main volume control level
var lfo = new audio.io.LFO( 'sine', 1 );
lfo.start();

playableOsc.connectMod(lfo, 'pitch');