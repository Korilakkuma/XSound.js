(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Tremolo(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        this.amplitude = context.createGain();

        this.amplitude.gain.value = 1;  // 1 +- depth

        // Initialize parameter
        this.depth.gain.value = 0;
        this.rate.value       = 0;

        // Tremolo is not connected by default
        this.state(false);

        // LFO
        // OscillatorNode (LFO) -> GainNode (Depth) -> AudioParam (gain)
        this.lfo.connect(this.depth);
        this.depth.connect(this.amplitude.gain);
    }

    /** @extends {Effector} */
    Tremolo.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Tremolo.prototype.constructor = Tremolo;

    /** @override */
    Tremolo.prototype.param = function(key, value) {
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
                case 'wave':
                    if (value === undefined) {
                        return this.lfo.type;
                    } else {
                        var v = String(value).toLowerCase();

                        // for legacy browsers
                        var WAVE_TYPE = {
                            'sine'    : this.lfo.SINE     || 0,
                            'square'  : this.lfo.SQUARE   || 1,
                            'sawtooth': this.lfo.SAWTOOTH || 2,
                            'triangle': this.lfo.TRIANGLE || 3
                        };

                        if (v in WAVE_TYPE) {
                            this.lfo.type = (Object.prototype.toString.call(this.lfo.type) === '[object String]') ? v : WAVE_TYPE[v];
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
    Tremolo.prototype.connect = function() {
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
    Tremolo.prototype.stop = function(stopTime, releaseTime) {
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
    Tremolo.prototype.params = function() {
        var params = {
            'state': this.isActive,
            'depth': this.depth.gain.value,
            'rate' : this.rate.value,
            'wave' : this.lfo.type
        };

        return params;
    };

    /** @override */
    Tremolo.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Tremolo.prototype.toString = function() {
        return '[SoundModule Tremolo]';
    };

    // Export
    global.Tremolo = Tremolo;
    global.tremolo = new Tremolo(audiocontext, 2048);

})(window);
