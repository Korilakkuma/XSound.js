(function(global) {
    'use strict';

    /**
     * This private class defines properties for Noise Gate.
     * @constructor
     */
    function NoiseGate() {
        this.level = 0;
    }

    /**
     * This method is getter or setter for parameters.
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|NoiseGate} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     */
    NoiseGate.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'level':
                    if (value === undefined) {
                        // Getter
                        return this.level;
                    } else {
                        // Setter
                        var v   = parseFloat(value);
                        var min = 0;
                        var max = 1;

                        if ((v >= min) && (v <= max)) {
                            this.level = v;
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
     * This method detects background noise and removes this.
     * @param {number} data This argument is amplitude (between -1 and 1).
     * @return {number} This is returned as 0 or the raw data.
     */
    NoiseGate.prototype.start = function(data) {
        var d = Math.abs(parseFloat(data));

        if (d > this.level) {
            // The amplitude is equal to argument.
            return d;
        } else {
            // Because signal is detected as background noise, the amplitude is 0 .
            return 0;
        }
    };

    /** @override */
    NoiseGate.prototype.toString = function() {
        return '[StreamModule NoiseGate]';
    };

    // Export
    global.NoiseGate = NoiseGate;
    global.noisegate = new NoiseGate();

})(window);
