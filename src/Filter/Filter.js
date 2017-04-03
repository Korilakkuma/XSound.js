(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Filter(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        this.filter = context.createBiquadFilter();

        // for legacy browsers
        this.filter.frequency.setTargetAtTime = this.filter.frequency.setTargetAtTime || this.filter.frequency.setTargetValueAtTime;

        // Initialize parameters
        this.filter.type            = (Object.prototype.toString.call(this.filter.type) === '[object String]') ? 'lowpass' : (this.filter.LOWPASS || 0);
        this.filter.frequency.value = 350;
        this.filter.Q.value         = 1;
        this.filter.gain.value      = 0;

        this.maxFrequency = this.filter.frequency.value;
        this.range        = 0.1;  // 10% -> between this.maxFrequency * 0.1 and this.maxFrequency

        this.attack  = 0.01;
        this.decay   = 0.3;
        this.sustain = 1.0;
        this.release = 1.0;

        // Filter is not connected by default
        this.state(false);
    }

    /** @extends {Effector} */
    Filter.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Filter.prototype.constructor = Filter;

    /** @override */
    Filter.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'type':
                    if (value === undefined) {
                        return this.filter.type;
                    } else {
                        var v = String(value).toLowerCase();

                        // for legacy browsers
                        var FILTER_TYPES = {
                            'lowpass'  : this.filter.LOWPASS   || 0,
                            'highpass' : this.filter.HIGHPASS  || 1,
                            'bandpass' : this.filter.BANDPASS  || 2,
                            'lowshelf' : this.filter.LOWSHELF  || 3,
                            'highshelf': this.filter.HIGHSHELF || 4,
                            'peaking'  : this.filter.PEAKING   || 5,
                            'notch'    : this.filter.NOTCH     || 6,
                            'allpass'  : this.filter.ALLPASS   || 7
                        };

                        if (v in FILTER_TYPES) {
                            this.filter.type = (Object.prototype.toString.call(this.filter.type) === '[object String]') ? v : FILTER_TYPES[v];
                        }
                    }

                    break;
                case 'frequency':
                case 'cutoff'   :
                    if (value === undefined) {
                        return this.filter.frequency.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.filter.frequency.minValue || 10;
                        var max = this.filter.frequency.maxValue || (this.context.sampleRate / 2);

                        if ((v >= min) && (v <= max)) {
                            this.maxFrequency           = v;
                            this.filter.frequency.value = v;
                        }
                    }

                    break;
                case 'gain':
                    if (value === undefined) {
                        return this.filter.gain.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.filter.gain.minValue || -40;
                        var max = this.filter.gain.maxValue ||  40;

                        if ((v >= min) && (v <= max)) {
                            this.filter.gain.value = v;
                        }
                    }

                    break;
                case 'q':
                    if (value === undefined) {
                        return this.filter.Q.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.filter.Q.minValue || 0.0001;
                        var max = this.filter.Q.maxValue || 1000;

                        if ((v >= min) && (v <= max)) {
                            this.filter.Q.value = v;
                        }
                    }

                    break;
                case 'range':
                    if (value === undefined) {
                        return this.range;
                    } else {
                        var v   = parseFloat(value);
                        var min = 0;
                        var max = 1;

                        if ((v >= min) && (v <= max)) {
                            this.range= v;
                        }
                    }

                    break;
                case 'attack' :
                case 'sustain':
                    if (value === undefined) {
                        return this[k];
                    } else {
                        var v = parseFloat(value);

                        if (v >= 0) {
                            this[k] = v;
                        }
                    }

                    break;
                case 'decay'  :
                case 'release':
                    if (value === undefined) {
                        return this[k];
                    } else {
                        var v = parseFloat(value);

                        if (v > 0) {
                            this[k] = v;
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
    Filter.prototype.connect = function() {
        // Clear connection
        this.input.disconnect(0);
        this.filter.disconnect(0);

        if (this.isActive) {
            // Effector ON

            // GainNode (Input) -> BiquadFilterNode -> GainNode (Output)
            this.input.connect(this.filter);
            this.filter.connect(this.output);
        } else {
            // Effector OFF

            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);
        }
    };

    /** @override */
    Filter.prototype.start = function(startTime) {
        if (this.isActive) {
            var s = parseFloat(startTime);

            if (isNaN(s) || (s < this.context.currentTime)) {
                s = this.context.currentTime;
            }

            var t0      = s;
            var t1      = t0 + this.attack;
            var t2      = this.decay;
            var t2Value = this.sustain * this.maxFrequency;

            var minFrequnecy = this.maxFrequency * this.range;

            // Envelope Generator for filter
            this.filter.frequency.cancelScheduledValues(t0);
            this.filter.frequency.setValueAtTime(minFrequnecy, t0);
            this.filter.frequency.linearRampToValueAtTime(this.maxFrequency, t1);  // Attack
            this.filter.frequency.setTargetAtTime(t2Value, t1, t2);  // Decay -> Sustain
        }

        return this;
    };

    /** @override */
    Filter.prototype.stop = function(stopTime) {
        if (this.isActive) {
            var s = parseFloat(stopTime) - this.release;

           if (isNaN(s) || (s < this.context.currentTime)) {
               s = this.context.currentTime;
           }

            var t3 = s;
            var t4 = this.release;

            var minFrequnecy = this.maxFrequency * this.range;

            // Envelope Generator for filter
            this.filter.frequency.cancelScheduledValues(t3);
            this.filter.frequency.setValueAtTime(this.filter.frequency.value, t3);
            this.filter.frequency.setTargetAtTime(minFrequnecy, t3, t4);  // Sustain -> Release
        }

        return this;
    };

    /** @override */
    Filter.prototype.state = function(state) {
        if (state === undefined) {
            return this.isActive;
        } else if (String(state).toLowerCase() === 'toggle') {
            this.isActive = !this.isActive;
        } else {
            this.isActive = Boolean(state);
        }

        // Change connection
        this.connect();

        return this;
    };

    /** @override */
    Filter.prototype.params = function() {
        var params = {
            'state'    : this.isActive,
            'type'     : this.filter.type,
            'frequency': this.filter.frequency.value,
            'Q'        : this.filter.Q.value,
            'gain'     : this.filter.gain.value,
            'range'    : this.range,
            'attack'   : this.attack,
            'decay'    : this.decay,
            'sustain'  : this.sustain,
            'release'  : this.release
        };

        return params;
    };

    /** @override */
    Filter.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Filter.prototype.toString = function() {
        return '[SoundModule Filter]';
    };

    // Export
    global.Filter = Filter;
    global.filter = new Filter(audiocontext, 2048);

})(window);
