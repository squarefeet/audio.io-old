// Create an audio effect class to hold shared effect
// functions...
audio.io.Effect = audio.io.Audio.extend({
	defaults: {
		dryWet: 100,
		active: 1
	},

	initialize: function() {
		var that = this,
			ctx = that._io.context;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Audio.prototype.initialize.apply(that, arguments);

		that.dry = ctx.createGainNode();
		that.wet = ctx.createGainNode();

		that.input.connect(that.dry);
		that.dry.connect(that.output);
		that.wet.connect(that.output);

		that.on('change:dryWet', function(model, value) {
			that.setDryWet(value);
		});

		that.setDryWet( that.get('dryWet') );
	},

	// FIXME: Correct this so it works with dry/wet rather than
	//	      effect/output.
	bypass: function( bool ) {
		// If bool is truthy and we're already
		// connected to the effect, go ahead and disconnect...
		if( bool && this.get('active') ) {
			this.input.disconnect( this.effect );
			this.input.connect( this.output );
			this.set('active', 0);
		}

		// ...Alternatively, connect the output if it's not already
		// connected
		else if( !bool && !this.get('active') ) {
			this.input.disconnect( this.output );
			this.input.connect( this.effect );
			this.set('active', 1);
		}
	},

	connectMod: function( modSource, param, channel ) {
		if(this.effect && this.effect[param]) {
			modSource.output.connect( this.effect[param] );
		}
		else if(channel === 'l' && this.effectL && this.effectL[param]) {
			modSource.output.connect( this.effectL[param] );
		}
		else if(channel === 'r' && this.effectR && this.effectR[param]) {
			modSource.output.connect( this.effectR[param] );
		}
	},

	setDryWet: function( value ) {
		// Range 0 - 100
		this.dry.gain.value = (100 - value) / 100;
		this.wet.gain.value = value / 100;
	},
});



audio.io.Filter = audio.io.Effect.extend({
	defaults: function() {
		return _.extend({
			type: 0,
			frequency: 5000,
			Q: 1,
			gain: 1,
			poles: 4 // Filter order (2nd, 4th, 6th)
		}, audio.io.Effect.prototype.defaults);
	},

	initialize: function() {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Effect.prototype.initialize.apply(that, arguments);

		var poles = that.get('poles'),
			numFilters = poles / 2,
			filters = [],
			filter;

		for(var i = 0; i < numFilters; ++i) {
			filter = that._io.context.createBiquadFilter();
			filter.type = that.get('type');
			filter.frequency.value = that.get('frequency');
			filter.Q.value = that.get('Q');
			filter.gain.value = that.get('gain');

			if(i === 0) {
				that.input.connect(filter);
			}
			else if (i < numFilters-1) {
				filters[i-1].connect(filter)
			}

			if(i === numFilters-1) {
				if(numFilters > 1) {
					filters[i-1].connect(filter)
				}
				filter.connect( that.wet );
			}

			filters.push(filter);
		}

		that.on('change:type', function(model, value) {
			for(var i = 0; i < numFilters; ++i) {
				filters[i].type = value;
			}
		});
		that.on('change:frequency', function(model, value) {
			for(var i = 0; i < numFilters; ++i) {
				filters[i].frequency.value = value;
			}
		});
		that.on('change:Q', function(model, value) {
			for(var i = 0; i < numFilters; ++i) {
				filters[i].Q.value = value;
			}
		});
		that.on('change:gain', function(model, value) {
			for(var i = 0; i < numFilters; ++i) {
				filters[i].gain.value = value;
			}
		});

		that.setDryWet( that.get('dryWet') );

		that.filters = filters;
	},

	connectMod: function( modSource, param ) {
		if(param === 'frequency') {
			for(var i = 0; i < this.filters.length; ++i) {
				modSource.output.connect(this.filters[i].frequency);
			}
		}
	}
});



