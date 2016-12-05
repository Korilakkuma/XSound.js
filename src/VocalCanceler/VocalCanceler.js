(function(global) {
    'use strict';

    /**
     * This private class defines properties for Vocal Canceler.
     * @constructor
     */
    function VocalCanceler() {
        this.depth = 0;
    };

    /**
     * This method is getter or setter for parameters.
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|VocalCanceler} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     */
    VocalCanceler.prototype.param = function(key, value) {
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
                        return this.depth;
                    } else {
                        var v   = parseFloat(value);
                        var min = 0;
                        var max = 1;

                        if ((v >= min) && (v <= max)) {
                            this.depth = v;
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
     * This method removes vocal part in the played audio.
     * @param {number} dataL This argument is gain level for Left channel.
     * @param {number} dataR This argument is gain level for Right channel.
     * @return {number} This is returned as audio data except vocal part.
     */
    VocalCanceler.prototype.start = function(dataL, dataR) {
        return dataL - (this.depth * dataR);
    };

    /** @override */
    VocalCanceler.prototype.toString = function() {
        return '[AudioModule VocalCanceler]';
    };

    // Export
    global.VocalCanceler = VocalCanceler;
    global.vocalcanceler = new VocalCanceler();

})(window);
