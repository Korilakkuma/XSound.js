(function(global) {
    'use strict';

    /**
     * This private class defines common properties for effector classes.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @implements {Statable}
     */
    function Effector(context, bufferSize) {
        // Call interface constructor
        Mocks.Statable.call(this);

        this.isActive = true;

        this.context = context;

        // for connecting external node
        this.input  = context.createGain();
        this.output = context.createGain();

        // for LFO (Low Frequency Oscillator)
        // LFO changes parameter cyclically
        this.lfo       = context.createOscillator();
        this.depth     = context.createGain();
        this.rate      = this.lfo.frequency;
        this.processor = context.createScriptProcessor(bufferSize, 1, 2);

        // for legacy browsers
        this.lfo.start = this.lfo.start || this.lfo.noteOn;
        this.lfo.stop  = this.lfo.stop  || this.lfo.noteOff;

        this.values = {};

        this.isStop = true;
    }

    /** @implements {Statable} */
    Effector.prototype = Object.create(Mocks.Statable.prototype);
    Effector.prototype.constructor = Effector;

    /**
     * This abstract method gets or sets parameter.
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number|string} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|Effector} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     * @abstract
     */
    Effector.prototype.param = function(key, value) {
    };

    /**
     * This abstract method connects nodes according to state.
     * @abstract
     */
    Effector.prototype.connect = function() {
    };

    /**
     * This method starts LFO. Namely, this method starts Effector.
     * @param {number} startTime This argument is in order to schedule parameter.
     * @return {Effector} This is returned for method chain.
     */
    Effector.prototype.start = function(startTime) {
        if (this.isActive && this.isStop) {
            var s = parseFloat(startTime);

            if (isNaN(s) || (s < this.context.currentTime)) {
                s = this.context.currentTime;
            }

            this.lfo.start(s);
            this.isStop = false;
        }

        return this;
    };

    /**
     * This method stops LFO, and creates the instance of OscillatorNode again in the case of false.
     * @param {number} stopTime This argument is in order to schedule parameter.
     * @param {number} releaseTime This argument is in order to schedule parameter when it is necessary to consider release time.
     * @return {Effector} This is returned for method chain.
     */
    Effector.prototype.stop = function(stopTime, releaseTime) {
        if (this.isActive && !this.isStop) {
            var s = parseFloat(stopTime);
            var r = parseFloat(releaseTime);

            if (isNaN(s) || (s < this.context.currentTime)) {
                s = this.context.currentTime;
            }

            if (isNaN(r) || (r < 0)) {
                r = 0;
            }

            // for saving value
            var type = this.lfo.type;
            var rate = this.lfo.frequency.value;

            // Destroy the instance of OscillatorNode
            this.lfo.stop(s + r);

            // Create the instance of OscillatorNode again
            this.lfo = this.context.createOscillator();

           // for legacy browsers
            this.lfo.start = this.lfo.start || this.lfo.noteOn;
            this.lfo.stop  = this.lfo.stop  || this.lfo.noteOff;

            // Set the saved value
            this.lfo.type            = type;
            this.lfo.frequency.value = rate;

            this.rate = this.lfo.frequency;

            this.isStop = true;
        }

        return this;
    };

    /** @override */
    Effector.prototype.state = function(state) {
        if (state === undefined) {
            return this.isActive;
        } else if (String(state).toLowerCase() === 'toggle') {
            this.isActive = !this.isActive;
        } else {
            this.isActive = Boolean(state);
        }

        // Change connection
        this.connect();

        // Start LFO
        this.start(this.context.currentTime);

        return this;
    };

    /**
     * This method gets effecter's parameters as associative array.
     * @return {object}
     * @abstract
     */
    Effector.prototype.params = function() {
        return {};
    };

    /**
     * This method gets effecter's parameters as JSON.
     * @return {string}
     * @abstract
     */
    Effector.prototype.toJSON = function() {
        return '';
    };

    /** @override */
    Effector.prototype.toString = function() {
        return '[SoundModule Effector]';
    };

    // Export
    global.Effector = Effector;
    global.effector = new Effector(audiocontext, 2048);

})(window);
