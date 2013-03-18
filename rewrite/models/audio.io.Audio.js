// A parent class for all audio-based models, such as panpots,
// volume controls, and oscillators.
audio.io.Audio = audio.io.Node.extend({
	initialize: function() {
		// Create in and out ports
		var that = this,
			ctx = that._io.context;
		that.input = ctx.createGainNode();
		that.output = ctx.createGainNode();

		// Create mods object and prepopulate with
		// the two gain nodes above.
		that.params = {
			inputGain: that.input.gain,
			outputGain: that.output.gain
		};
		that.mods = {};
	},

	connect: function( source ) {
		var that = this,
			io = that._io,
			output = that.output;

		// if( source instanceof io.Controller ) {
		// 	output.connect( source.node.input );
		// }

		// If we're dealing with an audio.io.Audio node,
		// we know we have an input to connect to, so
		// go ahead and do just that.
		// else
		if( source instanceof io.Audio ) {
			output.connect(source.input);
		}

		// Otherwise, try to connect to the source directly...
		else {
			output.connect( source );
		}

		return this;
	},

	connectTo: function( source ) {
		this.connect(source);
		return source;
	},

	connectMod: function( mod, param ) {
		// If there's already a registered modulatable
		// AudioParam, then connect to it.
		if(this.params[ param ]) {
			mod.output.connect( this.params[param] );
		}

		// Otherwise, store this mod in case we need it
		// later
		if(!this.mods[param]){
			this.mods[param] = [];
		}

		this.mods[param].push(mod);
	}
});