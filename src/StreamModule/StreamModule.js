(function(global) {
    'use strict';

    /**
     * This class defines properties that processes sound data from WebRTC in Web Audio API.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {SoundModule}
     */
    function StreamModule(context) {
        Mocks.SoundModule.call(this, context);

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

        // for the instance of MediaStreamAudioSourceNode
        this.source = null;

        // for navigator.getUserMedia
        this.medias = {
            'audio': true,
            'video': false
        };

        this.callbacks = {
            'stream': function() {},
            'error' : function() {}
        };

        this.isStop  = true;

        this.noisegate = new Mocks.StreamModule.NoiseGate();
    }

    /** @extends {SoundModule} */
    StreamModule.prototype = Object.create(Mocks.SoundModule.prototype);
    StreamModule.prototype.constructor = StreamModule;

    /**
     * This method sets up for using WebRTC.
     * @param {boolean} isVideo If this argument is true, WebRTC streams video.
     * @param {function} streamCallback This argument is invoked on streaming.
     * @param {function} errorCallback This argument is invoked when error occurs on streaming.
     * @return {StreamModule} This is returned for method chain.
     * @override
     */
    StreamModule.prototype.setup = function(isVideo, streamCallback, errorCallback) {
        if (Boolean(isVideo)) {
            this.medias.video = true;
        }

        if (Object.prototype.toString.call(streamCallback) === '[object Function]') {this.callbacks.stream = streamCallback;}
        if (Object.prototype.toString.call(errorCallback)  === '[object Function]') {this.callbacks.error  = errorCallback;}

        return this;
    };

    /**
     * This method is getter or setter for parameters.
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|StreamModule} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     * @override
     */
    StreamModule.prototype.param = function(key, value) {
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

    /** @override */
    StreamModule.prototype.ready = function() {
        return this;
    };

    /**
     * This method starts streaming.
     * @param {Array.<Effector>} connects This argument is the array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {StreamModule} This is returned for method chain.
     * @override
     */
    StreamModule.prototype.start = function(connects, processCallback) {
        if (navigator.getUserMedia === undefined) {
            throw new Error('Cannot use WebRTC.');
        }

        var isAnalyser = false;

        var self = this;

        var start = function(stream, connects, processCallback) {
            self.source = self.context.createMediaStreamSource(stream);

            // MediaStreamAudioSourceNode (Input) -> ScriptProcessorNode -> ... -> AudioDestinationNode (Output)
            self.source.connect(self.processor);
            self.connect(self.processor, connects);

            self.on(self.context.currentTime);

            if (!isAnalyser) {
                self.analyser.start('time');
                self.analyser.start('fft');
                isAnalyser = true;
            }

            if (Object.prototype.toString.call(processCallback) === '[object Function]') {
                self.processor.onaudioprocess = processCallback;
            } else {
                self.processor.onaudioprocess = function(event) {
                    var inputLs  = event.inputBuffer.getChannelData(0);
                    var inputRs  = event.inputBuffer.getChannelData(1);
                    var outputLs = event.outputBuffer.getChannelData(0);
                    var outputRs = event.outputBuffer.getChannelData(1);

                    for (var i = 0; i < this.bufferSize; i++) {
                        outputLs[i] = self.noisegate.start(inputLs[i]);
                        outputRs[i] = self.noisegate.start(inputRs[i]);
                    }
                };
            }
        };

        this.isStop = false;

        navigator.getUserMedia(this.medias, function(stream) {
            if (self.isStop) {
                return;
            }

            start(stream, connects, processCallback);
            self.callbacks.stream(stream);
        }, function(error) {
            self.callbacks.error(error);
        });

        return this;
    };

    /**
     * This method stops streaming.
     * @return {StreamModule} This is returned for method chain.
     * @override
     */
    StreamModule.prototype.stop = function() {
        this.source = null;

        this.off(this.context.currentTime, true);

        this.analyser.stop('time');
        this.analyser.stop('fft');

        // Stop onaudioprocess event
        this.processor.disconnect(0);
        this.processor.onaudioprocess = null;

        this.isStop = true;

        return this;
    };

    /**
     * This method gets the instance of MediaStreamAudioSourceNode.
     * @return {MediaStreamAudioSourceNode}
     * @override
     */
    StreamModule.prototype.get = function() {
        return this.source;
    };

    /**
     * This method starts or stops streaming according to current state.
     * @param {Array.<Effector>} connects This argument is the array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {StreamModule} This is returned for method chain.
     */
    StreamModule.prototype.toggle = function(connects, processCallback) {
        if (this.isStreaming()) {
            this.stop();
        } else {
            this.start(connects, processCallback);
        }

        return this;
    };

    /**
     * This method determines whether streaming is active.
     * @return {boolean} If streaming is active, this value is true. Otherwise, this value is false.
     */
    StreamModule.prototype.isStreaming = function() {
        return !this.isStop;
    };

    /** @override */
    StreamModule.prototype.params = function() {
        var params = Mocks.SoundModule.prototype.params.call(this);

        params.stream = {
            'noisegate': {
                'level': this.noisegate.param('level')
            }
        };

        return params;
    };

    /** @override */
    StreamModule.prototype.toString = function() {
        return '[StreamModule]';
    };

    // Export
    global.StreamModule = StreamModule;
    global.streamModule = new StreamModule(audiocontext);

})(window);
