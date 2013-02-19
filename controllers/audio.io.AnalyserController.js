audio.io.AnalyserController = audio.io.Controller.extend({
	initialize: function( options ) {
		var that = this;

		// Create model
		this.setModel( audio.io.AnalyserModel);
		this.model.set(options);

		// Create the view
		this.setView( audio.io.AnalyserView );

		// Create the Nodes
		this.node = new audio.io.Analyser(2048, 20, function(data) {
			that.view.draw(data);
		});

		this.view.controller = this;
        this.view.onControllerAttach();

		// Render the view (doing this here because it's only at
		// this point that the view knows who it's controller is
		// and so can get values from it in order to render
		// correctly).
		this.view.render();

		this.node.start();
	}
});