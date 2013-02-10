// Create an audio effect class to hold shared effect
// functions...
audio.io.Effect = audio.io.Audio.extend({
	setup: function() {
		// Create in and out ports
		this.input = this._io.context.createGainNode();
		this.output = this._io.context.createGainNode();

		this.dry = this._io.context.createGainNode();
		this.wet = this._io.context.createGainNode();

		this.input.connect( this.dry );

		// Connect wet and dry to output
		this.dry.connect( this.output );
		this.wet.connect( this.output );
	},

	bypass: function( bool ) {
		// If bool is truthy and we're already
		// connected to the effect, go ahead and disconnect...
		if( bool && this.active ) {
			this.input.disconnect( this.effect );
			this.input.connect( this.output );
			this.active = 0;
		}

		// ...Alternatively, connect the output if it's not already
		// connected
		else if( !bool && !this.active ) {
			this.input.disconnect( this.output );
			this.input.connect( this.effect );
			this.active = 1;
		}
	},

	connectMod: function( modSource, param ) {
		if( this.effect[param] ) {
			modSource.output.connect( this.effect[param] );
		}
	},

	setDryWet: function( value ) {
		// Range 0 - 100
		this.dry.gain.value = (100 - value) / 100;
		this.wet.gain.value = value / 100;
	},
});



audio.io.Filter = audio.io.Effect.extend({
	initialize: function(type, cutoff, res, gain, dryWet) {
		this.effect = this._io.context.createBiquadFilter();

		this.setType( type );
		this.setCutoff( cutoff );
		this.setResonance( res || 5 );
		this.setGain( gain );

		// Connect input to filter
		this.input.connect( this.effect );

		// ... and the filter to the wet control.
		this.effect.connect( this.wet );

		// Mark this Node as active, so if/when .bypass() is called
		// it will behave as expected.
		this.active = 1;
	},

	setType: function( type ) {
		var hasType = this._io.filterTypes.indexOf( type );

		// Default to lowpass if invalid type provided.
		this.type = ~hasType ? hasType : 0;

		this.effect.type = this.type;
	},
	setCutoff: function( value ) {
		this.effect.frequency.value = +value;
	},
	setResonance: function( value ) {
		this.effect.Q.value = +value;
	},
	setGain: function( value ) {
		this.effect.gain.value = +value;
	}
});



audio.io.Reverb = audio.io.Effect.extend({
	initialize: function( impulse, dryWet ) {
		this.effect = this._io.context.createConvolver();

		this.setImpulse( impulse ||'impulse_rev.wav' );

		// Connect input to dry gain node and effect
		this.input.connect( this.effect );

		// Connect convolver to the wet gain node.
		this.effect.connect( this.wet );


		// Set wet/dry level
		this.setDryWet( dryWet || 50 );

		this.active = 1;
	},

	setImpulse: function( impulseFilename ) {

		var that = this;

		this._io.utils.loadFileIntoBuffer('../impulses/' + impulseFilename, function(buffer) {
			that.effect.buffer = buffer;
		});
	}
});