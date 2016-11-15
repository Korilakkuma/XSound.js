(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Compressor(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        this.compressor = context.createDynamicsCompressor();

        // Set default value
        this.compressor.threshold.value = -24;
        this.compressor.knee.value      = 30;
        this.compressor.ratio.value     = 12;
        this.compressor.attack.value    = 0.003;
        this.compressor.release.value   = 0.25;

        // Compressor is connected by default
        this.state(true);
    }

    /** @extends {Effector} */
    Compressor.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Compressor.prototype.constructor = Compressor;

    /** @override */
    Compressor.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            if (k in this.compressor) {
                if (value === undefined) {
                    return this.compressor[k].value;
                } else {
                    var v = parseFloat(value);

                    var minValues = {
                        'threshold': -100,
                        'knee'     : 0,
                        'ratio'    : 1,
                        'attack'   : 0,
                        'release'  : 0
                    };

                    var maxValues = {
                        'threshold': 0,
                        'knee'     : 40,
                        'ratio'    : 20,
                        'attack'   : 1,
                        'release'  : 1
                    };

                    var min = this.compressor[k].minValue || minValues[k];
                    var max = this.compressor[k].maxValue || maxValues[k];

                    if ((v >= min) && (v <= max)) {
                        this.compressor[k].value = v;
                    }
                }
            }
        }

        return this;
    };

    /** @override */
    Compressor.prototype.connect = function() {
        // Clear connection
        this.input.disconnect(0);
        this.compressor.disconnect(0);

        if (this.isActive) {
            // Effect ON
            // GainNode (Input) -> DynamicsCompressorNode -> GainNode (Output)
            this.input.connect(this.compressor);
            this.compressor.connect(this.output);
        } else {
            // Effect OFF
            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);
        }

        return this;
    };

    /** @override */
    Compressor.prototype.params = function() {
        var params = {
            'state'    : this.isActive,
            'threshold': this.compressor.threshold.value,
            'knee'     : this.compressor.knee.value,
            'ratio'    : this.compressor.ratio.value,
            'attack'   : this.compressor.attack.value,
            'release'  : this.compressor.release.value
        };

        return params;
    };

    /** @override */
    Compressor.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Compressor.prototype.toString = function() {
        return '[SoundModule Compressor]';
    };

    // Export
    global.Compressor = Compressor;
    global.compressor = new Compressor(audiocontext, 2048);

})(window);
