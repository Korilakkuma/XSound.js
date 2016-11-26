(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Delay(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        this.delay    = context.createDelay(Delay.MAX_DELAY_TIME);
        this.dry      = context.createGain();
        this.wet      = context.createGain();
        this.tone     = context.createBiquadFilter();
        this.feedback = context.createGain();

        // Initialize parameters
        this.delay.delayTime.value = 0;
        this.dry.gain.value        = 1;
        this.wet.gain.value        = 0;
        this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
        this.tone.frequency.value  = 350;
        this.tone.Q.value          = Math.SQRT1_2;
        this.tone.gain.value       = 0;  // Not used
        this.feedback.gain.value   = 0;

        // Delay is not connected by default
        this.state(false);
    };

    /** @extends {Effector} */
    Delay.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Delay.prototype.constructor = Delay;

    /**
     * Class (Static) property
     */
    Delay.MAX_DELAY_TIME = 5;  // Max delay time is 5000 [ms]

    /** @override */
    Delay.prototype.param = function(key, value) {
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
                        var max = this.delay.delayTime.maxValue || Delay.MAX_DELAY_TIME;

                        if ((v >= min) && (v <= max)) {
                            this.delay.delayTime.value = v;
                        }
                    }

                    break;
                case 'dry'     :
                case 'wet'     :
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
    Delay.prototype.connect = function() {
        // Clear connection
        this.input.disconnect(0);
        this.delay.disconnect(0);
        this.dry.disconnect(0);
        this.wet.disconnect(0);
        this.tone.disconnect(0);
        this.feedback.disconnect(0);

        if (this.isActive) {
            // Effect ON

            // GainNode (Input) -> GainNode (Dry) -> GainNode (Output)
            this.input.connect(this.dry);
            this.dry.connect(this.output);

            // GainNode (Input) -> BiquadFilterNode (Tone) -> DelayNode -> GainNode (Wet) -> GainNode (Output)
            this.input.connect(this.tone);
            this.tone.connect(this.delay);
            this.delay.connect(this.wet);
            this.wet.connect(this.output);

            // Feedback
            // GainNode (Input) -> DelayNode -> GainNode (Feedback) -> DelayNode ...
            this.delay.connect(this.feedback);
            this.feedback.connect(this.delay);
        } else {
            // Effect OFF

            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);
        }
    };

    /** @override */
    Delay.prototype.params = function() {
        var params = {
            'state'   : this.isActive,
            'time'    : this.delay.delayTime.value,
            'dry'     : this.dry.gain.value,
            'wet'     : this.wet.gain.value,
            'tone'    : this.tone.frequency.value,
            'feedback': this.feedback.gain.value
        };

        return params;
    };

    /** @override */
    Delay.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Delay.prototype.toString = function() {
        return '[SoundModule Delay]';
    };

    // Export
    global.Delay = Delay;
    global.delay = new Delay(audiocontext, 2048);

})(window);
