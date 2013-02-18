audio.io.VolumeControlController = audio.io.Controller.extend({
	initialize: function( options ) {
		var that = this;

		// Create model
		this.setModel( audio.io.VolumeControlModel);
		this.model.set(options);

		// Create the view
		this.setView( audio.io.VolumeControlView );

		// Create the Nodes
		this.node = new audio.io.VolumeControl(options.curve, options.value);
		this.analyser = new audio.io.LevelAnalyser(2048, 50, function(data) {
			that.view.draw(data);
		});

		this.node.output.connect(this.analyser.input);
		this.analyser.output.connect(this._io.masterOut);


		// Bind a change event on the model to the node's
		// setPosition method, so that when the view changes
		// its panning position, it'll set that value on the model
		// (via this controller), and thus fire a change
		// event on the model...
		this.model.on('change:value', function(model, value) {
			that.node.setVolume.call(that.node, value);
		});

		// Tell the model who we are so the view can
		// access this controllers .get and .set methods
		// (which pass on the request to the model).
		this.view.controller = this;
        // this.model.on('change', this.view.draw, this.view);
        this.view.onControllerAttach();

		// Render the view (doing this here because it's only at
		// this point that the view knows who it's controller is
		// and so can get values from it in order to render
		// correctly).
		this.view.render();
	}
});