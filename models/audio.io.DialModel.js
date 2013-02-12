audio.io.DialModel = audio.io.Model.extend({
    defaults: {
        from: 0,
        to: 100,
        value: 0,
        range: 0,
        increment: 1,
        active: false,
        width: 30,
        height: 30,
        label: ''
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