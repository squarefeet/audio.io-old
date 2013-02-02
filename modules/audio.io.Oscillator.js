// FIXME: Use this as a base class when creating oscillator
//        instances? E.g: create a throw-away osc instance, used
//        when a note is triggered..?
audio.io.MonoOscillator = audio.io.Audio.extend({
	initialize: function(type, freq) {
		var hasType = this._io.oscTypes.indexOf( type );

		// Default to sine if invalid type provided.
		this.type = ~hasType ? hasType : 1;

		// Default to 440hz if none provided.
		this.freq = +freq || 440;

		// Create the oscillator.
		this.osc = this._io.context.createOscillator();
		this.osc.type = this.type;
		this.osc.frequency.value = this.freq;
	},

	onOutputConnect: function( source ) {
		var path = this.getPathToNode( source );
		this.osc.connect( source[path] );
	},

	setType: function( type ) {
		var hasType = this._io.oscTypes.indexOf( type );

		// Default to sine if invalid type provided.
		this.type = ~hasType ? hasType : 1;

		this.osc.type = this.type;
	},

	setFreq: function( freq ) {
		this.osc.frequency.value = +freq || 440;
	},

	start: function( delay ) {
		this.osc.noteOn( delay );
	},
	stop: function( delay ) {
		this.osc.noteOff( delay );
	}
});



// TODO: Ensure this Osc can be used for LFOs as well as noise generation
// FIXME: Should this take care of polyphony and retriggering?
//
// FIXME: As it is below, this class is mostly incorrect. Why on earth
//        I thought that setting the same pitch for all oscillator
//        instances was the way forward is anyone's guess.
//        Needs rewrite! It does make a noise, though... Baby steps...
audio.io.Oscillator = audio.io.Audio.extend({
	initialize: function( type, maxVoices, retrigger ) {
		this.maxVoices = +maxVoices || 1;

		this.retrigger = !!retrigger;

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
		var hasType = this._io.oscTypes.indexOf( type ),
			oscs;

		// Default to sine if invalid type provided.
		this.type = ~hasType ? hasType : 1;

		if(this.instanceOrder.length) {
			oscs = this.instances;

			for(var i in this.instances) {
				oscs[i].type = this.type;
			}
		}
	},

	setFreq: function( osc, freq ) {
		osc.frequency.value = +freq || 440;
	},

	start: function( freq, delay ) {
		var osc = this._io.context.createOscillator();
		osc.type = this.type;

		this.setFreq( osc, freq );

		delay = +delay || 0;


		// If we're already playing the maximum number of voices, stop
		// an existing one.
		if(Object.keys(this.instances).length === this.maxVoices) {
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
			path = this.getPathToNode( this.outputs[i] );
			osc.connect( this.outputs[i][path] );
		}

		// Turn it on, baby!
		osc.noteOn( delay );
	},

	stop: function( freq, delay ) {
		this.instances[ freq ].noteOff( +delay || 0 );
	}
});