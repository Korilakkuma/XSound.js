(function(global) {
    'use strict';

    /**
     * This class defines properties for using Web MIDI API.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     */
    function MIDI(context) {
        this.context = context;

        this.midiAccess = null;  // for the instance of MIDIAccess
        this.inputs     = [];    // for the instances of MIDIInput
        this.outputs    = [];    // for the instances of MIDIOutput
    }

    /**
     * This method invokes requestMIDIAccess and gets objects for using Web MIDI API.
     * @param {function} sysex This argument is in order to select whether using system exclusive message.
     * @param {function} successCallback This argument is invoked when requestMIDIAccess succeeds.
     * @param {function} errorCallback This argument is invoked when requestMIDIAccess fails.
     * @return {MIDI} This is returned for method chain.
     */
    MIDI.prototype.setup = function(sysex, successCallback, errorCallback) {
        if (!navigator.requestMIDIAccess) {
            throw new Error('Cannot use Web MIDI API.');
        }

        var self = this;

        navigator.requestMIDIAccess({sysex : Boolean(sysex)}).then(function(midiAccess) {
            self.midiAccess = midiAccess;

            if (Object.prototype.toString.call(midiAccess) === '[object Function]') {
                // Legacy Chrome
                self.inputs  = midiAccess.inputs();
                self.outputs = midiAccess.outputs();
            } else {
                // Chrome 39 and later
                var inputIterator  = midiAccess.inputs.values();
                var outputIterator = midiAccess.outputs.values();

                for (var i = inputIterator.next(); !i.done; i = inputIterator.next()) {
                    self.inputs.push(i.value);
                }

                for (var o = outputIterator.next(); !o.done; o = outputIterator.next()) {
                    self.outputs.push(o.value);
                }
            }

            if (Object.prototype.toString.call(successCallback) === '[object Function]') {
                successCallback(self.midiAccess, self.inputs, self.outputs);
            }
        }, function(error) {
            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(error);
            }
        });

        return this;
    };

    /**
     * This method gets the instance of MIDIAccess.
     * @return {MIDIAccess}
     */
    MIDI.prototype.get = function() {
        return this.midiAccess;
    };

    /** @override */
    MIDI.prototype.toString = function() {
        return '[MIDI]';
    };

    // Export
    global.MIDI = MIDI;
    global.midi = new MIDI(audiocontext);

})(window);
