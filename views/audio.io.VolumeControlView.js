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


        //     fine = this.controller.get('fine'),
        //     range = this.controller.get('range')


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
        this.initValues();
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

    initValues: function() {
        this.clearColor = 'rgba(0,0,0,0)';
    },

    clearCanvas: function(ctx) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    draw: function( dataL, dataR ) {

        if(!dataL || !dataR) return;

        var ctx = this.context,
            width = this.controller.get('width'),
            height = this.controller.get('height'),
            length = dataL.length,
            value = this.controller.get('value'),
            scaleNumber = audio.io.utils.scaleNumber,
            scaledValue = scaleNumber(value, 0, 100, 0, height);

        this.clearCanvas(ctx);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(10, 0, width-20, height);

        var sumL = 0,
            sumR = 0;

        for (var j=0; j < length; ++j) {
            sumL += dataL[j];
        }
        for (var j=0; j < length; ++j) {
            sumR += dataR[j];
        }

        // Calculate the average frequency of the samples in the bin
        var averageL = sumL / length,
            averageR = sumR / length

        // Draw the bars on the canvas
        var barWidth = this.canvas.width / 2;
        var scaled_averageL = (averageL / 100) * height,
            scaled_averageR = (averageR / 100) * height;


        scaled_averageL = scaleNumber(scaled_averageL, 0, height, 0, value);
        scaled_averageR = scaleNumber(scaled_averageR, 0, height, 0, value);


        // add linear gradient
        var grd = ctx.createLinearGradient(0, height, 0, 0);
        grd.addColorStop(0, '#6ac454');
        grd.addColorStop(0.7, '#6ac454');
        grd.addColorStop(0.8, '#f1e800');
        grd.addColorStop(0.9, '#ff0000');
        grd.addColorStop(1, '#ff0000');

        ctx.fillStyle = grd;

        ctx.fillRect(1, this.canvas.height, barWidth - 2, -scaled_averageL);
        ctx.fillRect(barWidth+1, this.canvas.height, barWidth - 2, -scaled_averageR);



        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, this.canvas.height-scaledValue-1, this.canvas.width, 2);


        // this.updateText();
    },

    updateText: function() {
        var value = this.controller.get('value');

        if(this.controller.get('range') < 100 && this.controller.get('fine')) {
            value = value.toFixed(2);
        }

        this.label.textContent = this.controller.get('label') || '';
        this.value.textContent = value;
    }
});