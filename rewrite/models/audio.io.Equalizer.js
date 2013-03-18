audio.io.Equalizer = audio.io.Effect.extend({
	defaults: function() {
		return _.extend({
			maxPoints: 10,
			activePoints: [0, 1, 2, 3],
			frequencies: [100, 500, 2000, 10000, 50, 200, 1000, 5000],
			scale: 100,
			types: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			gains: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		}, audio.io.Effect.prototype.defaults);
	},

	initialize: function() {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Effect.prototype.initialize.apply(that, arguments);

		that.filters = [];
		that.gains = [];

		that.on('change:frequencies', function(model, value) {
			for(var i = 0; i < value.length; ++i) {
				that.filters[i].set('frequency', value);
			}
		});

		that.on('change:types', function(model, value) {
			for(var i = 0; i < value.length; ++i) {
				that.filters[i].set('type', value);
			}
		});

		that.on('change:gains', function(model, value) {
			for(var i = 0; i < value.length; ++i) {
				that.gains[i].gain.value = value;
			}
		});

		that.createPoints();
	},

	createPoints: function() {
		var maxPoints = this.get('maxPoints'),
			point,
			types = this.get('types'),
			frequencies = this.get('frequencies'),
			filter, gain;

		for(var i = 0; i < maxPoints; ++i) {
			filter = new audio.io.Filter({
				type: types[i],
				frequency: frequencies[i]
			});

			gain = this._io.context.createGainNode();
			gain.gain.value = 1;
			filter.connect(gain);

			this.input.connect(filter.input);
			gain.connect(this.wet);

			this.gains.push(gain);
			this.filters.push(filter);
		}
	},
	setFrequency: function(index, value) {
		var frequencies = this.get('frequencies');
		frequencies[index] = value;
		this.set('frequencies', frequencies);
	},
	setGain: function(index, value) {
		var gains = this.get('gains');
		gains[index] = value;
		this.set('gains', gains);
	},
	setType: function(index, value) {
		var types = this.get('types');
		types[index] = value;
		this.set('types', types);
	}
});