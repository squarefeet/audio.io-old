audio.io.VolumeControl = audio.io.Audio.extend({

	initialize: function( curve, defaultVolume ) {
		this.curve = ~this._io.curveTypes.indexOf(curve) ? curve : 'linear';
		this.maxValue = 100;
		this.minValue = 0;
		this.defaultValue = +defaultVolume || this.maxValue;

		this.gain = this._io.context.createGainNode();

		this.setVolume( this.defaultValue );
	},

	onInputConnect: function( source ) {
		console.log('volume input connected', arguments);
	},

	onOutputConnect: function( source ) {
		this.gain.connect( source );
	},

	setVolume: function( value ) {
		this.gain.gain.value = this._io.utils.getValueWithCurve( this.curve, value, this.maxValue);
	}
});