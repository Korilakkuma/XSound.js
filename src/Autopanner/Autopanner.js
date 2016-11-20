(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Autopanner(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        // this.panner = context.createStereoPanner();

        // Initialize parameters
        // this.panner.pan.value = 0;
        this.depth.gain.value = 0;
        this.rate.value       = 0;

        // Autopanner is not connected by default
        this.state(false);

        // LFO
        // OscillatorNode (LFO) -> GainNode (Depth) -> AudioParam (pan)
        // this.lfo.connect(this.depth);
        // this.depth.connect(this.panner.pan);
    };

    /** @extends {Effector} */
    Autopanner.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Autopanner.prototype.constructor = Autopanner;

    /** @override */
    Autopanner.prototype.param = function(key, value) {
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
    Autopanner.prototype.connect = function() {
        // Clear connection
        this.input.disconnect(0);
        this.panner.disconnect(0);

        if (this.isActive) {
            // Effect ON

            // GainNode (Input) -> StereoPannerNode -> GainNode (Output)
            this.input.connect(this.panner);
            this.panner.connect(this.output);
        } else {
            // Effect OFF

            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);
        }
    };

    /** @override */
    Autopanner.prototype.stop = function(stopTime, releaseTime) {
        Mocks.SoundModule.Effector.prototype.stop.call(this, stopTime, releaseTime);

        // Effector's state is active ?
        if (this.isActive) {
            // Connect nodes again
            this.lfo.connect(this.depth);
            this.depth.connect(this.panner.pan);
        }

        return this;
    };

    /** @override */
    Autopanner.prototype.params = function() {
        var params = {
            'state': this.isActive,
            'depth': this.depth.gain.value,
            'rate' : this.rate.value
        };

        return params;
    };

    /** @override */
    Autopanner.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Autopanner.prototype.toString = function() {
        return '[SoundModule Autopanner]';
    };

    // Export
    global.Autopanner = Autopanner;
    global.autopanner = new Autopanner(audiocontext, 2048);

})(window);