audio.io.Reverb = audio.io.Effect.extend({
	defaults: function() {
		return _.extend({
			impulse: 'impulse_rev.wav'
		}, audio.io.Effect.prototype.defaults);
	},

	initialize: function( impulse, dryWet ) {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Effect.prototype.initialize.apply(that, arguments);

		that.effect = that._io.context.createConvolver();

		that.setImpulse( that.get('impulse') );

		// Connect input to dry gain node and effect
		that.input.connect( that.effect );

		// Connect convolver to the wet gain node.
		that.effect.connect( that.wet );

		// Set wet/dry level
		that.setDryWet( dryWet );

		that.on('change:impulse', function(model, value) {
			that.setImpulse( value );
		});
	},

	setImpulse: function( impulseFilename ) {
		var that = this;

		that._io.utils.loadFileIntoBuffer('../impulses/' + impulseFilename, function(buffer) {
			that.effect.buffer = buffer;
		});
	}
});


audio.io.SimpleDelay = audio.io.Effect.extend({
	defaults: function() {
		return _.extend({
			time: 0.5,
			feedback: 0.6
		}, audio.io.Effect.prototype.defaults);
	},

	initialize: function() {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Effect.prototype.initialize.apply(that, arguments);


		that.effect = that._io.context.createDelayNode();
		that.feedback = that._io.context.createGainNode();

		that.input.connect(that.effect);
		that.effect.connect(that.feedback);
		that.feedback.connect(that.wet);
		that.feedback.connect(that.effect);

		that.effect.delayTime.value = that.get('time');
		that.feedback.gain.value = that.get('feedback');

		that.on('change:time', function(model, value) {
			that.effect.delayTime.value = value;
		});
		that.on('change:feedback', function(model, value) {
			that.feedback.gain.value = value;
		});

		that.setDryWet(dryWet);
	}
});


audio.io.StereoDelay = audio.io.Effect.extend({
	defaults: function() {
		return _.extend({
			timeL: 0.5,
			timeR: 0.8,
			feedback: 0.6
		}, audio.io.Effect.prototype.defaults);
	},

	initialize: function() {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Effect.prototype.initialize.apply(that, arguments);


		that.effectL = that._io.context.createDelayNode();
		that.effectR = that._io.context.createDelayNode();

		that.feedbackL = that._io.context.createGainNode();
		that.feedbackR = that._io.context.createGainNode();

		that.splitter = that._io.context.createChannelSplitter(2);
		that.merger = that._io.context.createChannelMerger(2);

		that.input.connect(that.splitter);

		that.splitter.connect(that.effectL, 0);
		that.splitter.connect(that.effectR, 1);

		that.effectL.connect(that.feedbackL);
		that.effectR.connect(that.feedbackR);

		that.feedbackL.connect(that.effectL);
		that.feedbackR.connect(that.effectR);

		that.feedbackL.connect(that.merger, 0, 0);
		that.feedbackR.connect(that.merger, 0, 1);

		that.merger.connect(that.wet);

		that.effectL.delayTime.value = that.get('timeL');
		that.effectR.delayTime.value = that.get('timeR');

		that.on('change:timeL', function(model, value) {
			that.effectL.delayTime.value = value;
		});
		that.on('change:timeR', function(model, value) {
			that.effectR.delayTime.value = value;
		});
		that.on('change:feedback', function(model, value) {
			that.feedbackL.gain.value = value;
			that.feedbackR.gain.value = value;
		});
	}
});


audio.io.RingMod = audio.io.Effect.extend({
	defaults: function() {
		return _.extend({
			frequency: 5
		}, audio.io.Effect.prototype.defaults);
	},

	initialize: function(freq, dryWet) {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Effect.prototype.initialize.apply(that, arguments);


		that.ringMod = that._io.context.createGainNode();

		that.osc = that._io.context.createOscillator();
		that.osc.type = that.osc.SINE;
		that.osc.frequency.value = that.get('frequency');

		that.ringMod.gain.value = 0;

		that.input.connect(that.ringMod);
		that.osc.connect(that.ringMod.gain);
		that.ringMod.connect(that.wet);

		that.osc.start(0);

		that.on('change:frequency', function(model, value) {
			that.osc.frequency.value = value;
		});
	}
});


