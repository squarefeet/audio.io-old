//
// A 2d, stereo PanPot. Accepted values in range -50 to 50.
// Center position is 0.
//
audio.io.PanPot = audio.io.Audio.extend({
	initialize: function( defaultPosition ) {
		this.panner = this._io.context.createPanner();
		this.panner.panningModel = 'equalPower';

		this.position = [];

		this.setPosition( defaultPosition );

		// Connect the input to the panner node.
		this.input.connect(this.panner);

		// Connect the panner node to the output
		this.panner.connect(this.output);
	},

	setPosition: function( pos ) {
		var x = 0,
			y = 0,
			z = -0.5;

		// Normalize position argument
		pos = +pos;

		if( pos < -50 ) {
			pos = -50;
		}
		else if( pos > 50 ) {
			pos = 50;
		}

		// Reuse the same Array literal.
		this.position[0] = x;
		this.position[1] = y;
		this.position[2] = z;

		this.panner.setPosition(pos/50, y, z);
	}
});