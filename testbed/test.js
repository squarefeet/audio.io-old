
// Create AudioContext and destination (audio.io.masterOut)
audio.io.initialize();

// Create the master volume control and connect its output
// "port" to the destination node.
var masterChannelStrip = new audio.io.BasicChannelStrip('x*x', 50);
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


// Create some yummy reverb
var reverb = new audio.io.Reverb();
reverb.connect( masterChannelStrip );

// Create a filter (lowpass, 200hz, 1unit of resonance, and 100% dry/wet)
var filter = new audio.io.Filter('lowpass', 200, 1, 100);
filter.connect( reverb );



// Create a playable oscillator (not single-shot) and
// allow it to have up to 16 voices, using a sine wave,
// and set the retriggering argument to true, and
// volumeControl curve to x*x
var playableOsc = new audio.io.Oscillator( 'sawtooth', 16, true, 'x*x' );
playableOsc.connect( filter );




// Create a new LFO instance at 3hz and 300 depth units
var pitchLfo = new audio.io.LFO( 'sine', 3, 100 );
pitchLfo.start();

// Make another LFO at 1hz and 5 depth units
var lfoMod = new audio.io.LFO('sawtooth', 0.5, 10);
lfoMod.start();

// Aaaand another LFO to mod the filter cutoff
var filterLfo = new audio.io.LFO('sine', 0.2, 4000);
filterLfo.start();

// Connect the lfoMod to the pitchLfo frequency value,
// so we end up with a nice off-beat filter wobble.
pitchLfo.connectMod(lfoMod, 'frequency');
filter.connectMod(pitchLfo, 'frequency');

//
playableOsc.connectMod(pitchLfo, 'pitch');

filter.connectMod(filterLfo, 'frequency');