//
// A VolumeControl and PanPot combination
//
audio.io.BasicChannelStrip = audio.io.Audio.extend({
	initialize: function( volumeCurve, defaultLevel, panValue) {
		this.volumeControl = new this._io.VolumeControl( volumeCurve || 'x*x', defaultLevel || 50 );
		this.panPot = new this._io.PanPot( panValue || 0 );

		this.volumeControl.gain.connect( this.panPot.panner );
	},

	onOutputConnect: function( source ) {
		this.panPot.panner.connect( source );
	}
});