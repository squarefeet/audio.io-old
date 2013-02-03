// A basic envelope
//
// Allows for attack time, decay time, sustain level, and release time.
//
audio.io.BasicEnvelope = audio.io.Audio.extend({
	initialize: function(attackTime, decayTime, sustainLevel, releaseTime) {
		this.gain = this._io.context.createGainNode();

		// Set timing values
		this.setAttackTime( attackTime );
		this.setDecayTime( decayTime );
		this.setReleaseTime( releaseTime );

		// Set level values
		this.setSustainLevel( sustainLevel );

		this.attackLevel = 1;
	},

	setAttackTime: function( value ) {
		this.attackTime = +value || 0.1;
	},
	setDecayTime: function( value ) {
		this.decayTime = +value || 0.2;
	},
	setReleaseTime: function( value ) {
		this.releaseTime = +value || 1;
	},
	setSustainLevel: function( value ) {
		this.sustainLevel = +value || 0.7;
	},

	set: function( param, value ) {
		switch(param) {
			case 'attack':
			case 'attackTime':
				this.setAttackTime(value);
				break;

			case 'decay':
			case 'decayTime':
				this.setDecayTime(value);
				break;

			case 'sustain':
			case 'sustainLevel':
				this.setSustainLevel(value);
				break;

			case 'release':
			case 'releaseTime':
				this.setReleaseTime(value);
				break;
		}
	},

	// A 'noteOn' equivalent. Will ramp up to attack, down to decay at sustain level.
	start: function() {
		var now = this._io.context.currentTime,
			gain = this.gain.gain;

		gain.cancelScheduledValues( now );

		// Start the envelope at 0 volume
		gain.setValueAtTime(0, now);

		// Ramp up to full volume over attack duration.
		gain.linearRampToValueAtTime(this.attackLevel, now + this.attack);

		// Ramp up or down to sustain level over decay duration
		gain.linearRampToValueAtTime(this.sustainLevel, now + this.attack + this.decay);
	},

	stop: function() {
		var now = this._io.context.currentTime,
			gain = this.gain.gain;

		gain.linearRampToValueAtTime(0, this.releaseTime);
	}
});


// This envelope class allows for custom attack levels. It's a tiny
// change but one that I think warrants its own class.
audio.io.Envelope = audio.io.BasicEnvelope.extend({
	initialize: function(attackTime, attackLevel, decayTime, sustainLevel, releaseTime) {
		this.gain = this._io.context.createGainNode();

		// Set timing values
		this.setAttackTime( attackTime );
		this.setDecayTime( decayTime );
		this.setReleaseTime( releaseTime );

		// Set level values
		this.setAttackLevel( attackLevel );
		this.setSustainLevel( sustainLevel );
	},

	setAttackLevel: function( value ) {
		this.attackLevel = +value || 1;
	},

	set: function( param, value ) {
		switch(param) {
			case 'attack':
			case 'attackTime':
				this.setAttackTime(value);
				break;

			case 'attackLevel':
				this.setAttackLevel(value);
				break;

			case 'decay':
			case 'decayTime':
				this.setDecayTime(value);
				break;

			case 'sustain':
			case 'sustainLevel':
				this.setSustainLevel(value);
				break;

			case 'release':
			case 'releaseTime':
				this.setReleaseTime(value);
				break;
		}
	}
});