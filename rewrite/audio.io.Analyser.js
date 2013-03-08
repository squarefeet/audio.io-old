
// Analyser
audio.io.Analyser = audio.io.Audio.extend({
	defaults: {
		granularity: 1024,
		rate: 40,
		mindB: -192,
		maxdB: 0,
		smoothing: 0.75,
		callback: audio.io.noop
	},

	initialize: function(granularity, interval, mindB, maxdB, smoothing, callback) {
		var that = this;

		that.analyser = that._io.context.createAnalyser();

		that.analyser.smoothingTimeConstant = that.get('smoothing');
		that.analyser.fftSize = that.get('granularity');
		that.analyser.minDecibels = that.get('mindB');
		that.analyser.maxDecibels = that.get('maxdB');

		that.data = new Uint8Array( that.analyser.frequencyBinCount );

		that.input.connect(that.analyser);
		that.analyser.connect(that.output);

		that.callback = that.get('callback');

		// Register events...
		that.on('change:granularity', function(model, value) {
			that.data = new Uint8Array( that.analyser.frequencyBinCount );
			that.analyser.fftSize = value;
		});

		that.on('change:smoothing', function(model, value) {
			that.analyser.smoothingTimeConstant = value;
		});

		that.on('change:mindB', function(model, value) {
			that.data = new Uint8Array( that.analyser.frequencyBinCount );
			that.analyser.minDecibels = value;
		});

		that.on('change:maxdB', function(model, value) {
			that.data = new Uint8Array( that.analyser.frequencyBinCount );
			that.analyser.maxDecibels = value;
		});

		that.on('change:rate', function(model, value) {
			that.stop();
			that.data = new Uint8Array( that.analyser.frequencyBinCount );
			that.start();
		});

		that.on('change:callback', function(model, value) {
			that.callback = (typeof value === 'function' ? value : that.callback);
		});
	},

	onProcess: function() {
		this.analyser.getByteFrequencyData(this.data);
		this.callback(this.data);
	},

	start: function() {
		this.interval = setInterval(this.onProcess.bind(this), this.get('rate'));
	},
	stop: function() {
		clearInterval(this.interval);
	}
});