audio.io.Utility = audio.io.Audio.extend({
	defaults: function() {
		return _.extend({
			invertLeft: false,
			invertRight: false
		}, audio.io.Effect.prototype.defaults);
	},

	initialize: function() {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Audio.prototype.initialize.apply(that, arguments);

		that.splitter = that._io.context.createChannelSplitter(2);
		that.merger = that._io.context.createChannelMerger(2);

		that.left = that._io.context.createGainNode();
		that.right = that._io.context.createGainNode();

		that.input.connect(that.splitter);

		that.splitter.connect(that.left, 0);
		that.splitter.connect(that.right, 1);

		that.left.connect(that.merger, 0, 0);
		that.right.connect(that.merger, 0, 1);

		that.merger.connect(that.output);

		that.on('change:invertLeft', function(model, value) {
			if(inverted) {
				that.left.gain.value = -that.left.gain.value;
			}
			else {
				that.left.gain.value = Math.abs(that.left.gain.value);
			}
		});

		that.on('change:invertRight', function(model, value) {
			if(inverted) {
				that.right.gain.value = -that.right.gain.value;
			}
			else {
				that.right.gain.value = Math.abs(that.right.gain.value);
			}
		});

		if(that.get('invertLeft')) {
			that.left.gain.value = -that.left.gain.value;
		}
		if(that.get('invertRight')) {
			that.right.gain.value = -that.right.gain.value;
		}
	}
});



audio.io.Phaser = audio.io.Effect.extend({
	defaults: function() {
		return _.extend({
			poles: 4,
			frequency: 5000,
			Q: 1,
			feedback: 0,
			lfoRate: 0.1,
			lfoDepth: 100
		}, audio.io.Effect.prototype.defaults);
	},

	initialize: function() {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Effect.prototype.initialize.apply(that, arguments);

		that.feedback = that._io.context.createGainNode();
		that.feedback.gain.value = that.get('feedback');

		that.filter = new that._io.Filter({
			type: 6,
			frequency: that.get('frequency'),
			Q: that.get('Q'),
			poles: that.get('poles')
		});

		that.filter.wet.connect(that.feedback);
		that.feedback.connect(that.filter.input);

		that.lfo = new that._io.LFO({
			rate: that.get('lfoRate'),
			depth: that.get('lfoDepth')
		});

		that.filter.connectMod(that.lfo, 'frequency');

		that.input.connect(that.filter.input);
		that.filter.wet.connect(that.wet);

		// Register events...
		that.on('change:frequency', function(model, value) {
			that.filter.set('frequency', value);
		});

		that.on('change:Q', function(model, value) {
			that.filter.set('Q', value);
		});

		that.on('change:poles', function(model, value) {
			that.filter.set('poles', value);
		});

		that.on('change:feedback', function(model, value) {
			that.feedback.gain.value = that._io.utils.clampNumber(value, 0, 1);
		});

		that.on('change:lfoRate', function(model, value) {
			that.lfo.set('rate', value);
		});

		that.on('change:lfoDepth', function(model, value) {
			that.lfo.set('depth', value);
		});
	}
});




audio.io.Equalizer = audio.io.Effect.extend({
	initialize: function(bands) {
		this.numBands = +bands || 10;

		this.filtersGain = this._io.context.createGainNode();

		this.filtersGain.connect(this.wet);

		this.filtersGain.gain.value = 1 / this.numBands;

		this._frequencies = [];
		this._propogateFrequencies();

		this.filters = [];
		this.createFrequencyBands();

		this.setDryWet(100);
	},

	_propogateFrequencies: function() {
		var offset = 60,
			maxFreq = this._io.context.sampleRate / 2,
			perStep = maxFreq / this.numBands;

		for(var i = 0; i < this.numBands; ++i) {
			this._frequencies.push( offset + (perStep * i) );
		}

		console.log(this._frequencies)
	},

	createFrequencyBands: function() {
		var filter;

		for(var i = 0, il = this.numBands; i < il; ++i) {
			filter = this._io.context.createBiquadFilter();
			filter.type = filter.PEAKING;
			filter.gain.value = 0.0;
			filter.frequency.value = this._frequencies[i];
			filter.Q.value = 1;

			this.filters.push(filter);
		}

		for(var i = 0; i < this.numBands; ++i) {
			if(i === 0) {
				this.input.connect(this.filters[i]);
			}
			else if(i < this.numBands-2) {
				this.filters[i-1].connect(this.filters[i]);
			}
			else {
				this.filters[i-1].connect(this.filters[i]);
				this.filters[i].connect(this.filtersGain);
			}
		}
	},

	setPoint: function( filterIndex, param, value) {
		var filter;

		if(filter = this.filters[ filterIndex ]) {
			filter[param].value = value;
		}
	}
});



