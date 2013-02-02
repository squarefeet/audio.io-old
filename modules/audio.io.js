var audio = audio || {};

audio.io = {
	noop: function() {},

	connectionTypes: {
		input: ['in', 'input'],
		output: ['out', 'output']
	},

	curveTypes: ['linear', 'x*x'],

	oscTypes: ['sine', 'square', 'sawtooth', 'triangle'],

	initialize: function() {
		this.context = new webkitAudioContext();
		this.masterOut = this.context.destination;
	}
};