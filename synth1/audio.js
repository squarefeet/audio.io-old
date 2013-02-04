var audio = {
	oscTypes: ['sine', 'square', 'saw', 'triangle']
};

audio.init = function() {
	var that = this;

	this.setupDOMElements();

	this.context = new webkitAudioContext();
	this.destination = this.context.destination;

	this.controls = {};
	this.oscillators = {};

	this.createGainControl( 50 );

	this.createOscillator( 'osc1', 'sine', 250 );
	this.createOscillator( 'osc2', 'saw', 250 );

	document.addEventListener('keydown', function(e) {
		for(var i in that.oscillators) {
			that.setOscFreq(i, e.keyCode);
			that.oscOn(i);
		}
	}, false);

	document.addEventListener('keyup', function() {
		for(var i in that.oscillators) {
			that.oscOff(i, 0);
		}
	}, false);
};


audio.setupDOMElements = function() {
	this.elements = {
		oscillators: {}
	};
	this.elements.wrapper = document.createElement('div');
	this.elements.wrapper.className = 'wrapper';

	document.body.appendChild(this.elements.wrapper);
};


audio.createDOMControl = function(name, min, max, defaultValue, callback) {
	var that = this,
		wrapper = document.createElement('div'),
		label = document.createElement('p'),
		control = document.createElement('input');

	label.textContent = name;

	control.type = 'range';
	control.min = +min;
	control.max = +max;
	control.value = defaultValue;

	control.addEventListener('change', function() {
		callback.call(that, this);
	}, false);

	wrapper.appendChild(label);
	wrapper.appendChild(control);

	return wrapper;
};


audio.createGainControl = function( defaultValue ) {
	this.controls.gain = this.context.createGainNode();
	this.controls.gain.connect( this.destination );

	this.elements.gainControl = this.createDOMControl('Volume', 0, 100, defaultValue, audio.setVolume);
	audio.setVolume(this.elements.gainControl.querySelectorAll('input')[0]);
	this.elements.wrapper.appendChild(this.elements.gainControl);
};


audio.setVolume = function( element ) {
	console.log('Volume:', element.value);
	var fraction = parseInt(element.value) / parseInt(element.max);
	// Let's use an x*x curve (x-squared) since simple linear (x) does not
	// sound as good.
	this.controls.gain.gain.value = fraction * fraction;
};


audio.createOscillator = function( name, type, freq ) {
	var that = this,
		osc = this.context.createOscillator();

	console.log(type);

	osc.type = this.oscTypes.indexOf(type);
	osc.frequency.value = freq;
	osc.connect(this.controls.gain);

	if(!this.elements.oscillators[name]) {
		this.elements.oscillators[name] = this.createDOMControl(name, 20, 14000, freq, function(el) {
			console.log(name, el.value);
			// that.setOscFreq(name, )
		});
		this.elements.wrapper.appendChild(this.elements.oscillators[name]);
	}

	this.oscillators[name] = osc;
};


audio.setOscFreq = function(name, freq) {
	var osc = this.oscillators[name];

	if(!osc) {
		throw new Error('No oscillator with name', name);
	}

	osc.frequency.value = +freq;
};


audio.oscOn = function(name, delay) {
	var osc = this.oscillators[name];

	if(!osc) {
		throw new Error('No oscillator with name', name);
	}

	this.oscOff(name);

	this.createOscillator(name, this.oscTypes[osc.type], osc.frequency.value);

	this.oscillators[name].start(delay || 0);
};

audio.oscOff = function(name, delay) {
	var osc = this.oscillators[name];

	if(!osc) {
		throw new Error('No oscillator with name', name);
	}

	osc.noteOff(delay || 0);
};



audio.init();