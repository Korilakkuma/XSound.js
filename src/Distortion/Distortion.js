(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Distortion(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        this.distortion = context.createWaveShaper();
        this.drive      = context.createGain();
        this.color      = context.createBiquadFilter();
        this.tone       = context.createBiquadFilter();

        // Distortion type
        this.type = Distortion.CURVES.CLEAN;

        // for creating curve
        this.numberOfSamples = 4096;

        // Initialize parameters
        this.drive.gain.value      = 1;
        this.color.type            = (Object.prototype.toString.call(this.color.type) === '[object String]') ? 'bandpass' : (this.color.BANDPASS || 2);
        this.color.frequency.value = 350;
        this.color.Q.value         = Math.SQRT1_2;
        this.color.gain.value      = 0;  // Not used
        this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
        this.tone.frequency.value  = 350;
        this.tone.Q.value          = Math.SQRT1_2;
        this.tone.gain.value       = 0;  // Not used

        // Distortion is not connected by default
        this.state(false);
    }

    /** @extends {Effector} */
    Distortion.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Distortion.prototype.constructor = Distortion;

    /**
     * Class (Static) properties
     */
    Distortion.CURVES            = {};
    Distortion.CURVES.CLEAN      = 'clean';
    Distortion.CURVES.CRUNCH     = 'crunch';
    Distortion.CURVES.OVERDRIVE  = 'overdrive';
    Distortion.CURVES.DISTORTION = 'distortion';
    Distortion.CURVES.FUZZ       = 'fuzz';

    /**
     * This class (static) method creates the instance of Float32Array for distortion.
     * @param {number} amount This argument is the depth of distortion.
     * @param {number} numberOfSamples This argument is the size of Float32Array.
     * @return {Float32Array|null} This is "curve" property in WaveShaperNode.
     */
    Distortion.createCurve = function(amount, numberOfSamples) {
        if ((amount > 0) && (amount < 1)) {
            var curves = new Float32Array(numberOfSamples);

            var k = (2 * amount) / (1 - amount);

            for (var i = 0; i < numberOfSamples; i++) {
                // LINEAR INTERPOLATION: x := (c - a) * (z - y) / (b - a) + y
                // a = 0, b = 2048, z = 1, y = -1, c = i
                var x = (((i - 0) * (1 - (-1))) / (numberOfSamples - 0)) + (-1);
                curves[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
            }

            return curves;
        } else {
            return null;  // Clean sound (default value)
        }
    };

    /** @override */
    Distortion.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else  {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'curve':
                    if (value === undefined) {
                        return this.distortion.curve;
                    } else {
                        var AMOUNTS = {
                            'CLEAN'     : 0.0,
                            'CRUNCH'    : 0.5,
                            'OVERDRIVE' : 0.7,
                            'DISTORTION': 0.8,
                            'FUZZ'      : 0.9
                        };

                        var curve = null;

                        switch (String(value).toLowerCase()) {
                            case Distortion.CURVES.CLEAN:
                                this.type = Distortion.CURVES.CLEAN;
                                curve = Distortion.createCurve(AMOUNTS.CLEAN, this.numberOfSamples);
                                break;
                            case Distortion.CURVES.CRUNCH:
                                this.type = Distortion.CURVES.CRUNCH;
                                curve = Distortion.createCurve(AMOUNTS.CRUNCH, this.numberOfSamples);
                                break;
                            case Distortion.CURVES.OVERDRIVE:
                                this.type = Distortion.CURVES.OVERDRIVE;
                                curve = Distortion.createCurve(AMOUNTS.OVERDRIVE, this.numberOfSamples);
                                break;
                            case Distortion.CURVES.DISTORTION:
                                this.type = Distortion.CURVES.DISTORTION;
                                curve = Distortion.createCurve(AMOUNTS.DISTORTION, this.numberOfSamples);
                                break;
                            case Distortion.CURVES.FUZZ:
                                this.type = Distortion.CURVES.FUZZ;
                                curve = Distortion.createCurve(AMOUNTS.FUZZ, this.numberOfSamples);
                                break;
                            default:
                                if (value instanceof Float32Array) {
                                    curve = value;
                                }

                                break;
                        }

                        this.distortion.curve = curve;
                    }

                    break;
                case 'samples':
                    if (value === undefined) {
                        return this.numberOfSamples;
                    } else {
                        var v = parseInt(value);

                        if (v >= 0) {
                            this.numberOfSamples = v;
                            this.param('curve', this.type);
                        }
                    }

                    break;
                case 'drive':
                    if (value === undefined) {
                        return this.drive.gain.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.drive.gain.minValue || 0;
                        var max = this.drive.gain.maxValue || 1;

                        if ((v >= min) && (v <= max)) {
                            this.drive.gain.value = v;
                        }
                    }

                    break;
                case 'color':
                case 'tone' :
                    if (value === undefined) {
                        return this[k].frequency.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this[k].frequency.minValue || 10;
                        var max = this[k].frequency.maxValue || (this.context.sampleRate / 2);

                        if ((v >= min) && (v <= max)) {
                            this[k].frequency.value = v;
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
    Distortion.prototype.connect = function() {
        // Clear connection
        this.input.disconnect(0);
        this.distortion.disconnect(0);
        this.drive.disconnect(0);
        this.color.disconnect(0);
        this.tone.disconnect(0);

        if (this.isActive) {
            // Effect ON

            // GainNode (Input) -> BiquadFilterNode (Color) -> WaveShaperNode (Distortion) -> GainNode (Drive) -> BiquadFilterNode (Tone) -> GainNode (Output)
            this.input.connect(this.color);
            this.color.connect(this.distortion);
            this.distortion.connect(this.drive);
            this.drive.connect(this.tone);
            this.tone.connect(this.output);
        } else {
            // Effect OFF

            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);
        }
    };

    /** @override */
    Distortion.prototype.params = function() {
        var params = {
            'state'  : this.isActive,
            'curve'  : this.type,
            'samples': this.numberOfSamples,
            'drive'  : this.drive.gain.value,
            'color'  : this.color.frequency.value,
            'tone'   : this.tone.frequency.value
        };

        return params;
    };

    /** @ovreride */
    Distortion.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Distortion.prototype.toString = function() {
        return '[SoundModule Distortion]';
    };

    // Export
    global.Distortion = Distortion;
    global.distortion = new Distortion(audiocontext, 2048);

})(window);
