
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


// Create some yummy delay and reverb
var reverb = new audio.io.Reverb(null, 15);
reverb.connect( masterChannelStrip );

var delay = new audio.io.StereoDelay(0.2, 0.2, 0.8, 5);
delay.connect( reverb );

// Create a filter (lowpass, 200hz, 1unit of resonance, and 100% dry/wet)
var filter = new audio.io.Filter('lowpass', 800, 13, null, 100);
filter.connect( delay );



// Lets make us a multi-osc.... ;)
var playableOsc = new audio.io.MultiOscillator({
	type: 'sawtooth',
	numOscs: 2,
	detune: 50,
	detuneType: 'center'
});
playableOsc.connect( filter );




var filterLfo = new audio.io.LFO('sine', 5, 700);
filterLfo.start();

filter.connectMod(filterLfo, 'frequency');