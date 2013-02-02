// FIXME: Use this as a base class when creating oscillator
//        instances? E.g: create a throw-away osc instance, used
//        when a note is triggered..?
audio.io.MonoOscillator = audio.io.Audio.extend({
	initialize: function(type, freq, curve, level) {

		// Default to 440hz if none provided.
		this.freq = +freq || 440;

		// Create the oscillator.
		this.osc = this._io.context.createOscillator();
		this.osc.frequency.value = this.freq;

		this.hasVolume = !!(curve || level);

		if(this.hasVolume) {
			this.volumeControl = new this._io.VolumeControl( curve, level );
			this.osc.connect(this.volumeControl.gain);
		}


		// Default to sine if invalid type provided.
		this.setType ( type );
	},

	onOutputConnect: function( source ) {
		var path = this.getPathToNode( source );

		if(this.hasVolume) {
			this.volumeControl.connect( 'out', source[path] );
		}
		else {
			this.osc.connect( source[path] );
		}
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
		if(level && this.hasVolume) {
			this.volumeControl.setVolume( level );
		}

		this.osc.noteOn( delay );
	},
	stop: function( delay ) {
		this.osc.noteOff( delay );
	}
});

// TODO: Ensure this Osc can be used for LFOs as well as noise generation
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

	onInputConnect: function() {},
	onOutputConnect: function( source ) {
		var path = this.getPathToNode( source );

		if(this.instances.length) {
			this.instances[i].connect( source[path] );
		}
	},

	setType: function( type ) {
		// No need to do any checking here since we're now using MonoOscillator
		// class when .start() is called.
		this.type = type;
	},

	start: function( freq, velocity, delay ) {

		// Create a new instance of MonoOscillator.
		var osc = new audio.io.MonoOscillator(this.type, freq, this.volumeCurve, velocity);

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
			this.stop(freq);
		}


		// Store this osc
		this.instances[freq] = osc;
		this.instanceOrder.push(freq);


		// Connect osc to all available outputs.
		for(var i = 0, il = this.outputs.length, path; i < il; ++i) {
			osc.connect( 'out', this.outputs[i] );
		}

		// Turn it on, baby!
		osc.start( delay );
	},

	stop: function( freq, delay ) {
		this.instances[ freq ].stop( +delay || 1 );
	}
});