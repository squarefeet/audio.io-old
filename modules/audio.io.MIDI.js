// FIXME: Make a simple PubSub class and use something like the following
//        as this MIDI class's output port? Or is this overkill?
//
//			var osc = new audio.io.MonoOscillator('sine');
//			var volume = new audio.io.VolumeControl();
//			var midi = new audio.io.MIDI();
//
//			volume.connect('out', audio.io.masterOut);
//
//			midi.on('note:on', function(channel, freq, velocity) {
//				velocity = audio.io.utils.scaleNumber(velocity, 0, 127, 0, 100);
//				osc.setFreq( freq );
//				volume.setValue(velocity);
//				osc.start();
//			});
//
//			midi.on('note:off', function(channel, freq, velocity) {
//				osc.stop();
//			});
//
// FIXME: Or (!), in the soon-to-be OscGroup class (see plan.md), have that
//        auto-bind events to an audio.io.MIDI instance passed as an arg?
//
// @requires WebMIDI || (Jazz-Plugin && WebMIDIAPIShim from @cwilso)
//
audio.io.MIDI = audio.io.Node.extend({
	initialize: function() {

		// Bind scope.
		this.onAccessSuccess = this.onAccessSuccess.bind(this);
		this.onAccessFailure = this.onAccessFailure.bind(this);
		this.onInputMessage  = this.onInputMessage.bind(this);

		// Try to initialize MIDI...
		navigator.requestMIDIAccess( this.onAccessSuccess, this.onAccessFailure );

		// If successful, the MIDI connection will be stored here.
		// Ins and Outs (Arrays) will be stored in the props below,
		// too.
		this.midi = null;
		this.inputs = null;
		this.outputs = null;
	},

	onAccessSuccess: function( midi ) {
		this.midi = midi;
		this.inputs = midi.getInputs();
		this.outputs = midi.getOutputs();

		console.log('Found', this.inputs.length, 'MIDI inputs');

		// For now just use 2nd input port (my axiom 25)
		var input = this.midi.getInput(1);
		input.onmessage = this.onInputMessage;
	},

	onAccessFailure: function( err ) {
		console.log('MIDI failed:', err);
	},

	onInputMessage: function( msg ) {
		var data = msg.data,
			fn = data[0],
			byte2 = data[1],
			byte3 = data[2],

			channel = this._io.utils.getChannelFromMIDIFunction( fn );


		console.log(channel, byte2, byte3);
	}
});