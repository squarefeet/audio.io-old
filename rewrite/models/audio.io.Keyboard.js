
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

			that.trigger(
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
			key = this._io.utils.getMIDINoteFromKey(key, this.get('octave'));

			this.trigger(
				'noteOff',
				-1,
				this._io.utils.midiNoteToFreq( key ),
				0
			);

			this.trigger(
				'noteOn',
				-1,
				this._io.utils.midiNoteToFreq( key ),
				0
			);
		}
	}
});