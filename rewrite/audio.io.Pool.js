var audio = audio || {};
audio.io = audio.io || {};

audio.io.Pool = function( options ) {
	this.options = {
		count: 24,
		object: null,
		objectArguments: [],
		allowEmpty: false
	};

	_.extend(this.options, options || {});

	this.pool = [];

	this.fill();
};

audio.io.Pool.prototype.fillSingle = function() {
	var opts = this.options,
		object = opts.object,
		args = opts.objectArguments,
		pool = this.pool,
		obj;

	if(object === 'object') {
		obj = {};
	}
	else if(object === 'array') {
		obj = [];
	}
	else {
		obj = new object(args[0], args[1], args[2], args[3], args[4]);
	}

	pool.push(obj);
};

audio.io.Pool.prototype.fill = function() {
	var opts = this.options,
		count = opts.count;

	for(var i = 0; i < count; ++i) {
		this.fillSingle();
	}
};

audio.io.Pool.prototype.get = function() {
	var pool = this.pool

	if( pool.length ) {
		return pool.pop();
	}
	else if(!this.options.allowEmpty) {
		this.fillSingle();
		return pool.pop();
	}
	else {
		throw new Error('Pool is empty.');
	}
};

audio.io.Pool.prototype.release = function( obj ) {
	if(this.options.object === 'array') {
		obj.length = 0;
	}

	this.pool.unshift(obj);
};