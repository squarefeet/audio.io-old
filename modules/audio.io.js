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
		var context = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || false;

		if(!context) {
			alert(
				"Your browser doesn't seem to support the Web Audio API. " +
				"Please ensure you're using the latest version of Chrome or Firefox."
			);
			return;
		}

		this.context = new webkitAudioContext();
		this.masterOut = this.context.destination;
	}
};