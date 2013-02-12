audio.io.DialModel = audio.io.Model.extend({
    defaults: {
        from: 0,
        to: 100,
        value: 50,
        range: 0,
        increment: 1,
        active: false
    },

    initialize: function() {
        var to = this.get('to'),
            from = this.get('from'),
            range = to - from,
            pc = (range / 100);

        this.set('increment', pc);
        this.set('range', range);
    },

    angleFromValue: function() {
        var from = this.get('from'),
            to = this.get('to'),
            value = this.get('value'),
            range = to - from,
            offset = to - range;


        // var degreeAsPercent = (270 / 100) * 1;
        //
        // value = value + offset;
        //
        // degreeAsPercent *= value;

        // var degreeAsPercent = (270 / to - offset) * (value + offset)


        var degreeAsPercent = (270 / range) * (value + offset);

        if(offset < 0) {
            degreeAsPercent -= 90;
        }

        return degreeAsPercent + 135;
    }
});