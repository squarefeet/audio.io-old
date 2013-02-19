audio.io.AnalyserView = audio.io.View.extend({
    tagName: 'div',
    className: 'analyser',

    onmousemove: function(e) {
        e.preventDefault();
        e.stopPropagation();

        // FIXME: display freq at mouse cursor position readout
    },

    initialize: function() {
       _.bindAll(this);
       this.el.addEventListener('mousemove', this.onmousemove, false);
    },

    onControllerAttach: function() {
        this.createElements();
        this.setupCanvas();
    },

    render: function() {
        this.el.appendChild(this.label);
        this.el.appendChild(this.canvas);
        return this;
    },

    createElements: function() {
        var width = this.controller.get('width'),
            fontSize = Math.max(Math.floor(width / 2) - 2, 10);

        this.label = document.createElement('p');
        this.label.style.fontSize = fontSize + 'px';
        this.label.style.width = width + 'px';
    },

    setupCanvas: function() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.controller.get('width') || 50;
        this.canvas.height = this.controller.get('height') || 50;
        this.ctx = this.canvas.getContext('2d');
    },

    clearCanvas: function(ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },


    logTen: function( n ) {
        return Math.log(n) / Math.LN10;
    },

    logTwo: function(n) {
        return Math.log(n) / Math.LN2;
    },

    getP: function( f ) {
        return 69 + 12 * this.logTwo(f / 400);
    },

    draw: function( data ) {
        var value, logValue, logdB, currFreq,
            width = this.canvas.width,
            height = this.canvas.height,
            ctx = this.ctx,
            max = 0,
            length = data.length;

        var freqPerBand = (audio.io.context.sampleRate / 2) / length, // (44100 / 2) / 2048 = 21.something
            power = 20,
            bandwidth = width / this.logTen(Math.pow(length-1, power)),
            octave = 0.301; // octave in decades...






        this.clearCanvas();

        // for ( var i = 0; i < length; i++ ){
        //     value = data[i];
        //     ctx.fillRect(i * bandwidth, height, 1, -((value/256) * height));
        // }


        for(var i = 0; i < length; ++i) {
            value = data[i];

            logValue = this.logTen(Math.pow(i, power));

            logdB = value;


            // ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            // ctx.fillRect(logValue * bandwidth, 0, 1, height);

            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillRect(logValue * bandwidth, height, 1, -((logdB/256) * height));
        }
    }
});