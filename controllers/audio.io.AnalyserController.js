audio.io.AnalyserController = audio.io.Controller.extend({
	initialize: function( options ) {
		var that = this;

		// Create model
		this.setModel( audio.io.AnalyserModel);
		this.model.set(options);

		// Create the view
		this.setView( audio.io.AnalyserView );

		// Create the Nodes
		this.node = new audio.io.Analyser(
			this.model.get('granularity'),
			this.model.get('updateRate'),
			this.model.get('mindB'),
			this.model.get('maxdB'),
			this.model.get('smoothing'),
			function(data) {
				that.view.draw(data);
			}
		);

		this.view.controller = this;
        this.view.onControllerAttach();

		// Render the view (doing this here because it's only at
		// this point that the view knows who it's controller is
		// and so can get values from it in order to render
		// correctly).
		this.view.render();

		this.node.start();

		this.model.on('change:granularity', function(model, value) {
			that.node.analyser.fftSize = value;
			that.node.data = new Uint8Array( that.node.analyser.frequencyBinCount );
			that.model.attributes.peaks = null;
		});

		this.model.on('change:active', function(model, value) {
			if(value) {
				that.node.start();
			}
			else {
				that.node.stop();
			}
		})
	}
});