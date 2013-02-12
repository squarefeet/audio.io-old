var audio = audio || {};
audio.io = audio.io || {};

audio.io.Controller = function() {
	// Store a reference to audio.io just in case I decide to
	// change the namespace. I'm lazy like that. And silly,
	// because it's pointless.
	this._io = audio.io;

	// Give each Controller a (hopefully) random (GU)ID.
	// Using the 'broofa guid generator'
	// (http://stackoverflow.com/a/2117523/1592759)
	// Via pull req from Sam Rounce @ https://github.com/srounce
	this.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var rand = (crypto.getRandomNumbers) ? crypto.getRandomNumbers(new Uint32Array(1))[0]/Math.pow(2,32)-1 : Math.random();
		var r = rand*16|0%16, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});

	// Create an events instance specific to this node.
	this.events = new PubSub({
		debug: false
	});

	if(typeof this.setup === 'function') {
		this.setup.apply(this, arguments);
	}

	if(typeof this.initialize === 'function') {
		this.initialize.apply(this, arguments);
	}
};


audio.io.Controller.prototype = {
	setModel: function( model, arguments ) {
		this.model = new model( model, arguments );
	},
	setView: function( view, arguments ) {
		this.view = new view( arguments );
	},
	setNode: function( node, arguments ) {
		this.node = new node( arguments );
	},

	appendTo: function( parentElement ) {
		parentElement.appendChild( this.view.el );
	},

	get: function( key ) {
		return this.model.get( key );
	},
	set: function( key, value ) {
		return this.model.set(key, value);
	},

	connect: function( source ) {
		return this.node.connect( source );
	},
	connectMod: function( modSource, targetAttribute ) {
		return this.node.connectMod( modSource, targetAttribute );
	}
};

audio.io.Controller.extend = window.extend;