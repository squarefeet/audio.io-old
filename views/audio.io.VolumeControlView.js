audio.io.VolumeControlView = audio.io.View.extend({
    tagName: 'div',
    className: 'volumeControl',

    events: {
       'mousedown': 'mousedown',
    },

    mousedown: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.startY = e.pageY;

        this.controller.set('active', true);
    },

    onmousemove: function(e) {
        if(!this.controller.get('active')) return;

        e.preventDefault();
        e.stopPropagation();

        var value = this.startY - e.pageY,
            min = this.controller.get('from'),
            max = this.controller.get('to');


        var absValue = this.controller.get('value') + value;

        absValue = Math.min(max, Math.max(min, absValue));

        this.controller.set('value', absValue);

        this.startY = e.pageY;
    },

    onmouseup: function(e) {
        if(!this.controller.get('active')) return;
        e.preventDefault();
        e.stopPropagation();
        this.controller.set('active', false);
    },

    initialize: function() {
       _.bindAll(this);

       document.addEventListener('mousemove', this.onmousemove, false);
       document.addEventListener('mouseup', this.onmouseup, false);
       // document.body.addEventListener('mouseout', this.onmouseup, false);
    },

    onControllerAttach: function() {
        this.createElements();
        this.setupCanvas();
    },

    render: function() {
        this.el.appendChild(this.label);
        this.el.appendChild(this.canvas);
        this.el.appendChild(this.value);
        this.draw();
        return this;
    },

    createElements: function() {
        var width = this.controller.get('width');

        this.label = document.createElement('p');
        this.value = document.createElement('p');

        var fontSize = Math.max(Math.floor(width / 2) - 2, 10);


        this.label.style.fontSize = this.value.style.fontSize = fontSize + 'px';
        this.label.style.width = this.value.style.width = width + 'px';
    },

    setupCanvas: function() {
        this.canvas = document.createElement('canvas');

        this.canvas.width = this.controller.get('width') || 50;
        this.canvas.height = this.controller.get('height') || 50;

        this.context = this.canvas.getContext('2d');
    },

    clearCanvas: function(ctx) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },


    draw: function( data ) {

        var ctx = this.context,
            width = this.controller.get('width'),
            height = this.controller.get('height'),
            value = this.controller.get('value'),
            active = this.controller.get('active'),
            scaleNumber = audio.io.utils.scaleNumber,
            scaledValue = scaleNumber(value, 0, 100, 0, height),
            paddingSide = 10,
            backgroundWidth = (width - paddingSide*2);

        this.clearCanvas(ctx);

        ctx.fillStyle = active ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(paddingSide, 0, backgroundWidth, height);

        if(data) {
            var length = data.length,
                sum = 0,
                max = 0,
                level = 0;

            for (var j=0; j < length; ++j) {
                sum += data[j];
                max = Math.max(max, data[j]);
            }

            level = max * height;
            level = scaleNumber(level, 0, height, 0, value);

            this.controller.set('level', level);

            // add linear gradient
            var grd = ctx.createLinearGradient(0, height, 0, 0);
            grd.addColorStop(0, '#6ac454');
            grd.addColorStop(0.7, '#6ac454');
            grd.addColorStop(0.8, '#f1e800');
            grd.addColorStop(0.9, '#ff0000');
            grd.addColorStop(1, '#ff0000');

            ctx.fillStyle = grd;

            ctx.fillRect(paddingSide, height, backgroundWidth, -level);
        }


        ctx.fillStyle = active ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.4)';

        // Draw triangles
        var triangleLeftX = paddingSide-1,
            triangleLeftY = this.canvas.height - scaledValue,
            triangleHeight = 4,
            triangleWidth = 5;

        ctx.beginPath();
        ctx.moveTo(triangleLeftX, triangleLeftY);
        ctx.lineTo(triangleLeftX - triangleWidth, triangleLeftY - triangleHeight);
        ctx.lineTo(triangleLeftX - triangleWidth, triangleLeftY + triangleHeight);
        ctx.lineTo(triangleLeftX, triangleLeftY);
        ctx.fill();
        ctx.closePath();

        var triangleRightX = width - paddingSide+2;

        ctx.beginPath();
        ctx.moveTo(triangleRightX, triangleLeftY);
        ctx.lineTo(triangleRightX + triangleWidth, triangleLeftY - triangleHeight);
        ctx.lineTo(triangleRightX + triangleWidth, triangleLeftY + triangleHeight);
        ctx.lineTo(triangleRightX, triangleLeftY);
        ctx.fill();
        ctx.closePath();

        this.updateText();
    },

    updateText: function() {
        var value = this.controller.get('level');

        this.label.textContent = this.controller.get('label') || '';
        this.value.textContent = parseInt(value);
    }
});