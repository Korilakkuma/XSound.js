(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Chorus(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        this.delay    = context.createDelay();
        this.mix      = context.createGain();
        this.tone     = context.createBiquadFilter();
        this.feedback = context.createGain();

        // Initialize parameters
        this.delay.delayTime.value = 0;
        this.depth.gain.value      = 0;
        this.rate.value            = 0;
        this.mix.gain.value        = 0;
        this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
        this.tone.frequency.value  = 350;
        this.tone.Q.value          = Math.SQRT1_2;
        this.tone.gain.value       = 0;  // Not used
        this.feedback.gain.value   = 0;
        this.depthRate             = 0;

        // Chorus is not connected by default
        this.state(false);

        // LFO
        // OscillatorNode (LFO) -> GainNode (Depth) -> AudioParam (elayTime)
        this.lfo.connect(this.depth);
        this.depth.connect(this.delay.delayTime);
    }

    /** @extends {Effector} */
    Chorus.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Chorus.prototype.constructor = Chorus;

    /** @override */
    Chorus.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'delaytime':
                case 'time'     :
                    if (value === undefined) {
                        return this.delay.delayTime.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.delay.delayTime.minValue || 0;
                        var max = this.delay.delayTime.maxValue || 1;

                        if ((v >= min) && (v <= max)) {
                            this.delay.delayTime.value = v;
                            this.depth.gain.value      = this.delay.delayTime.value * this.depthRate;
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
                            this.depth.gain.value = this.delay.delayTime.value * v;
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
                case 'mix'     :
                case 'feedback':
                    if (value === undefined) {
                        return this[k].gain.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this[k].gain.minValue || 0;
                        var max = this[k].gain.maxValue || 1;

                        if ((v >= min) && (v <= max)) {
                            this[k].gain.value = v;
                        }
                    }

                    break;
                case 'tone':
                    if (value === undefined) {
                        return this.tone.frequency.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.tone.frequency.minValue || 10;
                        var max = this.tone.frequency.maxValue || (this.context.sampleRate / 2);

                        if ((v >= min) && (v <= max)) {
                            this.tone.frequency.value = v;
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
    Chorus.prototype.connect = function() {
        // Clear connection
        this.input.disconnect(0);
        this.delay.disconnect(0);
        this.mix.disconnect(0);
        this.tone.disconnect(0);
        this.feedback.disconnect(0);

        // GainNode (Input) -> GainNode (Output)
        this.input.connect(this.output);

        // Effect ON
        if (this.isActive) {
            // GainNode (Input) -> BiquadFilterNode (Tone) -> DelayNode -> GainNode (Mix) -> GainNode (Output)
            this.input.connect(this.tone);
            this.tone.connect(this.delay);
            this.delay.connect(this.mix);
            this.mix.connect(this.output);

            // Feedback
            // GainNode (Input) -> DelayNode -> GainNode (Feedback) -> DelayNode ...
            this.delay.connect(this.feedback);
            this.feedback.connect(this.delay);
        }
    };

    /** @override */
    Chorus.prototype.stop = function(stopTime, releaseTime) {
        Mocks.SoundModule.Effector.prototype.stop.call(this, stopTime, releaseTime);

        // Effector's state is active ?
        if (this.isActive) {
            // Connect nodes again
            this.lfo.connect(this.depth);
            this.depth.connect(this.delay.delayTime);
        }

        return this;
    };

    /** @override */
    Chorus.prototype.params = function() {
        var params = {
            'state'   : this.isActive,
            'time'    : this.delay.delayTime.value,
            'depth'   : this.depthRate,
            'rate'    : this.rate.value,
            'mix'     : this.mix.gain.value,
            'tone'    : this.tone.frequency.value,
            'feedback': this.feedback.gain.value
        };

        return params;
    };

    /** @override */
    Chorus.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Chorus.prototype.toString = function() {
        return '[SoundModule Chorus]';
    };

    // Export
    global.Chorus = Chorus;
    global.chorus = new Chorus(audiocontext, 2048);

})(window);
