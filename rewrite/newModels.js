//
// The main model that all nodes/modules/whatever
// inherit from.
//
audio.io.Node = Backbone.Model.extend({
	_io: audio.io
});


//
// Direct audio.io.Node subclasses as listed
// below are do *not* have an input and an
// output. They can either be attached directly
// to audio params, or are start or end points
// for other Nodes and as such have only an input
// or an output.
//
// audio.io.Node subclasses:
// - LFO,
// - Envelope
// - Keyboard Input
//
audio.io.LFO = audio.io.Node.extend({
 	defaults: {
 		type: 0, // sine
 		rate: 2, // hz
 		depth: 100 // amplification level
 	},

	initialize: function() {
		var that = this,
			ctx = that._io.context;

		// Create the oscillator.
		that.osc = ctx.createOscillator();
		that.osc.frequency.value = that.get('rate');

		// Create depth control
		that.output = ctx.createGainNode();

		that.setType ( that.get('type')  );
		that.setDepth( that.get('depth') );

		that.osc.connect(that.output);

		that.on('change:type', that.setType, that);
		that.on('change:depth', that.setDepth, that);
	},

	setType: function( model, type ) {
		var that = this;

		// If only one argument is passed, use it as
		// the value argument, and set the value attribute
		// of this model as it won't have been triggered
		// by a change.
		if( arguments.length === 1 ) {
			type = model;
		}

		var types = that._io.oscTypes,
			hasType = types.indexOf( type );

		// Default to sine if invalid type provided.
		type = ~hasType ? hasType : 0;

		// Now that we've normalized the `type` argument,
		// set it on the model if this function hasn't been
		// fired by a `change:type` event.
		if( arguments.length === 1 ) {
			that.set('type', type);
		}

		that.osc.type = type;
	},

	setDepth: function( model, depth ) {
		var that = this;

		if( arguments.length === 1 ) {
			depth = model;
		}

		// Normalize...
		depth = +depth;

		if(arguments.length === 1) {
			that.set('depth', depth);
		}

		if(depth >= 0) {
			that.output.gain.value = depth;
		}
	},

	start: function( delay ) {
		this.osc.start( delay || 0 );
	},

	stop: function( delay ) {
		this.osc.stop( delay || 0 );
	}

	connectMod: function( mod, param ) {
		if(param === 'frequency') {
			mod.output.connect(this.osc.frequency);
		}
		else if(param === 'depth') {
			mod.output.connect(this.output.gain);
		}
	}
});

// FYI:
// Subscribe to Envelope's 'end' event to get told
// when envelope has finished release cycle.
audio.io.Envelope = audio.io.Node.extend({
	defaults: {
		audioParam: null,

		// min and max values have no lower or upper bounds
		// to allow for easy value scaling.
		min: 0, // minimum audioParam value
		max: 1, // maximum audioParam value

		// All time values are in seconds.
		attackTime: 0.2,
		decayTime: 1,
		releaseTime: 0.5,

		// Level values between 0 and 1.
		attackLevel: 1, // All level values are scaled to match min and max values
		sustainLevel: 0.5
	},

	initialize: function() {
		var that = this;

		that.startTime = 0;
		that.length = that.get('attackTime') + that.get('decayTime');
	},

	start: function() {
		var that = this,
			scaleNumber = that._io.utils.scaleNumber,
			node = that.get('audioParam'),
			minLevel = that.get('min'),
			maxLevel = that.get('max'),
			attackTime = that.get('attackTime'),
			decayTime = that.get('decayTime'),
			attackLevel = scaleNumber( that.get('attackLevel'), 0, 1, minLevel, maxLevel ),
			sustainLevel = scaleNumber( that.get('sustainLevel'), 0, 1, minLevel, maxLevel ),
			now = that._io.context.currentTime;

		that.startTime = now;

		node.cancelScheduledValues( now );
		node.setValueAtTime( minLevel, now );
		node.linearRampToValueAtTime( attackLevel, now + attackTime );
		node.linearRampToValueAtTime( sustainLevel, now + attackTime + decayTime );
	},

	stop: function() {
		var that = this,
			node = that.get('audioParam'),
			minLevel = that.get('min'),
			releaseTime = that.get('releaseTime'),
			envLength = that.startTime + that.length,
			now = that._io.context.currentTime;

		node.linearRampToValueAtTime(minLevel, now + releaseTime);

		setTimeout(function() {
			that.fire('end');
		}, now + (releaseTime * 1000));
	}
});


