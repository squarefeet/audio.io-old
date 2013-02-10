audio.io.LFO = audio.io.Node.extend({
	initialize: function( type, rate ) {
		// Default to 440hz if none provided.
		this.rate = +rate || 2;

		// Create the oscillator.
		this.osc = this._io.context.createOscillator();
		this.osc.frequency.value = this.rate;

		this.setType ( type );

		this.output = this._io.context.createGainNode();
		this.output.gain.value = 1000;
		this.osc.connect(this.output);

	},

	setType: function( type ) {
		var hasType = this._io.oscTypes.indexOf( type );

		// Default to sine if invalid type provided.
		this.type = ~hasType ? hasType : 0;

		this.osc.type = this.type;
	},

	start: function() {
		this.osc.start(0);
	}

});