audio.io.Waveshaper = audio.io.Effect.extend({
	initialize: function(options) {

		this.options = {
			min: -1,
			max: 0.9,
			level: 0.5,
			samples: 2048,
			dryWet: 100
		};

		if(options) {
			for(var i in options) {
				if(this.options.hasOwnProperty(i)) {
					this.options[i] = options[i];
				}
			}
		}

		this.curve = null;

		this.shaper = this._io.context.createWaveShaper();

		this.createCurve();

		this.input.connect(this.shaper);
		this.shaper.connect(this.wet);

		this.setDryWet(this.options.dryWet);
	},

	setLevel: function( level ) {
		level = +level;
		if(level <= this.options.max && level >= this.options.min) {
			this.options.level = level;
		}
	},

	createCurve: function() {
		var samples = this.options.samples,
			level = this.options.level,
			curve = new Float32Array(this.options.samples);

		var k = 2 * level / (1 - level);

        for (var i = 0; i < samples; ++i) {
            // LINEAR INTERPOLATION: x := (c - a) * (z - y) / (b - a) + y
            // a = 0, b = 2048, z = 1, y = -1, c = i
            var x = (i - 0) * (1 - (-1)) / (samples - 0) + (-1);
            curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
        }

        this.curve = curve;
        this.shaper.curve = this.curve;
	}
});

audio.io.AnotherWaveshaper = audio.io.Waveshaper.extend({
	createCurve: function() {
		var samples = this.options.samples,
			level = this.options.levle,
			curve = new Float32Array(this.options.samples),
			x;

        for (var i = 0; i < samples; ++i) {
        	x = (i - 0) * (1 - (-1)) / (samples - 0) + (-1);
            curve[i] = x * x * x;
        }

        this.curve = curve;
        this.shaper.curve = this.curve;
	}
});



audio.io.Bitcrusher = audio.io.Effect.extend({
	initialize: function(options) {
		this.options = {
			samples: 2048,
			depth: 1,
			dryWet: 100
		};

		if(options) {
			for(var i in options) {
				if(this.options.hasOwnProperty(i)) {
					this.options[i] = options[i];
				}
			}
		}

		this.scriptNode = this._io.context.createScriptProcessor(this.options.samples, 1, 1);
		this.scriptNode.onaudioprocess = this.onProcess.bind(this);

		this.input.connect(this.scriptNode);
		this.scriptNode.connect(this.wet);
		this.setDryWet(this.options.dryWet);
	},

	onProcess: function(e) {
		var inputBuffer = e.inputBuffer.getChannelData(0),
			outputBuffer = e.outputBuffer.getChannelData(0),
			length = inputBuffer.length,
			bits = this.options.depth;


		for(var i = 0; i < length; i+=bits) {
			outputBuffer[i] = inputBuffer[i];
		}
	}
});


audio.io.BitcrusherQuant = audio.io.Bitcrusher.extend({
	onProcess: function(e) {
		var phasor = 0,
	    	last = 0,
	    	normfreq = this._io.utils.scaleNumber(this.options.depth, 1, 16, 1, 0.01),
	    	inputBuffer = e.inputBuffer.getChannelData(0),
			outputBuffer = e.outputBuffer.getChannelData(0),
			length = inputBuffer.length;

		for(var i = 0; i < length; ++i) {
			phasor = phasor + normfreq;

			if (phasor >= 1.0) {
	        	phasor = phasor - 1.0;
	        	last = inputBuffer[i]; //quantize
	        }

			outputBuffer[i] = last; //sample and hold
		}
	}
});