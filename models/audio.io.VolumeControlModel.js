audio.io.VolumeControlModel = audio.io.Model.extend({
    defaults: {
        from: 0,
        to: 100,
        value: 50,
        level: 50,
        range: 0,
        increment: 1,
        active: false,
        width: 30,
        height: 70,
        label: '',
        curve: 'x*x'
    },

    initialize: function() {

        var to = this.get('to'),
            from = this.get('from'),
            range = to - from,
            pc = (range / 100);

        this.set('increment', pc);
        this.set('range', range);
    }
});