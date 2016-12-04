(function(global) {
    'use strict';

    /**
     * This subclass defines properties for playing the single audio.
     * This class creates audio player that has higher features than HTML5 audio.
     * But, this class is disadvantage to play the many one shot audios.
     * In the case of that, developer should use OneshotModule.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {SoundModule}
     */
    function AudioModule(context) {
        Mocks.SoundModule.call(this, context);

        this.source = context.createBufferSource();  // for the instance of AudioBufferSourceNode
        this.buffer = null;                          // for the instance of AudioBuffer

        this.currentTime = 0;
        this.paused = true;

        this.callbacks = {
            'decode': function() {},
            'ready' : function() {},
            'start' : function() {},
            'stop'  : function() {},
            'update': function() {},
            'ended' : function() {},
            'error' : function() {}
        };

        this.vocalcanceler = new Mocks.AudioModule.VocalCanceler();
    }

    /** @extends {SoundModule} */
    AudioModule.prototype = Object.create(Mocks.SoundModule.prototype);
    AudioModule.prototype.constructor = AudioModule;

    /**
     * This method sets callback functions.
     * @param {string|object} key This argument is property name.
     *     This argument is pair of property and value in the case of associative array.
     * @param {function} value This argument is callback function.
     * @return {AudioModule} This is returned for method chain.
     * @override
     */
    AudioModule.prototype.setup = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.setup(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            if (k in this.callbacks) {
                if (Object.prototype.toString.call(value) === '[object Function]') {
                    this.callbacks[k] = value;
                }
            }
        }

        return this;
    };

    /**
     * This method is getter or setter for parameters.
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number|boolean} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|AudioModuler} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     * @override
     */
    AudioModule.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            var r = Mocks.SoundModule.prototype.param.call(this, k, value);

            if (r !== undefined) {
                return r;
            } else {
                switch (k) {
                    case 'playbackrate':
                        if (value === undefined) {
                            return this.source.playbackRate.value;
                        } else {
                            var v   = parseFloat(value);
                            var min = this.source.playbackRate.minValue || 0;
                            var max = this.source.playbackRate.maxValue || 1024;

                            if ((v >= min) && (v <= max)) {
                                this.source.playbackRate.value = v;
                            }
                        }

                        break;
                    case 'loop'   :
                    case 'looping':
                        if (value === undefined) {
                            return this.source.loop;
                        } else {
                            this.source.loop = Boolean(value);
                        }

                        break;
                    case 'currenttime':
                        if (value === undefined) {
                            return this.currentTime;
                        } else {
                            if (this.buffer instanceof AudioBuffer) {
                                var v   = parseFloat(value);
                                var max = this.buffer.duration;
                                var min = 0;

                                if ((v >= min) && (v <= max)) {
                                    if (this.paused) {
                                        this.stop();
                                        this.currentTime = v;
                                    } else {
                                        this.stop();
                                        this.start(v);
                                    }
                                }
                            } else {
                                this.currentTime = 0;
                            }
                        }

                        break;
                    case 'duration':
                        return (this.buffer instanceof AudioBuffer) ? this.buffer.duration : 0;  // Getter only
                    case 'samplerate':
                        return (this.buffer instanceof AudioBuffer) ? this.buffer.sampleRate : this.sampleRate;  // Getter only
                    case 'channels':
                        return (this.buffer instanceof AudioBuffer) ? this.buffer.numberOfChannels : 0;  // Getter only
                    default:
                        break;
                }
            }
        }

        return this;
    };

    /**
     * This method creates the instance of AudioBuffer from ArrayBuffer.
     * @param {ArrayBuffer} arrayBuffer This argument is the instance of ArrayBuffer.
     * @return {AudioModule} This is returned for method chain.
     * @override
     */
    AudioModule.prototype.ready = function(arrayBuffer) {
        if (arrayBuffer instanceof ArrayBuffer) {
            var self = this;

            var successCallback = function(buffer) {
                self.buffer = buffer;

                self.analyser.start('timeOverviewL', buffer);
                self.analyser.start('timeOverviewR', buffer);

                self.callbacks.ready(buffer);
            };

            this.context.decodeAudioData(arrayBuffer, successCallback, this.callbacks.error);

            this.callbacks.decode(arrayBuffer);
        }

        return this;
    };

    /**
     * This method starts audio from the designated time.
     * @param {number} position This argument is the time that audio is started at. The default value is 0.
     * @param {Array.<Effector>} connects This argument is the array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {AudioModule} This is returned for method chain.
     * @override
     */
    AudioModule.prototype.start = function(position, connects, processCallback) {
        if ((this.buffer instanceof AudioBuffer) && this.paused) {
            var startTime = this.context.currentTime;

            var pos = parseFloat(position);

            this.currentTime = ((pos >= 0) && (pos <= this.buffer.duration)) ? pos : 0;

            var playbackRate = this.source.playbackRate.value;
            var loop         = this.source.loop;

            this.source = this.context.createBufferSource();

            // for legacy browsers
            this.source.start = this.source.start || this.source.noteGrainOn;
            this.source.stop  = this.source.stop  || this.source.noteOff;

            this.source.buffer             = this.buffer;
            this.source.playbackRate.value = playbackRate;
            this.source.loop               = loop;

            // AudioBufferSourceNode (Input) -> ScriptProcessorNode -> ... -> AudioDestinationNode (Output)
            this.source.connect(this.processor);
            this.connect(this.processor, connects);

            this.source.start(startTime, pos, (this.buffer.duration - pos));

            this.analyser.start('time');
            this.analyser.start('fft');

            this.paused = false;

            this.on(startTime);

            this.callbacks.start(this.source, this.currentTime);

            var self = this;

            if (Object.prototype.toString.call(processCallback) === '[object Function]') {
                this.processor.onaudioprocess = processCallback;
            } else {
                this.processor.onaudioprocess = function(event) {
                    var inputLs  = event.inputBuffer.getChannelData(0);
                    var inputRs  = event.inputBuffer.getChannelData(1);
                    var outputLs = event.outputBuffer.getChannelData(0);
                    var outputRs = event.outputBuffer.getChannelData(1);

                    if (self.currentTime < Math.floor(self.source.buffer.duration)) {
                        for (var i = 0; i < this.bufferSize; i++) {
                            outputLs[i] = self.vocalcanceler.start(inputLs[i], inputRs[i]);
                            outputRs[i] = self.vocalcanceler.start(inputRs[i], inputLs[i]);

                            self.currentTime += ((1 * self.source.playbackRate.value) / self.source.buffer.sampleRate);

                            var index = Math.floor(self.currentTime * self.source.buffer.sampleRate);
                            var n100msec = 0.100 * self.source.buffer.sampleRate;

                            // Invoke callback every 100 msec
                            if ((index % n100msec) === 0) {
                                self.callbacks.update(self.source, self.currentTime);
                            }
                        }

                        self.analyser.timeOverviewL.update(self.currentTime);
                        self.analyser.timeOverviewR.update(self.currentTime);
                    } else {
                        if (self.source.loop) {
                            self.currentTime = 0;
                        } else {
                            self.end.call(self);
                        }
                    }
                };
            }
        }

        return this;
    };

    /**
     * This method stops audio.
     * @return {AudioModule} This is returned for method chain.
     * @override
     */
    AudioModule.prototype.stop = function() {
        if ((this.buffer instanceof AudioBuffer) && !this.paused) {
            var stopTime = this.context.currentTime;

            this.source.stop(stopTime);

            this.off(stopTime, true);

            this.analyser.stop('time');
            this.analyser.stop('fft');

            // Clear

            // Stop onaudioprocess event
            this.processor.disconnect(0);
            this.processor.onaudioprocess = null;

            this.paused = true;
            this.callbacks.stop(this.source, this.currentTime);
        }

        return this;
    };

    /**
     * This method gets the instance of AudioBufferSourceNode.
     * @return {AudioBufferSourceNode}
     * @override
     */
    AudioModule.prototype.get = function() {
        return this.source;
    };

    /**
     * This method starts or stops audio according to audio state.
     * @param {number} position This argument is the time that audio is started at. The default value is 0.
     * @param {Array.<Effector>} connects This argument is the array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {AudioModule} This is returned for method chain.
     */
    AudioModule.prototype.toggle = function(position, connects, processCallback) {
        if (this.paused) {
            this.start(position, connects, processCallback);
        } else {
            this.stop();
        }

        return this;
    };

    /**
     * This method rewinds audio.
     * @return {AudioModule} This is returned for method chain.
     */
    AudioModule.prototype.end = function() {
        this.stop();
        this.currentTime = 0;
        this.callbacks.ended(this.source, this.currentTime);

        return this;
    };

    /**
     * This method determines whether the instance of AudioBuffer exists.
     * @return {boolean} If the instance of AudioBuffer already exists, this value is true. Otherwise, this value is false.
     */
    AudioModule.prototype.isBuffer = function() {
        return this.buffer instanceof AudioBuffer;
    };

    /**
     * This method determines whether the instance of AudioBufferSourceNode exists.
     * @return {boolean} If the instance of AudioBufferSourceNode already exists, this value is true. Otherwise, this value is false.
     */
    AudioModule.prototype.isSource = function() {
        return (this.source instanceof AudioBufferSourceNode) && (this.source.buffer instanceof AudioBuffer);
    };

    /**
     * This method determines whether the audio is paused.
     * @return {boolean} If the audio is paused, this value is true. Otherwise, this value is false.
     */
    AudioModule.prototype.isPaused = function() {
        return this.paused;
    };

    /** @override */
    AudioModule.prototype.params = function() {
        var params = Mocks.SoundModule.prototype.params.call(this);

        params.audio = {
            'playbackrate' : this.source.playbackRate.value,
            'vocalcanceler': {
                'depth': this.vocalcanceler.param('depth')
            }
        };

        return params;
    };

    /** @override */
    AudioModule.prototype.toString = function() {
        return '[AudioModule]';
    };

    // Export
    global.AudioModule = AudioModule;
    global.audioModule = new AudioModule(audiocontext);

})(window);
