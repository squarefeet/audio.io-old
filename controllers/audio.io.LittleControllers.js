audio.io.SelectBoxController = audio.io.Controller.extend({
    initialize: function( options ) {
        var that = this;

        // Create model
        this.setModel( audio.io.SelectBoxModel);
        this.model.set(options);

        // Create the view
        this.setView( audio.io.SelectBoxView );

        this.view.controller = this;
        this.view.onControllerAttach();

        this.model.on('change', this.view.render, this);
    }
});


audio.io.ButtonController = audio.io.Controller.extend({
    initialize: function( options ) {
        var that = this;

        // Create model
        this.setModel( audio.io.ButtonModel);
        this.model.set(options);

        // Create the view
        this.setView( audio.io.ButtonView );

        this.view.controller = this;
        this.view.onControllerAttach();

        this.model.on('change', this.view.render, this);
    }
});

audio.io.HorizontalRangeController = audio.io.Controller.extend({
    initialize: function( options ) {
        var that = this;

        // Create model
        this.setModel( audio.io.HorizontalRangeModel);
        this.model.set(options);

        // Create the view
        this.setView( audio.io.HorizontalRangeView );

        this.view.controller = this;
        this.view.onControllerAttach();

        this.model.on('change', this.view.render, this);
    }
});


audio.io.HorizontalSliderController = audio.io.Controller.extend({
    initialize: function( options ) {
        var that = this;

        // Create model
        this.setModel( audio.io.HorizontalSliderModel);
        this.model.set(options);

        // Create the view
        this.setView( audio.io.HorizontalSliderView );

        this.view.controller = this;
        this.view.onControllerAttach();

        this.model.on('change', this.view.render, this);
    }
});