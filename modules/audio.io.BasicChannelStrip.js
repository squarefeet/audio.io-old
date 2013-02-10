//
// A VolumeControl and PanPot combination
//
audio.io.BasicChannelStrip = audio.io.Audio.extend({
	initialize: function( volumeCurve, defaultLevel, panValue) {
		this.volumeControl = new this._io.VolumeControl( volumeCurve || 'x*x', defaultLevel || 50 );
		this.panPot = new this._io.StereoPanPot( panValue || 0 );

		// Connect the panpot to the input node
		this.input.connect( this.panPot.input );

		// Connect the panpot node to the volume node
		this.panPot.connect( this.volumeControl );

		// Connect the volume node to the output
		this.volumeControl.connect( this.output );

		// Store "modulatable" references
		this.modAttributes.volume = this.volumeControl.mods.volume;
	}
});