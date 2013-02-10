audio.io.LFO = audio.io.Node.extend({
	initialize: function( type, rate, depth ) {
		// Default to 440hz if none provided.
		this.rate = +rate || 2;

		// Create the oscillator.
		this.osc = this._io.context.createOscillator();
		this.osc.frequency.value = this.rate;

		// Create depth control
		this.output = this._io.context.createGainNode();

		this.setType ( type );
		this.setDepth( depth || 100 );

		this.osc.connect(this.output);

	},

	setType: function( type ) {
		var hasType = this._io.oscTypes.indexOf( type );

		// Default to sine if invalid type provided.
		this.type = ~hasType ? hasType : 0;

		this.osc.type = this.type;
	},

	setDepth: function( depth ) {
		// Normalize...
		depth = +depth;

		if(depth >= 0) {
			this.depth = depth;
			this.output.gain.value = depth;
		}
	},

	start: function() {
		this.osc.start(0);
	},

	connectMod: function( mod, param ) {
		if(param === 'frequency') {
			mod.output.connect(this.osc.frequency);
		}
		else if(param === 'depth') {
			mod.output.connect(this.output.gain);
		}
	}

});