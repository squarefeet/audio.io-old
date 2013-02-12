var panPot, dial;

dial = new audio.io.DialView({
    label: 'My Dial',
    width: 30,
    height: 30,
    from: 0,
    to: 100,
    value: 50,
    fine: true
});


panPot = new audio.io.PanPotView({
    width: 30,
    height: 30,
    from: -50,
    to: 50,
    value: 0
});

document.body.appendChild(dial.el);
document.body.appendChild(panPot.el);