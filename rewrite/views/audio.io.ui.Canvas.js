audio.io.ui = audio.io.ui || {};


audio.io.ui.ObjectView = Backbone.View.extend({
	className: 'object',

	initialize: function() {
		this.model = new audio.io.ObjectViewModel();

		this.template = document.getElementById('template_object').innerHTML;

		this.active = 0;
		this.moved = 0;
		this.lineActive = 0;

		document.addEventListener('mousemove', this.onmousemove.bind(this), false);
		document.addEventListener('mouseup', this.onmouseup.bind(this), false);

		this.model.on('change:x change:y', this.updatePosition, this);
		this.model.on('change:selected', this.onSelected, this);

		this.render();
	},

	render: function() {
		var that = this;

		this.el.innerHTML = _.template(this.template, {
			inputs: this.model.get('inputs'),
			outputs: this.model.get('outputs')
		});

		var editable = this.el.querySelector('.editable');

		editable.addEventListener('dblclick', function(e) {
			editable.contentEditable = true;
			editable.focus();
		}, false);

		editable.addEventListener('blur', function(e) {
			editable.contentEditable = false;
		}, false);

		editable.addEventListener('keydown', function(e) {
			if(e.keyCode === 13) {
				editable.blur();
				that.onEditableBlur( this.textContent );
			}
		}, false);

		editable.addEventListener('mousedown', this.onmousedown.bind(this), false);


		var inputs = this.el.querySelectorAll('.inputs > span'),
			outputs = this.el.querySelectorAll('.outputs > span');


		for(var i = 0; i < inputs.length; ++i) {
			inputs[i].addEventListener('mousedown', (function() {
				return function(e){
					that.onInputDown(e);
				};
			}(i)), false);

			inputs[i].addEventListener('mouseup', (function() {
				return function(e){
					that.onInputUp(e);
				};
			}(i)), false);
		}


		this.updatePosition();

		return this;
	},

	updatePosition: function() {
		this.el.style.webkitTransform =
			'translate3d(' +
			this.model.get('x') + 'px,' +
			this.model.get('y') + 'px,' +
			'0)';
	},

	onSelected: function(model, value) {
		if(value) {
			this.el.classList.add('selected');
		}
		else {
			this.el.classList.remove('selected');
		}
	},

	onEditableBlur: function( value ) {
		console.log(value);
	},

	onmousedown: function(e) {
		this.active = 1;
		this.moved = 0;

		if(this.model.get('selected')) {
			this.model.set('selected', 0);
		}
	},

	onmousemove: function(e) {
		if(this.lineActive) {
			this.options.canvasView.moveLine(e.pageX-4, e.pageY-4);
			return;
		}

		if(!this.active) return;
		this.moved = 1;
		this.model.set('x', e.pageX);
		this.model.set('y', e.pageY);
	},

	onmouseup: function(e) {
		this.lineActive = 0;
		if(!this.active) {
			this.model.set('selected', 0);
			return;
		}

		this.active = 0;

		if(!this.moved) {
			this.model.set('selected', 1);
		}
	},


	onInputDown: function(e) {
		this.options.canvasView.startLine(e.pageX-4, e.pageY-4);

		this.lineActive = 1;
	},

	onInputMove: function(e) {
		this.options.canvasView.moveLine(e.pageX, e.pageY);
	},

	onInputUp: function(e) {
		console.log('yeah')
	}
});



