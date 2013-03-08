// A one-shot oscillator class. Has built-in envelope
// control.
audio.io.SingleShotOscillator = audio.io.Audio.extend({
	defaults: function() {
		return _.extend({
			type: 0,
			frequency: 440,
		}, audio.io.Envelope.prototype.defaults);
	},

	initialize: function() {
		var that = this,
			ctx = that._io.context;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Audio.prototype.initialize.apply(that, arguments);

		_.bindAll(this);

		that.reset();

		// Register events...
		that.on('change:type', function(model, value) {
			that.osc.type = value;
		});

		that.on('change:frequency', function(model, value) {
			that.osc.frequency.value = value;
		});
	},

	start: function(level) {
		var that = this;

		that.envelope.set('maxLevel', level);
		that.envelope.start();
		that.osc.start(0);
	},

	stop: function() {
		this.envelope.stop();
	},

	end: function() {
		this.osc.stop(0);
	},

	reset: function() {
		var that = this,
			ctx = that._io.context;

		if(that.osc) {
			that.osc.stop(0);
		}

		var osc = that.osc = ctx.createOscillator();
		var merger = that.merger = ctx.createChannelMerger(2);
		var envelope = that.envelope = new that._io.Envelope(that.attributes);
		envelope.set('audioParam', that.output.gain);


		// Connect the osc to L and R inputs of the merger
		// to create a true stereo out.
		osc.connect(merger, 0, 0);
		osc.connect(merger, 0, 1);
		merger.connect(that.output);

		// Set properties...
		osc.type = that.get('type');
		osc.frequency.value = that.get('frequency');

		envelope.on('end', function() {
			that.end();
		});

		// Register mods
		that.params.frequency = osc.frequency;
		that.params.detune = osc.detune;
	}
});


audio.io.Oscillator = audio.io.Audio.extend({
	defaults: function() {
		return _.extend({
			type: 0,
			frequency: 440,
			polyphony: 1,
			numVoices: 1,
			detune: 0,
			detunePoint: 'center', // 'center' or 'root'
			detuneStep: null,
		}, audio.io.Envelope.prototype.defaults);
	},

	initialize: function() {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Audio.prototype.initialize.apply(that, arguments);

		// Create a pool of SingleShotOscillators so we don't
		// keep creating and destroying instances on every
		// noteOn/noteOff.
		// Shouldn't need to worry about passing arguments
		// to the SingleShotOscillator constructor as we'll
		// set properties when we get the osc out of the pool
		that.pool = new that._io.Pool({
			count: that.get('polyphony') * that.get('numVoices'),
			object: that._io.SingleShotOscillator,
		});

		that.on('change:detune change:detunePoint', that.setDetuneStep, that);

		that.setDetuneStep();

		that.instances = {};
		that.instanceOrder = [];
	},

	setDetuneStep: function() {
		this.detuneStep = this.get('detune') / this.get('numVoices');
		this.detuneStart = (this.get('detunePoint') === 'root' ?
			0 : -((this.get('numVoices')/2) * this.detuneStep)
		);
	},

	start: function( frequency, velocity ) {
		var that = this,
			numVoices = that.get('numVoices'),
			osc;

		// console.log('Pool length:', this.pool.pool.length);

		// if(this.instanceOrder === that.get('polyphony')) {
		// 	// this.stop( this.instanceOrder.shift() );
		// }
		// else if(this.instances[frequency] && this.instances[frequency].length > 0) {
		// 	console.log('already note');
		// 	this.stop( frequency );
		// }
		// else if(!this.instances[frequency]) {
		// 	this.instances[frequency] = [];
		// }

		if(!this.instances[frequency]) {
			this.instances[frequency] = [];
		}

		var instance = [];


		for(var i = 0; i < numVoices; ++i) {
			osc = that.pool.get();

			osc.set({
				frequency: frequency,
				type: this.get('type')
			});

			osc.osc.detune.value = this.detuneStart + (this.detuneStep * i);

			for(var mod in this.mods) {
				for(var j = 0; j < this.mods[mod].length; ++j) {
					this.mods[mod][j].output.connect( osc.osc[mod] );
				}
			}

			osc.connect(this.output);

			instance.push(osc);

			osc.start( velocity/127 );
		}

		this.instances[frequency].push(instance);
	},

	stop: function( frequency ) {
		var instance = this.instances[frequency].shift(),
			that = this;

		for(var i = 0; i < instance.length; ++i) {
			instance[i].stop();
		}

		setTimeout(function() {
			that.release( instance );
		}, this.get('releaseTime') * 1000 + 100);
	},

	release: function( instance ) {
		for(var i = 0; i < instance.length; ++i) {
			instance[i].reset();
			this.pool.release(instance[i]);
		}
	}
});
