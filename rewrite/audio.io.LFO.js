audio.io.LFO = audio.io.Node.extend({
 	defaults: {
 		audioParam: null,
 		type: 0, // sine
 		rate: 2, // hz
 		depth: 100 // amplification level
 	},

	initialize: function() {
		var that = this,
			ctx = that._io.context;

		// Create the oscillator.
		that.osc = ctx.createOscillator();
		that.osc.frequency.value = that.get('rate');

		// Create depth control
		that.output = ctx.createGainNode();

		that.setType ( that.get('type')  );
		that.setDepth( that.get('depth') );

		that.osc.connect(that.output);

		// Connect the output gain to the audioParam
		// if one is specified
		if(that.get('audioParam') !== null) {
			that.output.connect( that.get('audioParam') );
		}

		that.on('change:rate', function(model, value) {
			that.osc.frequency.value = value;
		});
		that.on('change:type', that.setType, that);
		that.on('change:depth', that.setDepth, that);

		that.start();
	},

	setType: function( model, type ) {
		var that = this;

		// If only one argument is passed, use it as
		// the value argument, and set the value attribute
		// of this model as it won't have been triggered
		// by a change.
		if( arguments.length === 1 ) {
			type = model;
		}

		// Now that we've normalized the `type` argument,
		// set it on the model if this function hasn't been
		// fired by a `change:type` event.
		if( arguments.length === 1 ) {
			that.set('type', type);
		}

		that.osc.type = type;
	},

	setDepth: function( model, depth ) {
		var that = this;

		if( arguments.length === 1 ) {
			depth = model;
		}

		// Normalize...
		depth = +depth;

		if(arguments.length === 1) {
			that.set('depth', depth);
		}

		if(depth >= 0) {
			that.output.gain.value = depth;
		}
	},

	start: function( delay ) {
		this.osc.start( delay || 0 );
	},

	stop: function( delay ) {
		var that = this;
		that.osc.stop( delay || 0 );

		// Reset the oscillator.
		that.osc = ctx.createOscillator();
		that.osc.frequency.value = that.get('rate');
		that.setType ( that.get('type')  );
		that.osc.connect(that.output);
	},

	connectMod: function( mod, param ) {
		if(param === 'frequency') {
			mod.output.connect(this.osc.frequency);
		}
		else if(param === 'depth') {
			mod.output.connect(this.output.gain);
		}

		return this;
	}
});