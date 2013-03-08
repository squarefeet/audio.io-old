
// A simple volume control model. Modulate's output
// gain node's value.
audio.io.VolumeControl = audio.io.Audio.extend({
	defaults: {
		min: 0,
        max: 100,
        value: 50,
        range: 0,
        active: false,
        width: 30,
        height: 70,
        label: '',
        curve: 'x*x'
	},

	initialize: function() {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Audio.prototype.initialize.apply(that, arguments);

		// Determine the range of the control
		that.set('range', that.get('max') - that.get('min'));

		// Set the starting level
		that.setVolume( that.get('value') );

		// Connect the input directly to the output
		that.input.connect( that.output );

		// Register events
		that.on('change:value', that.setVolume, that);
	},

	setVolume: function( model, value ) {
		var that = this;

		// If only one argument is passed, use it as
		// the value argument, and set the value attribute
		// of this model as it won't have been triggered
		// by a change.
		if(arguments.length === 1) {
			value = model;
			that.set('value', value);
		}

		value = that._io.utils.getValueWithCurve( that.get('curve'), value, that.get('max'));
		that.output.gain.value = value;
	}
});