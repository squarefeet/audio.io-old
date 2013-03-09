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


audio.io.Flanger = audio.io.Effect.extend({
	defaults: function() {
		return _.extend({
			delay: 0.25,
			feedback: 0.9,
			frequency: 100,
			Q: 1,
			poles: 4,
			lfoRate: 0.11,
			lfoDepth: 100
		}, audio.io.Effect.prototype.defaults);
	},

	initialize: function() {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Effect.prototype.initialize.apply(that, arguments);

		// Make highpass filter... like a 'clean' control
		that.filter = new that._io.Filter({
			type: 1,
			frequency: that.get('frequency'),
			Q: that.get('Q'),
			poles: that.get('poles')
		});



		// Create the delay node
		that.delay = that._io.context.createDelayNode();
		that.delay.delayTime.value = that.get('delay');

		that.feedback = that._io.context.createGainNode();
		that.feedback.gain.value = that.get('feedback');

		// Create an LFO instance to modulate the delay time
		that.lfo = new that._io.LFO({
			audioParam: that.delay.delayTime,
			rate: that.get('lfoRate'),
			depth: that.get('lfoDepth')
		});

		that.input.connect(that.filter.input);
		that.filter.wet.connect(that.delay);
		that.delay.connect(that.feedback);
		that.feedback.connect(that.delay);
		that.delay.connect(that.wet);
	}
})