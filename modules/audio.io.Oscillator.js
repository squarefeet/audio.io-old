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
	initialize: function( type, freq, maxVoices, retrigger ) {
		this.maxVoices = +maxVoices || 1;

		this.instances = [];

		this.setType( type );
		this.setFreq( freq );
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

		if(this.instances.length) {
			oscs = this.instances;

			for(var i = 0, il = oscs.length; i < il; ++i) {
				oscs[i].type = this.type;
			}
		}
	},

	setFreq: function( freq ) {
		var oscs;

		this.freq = +freq

		if(this.instances.length) {
			oscs = this.instances;

			for(var i = 0, il = oscs.length; i < il; ++i) {
				oscs[i].frequency.value = this.freq;
			}
		}
	},

	start: function() {
		var osc = this._io.context.createOscillator();
		osc.type = this.type;
		osc.frequency.value = this.freq;


		if(this.instances.length === this.maxVoices) {
			// Create a new instance, but pop one off the end of this.instances.
			osc.noteOn(0);
			this.stop(this.instances[0]);
			this.instances.push(osc);
		}
		else {
			// Just create a new instance
			osc.noteOn(0);
			this.instances.push(osc);
		}


		var path = this.getPathToNode( this.outputs[0] );
		osc.connect( this.outputs[0][path]);
	},

	stop: function( instance ) {
		if(!instance) {
			this.instances.forEach(function(osc) {
				osc.noteOff(0);
			});
		}
		else if (instance instanceof this._io.Oscillator) {
			instance.noteOff(0);
		}
		else if(typeof instance === 'number') {
			this.instances[instance].noteOff(0);
		}
	}
});