// A base class to handle inputs such as Keyboards
// and MIDI.
audio.io.Input = audio.io.Node.extend({
	defaults: {
		active: 1
	},

	enable: function() {
		this.set('active', 0);
	},
	disable: function() {
		this.set('active', 1);
	}
});

audio.io.Keyboard = audio.io.Input.extend({
	defaults: function() {
		return _.extend({
			minOctave: 0,
			maxOctave: 10,
			octave: 5,

			minVelocity: 0,
			maxVelocity: 127,
			velocity: 100,
			velocityStep: 10
		}, audio.io.Input.prototype.defaults);
	},

	initialize: function() {
		var that = this;

		document.addEventListener('keydown', that.onKeyDown.bind(that), false);
		document.addEventListener('keyup', that.onKeyUp.bind(that), false);

		that.pressedKeys = [];
	},

	onKeyDown: function(e) {
		var that = this,
			keyCode = e.keyCode,
			keys = that._io.keyboard,
			letter = String.fromCharCode(keyCode),
			utils = that._io.utils,
			octave, minOctave, maxOctave,
			velocity, minVelocity, maxVelocity, velocityStep,
			midiNote;

		if(!that.get('active') || that.pressedKeys.indexOf(keyCode) > -1 || e.metaKey) {
			return;
		}

		e.preventDefault();

		octave = that.get('octave');
		minOctave = that.get('minOctave');
		maxOctave = that.get('maxOctave');
		velocity = that.get('velocity');
		minVelocity = that.get('minVelocity');
		maxVelocity = that.get('maxVelocity');
		velocityStep = that.get('velocityStep');

		if(letter === keys.DOWN_OCTAVE) {
			that.set('octave', Math.max(--octave, minOctave));
		}
		else if(letter === keys.UP_OCTAVE) {
			that.set('octave', Math.min(++octave, maxOctave));
		}
		else if(letter === keys.DOWN_VEL) {
			that.set('velocity', Math.max(velocity - velocityStep, minVelocity));
		}
		else if(letter === keys.UP_VEL) {
			that.set('velocity', Math.min(velocity + velocityStep, maxVelocity));
		}

		else {
			midiNote = utils.getMIDINoteFromKey(letter, octave);

			if(!midiNote) return;

			that.pressedKeys.push(keyCode);

			that.fire(
				'noteOn',
				-1, // Channel (-1 === 'All')
				utils.midiNoteToFreq( midiNote ),
				velocity
			);
		}
	},

	onKeyUp: function(e) {
		if(!this.get('active')) return;

		var key = this.pressedKeys.indexOf( e.keyCode );

		if(key > -1) {
			key = String.fromCharCode(this.pressedKeys.splice(key, 1)[0]);
			key = this._io.utils.getMIDINoteFromKey(key, this.octave);

			this.fire(
				'noteOff',
				-1,
				this._io.utils.midiNoteToFreq( key ),
				0
			);

			this.fire(
				'noteOn',
				-1,
				this._io.utils.midiNoteToFreq( key ),
				0
			);
		}
	}
})




// A parent class for all audio-based models, such as panpots,
// volume controls, and oscillators.
audio.io.Audio = audio.io.Node.extend({

	initialize: function() {
		// Create in and out ports
		var that = this,
			ctx = that._io.context;
		that.input = ctx.createGainNode();
		that.output = ctx.createGainNode();
	},

	connectMod: function( modSource, targetAttribute ) {
		// If the attribute is allowed to be modulated
		// store this modSource so we can reference it
		// when needed.

		// if( this.modAttributes.hasOwnProperty( targetAttribute ) ) {
			this.modSources[ targetAttribute ] = modSource;
		// }
	},

	connect: function( source ) {
		var that = this,
			io = that._io,
			output = that.output;

		if( source instanceof io.Controller ) {
			output.connect( source.node.input );
		}

		// If we're dealing with an audio.io.Audio node,
		// we know we have an input to connect to, so
		// go ahead and do just that.
		else if( source instanceof io.Audio ) {
			output.connect(source.input);
		}

		// Otherwise, try to connect to the source directly...
		else {
			output.connect( source );
		}
	}
});



