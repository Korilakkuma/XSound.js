(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Ringmodulator(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        this.amplitude = context.createGain();

        this.amplitude.gain.value = 0;  // 0 +- depth

        // Initialize parameter
        this.depth.gain.value = 1;
        this.rate.value       = 0;

        // Ring Modulator is not connected by default
        this.state(false);

        // LFO
        // OscillatorNode (LFO) -> GainNode (Depth) -> AudioParam (gain)
        this.lfo.connect(this.depth);
        this.depth.connect(this.amplitude.gain);
    }

    /** @extends {Effector} */
    Ringmodulator.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Ringmodulator.prototype.constructor = Ringmodulator;

    /** @override */
    Ringmodulator.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'depth':
                    if (value === undefined) {
                        return this.depth.gain.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.depth.gain.minValue || 0;
                        var max = this.depth.gain.maxValue || 1;

                        if ((v >= min) && (v <= max)) {
                            this.depth.gain.value = v;
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
                default:
                    break;
            }
        }

        return this;
    };

    /** @override */
    Ringmodulator.prototype.connect = function() {
        // Clear connection
        this.input.disconnect(0);
        this.amplitude.disconnect(0);

        if (this.isActive) {
            // Effect ON

            // GainNode (Input) -> GainNode -> GainNode (Output)
            this.input.connect(this.amplitude);
            this.amplitude.connect(this.output);
        } else {
            // Effect OFF

            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);
        }
    };

    /** @override */
    Ringmodulator.prototype.stop = function(stopTime, releaseTime) {
        Mocks.SoundModule.Effector.prototype.stop.call(this, stopTime, releaseTime);

        // Effector's state is active ?
        if (this.isActive) {
            // Connect nodes again
            this.lfo.connect(this.depth);
            this.depth.connect(this.amplitude.gain);
        }

        return this;
    };

    /** @override */
    Ringmodulator.prototype.params = function() {
        var params = {
            'state': this.isActive,
            'depth': this.depth.gain.value,
            'rate' : this.rate.value
        };

        return params;
    };

    /** @override */
    Ringmodulator.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Ringmodulator.prototype.toString = function() {
        return '[SoundModule Ringmodulator]';
    };

    // Export
    global.Ringmodulator = Ringmodulator;
    global.ringmodulator = new Ringmodulator(audiocontext, 2048);

})(window);
