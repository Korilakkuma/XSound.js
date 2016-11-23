(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Phaser(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        this.numberOfStages = 12;  // The default number of All-Pass Filters
        this.filters        = new Array(Phaser.MAXIMUM_STAGES);

        for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
            this.filters[i]                 = context.createBiquadFilter();
            this.filters[i].type            = (Object.prototype.toString.call(this.filters[i].type) === '[object String]') ? 'allpass' : (this.filters[i].ALLPASS || 7);
            this.filters[i].frequency.value = 350;
            this.filters[i].Q.value         = 1;
            this.filters[i].gain.value      = 0;  // Not used
        }

        this.mix      = context.createGain();
        this.feedback = context.createGain();

        // Initialize parameters
        this.depth.gain.value    = 0;
        this.rate.value          = 0;
        this.mix.gain.value      = 0;
        this.feedback.gain.value = 0;
        this.depthRate           = 0;

        // Phaser is not connected by default
        this.state(false);

        // LFO
        // GainNode (LFO) -> GainNode (Depth) -> AudioParam (frequency)
        this.lfo.connect(this.depth);

        for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
            this.depth.connect(this.filters[i].frequency);
        }
    }

    /** @extends {Effector} */
    Phaser.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Phaser.prototype.constructor = Phaser;

    /**
     * Class (Static) property
     */
    Phaser.MAXIMUM_STAGES = 24;  // The maximum number of All-Pass Filters

    /** @override */
    Phaser.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'stage':
                    if (value === undefined) {
                        return this.numberOfStages;
                    } else {
                        var v = parseInt(value);

                        switch (v) {
                            case  0:
                            case  2:
                            case  4:
                            case  8:
                            case 12:
                            case 24:
                                this.numberOfStages = v;
                                this.connect();
                                break;
                            default:
                                break;
                        }
                    }

                    break;
                case 'frequency':
                case 'cutoff'   :
                    if (value === undefined) {
                        return this.filters[0].frequency.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.filters[0].frequency.minValue || 10;
                        var max = this.filters[0].frequency.maxValue || (this.context.sampleRate / 2);

                        if ((v >= min) && (v <= max)) {
                            for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
                                this.filters[i].frequency.value = v;
                            }

                            this.depth.gain.value = this.filters[0].frequency.value * this.depthRate;
                        }
                    }

                    break;
                case 'resonance':
                    if (value === undefined) {
                        return this.filters[0].Q.value;
                    } else {
                        var v   = parseFloat(value);
                        var min = this.filters[0].Q.minValue || 0.0001;
                        var max = this.filters[0].Q.maxValue || 1000;

                        if ((v >= min) && (v <= max)) {
                            for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
                                this.filters[0].Q.value = v;
                            }
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
                            this.depth.gain.value = this.filters[0].frequency.value * v;
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
                default:
                    break;
            }
        }

        return this;
    };

    /** @override */
    Phaser.prototype.connect = function() {
        // Clear connection
        this.input.disconnect(0);

        for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
            this.filters[i].disconnect(0);
        }

        this.mix.disconnect(0);
        this.feedback.disconnect(0);

        // GainNode (Input) -> GainNode (Output)
        this.input.connect(this.output);

        // Effect ON
        if (this.isActive && (this.numberOfStages > 0)) {
            // GainNode (Input) -> BiquadFilterNode (All-Pass Filter x N) -> GainNode (Mix) -> GainNode (Output)
            this.input.connect(this.filters[0]);

            for (var i = 0; i < this.numberOfStages; i++) {
                if (i < (this.numberOfStages - 1)) {
                    this.filters[i].connect(this.filters[i + 1]);
                } else {
                    this.filters[i].connect(this.mix);
                    this.mix.connect(this.output);

                    // Feedback
                    // GainNode (Input) -> BiquadFilterNode (All-Pass Filter x N) -> GainNode (Feedback) -> BiquadFilterNode (All-Pass Filter x N) ...
                    this.filters[i].connect(this.feedback);
                    this.feedback.connect(this.filters[0]);
                }
            }
        }
    };

    /** @override */
    Phaser.prototype.stop = function(stopTime, releaseTime) {
        Mocks.SoundModule.Effector.prototype.stop.call(this, stopTime, releaseTime);

        // Effector's state is active ?
        if (this.isActive) {
           // Connect nodes again
           this.lfo.connect(this.depth);

           for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
               this.depth.connect(this.filters[i].frequency);
           }
        }

        return this;
    };

    /** @override */
    Phaser.prototype.params = function() {
        var params = {
            'state'    : this.isActive,
            'stage'    : this.numberOfStages,
            'frequency': this.filters[0].frequency.value,
            'resonance': this.filters[0].Q.value,
            'depth'    : this.depthRate,
            'rate'     : this.rate.value,
            'mix'      : this.mix.gain.value,
            'feedback' : this.feedback.gain.value
        };

        return params;
    };

    /** @override */
    Phaser.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Phaser.prototype.toString = function() {
        return '[SoundModule Phaser]';
    };

    // Export
    global.Phaser = Phaser;
    global.phaser = new Phaser(audiocontext, 2048);

})(window);
