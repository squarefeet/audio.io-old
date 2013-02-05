// The underlying class inherited by most audio.io.* objects.
audio.io.Node = function () {

	// Store a reference to audio.io just in case I decide to
	// change the namespace. I'm lazy like that. And silly,
	// because it's pointless.
	this._io = audio.io;

	// Give each Node a (hopefully) random ID.
	// FIXME: Deprecate?
	this.id = Math.random() * 9827348 | 0;

	// This is where references to all automatable parameters
	// will be stored.
	//
	// Taking the Volume Control as an example, this will have
	// a reference to the gainNode's .gain object.
	//
	this.mods = {};

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

// Since this is the base for all other nodes, there won't
// be any specific functionality when another node is connected
// to an out port, so just use the placeholder NO-OP function
// from audio.io.
audio.io.Node.prototype.onOutputConnect = audio.io.noop;

// audio.io.Node.prototype.connectTo = function( source ) {
// 	if(!source instanceof audio.io.Node) {
// 		console.log('Please pass a valid audio.io.Node object as your', type, 'source.');
// 	}

// 	this.outputs.push( source );
// 	this.onOutputConnect( source );

// 	return this;
// };


// audio.io.Node.prototype.getPathToNode = function( node ) {

// 	if(this instanceof this._io.LFO) {
// 		if(node instanceof this._io.VolumeControl || node instanceof this._io.Envelope) {
// 			return node.gain.gain;
// 		}
// 		else if( node instanceof this._io.BasicChannelStrip ) {
// 			return node.volumeControl.gain.gain;
// 		}
// 		else {
// 			return node;
// 		}
// 	}

// 	if(node instanceof this._io.VolumeControl || node instanceof this._io.Envelope) {
// 		return node.gain;
// 	}
// 	else if( node instanceof this._io.BasicChannelStrip ) {
// 		return node.volumeControl.gain;
// 	}
// 	else if (node instanceof this._io.PanPot) {
// 		return node.panner;
// 	}

// 	else {
// 		return node;
// 	}
// };

// Make this object extendable.
audio.io.Node.extend = window.extend;