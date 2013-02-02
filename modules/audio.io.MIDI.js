//
// @requires WebMIDI || (Jazz-Plugin && WebMIDIAPIShim from @cwilso)
//
audio.io.MIDI = audio.io.Node.extend({
	initialize: function( channel, eventDebugging ) {

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

		this.channel = +channel || 1;

		this.events = new PubSub({
			debug: !!eventDebugging
		});
	},

	onAccessSuccess: function( midi ) {
		this.midi = midi;
		this.inputs = midi.getInputs();
		this.outputs = midi.getOutputs();

		console.log('Found', this.inputs.length, 'MIDI inputs');

		// For now just use 2nd input port (my axiom 25)
		var input = this.midi.getInput( this.channel );
		input.onmessage = this.onInputMessage;

		this.events.fire('connected:' + this.channel);
	},

	onAccessFailure: function( err ) {
		console.log('MIDI failed:', err);
	},

	onInputMessage: function( msg ) {
		var data = msg.data,
			fn = data[0],
			byte2 = data[1],
			byte3 = data[2],

			details = this._io.utils.parseMIDIFunction( fn );

		this.events.fire(details[0], null, details[1], byte2, byte3);
	}
});