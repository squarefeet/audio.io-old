// FYI:
// Subscribe to Envelope's 'end' event to get told
// when envelope has finished release cycle.
audio.io.Envelope = audio.io.Node.extend({
	defaults: {
		audioParam: null,

		// min and max values have no lower or upper bounds
		// to allow for easy value scaling.
		minLevel: 0, // minimum audioParam value
		maxLevel: 1, // maximum audioParam value

		// All time values are in seconds.
		attackTime: 0.01,
		decayTime: 0.1,
		releaseTime: 0.5,

		// Level values between 0 and 1.
		attackLevel: 1, // All level values are scaled to match min and max values
		sustainLevel: 0.9
	},

	initialize: function() {
		var that = this;

		_.bindAll(this);

		that.startTime = 0;
		that.length = that.get('attackTime') + that.get('decayTime');
	},

	start: function() {
		var that = this,
			scaleNumber = that._io.utils.scaleNumber,
			node = that.get('audioParam'),
			minLevel = that.get('minLevel'),
			maxLevel = that.get('maxLevel'),
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
			minLevel = that.get('minLevel'),
			releaseTime = that.get('releaseTime'),
			envLength = that.startTime + that.length,
			now = that._io.context.currentTime;

		// Turn off the note straight away if we've reached the end of the envelope
		if(now > envLength && this.get('sustainLevel') === 0) {
			that.trigger('stop');
			return;
		}

		// Stop any ramps set for the future if the note is released
		// before the end of the envelope cycle.
		else if(now < envLength) {
			node.cancelScheduledValues( now+0.1 );
			node.setValueAtTime( node.value, now);
		}

		node.linearRampToValueAtTime(minLevel, now + releaseTime);

		setTimeout(function() {
			that.trigger('end');
		}, now + (releaseTime * 1000) + 1000);
	}
});