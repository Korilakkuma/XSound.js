(function(global) {
    'use strict';

    /**
     * This private class defines properties for Envelope Generator.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     */
    function EnvelopeGenerator(context) {
        this.context = context;

        /** @type {Array.<GainNode>} */
        this.generators = [];

        // for GainNode
        this.activeIndexes = [];
        this.activeCounter = 0;

        this.attack  = 0.01;
        this.decay   = 0.3;
        this.sustain = 0.5;
        this.release = 1.0;
    }

    /**
     * Class (Static) property
     */
    EnvelopeGenerator.MIN_GAIN = 1e-3;

    /**
     * This method is getter or setter for parameters.
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|EnvelopeGenerator} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     */
    EnvelopeGenerator.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
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

    /**
     * This method connects the instance of AudioNode.
     * @param {number} index This argument is in order to select the instance of GainNode that is Envelope Generator.
     * @param {AudioNode} input This argument is the instance of AudioNode as input.
     * @param {AudioNode} output This argument is the instance of AudioNode as output.
     * @return {EnvelopeGenerator} This is returned for method chain.
     */
    EnvelopeGenerator.prototype.ready = function(index, input, output) {
        var i = (parseInt(index) >= 0) ? parseInt(index) : 0;

        input.connect(this.generators[i]);
        this.generators[i].connect(output);

        this.activeIndexes[i] = i;
        this.activeCounter++;

        return this;
    };

    /**
     * This method changes gain (Attack -> Decay -> Sustain).
     * @param {number} startTime This argument is the start time of Attack.
     * @return {EnvelopeGenerator} This is returned for method chain.
     */
    EnvelopeGenerator.prototype.start = function(startTime) {
        var s = parseFloat(startTime);

        if (isNaN(s) || (s < this.context.currentTime)) {
            s = this.context.currentTime;
        }

        // Attack -> Decay -> Sustain
        var t0      = s;
        var t1      = t0 + this.attack;
        var t2      = this.decay;
        var t2Value = this.sustain;

        for (var i = 0, len = this.activeIndexes.length; i < len; i++) {
            var activeIndex = this.activeIndexes[i];

            if (activeIndex === undefined) {
                continue;
            }

            // Start from gain.value = 0
            this.generators[activeIndex].gain.cancelScheduledValues(t0);
            this.generators[activeIndex].gain.setValueAtTime(0, t0);

            // Attack : gain.value increases linearly until assigned time (t1)
            this.generators[activeIndex].gain.linearRampToValueAtTime(1, t1);

            // Decay -> Sustain : gain.value gradually decreases to value of sustain during of Decay time (t2) from assigned time (t1)
            this.generators[activeIndex].gain.setTargetAtTime(t2Value, t1, t2);
        }

        return this;
    };

    /**
     * This method changes gain (Attack or Decay or Sustain -> Release).
     * @param {number} stopTime This argument is the start time of Release.
     * @return {EnvelopeGenerator} This is returned for method chain.
     */
    EnvelopeGenerator.prototype.stop = function(stopTime) {
        var s = parseFloat(stopTime) - this.release;

        if (isNaN(s) || (s < this.context.currentTime)) {
            s = this.context.currentTime;
        }

        // Sustain -> Release
        var t3 = s;
        var t4 = this.release;

        for (var i = 0, len = this.activeIndexes.length; i < len; i++) {
            var activeIndex = this.activeIndexes[i];

            if (activeIndex === undefined) {
                continue;
            }

            // in the case of mouseup on the way of Decay
            this.generators[activeIndex].gain.cancelScheduledValues(t3);
            this.generators[activeIndex].gain.setValueAtTime(this.generators[activeIndex].gain.value, t3);

            // Release : gain.value gradually decreases to 0 during of Release time (t4) from assigned time (t3)
            this.generators[activeIndex].gain.setTargetAtTime(0, t3, t4);
        }

        return this;
    };

    /**
     * This method gets the instance of GainNode for Envelope Generator.
     * @param {number} index This argument is the index of array that contains the instance of GainNode for Envelope Generator.
     * @return {GainNode} This is returned as the instance of GainNode for Envelope Generator.
     */
    EnvelopeGenerator.prototype.getGenerator = function(index) {
        var i = (parseInt(index) >= 0) ? parseInt(index) : 0;

        return this.generators[i];
    };

    /**
     * This method sets the instance of GainNode for Envelope Generator.
     * @param {number} index This argument is the index of array that contains the instance of GainNode for Envelope Generator.
     * @return {EnvelopeGenerator} This is returned for method chain.
     */
    EnvelopeGenerator.prototype.setGenerator = function(index) {
        var i = (parseInt(index) >= 0) ? parseInt(index) : 0;

        this.generators[i] = this.context.createGain();

        // for legacy browsers
        this.generators[i].gain.setTargetAtTime = this.generators[i].gain.setTargetAtTime || this.generators[i].gain.setTargetValueAtTime;

        return this;
    };

    /**
     * This method determines whether the all of gain schedulings have ended.
     * @return {boolean} If the all of gain schedulings have ended, this value is true. Otherwise, this value is false.
     */
    EnvelopeGenerator.prototype.isStop = function() {
        var counter = 0;

        for (var i = 0, len = this.activeIndexes.length; i < len; i++) {
            var activeIndex = this.activeIndexes[i];

            if (activeIndex === undefined) {
                continue;
            }

            if (this.generators[activeIndex].gain.value > EnvelopeGenerator.MIN_GAIN) {
                return false;
            } else {
                counter++;

                // the all of schedulings are stopped ?
                if (counter === this.activeCounter) {
                    return true;
                }
            }
        }
    };

    /**
     * This method clears variables for managing the instance of GainNode.
     * @param {boolean} isDisconnect This argument is in order to determine whether disconnect AudioNode.
     * @return {EnvelopeGenerator} This is returned for method chain.
     */
    EnvelopeGenerator.prototype.clear = function(isDisconnect) {
        this.activeIndexes.length = 0;
        this.activeCounter = 0;

        for (var i = 0, len = this.generators.length; i < len; i++) {
            this.generators[i].gain.cancelScheduledValues(this.context.currentTime);
            this.generators[i].gain.value = 1;

            if (isDisconnect) {
                this.generators[i].disconnect(0);
            }
        }

        return this;
    };

    /**
     * This method gets effecter's parameters as associative array.
     * @return {object}
     */
    EnvelopeGenerator.prototype.params = function() {
        var params = {
            'attack' : this.attack,
            'decay'  : this.decay,
            'sustain': this.sustain,
            'release': this.release
        };

        return params;
    };

    /**
     * This method gets effecter's parameters as JSON.
     * @return {string}
     */
    EnvelopeGenerator.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    EnvelopeGenerator.prototype.toString = function() {
        return '[SoundModule EnvelopeGenerator]';
    };

    // Export
    global.EnvelopeGenerator = EnvelopeGenerator;
    global.envelopegenerator = new EnvelopeGenerator(audiocontext);

})(window);
