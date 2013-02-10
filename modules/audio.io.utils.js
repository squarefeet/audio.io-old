audio.io.utils = {

	// This one's pretty self-explanatory...
	//
	// Resource: http://en.wikipedia.org/wiki/Note#Note_frequency_.28hertz.29
	//
	midiNoteToFreq: function( note ) {
		return Math.pow(2, (+note - 69)/12) * 440;
	},

	// Given a curve type, a current value and an upper limit point,
	// work out where on that curve the currentValue lies.
	//
	// At the moment, it's just used by audio.io.VolumeControl.
	//
	// FIXME: Add more curve types.
	//
	getValueWithCurve: function(curve, value, upperLimit) {
		if(curve === 'x*x') {
			var fraction = parseInt(value) / parseInt(upperLimit);
			return fraction * fraction;
		}

		else if(curve === 'linear') {
			return value / upperLimit;
		}
	},

	// When receiving a MIDI message, the first byte of the message
	// denotes the type of MIDI message it is (the function).
	// Each function type contains 16 instances of the function,
	// with each instance mapped to the channel the function was
	// received on.
	//
	// This little helper function will fetch the channel from
	// the first byte for us, as well as passing back a nice
	// string of what the function is.
	//
	// Resource: http://www.midi.org/techspecs/midimessages.php
	//
	parseMIDIFunction: function( fn ) {
		var channel;

		// Note off
		if(fn >= 128 && fn <= 143) {
			channel = fn - 128;
			fn = 'noteOff';
		}

		// Note on
		else if(fn >= 144 && fn <= 159) {
			channel = fn - 144;

			// Note off messages appear to be note on messages
			// with 0 velocity rather than appear within the
			// function range specified in the if clause above
			// this one.
			fn = 'noteOn';
		}

		// Polyphonic aftertouch
		else if(fn >= 160 && fn <= 175) {
			channel = fn - 160;
			fn = 'polyAftertouch';
		}

		// Control/Mode change
		else if(fn >= 176 && fn <= 191) {
			// Seems to handle mod wheel
			channel = fn - 176;
			fn = 'controlChange';
		}

		// Program change
		else if(fn >= 192 && fn <= 207) {
			channel = fn - 192;
			fn = 'programChange';
		}

		// Channel aftertouch
		else if(fn >= 208 && fn <= 223) {
			channel = fn - 208;
			fn = 'channelAftertouch';
		}

		// Pitch wheel
		else if(fn >= 224 && fn <= 239) {
			channel = fn - 224;
			fn = 'pitchbend';
		}

		else {
			// FIXME: Handle unsupported MIDI function values
		}

		return [fn, channel];
	},


	// Given an input value and its high and low bounds, scale
	// that value to new high and low bounds.
	//
	// Formula from MaxMSP's Scale object:
	//	http://www.cycling74.com/forums/topic.php?id=26593
	//
	scaleNumber: function(num, lowIn, highIn, lowOut, highOut) {
		return ((num-lowIn) / (highIn-lowIn)) * (highOut-lowOut) + lowOut;
	},


	keyCodeToMIDINoteMap: {

	},


	getMIDINoteFromKey: function( key, octave ) {
		var positionInScale = audio.io.keyboard.notes.indexOf(key);

		if(positionInScale === -1) return null;

		return positionInScale + (octave * 12);
	},

	loadFileIntoBuffer: function( path, callback ) {
		var xhr = new XMLHttpRequest();

		xhr.open("GET", path, true);

        xhr.responseType = "arraybuffer";

        xhr.onreadystatechange = function () {
            if(xhr.readyState === 4) {
                if(xhr.status < 300 && xhr.status > 199 || xhr.status === 302) {
                    audio.io.context.decodeAudioData(
                    	xhr.response,
                    	function (buffer) {
                        	callback( buffer );
                    	},
                    	function (e) {
                        	if(e) console.log("Error loading impulse:", e);
                    	}
                    );
                }
            }
        };

        xhr.send(null);
	}
};