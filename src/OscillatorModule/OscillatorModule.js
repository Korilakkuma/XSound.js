(function(global) {
    'use strict';

    /**
     * This subclass defines properties for creating sound.
     * Actually, properties for creating sound is defined in private class (Oscillator).
     * Therefore, This class manages these private classes for creating sound.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {SoundModule}
     */
    function OscillatorModule(context) {
        Mocks.SoundModule.call(this, context);

        /** @type {Array.<Oscillator>} */
        this.sources = [];

        // for scheduling
        this.times = {
            'start': 0,
            'stop' : 0
        };

        // This flag determines whether sound wave is drawn
        this.isAnalyser = false;

        this.glide = new Mocks.OscillatorModule.Glide(context);
    }

    /** @extends {SoundModule} */
    OscillatorModule.prototype = Object.create(Mocks.SoundModule.prototype);
    OscillatorModule.prototype.constructor = OscillatorModule;

    /**
     * This method creates the instances of Oscillator.
     * @param {Array.<boolean>|boolean} states This argument is initial state in the instance of Oscillator.
     * @return {OscillatorModule} This is returned for method chain.
     * @override
     */
    OscillatorModule.prototype.setup = function(states) {
        // Clear
        this.sources.length = 0;

        if (!Array.isArray(states)) {
            states = [states];
        }

        for (var i = 0, len = states.length ; i < len; i++) {
            this.sources[i] = new Mocks.OscillatorModule.Oscillator(this.context, Boolean(states[i]));
            this.envelopegenerator.setGenerator(i);
        }

        return this;
    };

    /**
     * This method is getter or setter for parameters.
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|OscillatorModule} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     * @override
     */
    OscillatorModule.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            var r = Mocks.SoundModule.prototype.param.call(this, k, value);
        }

        return (r === undefined) ? this : r;
    };

    /**
     * This method schedules the time of start and stop.
     * @param {number} startTime This argument is the start time. The default value is 0.
     * @param {number} stopTime This argument is the stop time. The default value is 0.
     * @return {OscillatorModule} This is returned for method chain.
     * @override
     */
    OscillatorModule.prototype.ready = function(startTime, stopTime) {
        var st = parseFloat(startTime);
        var sp = parseFloat(stopTime);

        if (st >=  0) {this.times.start = st;} else {this.times.start = 0;}
        if (sp >= st) {this.times.stop  = sp;} else {this.times.stop  = 0;}

        this.envelopegenerator.clear();

        return this;
    };

    /**
     * This method starts some sounds that are active at the same time.
     * @param {Array.<number>}|number} frequencies This argument each oscillator frequency. The default value is 0 Hz.
     * @param {Array.<Effector>} connects This argument is the array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {OscillatorModule} This is returned for method chain.
     * @override
     */
    OscillatorModule.prototype.start = function(frequencies, connects, processCallback) {
        var startTime = this.context.currentTime + this.times.start;

        // Validate the 1st argument
        if (!Array.isArray(frequencies)) {
            frequencies = [frequencies];
        }

        for (var i = 0, len = frequencies.length; i < len; i++) {
            var f = parseFloat(frequencies[i]);
            frequencies[i] = (f >= 0) ? f : 0;
        }

        // Clear previous
        this.envelopegenerator.clear();
        this.processor.disconnect(0);
        this.processor.onaudioprocess = null;

        // ScriptProcessorNode (Mix oscillators) -> ... -> AudioDestinationNode (Output)
        this.connect(this.processor, connects);

        for (var i = 0, len = frequencies.length; i < len; i++) {
            if (i >= this.sources.length) {
                break;
            }

            var oscillator = this.sources[i];
            var frequency  = frequencies[i];

            // GainNode (Volume) -> ScriptProcessorNode (Mix oscillators)
            oscillator.ready(this.processor);

            // OscillatorNode (Input) -> GainNode (Envelope Generator) -> GainNode (Volume)
            this.envelopegenerator.ready(i, oscillator.source, oscillator.volume);

            this.glide.ready(frequency).start(oscillator.source, startTime);

            oscillator.start(startTime);
        }

        // Attack -> Decay -> Sustain
        this.envelopegenerator.start(startTime);

        this.on(startTime);

        if (!this.isAnalyser) {
            this.analyser.start('time');
            this.analyser.start('fft');
            this.isAnalyser = true;
        }

        var self = this;

        if (Object.prototype.toString.call(processCallback) === '[object Function]') {
            this.processor.onaudioprocess = processCallback;
        } else {
            this.processor.onaudioprocess = function(event) {
                var inputLs  = event.inputBuffer.getChannelData(0);
                var inputRs  = event.inputBuffer.getChannelData(1);
                var outputLs = event.outputBuffer.getChannelData(0);
                var outputRs = event.outputBuffer.getChannelData(1);

                // Stop ?
                if (self.envelopegenerator.isStop()) {
                    // Stop
                    var stopTime = self.context.currentTime;

                    for (var i = 0, len = self.sources.length; i < len; i++) {
                        self.sources[i].stop(stopTime);
                    }

                    self.off(stopTime);

                    self.analyser.stop('time');
                    self.analyser.stop('fft');
                    self.isAnalyser = false;

                    // Stop onaudioprocess event
                    this.disconnect(0);
                    this.onaudioprocess = null;
                } else {
                    outputLs.set(inputLs);
                    outputRs.set(inputRs);
                }
            };
        }

        return this;
    };

    /**
     * This method stops active sounds.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {OscillatorModule} This is returned for method chain.
     * @override
     */
    OscillatorModule.prototype.stop = function(processCallback) {
        var stopTime = this.context.currentTime + this.times.stop;

        // Attack or Decay or Sustain -> Release
        this.envelopegenerator.stop(stopTime);

        this.glide.stop();
        this.filter.stop(stopTime);

        for (var i = 0, len = this.plugins.length; i < len; i++) {
            this.plugins[i].plugin.stop(stopTime, this.envelopegenerator.param('release'));
        }

        return this;
    };

    /**
     * This method gets the instance of Oscillator that is used in OscillatorModule.
     * @param {number} index This argument is required in the case of designating Oscillator.
     * @return {Array.<Oscillator>|Oscillator}
     * @override
     */
    OscillatorModule.prototype.get = function(index) {
        var i = parseInt(index);

        if ((i >= 0) && (i < this.sources.length)) {
            return this.sources[i];
        } else {
            return this.sources;
        }
    };

    /**
     * This method returns the number of oscillators.
     * @return {number} This is returned as the number of oscillators.
     */
    OscillatorModule.prototype.length = function() {
        return this.sources.length;
    };

    /** @override */
    OscillatorModule.prototype.params = function() {
        var params = Mocks.SoundModule.prototype.params.call(this);

        params.oscillator = {
            'glide': {
                'type': this.glide.param('type'),
                'time': this.glide.param('time')
            }
        };

        for (var i = 0, len = this.sources.length; i < len; i++) {
            var source = this.sources[i];

            params.oscillator['oscillator' + i] = {
                'state' : source.state(),
                'gain'  : source.param('gain'),
                'type'  : source.param('type'),
                'octave': source.param('octave'),
                'fine'  : source.param('fine')
            };
        }

        return params;
    };

    /** @override */
    OscillatorModule.prototype.toString = function() {
        return '[OscillatorModule]';
    };

    // Export
    global.OscillatorModule = OscillatorModule;
    global.oscillatorModule = new OscillatorModule(audiocontext);

})(window);
