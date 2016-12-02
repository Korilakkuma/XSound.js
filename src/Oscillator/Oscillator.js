(function(global) {
    'use strict';

    /**
     * This private class defines properties for the instance of OscillatorNode.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {boolean} state This argument is initial state.
     * @constructor
     * @implements {Statable}
     */
    function Oscillator(context, state) {
        // Call interface constructor
        Mocks.Statable.call(this);

        this.isActive = state;

        this.context = context;

        this.source = context.createOscillator();

        // for legacy browsers
        this.source.setPeriodicWave = this.source.setPeriodicWave || this.source.setWaveTable;
        this.source.start           = this.source.start           || this.source.noteOn;
        this.source.stop            = this.source.stop            || this.source.noteOff;

        this.volume = context.createGain();

        // in order to not call in duplicate "start" or "stop"  method in the instance of OscillatorNode
        this.isStop = true;

        this.octave  = 0;
        this.fine    = 0;
        this.customs = {
            'real': new Float32Array([0, 1]),
            'imag': new Float32Array([0, 1])
        };
    };

    /** @implements {Statable} */
    Oscillator.prototype = Object.create(Mocks.Statable.prototype);
    Oscillator.prototype.constructor = Oscillator;

    /**
     * This method is getter or setter for parameters.
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number|string} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|string|Oscillator} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     */
    Oscillator.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            var OCTAVE = 1200;  // 1 Octave = 1200 cent

            switch (k) {
                case 'type':
                    if (value === undefined) {
                        return this.source.type;
                    } else {
                        if (Object.prototype.toString.call(value) !== '[object Object]') {
                            var v = String(value).toLowerCase();

                            // for legacy browsers
                            var WAVE_TYPE = {
                                'sine'    : this.source.SINE     || 0,
                                'square'  : this.source.SQUARE   || 1,
                                'sawtooth': this.source.SAWTOOTH || 2,
                                'triangle': this.source.TRIANGLE || 3
                            };

                            if (v in WAVE_TYPE) {
                                this.source.type = (Object.prototype.toString.call(this.source.type) === '[object String]') ? v : WAVE_TYPE[v];
                            }
                        } else {
                            // Custom wave
                            if (('real' in value) && ('imag' in value)) {
                                var reals = null;
                                var imags = null;

                                if (value.real instanceof Float32Array) {
                                    reals = value.real;
                                } else if (Array.isArray(value.real)) {
                                    reals = new Float32Array(value.real);
                                }

                                if (value.imag instanceof Float32Array) {
                                    imags = value.imag;
                                } else if (Array.isArray(value.imag)) {
                                    imags = new Float32Array(value.imag);
                                }

                                if ((reals instanceof Float32Array) && (imags instanceof Float32Array)) {
                                    var MAX_SIZE = 4096;  // This size is defined by specification

                                    if (reals.length > MAX_SIZE) {reals = reals.subarray(0, MAX_SIZE);}
                                    if (imags.length > MAX_SIZE) {imags = imags.subarray(0, MAX_SIZE);}

                                    // The 1st value is fixed by 0 (This is is defined by specification)
                                    if (reals[0] !== 0) {reals[0] = 0;}
                                    if (imags[0] !== 0) {imags[0] = 0;}

                                    var periodicWave = this.context.createPeriodicWave(reals, imags);

                                    this.source.setPeriodicWave(periodicWave);
                                    this.customs.real = reals;
                                    this.customs.imag = imags;
                                }
                            }
                        }
                    }

                    break;
                case 'octave':
                    if (value === undefined) {
                        return this.octave;
                    } else {
                        var v   = parseFloat(value);
                        var min = (this.source.detune.minValue || -4800) / OCTAVE;
                        var max = (this.source.detune.maxValue ||  4800) / OCTAVE;

                        if ((v >= min) && (v <= max)) {
                            this.octave = v;
                            this.source.detune.value = this.fine + (v * OCTAVE);
                        }
                    }

                    break;
                case 'fine':
                    if (value === undefined) {
                        return this.fine;
                    } else {
                        var v   = parseFloat(value);
                        var min = -OCTAVE;
                        var max =  OCTAVE;

                        if ((v >= min) && (v <= max)) {
                            this.fine = v;
                            this.source.detune.value = v + (this.octave * OCTAVE);
                        }
                    }

                    break;
                case 'volume':
                case 'gain'  :
                    if (value === undefined) {
                        return this.volume.gain.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.volume.gain.minValue || 0;
                        var max = this.volume.gain.maxValue || 1;

                        if ((v >= min) && (v <= max)) {
                            this.volume.gain.value = v;
                        }
                    }

                    break;
                default:
                    break;
            }
        }

        return this;
    };

    /**
     * This method connects nodes.
     * @param {AudioNode} output This argument is the instance of AudioNode as output.
     * @return {Oscillator} This is returned for method chain.
     */
    Oscillator.prototype.ready = function(output) {
        if (this.isActive) {
            // for saving value
            var params = {
                'type'     : this.source.type,
                'frequency': this.source.frequency.value,
                'detune'   : this.source.detune.value
            };

            if (!this.isStop) {
                this.source.stop(this.context.currentTime);
                this.source.disconnect(0);
            }

            this.source = this.context.createOscillator();

            // for legacy browsers
            this.source.setPeriodicWave = this.source.setPeriodicWave || this.source.setWaveTable;
            this.source.start           = this.source.start           || this.source.noteOn;
            this.source.stop            = this.source.stop            || this.source.noteOff;

            if (params.type === 'custom') {
                // Custom wave
                var reals        = this.customs.real;
                var imags        = this.customs.imag;
                var periodicWave = this.context.createPeriodicWave(reals, imags);

                this.source.setPeriodicWave(periodicWave);
            } else {
                this.source.type = params.type;
            }

            this.source.frequency.value = params.frequency;
            this.source.detune.value    = params.detune;

            this.volume.connect(output);
        }

        return this;
    };

    /**
     * This method starts sound.
     * @param {number} startTime This argument is the start time.
     * @return {Oscillator} This is returned for method chain.
     */
    Oscillator.prototype.start = function(startTime) {
        if (this.isActive) {
            this.source.start(startTime);
            this.isStop = false;
        } else {
            if (!this.isStop) {
                this.source.stop(this.context.currentTime);
                this.isStop = true;
            }

            this.source.disconnect(0);
        }

        return this;
    };

    /**
     * This method stops sound.
     * @param {number} stopTime This argument is the stop time.
     * @return {Oscillator} This is returned for method chain.
     */
    Oscillator.prototype.stop = function(stopTime) {
        if (!this.isStop) {
            this.source.stop(stopTime);
            this.source.disconnect(0);

            this.isStop = true;
        }

        return this;
    };

    /** @override */
    Oscillator.prototype.state = function(state) {
        if (state === undefined) {
            return this.isActive;
        } else if (String(state).toLowerCase() === 'toggle') {
            this.isActive = !this.isActive;
        } else {
            this.isActive = Boolean(state);
        }

        return this;
    };

    /**
     * This method gets the instance of OscillatorNode.
     * @return {OscillatorNode}
     */
    Oscillator.prototype.get = function() {
        return this.source;
    };

    /** @override */
    Oscillator.prototype.toString = function() {
        return '[OscillatorModule Oscillator]';
    };

    // Export
    global.Oscillator = Oscillator;
    global.oscillator = new Oscillator(audiocontext, true);

})(window);
