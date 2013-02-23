audio.io.SelectBoxModel = audio.io.Model.extend({
    defaults: {
        width: 100,
        height: 30,
        options: [],
        label: 'Select:',
        index: 0,
        disabled: false
    }
});

audio.io.ButtonModel = audio.io.Model.extend({
    defaults: {
        width: 100,
        height: 30,
        label: 'Button label:',
        value: 'Toggle me',
        active: false,
        disabled: false
    }
});

audio.io.HorizontalRangeModel = audio.io.Model.extend({
    defaults: {
        width: 100,
        height: 30,
        min: 0,
        max: 100,
        label: 'Range:',
        value: 50,
        disabled: false
    }
});