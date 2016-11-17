(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Wah(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        this.lowpass = context.createBiquadFilter();

        // Initialize parameters
        this.lowpass.type            = (Object.prototype.toString.call(this.lowpass.type) === '[object String]') ? 'lowpass' : (this.lowpass.LOWPASS || 0);
        this.lowpass.frequency.value = 350;
        this.lowpass.Q.value         = 1;
        this.lowpass.gain.value      = 0;    // Not used

        this.depth.gain.value  = 0;
        this.rate.value        = 0;
        this.depthRate         = 0;

        // Wah is not connected by default
        this.state(false);

        // LFO
        // OscillatorNode (LFO) -> GainNode (Depth) -> AudioParam (frequency)
        this.lfo.connect(this.depth);
        this.depth.connect(this.lowpass.frequency);
    };

    /** @extends {Effector} */
    Wah.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Wah.prototype.constructor = Wah;

    /** @override */
    Wah.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'frequency':
                case 'cutoff'   :
                    if (value === undefined) {
                        return this.lowpass.frequency.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.lowpass.frequency.minValue || 10;
                        var max = this.lowpass.frequency.maxValue || (this.context.sampleRate / 2);

                        if ((v >= min) && (v <= max)) {
                            this.lowpass.frequency.value = v;
                            this.depth.gain.value        = this.lowpass.frequency.value * this.depthRate;
                        }
                    }

                    break;
                case 'depth':
                    if (value === undefined) {
                        return this.depthRate;
                    } else {
                        var v   = parseFloat(value);
                        var min = 0;
                        var max = 1;

                        if ((v >= min) && (v <= max)) {
                            this.depth.gain.value = this.lowpass.frequency.value * v;
                            this.depthRate        = v;
                        }
                    }

                    break;
                case 'rate':
                    if (value === undefined) {
                        return this.rate.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.rate.minValue || 0;
                        var max = this.rate.maxValue || 100000;

                        if ((v >= min) && (v <= max)) {
                            this.rate.value = v;
                        }
                    }

                    break;
                case 'resonance':
                    if (value === undefined) {
                        return this.lowpass.Q.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.lowpass.Q.minValue || 0.0001;
                        var max = this.lowpass.Q.maxValue || 1000;

                        if ((v >= min) && (v <= max)) {
                            this.lowpass.Q.value = v;
                        }
                    }

                    break;
                default:
                    break;
            }
        }

        return this;
    };

    /** @override */
    Wah.prototype.stop = function(stopTime, releaseTime) {
        Mocks.SoundModule.Effector.prototype.stop.call(this, stopTime, releaseTime);

        // Effector's state is active ?
        if (this.isActive) {
            // Connect nodes again
            this.lfo.connect(this.depth);
            this.depth.connect(this.lowpass.frequency);
        }

        return this;
    };

    /** @override */
    Wah.prototype.connect = function() {
        // Clear connection
        this.input.disconnect(0);
        this.lowpass.disconnect(0);

        if (this.isActive) {
            // Effect ON

            // GainNode (Input) -> BiquadFilterNode (Low-Pass Filter) -> GainNode (Output)
            this.input.connect(this.lowpass);
            this.lowpass.connect(this.output);
        } else {
            // Effect OFF

            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);
        }
    };

    /** @override */
    Wah.prototype.params = function() {
        var params = {
            'state'    : this.isActive,
            'cutoff'   : this.lowpass.frequency.value,
            'depth'    : this.depthRate,
            'rate'     : this.rate.value,
            'resonance': this.lowpass.Q.value
        };

        return params;
    };

    /** @override */
    Wah.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Wah.prototype.toString = function() {
        return '[SoundModule Wah]';
    };

    // Export
    global.Wah = Wah;
    global.wah = new Wah(audiocontext, 2048);

})(window);
