(function(global) {
    'use strict';

    /**
     * This private class defines properties for Glide.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     */
    function Glide(context) {
        this.context = context;

        this.frequencies = {
            'start': -1,  // Abnormal value for the 1st sound
            'end'  : 0
        };

        this.time = 0;                   // Glide time
        this.type = Glide.TYPES.LINEAR;  // 'linear' or 'exponential'
    };

    /**
     * Class (Static) properties
     */
    Glide.TYPES             = {};
    Glide.TYPES.LINEAR      = 'linear';
    Glide.TYPES.EXPONENTIAL = 'exponential';

    /**
     * This method is getter or setter for parameters.
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|Glide} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     */
    Glide.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'time':
                    if (value === undefined) {
                        return this.time;
                    } else {
                        var v = parseFloat(value);

                        if (v >= 0) {
                            this.time = v;
                        }
                    }

                    break;
                case 'type':
                    if (value === undefined) {
                        return this.type;
                    } else {
                        var v = String(value).toUpperCase();

                        if (v in Glide.TYPES) {
                            this.type = v.toLowerCase();
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
     * This method sets frequencies for Glide.
     * @param {number} frequency This argument is the frequency at which glide ends.
     * @return {Glide} This is returned for method chain.
     */
    Glide.prototype.ready = function(frequency) {
        this.frequencies.end = frequency;

        var diff = (this.frequencies.start === -1) ? 0 : (this.frequencies.end - this.frequencies.start);

        if ((this.frequencies.start === -1) || (this.time === 0) || (diff === 0)) {
            // The 1st sound or Glide OFF or The same sound
            this.frequencies.start = this.frequencies.end;
        }

        return this;
    };

    /**
     * This method starts Glide.
     * @param {OscillatorNode} oscillator This argument is the instance of OscillatorNode.
     * @param {number} startTime This argument is the start time of Glide.
     * @return {Glide} This is returned for method chain.
     */
    Glide.prototype.start = function(oscillator, startTime) {
        var s = parseFloat(startTime);

        if (isNaN(s) || (s < this.context.currentTime)) {
            s = this.context.currentTime;
        }

        var t0 = s;
        var t1 = t0 + this.time;

        // Start Glide
        oscillator.frequency.cancelScheduledValues(t0);
        oscillator.frequency.setValueAtTime(this.frequencies.start, t0);
        oscillator.frequency[this.type + 'RampToValueAtTime'](this.frequencies.end, t1);

        return this;
    };

    /**
     * This method stops Glide. Moreover, This method prepares for next Glide.
     * @return {Glide} This is returned for method chain.
     */
    Glide.prototype.stop = function() {
        // Stop Glide or on the way of Glide
        this.frequencies.start = this.frequencies.end;
        return this;
    };

    /** @override */
    Glide.prototype.toString = function() {
        return '[OscillatorModule Glide]';
    };

    // Export
    global.Glide = Glide;
    global.glide = new Glide(audiocontext);

})(window);
