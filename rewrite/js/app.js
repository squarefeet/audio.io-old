
var canvas = new audio.io.ui.CanvasView();
document.querySelector('.stage').appendChild(canvas.el);


var newObjectBtn = document.querySelector('.newObject');

newObjectBtn.addEventListener('click', function(e) {
	var view = new audio.io.ui.ObjectView({
		canvasView: canvas
	});
	document.querySelector('.stage').appendChild(view.el);
}, false);