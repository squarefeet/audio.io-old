audio.io.SelectBoxView = audio.io.View.extend({
    className: 'select',

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
    className: 'button',

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
        $(this.button).toggleClass('active');
        this.controller.set('active', !!this.button.className);
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


