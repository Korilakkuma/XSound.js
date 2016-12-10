(function(global) {
    'use strict';

    /**
     * This class defines properties for mixing sound sources  that is defined in this library.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {SoundModule}
     */
    function MixerModule(context) {
        Mocks.SoundModule.call(this, context);

        /** @type {Array.<OscillatorModule>|Array.<OneshotModule>|Array.<AudioModule>|Array.<MediaModule>}|Array.<StreamModule> */
        this.sources = [];

        this.isAnalyser = false;
    };

    /** @extends {SoundModule} */
    MixerModule.prototype = Object.create(Mocks.SoundModule.prototype);
    MixerModule.prototype.constructor = MixerModule;

    /**
     * This method mixes sound source.
     * @param {Array.<OscillatorModule>|Array.<OneshotModule>|Array.<AudioModule>|Array.<MediaModule>|Array.<StreamModule>} sources This argument is array of sound source that is defined by this library.
     * @return {MixerModule} This is returned for method chain.
     */
    MixerModule.prototype.mix = function(sources) {
        if (!Array.isArray(sources)) {
            sources = [sources];
        }

        this.sources = sources;

        for (var i = 0, len = this.sources.length; i < len; i++) {
            var source = this.sources[i];

            if (!((source instanceof OscillatorModule) || (source instanceof OneshotModule) || (source instanceof AudioModule) || (source instanceof MediaModule) || (source instanceof StreamModule))) {
                return;
            }

            var stopTime = this.context.currentTime;

            this.off(stopTime, false);

            source.analyser.stop('time');
            source.analyser.stop('fft');
            source.isAnalyser = false;

            source.recorder.stop();
            source.session.close();

            // ScriptProcessorNode (each sound source) -> ScriptProcessorNode (Mix sound sources)
            source.processor.disconnect(0);
            source.processor.connect(this.processor);
        }

        // (... ->) ScriptProcessorNode (Mix sound sources) -> ... -> AudioDestinationNode (Output)
        this.connect(this.processor);

        var startTime = this.context.currentTime;

        this.on(startTime);

        if (!this.isAnalyser) {
            this.analyser.start('time');
            this.analyser.start('fft');
            this.isAnalyser = true;
        }

        var self = this;

        this.processor.onaudioprocess = function(event) {
            var inputLs  = event.inputBuffer.getChannelData(0);
            var inputRs  = event.inputBuffer.getChannelData(1);
            var outputLs = event.outputBuffer.getChannelData(0);
            var outputRs = event.outputBuffer.getChannelData(1);

            // Stop ?
            var isStop = false;

            for (var i = 0, len = self.sources.length; i < 10; i++) {
                var source = sources[i];

                if ((source instanceof OscillatorModule) && source.envelopegenerator.isStop()) {
                    isStop = true;
                } else if ((source instanceof OneshotModule) && source.isStop) {
                    isStop = true;
                } else if ((source instanceof AudioModule) && source.paused) {
                    isStop = true;
                } else if ((source instanceof MediaModule) && source.media.paused) {
                    isStop = true;
                } else if ((source instanceof StreamModule) && source.isStop) {
                    isStop = true;
                }
            }

            if (isStop) {
                var stopTime = self.context.currentTime;

                self.stop(stopTime, true);

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

        return this;
    };

    /**
     * This method gets the instance of sound source that is mixed in this class.
     * @param {number} index This argument is required in the case of designating sound source.
     * @return {Array.<OscillatorModule>|Array.<OneshotModule>|Array.<AudioModule>|Array.<MediaModule>|Array.<StreamModule>|OscillatorModule|OneshotModule>|AudioModule|MediaModule|StreamModule}
     * @override
     */
    MixerModule.prototype.get = function(index) {
        var i = parseInt(index);

        if ((i >= 0) && (i < this.sources.length)) {
            return this.sources[i];
        } else {
            return this.sources;
        }
    };

    /** @override */
    MixerModule.prototype.toString = function() {
        return '[MixerModule]';
    };
    // Export
    global.MixerModule = MixerModule;
    global.mixerModule = new MixerModule(audiocontext);

})(window);
