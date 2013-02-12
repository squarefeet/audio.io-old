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

        this.model.set('active', true);
    },

    onmousemove: function(e) {
        if(!this.model.get('active')) return;

        e.preventDefault();
        e.stopPropagation();

        var value = this.startY - e.pageY,
            fine = this.options.fine,
            range = this.model.get('range'),
            min = this.model.get('from'),
            max = this.model.get('to');

        if( !fine && range > 100 || fine && range < 100 ) {
            if(value > 0) {
                value = this.model.get('increment');
            }
            else {
                value = -this.model.get('increment');
            }
        }


        var absValue = this.model.get('value') + value;

        absValue = Math.min(max, Math.max(min, absValue));

        this.model.set('value', absValue);

        this.startY = e.pageY;
    },

    onmouseup: function(e) {
        if(!this.model.get('active')) return;
        e.preventDefault();
        e.stopPropagation();
        this.model.set('active', false);
    },

    initialize: function() {
       _.bindAll(this);

       this.model = new audio.io.DialModel(this.options);
       this.model.on('change', this.draw);

       document.addEventListener('mousemove', this.onmousemove, false);
       document.addEventListener('mouseup', this.onmouseup, false);
       // document.body.addEventListener('mouseout', this.onmouseup, false);

       this.createElements();
       this.setupCanvas();
       this.initValues();

       this.render();
    },

    render: function() {
        this.el.appendChild(this.label);
        this.el.appendChild(this.canvas);
        this.el.appendChild(this.value);
        this.draw();
        return this;
    },

    createElements: function() {
        this.label = document.createElement('p');
        this.value = document.createElement('p');

        var fontSize = Math.max(Math.floor(this.options.width / 2) - 2, 10);


        this.label.style.fontSize = this.value.style.fontSize = fontSize + 'px';
        this.label.style.width = this.value.style.width = this.options.width + 'px';
    },

    setupCanvas: function() {

        this.canvas = document.createElement('canvas');

        this.canvas.width = this.options.width || 50;
        this.canvas.height = this.options.height || 50;

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

        var lineWidth = this.options.width / 10;

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
        var value = this.model.get('value');

        if(this.model.get('range') < 100 && this.options.fine) {
            value = value.toFixed(2);
        }

        this.label.textContent = this.options.label || '';
        this.value.textContent = value;
    }
});


audio.io.PanPotView = audio.io.DialView.extend({
    events: {
        'dblclick': 'dblclick',
        'mousedown': 'mousedown'
    },

    dblclick: function() {
        this.model.set('value', 0);
    },

    draw: function() {
        var ctx = this.context;

        this.clearCanvas(ctx);

        var lineWidth = this.options.width / 10;

        var outlineX = this.canvas.width / 2;
        var outlineY = this.canvas.height / 2;
        var radius = (this.canvas.width / 2) - lineWidth;
        var startAngle = 0 + 135;
        var endAngle = 270 + 135;

        var valueStartAngle = 0 - 90;

        var valueEnd = this.model.angleFromValue();

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
        ctx.arc(outlineX, outlineY, radius, valueStartAngle, valueEnd, !(this.model.get('value') > 0));
        ctx.lineTo(outlineX, outlineY);
        ctx.stroke();

        this.updateText();
    },


    updateText: function() {
        var value = this.model.get('value');

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

        this.label.textContent = this.options.label || '';
        this.value.textContent = value;
    }
})