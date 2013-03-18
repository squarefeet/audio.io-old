// A 2d, stereo PanPot. Accepted values in range -50 to 50.
// Center position is 0.
//
audio.io.StereoPanPot = audio.io.Audio.extend({
	defaults: {
		min: -50,
		max: 50,
		value: 0,
		range: 0,
		active: false,
		width: 30,
		height: 30,
		label: ''
	},

	initialize: function() {

		var that = this,
			io = that._io,
			ctx = io.context;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Audio.prototype.initialize.apply(that, arguments);

		// Create a channel splitter so we can grab left/right channels.
		that.splitter = ctx.createChannelSplitter(2);

		// Create gain Nodes for left/right channels.
		that.leftGain = ctx.createGainNode();
		that.rightGain = ctx.createGainNode();

		// Create a channel merger
		that.merger = ctx.createChannelMerger(2);

		// Connect audio in to splitter...
		that.input.connect(that.splitter);

		// ...then left/right splitter out to each gain node
		that.splitter.connect(that.leftGain, 0);
		that.splitter.connect(that.rightGain, 1);

		// ...then connect the left/right gain nodes back into the merger
		that.leftGain.connect(that.merger, 0, 0);
		that.rightGain.connect(that.merger, 0, 1);

		// ...and finally connect the merger to the output
		that.merger.connect(that.output);


		// Bind scope where needed
		that.setPosition = that.setPosition.bind(that);

		// Set the initial panning value
		that.setPosition( that.get('value') );

		// Register events
		that.on('change:value', that.setPosition);

		// Register mods
		that.params.leftGain = that.leftGain.gain;
		that.params.rightGain = that.rightGain.gain;
	},

	setPosition: function( model, value ) {
		var that = this,
			utils = that._io.utils,
			min = that.get('min'),
			max = that.get('max'),
			l = that.leftGain.gain,
			r = that.rightGain.gain;

		// If only one argument is passed, use it as
		// the value argument, and set the value attribute
		// of this model.
		if(arguments.length === 1) {
			value = model;
			that.set('value', value);
		}

		if(!value) { value = 0; }

		value |= 0;
		value = utils.clampNumber(value, min, max);
		value = utils.scaleNumber(value, -50, 50, -1, 1);

		// Optimise for center
		if(value === 0) {
			l.value = r.value = 1;
		}
		else if(value > 0) {
			l.value = 1 - value;
			r.value = 1;
		}
		else if(value < 0) {
			r.value = 1 + value;
			l.value = 1;
		}
	}
});