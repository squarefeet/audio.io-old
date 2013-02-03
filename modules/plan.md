### Audio Modules ###

##### Terms #####
* **ain**: _audio in_
	* Audio stream into module

* **aout**: _audio out_
	* Audio stream out of module

* **nin**: _note in_
	* Frequency, velocity

* **nout**: _note out_
	* Frequency, velocity

* **min**: _midi in_
	* Channel, note, message

* **mout**: _midi out_
	* Channel, note, message

* **kin**: _keyboard in_
	* Keycode

* **kout**: _keyboard out_
	* Unused..!

#### Core ####
* IO Module
	* min, mout, nin, nout, kin, kout, ain, aout

* **Audio Context**

* **Context Destination Node**: _ain_

* **Volume Control (Gain node)**: _ain, settings, aout_
	* gain (0 - 1)

* **PannerNode**: _ain, settings, aout_
	* Outer gain / inner gain / inner angle

* **Oscillator**: _nin, settings, aout_
	* Sine / Square / Saw / Tri / freq (0 - sampleRate/2)

* **Note**: _min, settings, nout_
	* Converts MIDI in to freq, velocity

* **Keyboard In**: _kin, settings, mout_
	* keyCode to MIDI note
	* Octave bothering (z down, x up)
	* Velocity bothering (c down, v up)

* **MIDI In**: _min, mout_
	* MIDI note to freq conversion


----

#### Combinations ####
* **Master Out**: _In -> Volume control -> Destination node_

* **Pan Pot**: _In -> PannerNode -> Out_

* **Channel Strip**: _In -> Pan Pot -> Volume Control -> Master Out_

* **Envelope**: _In -> Volume Control ->_ n _linearRampToValueAtTime calls -> Out_
	* _Attack value, decay value, sustain value, release value_
	* _Resource: http://www.softsynth.com/webaudio/gainramp.php_

* **Oscillator Group**: _Nin -> _Freq (+- fine) -> Pan Pot -> Volume Control -> Envelope -> Out_