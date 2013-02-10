//
// A 2d, stereo PanPot. Accepted values in range -50 to 50.
// Center position is 0.
//

audio.io.StereoPanPot = audio.io.Audio.extend({
	initialize: function( value ) {

		// Create a channel splitter so we can grab left/right channels.
		this.splitter = this._io.context.createChannelSplitter(2);

		// Create gain Nodes for left/right channels.
		this.leftGain = this._io.context.createGainNode();
		this.rightGain = this._io.context.createGainNode();

		// Create a channel merger
		this.merger = this._io.context.createChannelMerger(2);

		// Connect audio in to splitter...
		this.input.connect(this.splitter);

		// ...then left/right splitter out to each gain node
		this.splitter.connect(this.leftGain, 0);
		this.splitter.connect(this.rightGain, 0);

		// ...then connect the left/right gain nodes back into the merger
		this.leftGain.connect(this.merger, 0, 0);
		this.rightGain.connect(this.merger, 0, 1);

		// ...and finally connect the merger to the output
		this.merger.connect(this.output);

		// Set the initial panning value
		this.setPosition( value );
	},

	setPosition: function( value ) {
		// -50 to 50

		if(!value) { value = 0; }

		value = Math.min(50, value);
		value = Math.max(-50, value);

		value = this._io.utils.scaleNumber(value, -50, 50, -1, 1);

		// Optimise for center
		if(value === 0.5) {
			this.leftGain.gain.value = this.rightGain.gain.value = 1;
		}


		else if(value > 0) {
			this.leftGain.gain.value = 1 - value;
			this.rightGain.gain.value = 1;
		}
		else if(value < 0) {
			this.rightGain.gain.value = 1+ value;
			this.leftGain.gain.value = 1;
		}
	}
});