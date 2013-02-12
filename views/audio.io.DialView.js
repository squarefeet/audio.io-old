// Dial View and PanPot View.

audio.io.DialView = audio.io.View.extend({
    tagName: 'div',
    className: 'dial',

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
            fine = this.controller.get('fine'),
            range = this.controller.get('range'),
            min = this.controller.get('from'),
            max = this.controller.get('to');

        if( !fine && range > 100 || fine && range < 100 ) {
            if(value > 0) {
                value = this.controller.get('increment');
            }
            else {
                value = -this.controller.get('increment');
            }
        }


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

    draw: function() {
        var ctx = this.context;

        this.clearCanvas(ctx);

        var lineWidth = this.controller.get('width') / 10;

        var outlineX = this.canvas.width / 2;
        var outlineY = this.canvas.height / 2;
        var radius = (this.canvas.width / 2) - lineWidth;
        var startAngle = 0 + 135;
        var endAngle = 270 + 135;

        var valueEnd = this.model.angleFromValue();

        startAngle = audio.io.utils.degToRad(startAngle);
        endAngle = audio.io.utils.degToRad(endAngle);
        valueEnd = audio.io.utils.degToRad(valueEnd);


        // Draw the outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = lineWidth-0.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
        ctx.arc(outlineX, outlineY, radius, startAngle, endAngle, false);
        ctx.stroke();


        // Draw the value line
        ctx.strokeStyle = '#ED7020';

        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.arc(outlineX, outlineY, radius, startAngle, valueEnd, false);
        ctx.lineTo(outlineX, outlineY);
        ctx.stroke();

        this.updateText();
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


audio.io.PanPotView = audio.io.DialView.extend({
    events: {
        'dblclick': 'dblclick',
        'mousedown': 'mousedown'
    },

    dblclick: function() {
        this.controller.set('value', 0);
    },

    draw: function() {
        var ctx = this.context;

        this.clearCanvas(ctx);

        var lineWidth = this.controller.get('width') / 10;

        var outlineX = this.canvas.width / 2;
        var outlineY = this.canvas.height / 2;
        var radius = (this.canvas.width / 2) - lineWidth;
        var startAngle = 0 + 135;
        var endAngle = 270 + 135;

        var valueStartAngle = 0 - 90;

        var valueEnd = audio.io.utils.angleFromValue(
            this.controller.get('from'),
            this.controller.get('to'),
            this.controller.get('value')
        );

        valueStartAngle = audio.io.utils.degToRad(valueStartAngle);
        startAngle = audio.io.utils.degToRad(startAngle);
        endAngle = audio.io.utils.degToRad(endAngle);
        valueEnd = audio.io.utils.degToRad(valueEnd);


        // Draw the outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
        ctx.lineWidth = lineWidth - 0.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
        ctx.arc(outlineX, outlineY, radius, startAngle, endAngle, false);
        ctx.stroke();


        // Draw the value line
        ctx.strokeStyle = '#ED7020';
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.arc(outlineX, outlineY, radius, valueStartAngle, valueEnd, !(this.controller.get('value') > 0));
        ctx.lineTo(outlineX, outlineY);
        ctx.stroke();

        this.updateText();
    },


    updateText: function() {
        var value = this.controller.get('value');

        if(value < 0) {
            value = Math.abs(value);
            value += 'L';
        }
        else if(value > 0){
            value += 'R';
        }
        else {
            value = 'C';
        }

        this.label.textContent = this.controller.get('label') || '';
        this.value.textContent = value;
    }
})