audio.io.ViewModel = Backbone.Model.extend({
	defaults: {
		width: 0,
		height: 0
	}
});


audio.io.ObjectViewModel = audio.io.ViewModel.extend({
	defaults: {
		width: 50,
		height: 20,
		x: window.innerWidth / 2 | 0,
		y: window.innerHeight / 2 | 0,
		selected: 0,
		hovered: 0,
		zIndex: 1,
		inputs: [
			{ help: 'default input' }
		],
		outputs: [
			{ help: 'default output' }
		]
	}
});


audio.io.CanvasViewModel = audio.io.ViewModel.extend({
	defaults: {
		width: 1,
		height: 1,
		dataLineColor: 'rgba(0, 0, 0, 1)',
		audioLineColor: 'rgba(255, 0, 0, 1)',
		objects: {}
	},

	initialize: function() {
		this.onWindowResize();
		window.addEventListener('resize', this.onWindowResize.bind(this), false);
	},

	onWindowResize: function() {
		this.set('width', window.innerWidth - 8);
		this.set('height', window.innerHeight - 8 - 20);
	}
});



audio.io.AnalyzerViewModel = audio.io.ViewModel.extend({
	defaults: function() {
		return _.extend({
			width: 300,
			height: 150,
			frequencyDetail: 10,
			decibelDetail: 10,
			showReadout: true
		}, audio.io.ViewModel.prototype.defaults);
	},
});