//
// audio.io.Audio subclasses:
// - VolumeControl,
// - StereoPanPot
//

// A simple volume control model. Modulate's output
// gain node's value.
audio.io.VolumeControl = audio.io.Audio.extend({
	defaults: {
		min: 0,
        max: 100,
        value: 50,
        range: 0,
        active: false,
        width: 30,
        height: 70,
        label: '',
        curve: 'x*x'
	},

	initialize: function() {
		var that = this;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Audio.prototype.initialize.apply(that, arguments);

		// Determine the range of the control
		that.set('range', that.get('max') - that.get('min'));

		// Set the starting level
		that.setVolume( value );

		// Connect the input directly to the output
		that.input.connect( that.output );

		// Register events
		that.on('change:value', that.setVolume, that);
	},

	setVolume: function( model, value ) {
		var that = this;

		// If only one argument is passed, use it as
		// the value argument, and set the value attribute
		// of this model as it won't have been triggered
		// by a change.
		if(arguments.length === 1) {
			value = model;
			that.set('value', value);
		}

		value = that._io.utils.getValueWithCurve( that.get('curve'), value, that.get('max'));
		that.output.gain.value = value;
	}
});


// A 2d, stereo PanPot. Accepted values in range -50 to 50.
// Center position is 0.
//
audio.io.StereoPanPot = audio.io.Audio.extend({
	defaults: {
		min: -50,
		max: 50,
		value: 0,
		range: 0,
		active: false,
		width: 30,
		height: 30,
		label: ''
	},

	initialize: function() {

		var that = this,
			io = that._io,
			ctx = io.context;

		// Call parent class's initialize fn so in and out gain nodes
		// are created.
		that._io.Audio.prototype.initialize.apply(that, arguments);

		// Create a channel splitter so we can grab left/right channels.
		that.splitter = ctx.createChannelSplitter(2);

		// Create gain Nodes for left/right channels.
		that.leftGain = ctx.createGainNode();
		that.rightGain = ctx.createGainNode();

		// Create a channel merger
		that.merger = ctx.createChannelMerger(2);

		// Connect audio in to splitter...
		that.input.connect(that.splitter);

		// ...then left/right splitter out to each gain node
		that.splitter.connect(that.leftGain, 0);
		that.splitter.connect(that.rightGain, 1);

		// ...then connect the left/right gain nodes back into the merger
		that.leftGain.connect(that.merger, 0, 0);
		that.rightGain.connect(that.merger, 0, 1);

		// ...and finally connect the merger to the output
		that.merger.connect(that.output);


		// Bind scope where needed
		that.setPosition = that.setPosition.bind(that);

		// Set the initial panning value
		that.setPosition( value );

		// Register events
		that.on('change:value', that.setPosition);
	},

	setPosition: function( model, value ) {
		var that = this,
			utils = that._io.utils,
			min = that.get('min'),
			max = that.get('max'),
			l = that.leftGain.gain,
			r = that.rightGain.gain;

		// If only one argument is passed, use it as
		// the value argument, and set the value attribute
		// of this model.
		if(arguments.length === 1) {
			value = model;
			that.set('value', value);
		}

		if(!value) { value = 0; }

		value |= 0;
		value = utils.clampNumber(value, min, max);
		value = utils.scaleNumber(value, -50, 50, -1, 1);

		// Optimise for center
		if(value === 0) {
			l.value = r.value = 1;
		}
		else if(value > 0) {
			l.value = 1 - value;
			r.value = 1;
		}
		else if(value < 0) {
			r.value = 1 + value;
			l.value = 1;
		}
	}
});



// FIXME: this.
audio.io.MonoOscillator = audio.io.Audio.extend({
	defaults: {
		type: 0,
		freq: 440,
		curve: 'x*x'
	},

	initialize: function() {
		var that = this,
			ctx = that._io.context;

		var osc = that.osc = ctx.createOscillator();
		var merger = that.merger = ctx.createChannelMerger(2);

		// Connect the osc to L and R inputs of the merger
		// to create a true stereo out.
		osc.connect(merger, 0, 0);
		osc.connect(merger, 0, 1);
	}
});