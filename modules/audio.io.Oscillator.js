// A one-shot oscillator. Used by the main Oscillator class
// to create noises.
audio.io.MonoOscillator = audio.io.Audio.extend({
	initialize: function(type, freq, curve, level, useEnvelope) {

		// Default to 440hz if none provided.
		this.freq = +freq || 440;

		// Create the oscillator.
		this.osc = this._io.context.createOscillator();
		this.osc.frequency.value = this.freq;

		this.hasVolume = !!(curve || level);
		this.useEnvelope = !!useEnvelope;


		if(this.hasVolume) {
			this.volumeControl = new this._io.VolumeControl( curve, level );

			if(this.useEnvelope) {
				this.envelope = new audio.io.BasicEnvelope();
				this.osc.connect( this.envelope.input );
				this.envelope.connect( this.volumeControl );
			}
			else {
				this.osc.connect( this.volumeControl );
			}

			this.volumeControl.connect( this.output );

			// Store a refernence to the volume control's mod.
			this.modAttributes.volume = this.volumeControl.output;
		}
		else {
			this.osc.connect( this.output );
		}

		// Store "modulatable" references
		this.modAttributes.pitch = this.osc.frequency;

		// Default to sine if invalid type provided.
		this.setType ( type );
	},

	setType: function( type ) {
		var hasType = this._io.oscTypes.indexOf( type );

		// Default to sine if invalid type provided.
		this.type = ~hasType ? hasType : 0;

		this.osc.type = this.type;
	},

	setFreq: function( freq ) {
		this.osc.frequency.value = +freq || 440;
	},

	start: function( delay, level ) {
		if(level && this.hasVolume && !this.useEnvelope) {
			this.volumeControl.setVolume( level );
		}
		else if(this.useEnvelope) {
			this.envelope.events.fire('start');
		}

		if(this.modSources.pitch) {
			this.modSources.pitch.output.connect( this.osc.frequency );
		}


		this.osc.start( delay );
	},

	stop: function( delay, immediate ) {
		var that = this;

		if(!this.useEnvelope || immediate) {
			this.osc.stop( delay );
		}
		else {
			this.envelope.events.on('stop', function() {
				that.osc.stop( delay );
				that.envelope.events.off('stop');
			});

			// FIXME: Find out why this.envelope is sometimes undefined...
			try {
				this.envelope.stop();
			} catch(e) {
				console.error(e);
				this.osc.stop( delay );
			}
		}
	}
});

//
//
//
audio.io.Oscillator = audio.io.Audio.extend({
	initialize: function( type, maxVoices, retrigger, volumeCurve ) {
		this.maxVoices = +maxVoices || 1;
		this.retrigger = !!retrigger;
		this.volumeCurve = volumeCurve;

		this.instances = {};
		this.instanceOrder = [];

		this.setType( type );
	},

	setType: function( type ) {
		// No need to do any checking here since we're now using MonoOscillator
		// class when .start() is called.
		this.type = type;
	},

	start: function( freq, velocity, delay ) {

		// Create a new instance of MonoOscillator.
		var osc = new audio.io.MonoOscillator(this.type, freq, this.volumeCurve, velocity, true);

		// Normalize delay argument
		delay = +delay || 0;

		// If we're already playing the maximum number of voices, stop
		// an existing one.
		if(this.instanceOrder.length === this.maxVoices) {
			// Create a new instance, but pop one off the end of this.instances
			// (i.e. the oldest note currently playing)
			this.stop( this.instanceOrder.shift() );
		}

		// If a note of this frequency is already playing and retriggering is false
		// stop the current instance.
		else if(this.instances[freq] && this.retrigger) {
			this.stop(freq, 0, true);
		}

		// Store this osc
		this.instances[freq] = osc;
		this.instanceOrder.push(freq);


		// Connect osc to all available outputs.
		osc.connect( this.output );

		// Turn it on, baby!
		osc.start( delay );
	},

	stop: function( freq, delay, immediate ) {
		this.instances[ freq ].stop( +delay || 1, immediate );
	}
});



audio.io.MultiOscillator = audio.io.Audio.extend({
	initialize: function( options ) {

		this.options = {
			type: 'sawtooth',
			maxVoices: '16',
			retrigger: true,
			volumeCurve: 'x*x',
			numOscs: 80,
			detune: 20,
			detuneType: 'center'
		};

		if(options) {
			for(var i in options) {
				this.options[i] = options[i];
			}
		}

		this.instances = {};
		this.instanceOrder = [];
	},

	start: function( freq, velocity, delay ) {

		var osc,
			type = this.options.type,
			volCurve = this.options.volumeCurve,
			detuneStep = this.options.detune / this.options.numOscs,
			detuneStart = (this.options.detuneType === 'up' ? 0 :
				-((this.options.numOscs/2) * detuneStep)
			);

		// Normalize delay argument
		delay = +delay || 0;

		// If we're already playing the maximum number of voices, stop
		// an existing one.
		if(this.instanceOrder.length === this.maxVoices) {
			// Create a new instance, but pop one off the end of this.instances
			// (i.e. the oldest note currently playing)
			this.stop( this.instanceOrder.shift() );
		}

		// If a note of this frequency is already playing and retriggering is false
		// stop the current instance.
		else if(this.instances[freq] && this.retrigger) {
			this.stop(freq, 0, true);
		}
		else if(this.instances[freq]) {
			this.stop(freq, 0, true);
			// this.instances[freq].length = 0;
		}
		else {
			this.instances[freq] = [];
		}


		// Create multiple mono oscs
		for(var i = 0, il = this.options.numOscs; i < il; ++i) {

			osc = new audio.io.MonoOscillator(type, freq, volCurve, velocity, true);

			osc.osc.detune.value = detuneStart + (detuneStep * i);

			// Connect osc to all available outputs.
			osc.connect( this.output );

			// Turn it on, baby!
			osc.start( delay );

			this.instances[freq].push(osc);
		}



		// // Store this osc
		// this.instances[freq] = osc;
		this.instanceOrder.push(freq);



	},

	stop: function( freq, delay, immediate ) {

		var instance = this.instances[freq];

		for(var i = 0; i < instance.length; ++i) {
			this.instances[freq][i].stop(+delay || 0, immediate);
		}
		// this.instances[ freq ].stop( +delay || 1, immediate );
	}
});