audio.io.AnalyserModel = audio.io.Model.extend({
    defaults: {
        // Pixel dimensions of the analyser view
        width: 400,
        height: 100,

        // Updated the canvas every n milliseconds
        updateRate: 20,

        // Range: 128 - 2048. Must be a power of 2.
        granularity: 2048,
        smoothing: 0.7,

        // Accepted values: 'log' and 'linear'
        frequencyScaling: 'log',

        // Accepted values: 'log' and 'linear'
        dBScaling: 'linear',

        // Display either a 'line' graph or a 'bar' graph
        display: 'line',

        // Whether to draw the peak hold line or not.
        drawPeak: true,

        // Don't touch this. It will hold the peak Uint8Array.
        peaks: null,

        // Don't display decibel levels below this level
        mindB: -192,

        // Don't display decibel levels above this level
        maxdB: 2,

        // View's background color.
        backgroundColor: 'rgba(50, 50, 50, 1)',

        // Colour of the bars or line graph
        bandColor: 'rgba(237, 112, 32, 1)',

        // Color of the peak line.
        peakColor: 'rgba(237, 112, 32, 0.3)',

        // Colors of the frequency delimiter bars
        barColor: 'rgba(100, 100, 100, 0.5)',
        accentuatedBarColor: 'rgba(100, 100, 100, 1)',

        // Color for the frequency text.
        textColor: 'rgba(150, 150, 150, 1)'
    },

    initialize: function() {

    }
});