audio.io.SelectBoxView = audio.io.View.extend({
    className: 'selectView',

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
    className: 'buttonView',

    initialize: function() {
        _.bindAll(this);
    },

    createElements: function() {
        this.button = document.createElement('button');
        this.button.addEventListener('click', this.onChange.bind(this), false);

        this.label = document.createElement('span');

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
            this.button.className = 'active';
        }
        else {
            this.button.className = '';
        }

        this.button.disabled = this.controller.get('disabled');
    },

    onChange: function(e) {
        this.controller.set('active', !this.button.className);
    }
});




audio.io.HorizontalRangeView = audio.io.View.extend({
    className: 'rangeView horizontal',

    initialize: function() {
        _.bindAll(this);
    },

    createElements: function() {
        this.range = document.createElement('input');
        this.range.type = 'range';
        this.range.addEventListener('change', this.onChange, false);

        this.label = document.createElement('span');

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
    className: 'sliderView horizontal',

    onmousedown: function(e) {
        if(this.controller.get('disabled')) return;
        this.active = true;
        this.startX = e.pageX;
    },
    onmousemove: function(e) {
        if(!this.active || this.controller.get('disabled')) return;

        var distX = e.pageX - this.startX,
            newValue = this.controller.get('value') + distX;

        newValue = Math.max(this.controller.get('min'), Math.min(this.controller.get('max'), newValue))

        this.startX = e.pageX;
        this.controller.set('value', newValue);
    },
    onmouseup: function(e) {
        if(!this.active || this.controller.get('disabled')) return;
        this.active = false;
    },

    initialize: function() {
        _.bindAll(this);

        this.active = false;
        this.startX = 0;
    },

    createElements: function() {
        this.label = document.createElement('span');

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
        document.addEventListener('mousemove', this.onmousemove, false);
        document.addEventListener('mouseup', this.onmouseup, false);
    },

    onControllerAttach: function() {
        this.createElements();
        this.createEvents();
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
        this.slider.style.width = audio.io.utils.scaleNumberExp(value, min, max, 0, width, exp);
    }
});


