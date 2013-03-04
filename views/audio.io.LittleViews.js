audio.io.SelectBoxView = audio.io.View.extend({
    className: 'io-view io-select',

    initialize: function() {
        _.bindAll(this);
    },

    createElements: function() {
        var select = document.createElement('select'),
            options = this.controller.get('options'),
            option;

        for(var i = 0, il = options.length; i < il; ++i) {
            option = document.createElement('option');
            option.textContent = option.value = options[i];
            select.appendChild(option);
        }

        select.addEventListener('change', this.onChange.bind(this), false);

        var label = document.createElement('span');
        label.className = 'label';

        this.el.appendChild(label);
        this.el.appendChild(select);

        this.select = select;
        this.label = label;
    },

    onControllerAttach: function() {
        this.createElements();
        this.render();
    },

    render: function() {
        this.label.textContent = this.controller.get('label');
        this.select.selectedIndex = this.controller.get('index');
        this.select.disabled = this.controller.get('disabled');
    },

    onChange: function(e) {
        this.controller.set('index', this.select.selectedIndex);
    }
});



audio.io.ButtonView = audio.io.View.extend({
    className: 'io-view io-button',

    initialize: function() {
        _.bindAll(this);
    },

    createElements: function() {
        this.button = document.createElement('button');
        this.button.addEventListener('click', this.onChange.bind(this), false);

        this.label = document.createElement('span');
        this.label.className = 'label';

        this.el.appendChild(this.label);
        this.el.appendChild(this.button);
    },

    onControllerAttach: function() {
        this.createElements();
        this.render();
    },

    render: function() {
        this.button.textContent = this.controller.get('value');
        this.label.textContent = this.controller.get('label');

        if(this.controller.get('active')) {
            this.el.className = this.className + ' active';
        }
        else {
            this.el.className = this.className;
        }

        this.button.disabled = this.controller.get('disabled');
    },

    onChange: function(e) {
        this.controller.set('active', !~this.el.className.indexOf('active'));
    }
});




audio.io.HorizontalRangeView = audio.io.View.extend({
    className: 'io-view io-range io-horizontal',

    initialize: function() {
        _.bindAll(this);
    },

    createElements: function() {
        this.range = document.createElement('input');
        this.range.type = 'range';
        this.range.addEventListener('change', this.onChange, false);

        this.label = document.createElement('span');
        this.label.className = 'label';

        this.el.appendChild(this.label);
        this.el.appendChild(this.range);
    },

    onControllerAttach: function() {
        this.createElements();
        this.render();
    },

    render: function() {
        this.label.textContent = this.controller.get('label');
        this.range.style.width = this.controller.get('width') + 'px';
        this.range.style.height = this.controller.get('height') + 'px';

        this.range.min = this.controller.get('min');
        this.range.max = this.controller.get('max');
        this.range.value = this.controller.get('value');

        this.disabled = this.controller.get('disabled');
    },

    onChange: function(e) {
        this.controller.set('value', this.range.value, true);
    }
});



audio.io.HorizontalSliderView = audio.io.View.extend({
    className: 'io-view io-slider io-horizontal',

    onmousedown: function(e) {
        if(this.controller.get('disabled')) return;
        this.active = true;
        this.startX = e.pageX;
    },
    onmousemove: function(e) {
        if(!this.active || this.controller.get('disabled')) return;

        var oldValue = this.controller.get('value'),
            min = this.controller.get('min'),
            max = this.controller.get('max'),
            distX = e.pageX - this.startX,
            steps = this.controller.get('steps'),
            newValue;


        this.currentStep = this.currentStep + distX;

        if(this.currentStep < 0) {
            this.currentStep = 0;
            newValue = min;
        }

        else if(this.currentStep >= steps) {
            this.currentStep = steps-1;
            newValue = max;
        }

        else {
            newValue = this.steps[this.currentStep];
        }

        this.startX = e.pageX;
        this.controller.set('value', newValue);
    },
    onmouseup: function(e) {
        if(!this.active || this.controller.get('disabled')) return;
        this.active = false;
    },

    initialize: function() {
        _.bindAll(this);

        this.steps = [];
        this.active = false;
    },

    createElements: function() {
        this.label = document.createElement('span');
        this.label.className = 'label';

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'wrapper';

        this.slider = document.createElement('div');
        this.slider.className = 'slider';

        this.value = document.createElement('span');
        this.value.className = 'value';

        this.wrapper.appendChild(this.slider);
        this.wrapper.appendChild(this.value);

        this.el.appendChild(this.label);
        this.el.appendChild(this.wrapper);
    },

    createEvents: function() {
        this.el.addEventListener('mousedown', this.onmousedown, false);
        this.el.addEventListener('mousemove', this.onmousemove, false);
        document.addEventListener('mouseup', this.onmouseup, false);
    },

    createRange: function() {
        var steps = this.controller.get('steps'),
            min = this.controller.get('min'),
            max = this.controller.get('max'),
            exp = this.controller.get('exponent'),
            linearStep = (max - min) / steps,
            value;

        for(var i = 0; i < steps; ++i) {
            value = audio.io.utils.scaleNumberExp( min+(linearStep*i), min, max, min, max, exp).toFixed(2)
            this.steps.push( +value );
        }

        this.linearStep = linearStep;

        this.currentStep = audio.io.utils.scaleNumber(this.controller.get('value'), min, max, 0, steps);
    },

    onControllerAttach: function() {
        this.createElements();
        this.createEvents();
        this.createRange();
        this.render();
    },

    render: function() {
        var controller = this.controller,
            width = controller.get('width'),
            height = controller.get('height'),
            value = controller.get('value'),
            label = controller.get('label'),
            exp = controller.get('exponent'),
            min = controller.get('min'),
            max = controller.get('max');

        this.label.textContent = label;
        this.value.textContent = value;
        this.value.style.lineHeight = height + 'px';
        this.wrapper.style.width = width + 'px';
        this.wrapper.style.height = height + 'px';
        this.slider.style.width = audio.io.utils.scaleNumber(value, min, max, 0, width);
    }
});


