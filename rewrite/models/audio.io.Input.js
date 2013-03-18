// A base class to handle inputs such as Keyboards
// and MIDI.
audio.io.Input = audio.io.Node.extend({
	defaults: {
		active: 1
	},

	enable: function() {
		this.set('active', 0);
	},
	disable: function() {
		this.set('active', 1);
	}
});