audio.io.ui.OLDCanvasView = Backbone.View.extend({
	tagName: 'canvas',

	events: {
		'mousedown': 'onmousedown',
		'mousemove': 'onmousemove',
		'mouseup': 'onmouseup',
		'mouseout': 'onmouseup'
	},

	initialize: function() {
		this.ctx = this.el.getContext('2d');

		this.active = 0;

		this.viewModel = new audio.io.CanvasViewModel();
		this.viewModel.on('change', this.render, this);

		this.render();
	},

	render: function() {
		this.el.width = this.viewModel.get('width');
		this.el.height = this.viewModel.get('height');

		var objects = this.viewModel.get('objects'),
			current;

		this.ctx.clearRect(0, 0, this.el.width, this.el.height);

		for(var i in objects) {
			current = objects[i];
			this.drawObject( current );
		}

		return this;
	},

	drawObject: function( object ) {
		var ctx = this.ctx,
			width = object.model.get('width'),
			height = object.model.get('height'),
			x = object.model.get('x'),
			y = object.model.get('y'),
			inputs = object.model.get('inputs'),
			outputs = object.model.get('outputs'),
			hovered = object.model.get('hovered'),
			selected = object.model.get('selected');

		ctx.fillStyle = selected ? '#95a5a6' : hovered ? '#4d9bc8' : '#ecf0f1';
		ctx.strokeStyle = selected ? '#ecf0f1' : hovered ? '#ecf0f1' : '#95a5a6';
		this.drawRoundRect( ctx, x, y, width, height, 4, true, true);


		ctx.fillStyle = selected || hovered ? '#ecf0f1' : '#95a5a6';

		for(var i = 0; i < inputs; ++i) {
			ctx.fillRect(x + (10 * i) + 3, y, 8, 2);
		}

		for(var i = 0; i < outputs; ++i) {
			ctx.fillRect(x + (10 * i) + 3, y + height - 2, 8, 2);
		}
	},

	drawRoundRect: function(ctx, x, y, width, height, radius, fill, stroke) {
		if (typeof stroke == "undefined" ) {
			stroke = true;
		}

		if (typeof radius === "undefined") {
			radius = 5;
		}

		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();

		if (stroke) {
			ctx.stroke();
		}

		if (fill) {
			ctx.fill();
		}
	},

	getObjectFromPoint: function(x, y) {
		var	objects = this.viewModel.get('objects'),
			objectX, objectY, objectW, objectH,
			inputs, outputs,
			foundObjects = [],
			offsets = [];


		for(var i in objects) {
			objectX = objects[i].model.get('x');
			objectY = objects[i].model.get('y');
			objectW = objects[i].model.get('width');
			objectH = objects[i].model.get('height');
			inputs = objects[i].model.get('inputs');
			outputs = objects[i].model.get('outputs');

			if(inputs.length) {
				for(var i = 0; i < inputs.length; ++i) {
					// if(x >= objectX + 3)
				}
			}

			objects[i].model.set('hovered', 0);

			if(
				x >= objectX && x <= objectX + objectW &&
				y >= objectY && y <= objectY + objectH
			) {
				foundObjects.push(objects[i]);
				offsets.push([x - objectX, y - objectY]);
			}
		}

		foundObjects.sort(function(a, b) {
			return a.model.get('zIndex') < b.model.get('zIndex');
		});

		return {
			objects: foundObjects,
			offsets: offsets
		};
	},

	onmousedown: function(e) {
		var x = e.offsetX,
			y = e.offsetY;

		var pointObjects = this.getObjectFromPoint(x, y),
			objects = pointObjects.objects,
			offsets = pointObjects.offsets,
			viewModelObjects = this.viewModel.get('objects');

		if(objects.length) {
			for(var i in viewModelObjects) {
				viewModelObjects[i].model.set('selected', 0);
			}

			objects[0].model.set('selected', 1);
			this.active = objects[0];
		}
		else {
			for(var i in viewModelObjects) {
				viewModelObjects[i].model.set('selected', 0);
			}
		}

		this.render();
	},

	onmousemove: function(e) {
		var x = e.offsetX,
			y = e.offsetY;

		var pointObjects = this.getObjectFromPoint(x, y),
			objects = pointObjects.objects,
			offsets = pointObjects.offsets;

		if(objects.length) {
			objects[0].model.set('hovered', 1);
		}

		if(this.active) {
			this.active.model.set('x', x);
			this.active.model.set('y', y);
		}

		this.render();
	},

	onmouseup: function(e) {
		if(!this.active) return;
		this.active = 0;
	},

	addNewObject: function() {
		var object = new audio.io.ui.ObjectView();
		var objects = this.viewModel.get('objects');
		objects[ object.cid ] = object;

		object.model.set('zIndex', Object.keys(objects).length);

		this.viewModel.set('objects', objects);
		this.viewModel.trigger('change');
	}
});


audio.io.ui.CanvasView = Backbone.View.extend({
	tagName: 'canvas',

	initialize: function() {
		this.ctx = this.el.getContext('2d');

		this.viewModel = new audio.io.CanvasViewModel();
		this.viewModel.on('change', this.render, this);

		this.render();

		this.startX = 0;
		this.startY = 0;
	},

	render: function() {
		this.el.width = this.viewModel.get('width');
		this.el.height = this.viewModel.get('height');

		return this;
	},


	startLine: function(x, y) {
		this.startX = x;
		this.startY = y
	},

	moveLine: function(x, y) {
		this.ctx.clearRect(0, 0, this.el.width, this.el.height);
		this.ctx.beginPath();
		this.ctx.moveTo(this.startX, this.startY);
		this.ctx.lineTo(x, y);
		this.ctx.closePath();
		this.ctx.stroke();
	},

	endLine: function(x, y) {

	}
});