audio.io.VolumeControl = audio.io.Audio.extend({

	initialize: function( curve, defaultVolume ) {
		this.curve = ~this._io.curveTypes.indexOf(curve) ? curve : 'linear';
		this.maxValue = 100;
		this.minValue = 0;
		this.defaultValue = +defaultVolume || this.maxValue;

		this.setVolume( this.defaultValue );

		// Register modulatable parameters
		this.modAttributes.volume = this.output.gain;

		// Connect the input directly to the output
		this.input.connect( this.output );
	},

	setVolume: function( value ) {
		this.output.gain.value = this._io.utils.getValueWithCurve( this.curve, value, this.maxValue);
	}
});