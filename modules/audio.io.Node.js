// The underlying class inherited by most audio.io.* objects.
audio.io.Node = function () {
	this.inputs = [];
	this.outputs = [];

	// Store a reference to audio.io just in case I decide to
	// change the namespace. I'm lazy like that. And silly,
	// because it's pointless.
	this._io = audio.io;

	if(typeof this.initialize === 'function') {
		this.initialize.apply(this, arguments);
	}
};

// Since this is the base for all other nodes, there won't
// be any specific functionality when another node is connected
// to an in or out port, so just use the placeholder NO-OP function
// from audio.io.
audio.io.Node.prototype.onInputConnect =
audio.io.Node.prototype.onOutputConnect = audio.io.noop;

// Deal with in/out connections.
audio.io.Node.prototype.connect = function ( type, source ) {
	var types = this._io.connectionTypes,
		isInput = ~types.input.indexOf( type ),
		isOutput = ~types.output.indexOf( type );

	if ( !isInput && !isOutput ) {
		console.error('Invalid input type of "' + type + '" supplied to `connect()`. ');
		return;
	}

	if(!source instanceof audio.io.Node) {
		console.log('Please pass a valid audio.io.Node object as your', type, 'source.');
	}

	if ( isInput ) {
		this.inputs.push( source );
		this.onInputConnect( source );
	}
	else {
		this.outputs.push( source );
		this.onOutputConnect( source );
	}

	return this;
};

audio.io.Node.prototype.getPathToNode = function( node ) {
	if(node instanceof this._io.VolumeControl) {
		return 'gain';
	}
	else if (node instanceof this._io.PanPot) {
		return 'panner';
	}
};


audio.io.Node.extend = window.extend;