audio.io.LFO = audio.io.Audio.extend({
	initialize: function( type, rate ) {
		// Default to 440hz if none provided.
		this.rate = +rate || 2;

		// Create the oscillator.
		this.osc = this._io.context.createOscillator();
		this.osc.frequency.value = this.rate;

		// Default to sine if invalid type provided.
		this.setType ( type );

		// Connect the oscillator to the output node
		this.output.connect( this.osc );
	},

	setType: function( type ) {
		var hasType = this._io.oscTypes.indexOf( type );

		// Default to sine if invalid type provided.
		this.type = ~hasType ? hasType : 0;

		this.osc.type = this.type;
	},

	onOutputConnect: function( source ) {
		this.osc.connect( this.getPathToNode( source ) );
	},

	start: function() {
		this.osc.start(0);
	}

});