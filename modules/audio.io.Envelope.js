// A basic envelope
//
// Allows for attack time, decay time, sustain level, and release time.
//
audio.io.BasicEnvelope = audio.io.Audio.extend({
	initialize: function(attackTime, decayTime, sustainLevel, releaseTime) {

		// Set timing values
		this.setAttackTime( attackTime );
		this.setDecayTime( decayTime );
		this.setReleaseTime( releaseTime );

		// Set level values
		this.setSustainLevel( sustainLevel );
		this.attackLevel = 1;

		this.events = new PubSub({ debug: false });
		this.events.on('start', this.start, this);

		this.startTime = 0;

		// Connect in to out directly
		this.input.connect( this.output );
	},

	setAttackTime: function( value ) {
		this.attackTime = +value || 0.05;
	},
	setDecayTime: function( value ) {
		this.decayTime = +value || 0.4;
	},
	setReleaseTime: function( value ) {
		this.releaseTime = +value || 0.01;
	},
	setSustainLevel: function( value ) {
		this.sustainLevel = +value || 0.5;
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
			gain = this.output.gain;

		this.startTime = now;

		gain.cancelScheduledValues( now );

		// Start the envelope at 0 volume
		gain.setValueAtTime(0, now);

		// Ramp up to full volume over attack duration.
		gain.linearRampToValueAtTime(this.attackLevel, now + this.attackTime);

		// Ramp up or down to sustain level over decay duration
		gain.linearRampToValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime);
	},

	stop: function() {
		var now = this._io.context.currentTime,
			gain = this.output.gain,
			that = this,

			envelopeLength = this.startTime + this.attackTime + this.decayTime;

		// Turn off the note straight away if we've reached the end of the envelope
		if(now > envelopeLength && this.sustainLevel === 0) {
			that.events.fire('stop');
			return;
		}

		// Stop any ramps set for the future if the note is released
		// before the end of the envelope cycle.
		else if(now < envelopeLength) {
			gain.cancelScheduledValues( now+0.1 );
			gain.setValueAtTime(gain.value, now);
		}

		gain.linearRampToValueAtTime(0, now + that.releaseTime);

		setTimeout(function() {
			that.events.fire('stop');
		}, (this.releaseTime * 1000) + 1000);
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

		this.events = new PubSub({ debug: false });
		this.events.on('start', this.start, this);

		this.startTime = 0;

		// Connect in to out directly
		this.input.connect( this.output );
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