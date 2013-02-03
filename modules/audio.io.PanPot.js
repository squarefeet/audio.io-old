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
	},

	onOutputConnect: function( source ) {
		console.log(source);

		var path = this.getPathToNode( source );
		this.panner.connect( source[path] );
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