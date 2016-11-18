(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Equalizer(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        this.bass     = context.createBiquadFilter();
        this.middle   = context.createBiquadFilter();
        this.treble   = context.createBiquadFilter();
        this.presence = context.createBiquadFilter();

        // Set filter type
        this.bass.type     = (Object.prototype.toString.call(this.bass.type)     === '[object String]') ? 'lowshelf'  : (this.bass.LOWSHELF      || 3);
        this.middle.type   = (Object.prototype.toString.call(this.middle.type)   === '[object String]') ? 'peaking'   : (this.middle.PEAKING     || 5);
        this.treble.type   = (Object.prototype.toString.call(this.treble.type)   === '[object String]') ? 'peaking'   : (this.treble.PEAKING     || 5);
        this.presence.type = (Object.prototype.toString.call(this.presence.type) === '[object String]') ? 'highshelf' : (this.presence.HIGHSHELF || 4);

        // Set cutoff frequency
        this.bass.frequency.value     =  500;  // 500 Hz
        this.middle.frequency.value   = 1000;  // 1 kHz
        this.treble.frequency.value   = 2000;  // 2 kHz
        this.presence.frequency.value = 4000;  // 4 kHz

        // Set Q
        // this.bass.Q.value     = Math.SQRT1_2;  // Not used
        this.middle.Q.value   = Math.SQRT1_2;
        this.treble.Q.value   = Math.SQRT1_2;
        // this.presence.Q.value = Math.SQRT1_2;  // Not used

        // Set Gain
        this.bass.gain.value     = 0;
        this.middle.gain.value   = 0;
        this.treble.gain.value   = 0;
        this.presence.gain.value = 0;

        // Equalizer is not connected by default
        this.state(false);
    }

    /** @extends {Effector} */
    Equalizer.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Equalizer.prototype.constructor = Equalizer;

    /** @override */
    Equalizer.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'bass'    :
                case 'middle'  :
                case 'treble'  :
                case 'presence':
                    if (value === undefined) {
                        return this[k].gain.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this[k].gain.minValue || -40;
                        var max = this[k].gain.maxValue ||  40;

                        if ((v >= min) && (v <= max)) {
                            this[k].gain.value = v;
                        }
                    }

                    break
                default:
                    break;
            }
        }

        return this;
    };

    /** @override */
    Equalizer.prototype.connect = function() {
        // Clear connection
        this.input.disconnect(0);
        this.bass.disconnect(0);
        this.middle.disconnect(0);
        this.treble.disconnect(0);
        this.presence.disconnect(0);

        if (this.isActive) {
            // Effect ON

            // GainNode (Input) -> BiquadFilterNode (Bass) -> BiquadFilterNode (Middle) -> BiquadFilterNode (Treble) -> BiquadFilterNode (Presence) -> GainNode (Output)
            this.input.connect(this.bass);
            this.bass.connect(this.middle);
            this.middle.connect(this.treble);
            this.treble.connect(this.presence);
            this.presence.connect(this.output);
        } else {
            // Effect OFF

            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);
        }
    };

    /** @override */
    Equalizer.prototype.params = function() {
        var params = {
            'state'   : this.isActive,
            'bass'    : this.bass.gain.value,
            'middle'  : this.middle.gain.value,
            'treble'  : this.treble.gain.value,
            'presence': this.presence.gain.value
        };

        return params;
    };

    /** @override */
    Equalizer.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Equalizer.prototype.toString = function() {
        return '[SoundModule Equalizer]';
    };

    // Export
    global.Equalizer = Equalizer;
    global.equalizer = new Equalizer(audiocontext, 2048);

})(window);
