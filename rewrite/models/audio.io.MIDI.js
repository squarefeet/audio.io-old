//
// @requires WebMIDI || (Jazz-Plugin && WebMIDIAPIShim from @cwilso)
//
audio.io.MIDI = audio.io.Input.extend({
	defaults: function() {
		return _.extend({
			midi: null,
			inputs: null,
			outputs: null,
			channel: 2
		}, audio.io.Input.prototype.defaults);
	},

	initialize: function( channel, eventDebugging ) {

		// Bind scope.
		this.onAccessSuccess = this.onAccessSuccess.bind(this);
		this.onAccessFailure = this.onAccessFailure.bind(this);
		this.onInputMessage  = this.onInputMessage.bind(this);

		// Try to initialize MIDI...
		navigator.requestMIDIAccess( this.onAccessSuccess, this.onAccessFailure );
	},

	onAccessSuccess: function( midi ) {
		var inputs = midi.getInputs(),
			outputs = midi.getOutputs();


		this.set('midi', midi)
		this.set('inputs', inputs);
		this.set('outputs', outputs);

		console.log('Found', inputs.length, 'MIDI inputs');

		// For now just use 2nd input port (my axiom 25)
		var input = midi.getInput( this.get('channel') );
		input.onmessage = this.onInputMessage;

		this.trigger('connected:' + this.channel);
	},

	onAccessFailure: function( err ) {
		console.log('MIDI failed:', err);
	},

	onInputMessage: function( msg ) {
		if(!this.get('active')) return;

		var data = msg.data,
			fn = data[0],
			byte2 = data[1],
			byte3 = data[2],

			details = this._io.utils.parseMIDIFunction( fn );

		// If we're dealing with a noteOn event, then automatically
		// translate the MIDI note number into a frequency value.
		if(details[0] === 'noteOn' || details[0] === 'noteOff') {
			byte2 = audio.io.utils.midiNoteToFreq( byte2 );
		}

		this.trigger(details[0], details[1], byte2, byte3);
	}
});