//
//	FIXME: Need to account for different keyboard layouts.
//
audio.io.Keyboard = audio.io.Audio.extend({
	initialize: function() {

		document.addEventListener('keydown', this.onKeyDown.bind(this), false);
		document.addEventListener('keyup', this.onKeyUp.bind(this), false);

		this.events = new PubSub({ debug: false });

		this.active = 1;
		this.octave = 5;
		this.velocity = 100;

		this.pressedKeys = [];
	},

	enable: function() {
		this.active = 1;
	},
	disable: function() {
		this.active = 0;
	},

	onKeyDown: function(e) {
		if(!this.active || this.pressedKeys.indexOf(e.keyCode) > -1) return;

		var keyCode = e.keyCode,
			letter = String.fromCharCode(keyCode),
			keys = this._io.keyboard,
			midiNote;



		if(!e.metaKey) {
			e.preventDefault();
		}

		if(letter === keys.DOWN_OCTAVE) {
			this.octave = Math.max(--this.octave, 0);
		}
		else if(letter === keys.UP_OCTAVE) {
			this.octave = Math.min(++this.octave, 7);
		}
		else if(letter === keys.DOWN_VEL) {
			this.velocity = Math.max(this.velocity - 10, 0);
			console.log(this.velocity);
		}
		else if(letter === keys.UP_VEL) {
			this.velocity = Math.min(this.velocity + 10, 127);
			console.log(this.velocity);
		}
		else {
			midiNote = this._io.utils.getMIDINoteFromKey(letter, this.octave);

			if(!midiNote) return;

			this.events.fire(
				'noteOn',
				null,
				0, // channel
				audio.io.utils.midiNoteToFreq( midiNote ), // frequency
				this.velocity // velocity (obviously)
			);

			this.pressedKeys.push(keyCode);
		}


	},

	onKeyUp: function(e) {
		if(!this.active) return;

		var key = this.pressedKeys.indexOf(e.keyCode);

		if(key > -1) {
			key = String.fromCharCode(this.pressedKeys.splice(key, 1)[0]);



			key = this._io.utils.getMIDINoteFromKey(key, this.octave);

			this.events.fire(
				'noteOn',
				null,
				0, // channel
				audio.io.utils.midiNoteToFreq( key ), // frequency
				0 // velocity (obviously)
			);
		}
	}
});