audio.io.PanPotController = audio.io.Controller.extend({
	initialize: function( options ) {
		var that = this;

		// Create model
		this.setModel( audio.io.DialModel);
		this.model.set(options);

		// Create the view
		this.setView( audio.io.PanPotView );

		// Create the Node
		this.node = new audio.io.StereoPanPot();

		// Bind a change event on the model to the node's
		// setPosition method, so that when the view changes
		// its panning position, it'll set that value on the model
		// (via this controller), and thus fire a change
		// event on the model...
		this.model.on('change:value', function(model, value) {
			that.node.setPosition.call(that.node, value);
		});

		// Tell the model who we are so the view can
		// access this controllers .get and .set methods
		// (which pass on the request to the model).
		this.view.controller = this;
        this.model.on('change', this.view.draw, this.view);
        this.view.onControllerAttach();


		// Render the view (doing this here because it's only at
		// this point that the view knows who it's controller is
		// and so can get values from it in order to render
		// correctly).
		this.view.render();
	}
});