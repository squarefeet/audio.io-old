// Create AudioContext and destination (audio.io.masterOut)
audio.io.initialize();

var panPotController = new audio.io.PanPotController({
    width: 30,
    height: 30,
    from: -50,
    to: 50,
    value: 0
});

panPotController.appendTo(document.body);