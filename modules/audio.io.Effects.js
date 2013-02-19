// Create an audio effect class to hold shared effect
// functions...
audio.io.Effect = audio.io.Audio.extend({
	setup: function() {
		// Create in and out ports
		this.input = this._io.context.createGainNode();
		this.output = this._io.context.createGainNode();

		this.dry = this._io.context.createGainNode();
		this.wet = this._io.context.createGainNode();

		this.input.connect( this.dry );

		// Connect wet and dry to output
		this.dry.connect( this.output );
		this.wet.connect( this.output );

		this.active = 1;
	},

	// FIXME: Correct this so it works with dry/wet rather than
	//	      effect/output.
	bypass: function( bool ) {
		// If bool is truthy and we're already
		// connected to the effect, go ahead and disconnect...
		if( bool && this.active ) {
			this.input.disconnect( this.effect );
			this.input.connect( this.output );
			this.active = 0;
		}

		// ...Alternatively, connect the output if it's not already
		// connected
		else if( !bool && !this.active ) {
			this.input.disconnect( this.output );
			this.input.connect( this.effect );
			this.active = 1;
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
	initialize: function(type, cutoff, res, gain, dryWet) {
		this.effect = this._io.context.createBiquadFilter();

		this.setType( type );
		this.setCutoff( cutoff );
		this.setResonance( res || 5 );
		this.setGain( gain );

		// Connect input to filter
		this.input.connect( this.effect );

		// ... and the filter to the wet control.
		this.effect.connect( this.wet );

		this.setDryWet(dryWet);
	},

	setType: function( type ) {
		var hasType = this._io.filterTypes.indexOf( type );

		// Default to lowpass if invalid type provided.
		this.type = ~hasType ? hasType : 0;

		this.effect.type = this.type;
	},
	setCutoff: function( value ) {
		this.effect.frequency.value = +value;
	},
	setResonance: function( value ) {
		this.effect.Q.value = +value;
	},
	setGain: function( value ) {
		this.effect.gain.value = +value;
	}
});



audio.io.Reverb = audio.io.Effect.extend({
	initialize: function( impulse, dryWet ) {
		this.effect = this._io.context.createConvolver();

		this.setImpulse( impulse ||'impulse_rev.wav' );

		// Connect input to dry gain node and effect
		this.input.connect( this.effect );

		// Connect convolver to the wet gain node.
		this.effect.connect( this.wet );


		// Set wet/dry level
		this.setDryWet( dryWet );
	},

	setImpulse: function( impulseFilename ) {
		var that = this;

		this._io.utils.loadFileIntoBuffer('../impulses/' + impulseFilename, function(buffer) {
			that.effect.buffer = buffer;
		});
	}
});


audio.io.SimpleDelay = audio.io.Effect.extend({
	initialize: function( time, feedback, dryWet ) {
		this.effect = this._io.context.createDelayNode();
		this.feedback = this._io.context.createGainNode();

		this.input.connect(this.effect);
		this.effect.connect(this.feedback);
		this.feedback.connect(this.wet);
		this.feedback.connect(this.effect);

		this.setFeedback( 0.5 );
		this.setTime( 0.1 );
		this.setDryWet(dryWet);
	},
	setTime: function( time ) {
		this.effect.delayTime.value = +time;
	},
	setFeedback: function( feedback ) {
		this.feedback.gain.value = +feedback || 0.5;
	}
});


audio.io.StereoDelay = audio.io.Effect.extend({
	initialize: function( timeL, timeR, feedback, dryWet ) {
		this.effectL = this._io.context.createDelayNode();
		this.effectR = this._io.context.createDelayNode();

		this.feedbackL = this._io.context.createGainNode();
		this.feedbackR = this._io.context.createGainNode();

		this.splitter = this._io.context.createChannelSplitter(2);
		this.merger = this._io.context.createChannelMerger(2);

		this.input.connect(this.splitter);

		this.splitter.connect(this.effectL, 0);
		this.splitter.connect(this.effectR, 1);

		this.effectL.connect(this.feedbackL);
		this.effectR.connect(this.feedbackR);

		this.feedbackL.connect(this.effectL);
		this.feedbackR.connect(this.effectR);

		this.feedbackL.connect(this.merger, 0, 0);
		this.feedbackR.connect(this.merger, 0, 1);

		this.merger.connect(this.wet);

		this.setTime( timeL, timeR );
		this.setFeedback( feedback );
		this.setDryWet(dryWet);
	},

	setLeftTime: function( time ) {
		this.effectL.delayTime.value = +time;
	},
	setRightTime: function( time ) {
		this.effectR.delayTime.value = +time;
	},
	setTime: function(l, r) {
		this.setLeftTime(l);
		this.setRightTime(r);
	},
	setFeedback: function( feedback ) {
		this.feedbackL.gain.value = +feedback || 0.5;
		this.feedbackR.gain.value = +feedback || 0.5;
	}
});


audio.io.RingMod = audio.io.Effect.extend({
	initialize: function(freq, dryWet) {
		this.ringMod = this._io.context.createGainNode();
		this.osc = this._io.context.createOscillator();

		this.osc.type = this.osc.SINE;

		this.osc.connect(this.ringMod.gain);

		this.setFrequency(freq);
		this.setDryWet( dryWet );

		this.ringMod.gain.value = 0;
		this.input.connect(this.ringMod);
		this.ringMod.connect(this.wet);
		this.osc.start(0);
	},

	setFrequency: function( freq ) {
		this.osc.frequency.value = +freq;
	}
});


audio.io.Utility = audio.io.Audio.extend({
	initialize: function() {
		this.splitter = this._io.context.createChannelSplitter(2);
		this.merger = this._io.context.createChannelMerger(2);

		this.left = this._io.context.createGainNode();
		this.right = this._io.context.createGainNode();

		this.input.connect(this.splitter);

		this.splitter.connect(this.left, 0);
		this.splitter.connect(this.right, 1);

		this.left.connect(this.merger, 0, 0);
		this.right.connect(this.merger, 0, 1);

		this.merger.connect(this.output);
	},

	setLeftPhase: function( inverted ) {
		if(inverted) {
			this.left.gain.value = -this.left.gain.value;
		}
		else {
			this.left.gain.value = Math.abs(this.left.gain.value);
		}
	},
	setRightPhase: function( inverted ) {
		if(inverted) {
			this.right.gain.value = -this.right.gain.value;
		}
		else {
			this.right.gain.value = Math.abs(this.right.gain.value);
		}
	}
});



audio.io.Equalizer = audio.io.Effect.extend({
	_frequencies: [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000],

	initialize: function(bands) {
		this.numBands = +bands || 10;

		this.filtersGain = this._io.context.createGainNode();

		this.filtersGain.connect(this.wet);

		this.filtersGain.gain.value = 1 / this.numBands;

		this.filters = [];
		this.createFrequencyBands();

		this.setDryWet(100);
	},

	createFrequencyBands: function() {
		var filter;

		for(var i = 0, il = this.numBands; i < il; i += 1) {
			filter = this._io.context.createBiquadFilter();
			filter.type = filter.PEAKING;
			filter.gain.value = 1.0;
			filter.frequency.value = this._frequencies[i];
			filter.Q.value = 1;

			this.input.connect(filter);
			filter.connect(this.filtersGain);

			this.filters.push(filter);
		}
	},

	setPoint: function( filterIndex, param, value) {
		var filter;

		if(filter = this.filters[ filterIndex ]) {
			filter[param].value = value;
		}
	}
});