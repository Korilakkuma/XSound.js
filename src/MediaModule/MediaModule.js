(function(global) {
    'use strict';

    /**
     * This class defines properties for processing sound data from HTMLMediaElement .
     * Namely, this class creates audio player that has higher features from HTMLMediaElement.
     * But, this class is disadvantage to play the many one shot audios.
     * In the case of that, developer should use OneshotModule.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {AudioModule}
     */
    function MediaModule(context) {
        Mocks.SoundModule.call(this, context);
        Mocks.AudioModule.call(this, context);

        this.source = null;  // for the instance of MediaElementAudioSourceNode
        this.media  = null;  // for the instance of HTMLMediaElement
        this.ext    = '';    // 'wav', 'ogg', 'mp3, 'webm', 'ogv', 'mp4' ...etc

        this.duration     = 0;
        this.playbackRate = 1.0;
        this.controls     = false;
        this.loop         = false;
        this.muted        = false;

        // The keys are the event interfaces that are defined by HTMLMediaElement.
        // For example, "loadstart", "loadedmetadata", "loadeddata", "canplay", "canplaythrough", "timeupdate", "ended" ...etc
        this.listeners = {};
    }

    /** @extends {SoundModule} */
    Mocks.AudioModule.prototype = Object.create(Mocks.SoundModule.prototype);
    Mocks.AudioModule.prototype.constructor = Mocks.AudioModule;

    /** @extends {AudioModule} */
    MediaModule.prototype = Object.create(Mocks.AudioModule.prototype);
    MediaModule.prototype.constructor = MediaModule;

    /**
     * Class (Static) properties
     */
    MediaModule.TYPES       = {};
    MediaModule.TYPES.AUDIO = 'audio';
    MediaModule.TYPES.VIDEO = 'video';

    /**
     * This method gets HTMLMediaElement and selects media format. In addition, this method adds event listeners that are defined by HTMLMediaElement.
     * @param {HTMLAudioElement|HTMLVideoElement} media This argument is either HTMLAudioElement or HTMLVideoElement.
     * @param {Array.<string>|string} formats This argument is usable media format. For example, 'wav', 'ogg', 'webm', 'mp4' ...etc.
     * @param {object} listeners This argument is event handlers that are defined by HTMLMediaElement.
     * @return {MediaModule} This is returned for method chain.
     * @override
     */
    MediaModule.prototype.setup = function(media, formats, listeners) {
        // The argument is associative array ?
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            var properties = arguments[0];

            if ('media'     in properties) {media     = properties.media;}
            if ('formats'   in properties) {formats   = properties.formats;}
            if ('listeners' in properties) {listeners = properties.listeners;}
        }

        var type = '';

        if (media instanceof HTMLAudioElement) {
            type = MediaModule.TYPES.AUDIO;
        } else if (media instanceof HTMLVideoElement) {
            type = MediaModule.TYPES.VIDEO;
        } else {
            return this;
        }

        this.media = media;

        if (!Array.isArray(formats)) {
            formats = [formats];
        }

        for (var i = 0, len = formats.length; i < len; i++) {
            var format = type + '/' + String(formats[i]).toLowerCase();

            if (/^(?:maybe|probably)/.test(this.media.canPlayType(format))) {
                this.ext = formats[i];
                break;
            }
        }

        if (this.ext === '') {
            throw new Error('Media format that can be played does not exist.');
        }

        if (Object.prototype.toString.call(listeners) === '[object Object]') {
            for (var k in listeners) {
                this.listeners[k.toLowerCase()] = (Object.prototype.toString.call(listeners[k]) === '[object Function]') ? listeners[k] : function() {};
            }
        }

        var self = this;

        this.media.addEventListener('loadstart', function(event) {
            // To create the instance of MediaElementAudioSourceNode again causes error to occur.
            if (!(self.source instanceof MediaElementAudioSourceNode)) {
                self.source = self.context.createMediaElementSource(this);
            }

            if ('loadstart' in self.listeners) {
                self.listeners.loadstart(event);
            }
        }, false);

        this.media.addEventListener('loadedmetadata', function(event) {
            self.duration = this.duration;

            if ('loadedmetadata' in self.listeners) {
                self.listeners.loadedmetadata(event);
            }
        }, false);

        this.media.addEventListener('ended', function(event) {
            this.pause();

            self.off(self.context.currentTime);

            self.analyser.stop('time');
            self.analyser.stop('fft');

            // Stop onaudioprocess event
            self.processor.disconnect(0);
            self.processor.onaudioprocess = null;

            if ('ended' in self.listeners) {
                self.listeners.ended(event);
            }
        }, false);

        for (var k in this.listeners) {
            this.media.addEventListener(k, function(event) {
                self.listeners[(event.type).toLowerCase()](event);
            }, false);
        }

        return this;
    };

    /**
     * This method is getter or setter for parameters.
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number|boolean} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|boolean|MediaModule} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     * @override
     */
    MediaModule.prototype.param = function(key, value) {
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
                            return (this.media instanceof HTMLMediaElement) ? this.media.playbackRate : this.playbackRate;
                        } else {
                            var v   = parseFloat(value);
                            var min = 0.5;  // for Chrome

                            if (v >= min) {
                                if (this.media instanceof HTMLMediaElement) {
                                    this.media.playbackRate = v;
                                }

                                this.playbackRate = v;
                            }
                        }

                        break;
                    case 'currenttime':
                        if (value === undefined) {
                            return (this.media instanceof HTMLMediaElement) ? this.media.currentTime : 0;
                        } else {
                            if (this.media instanceof HTMLMediaElement) {
                                var v   = parseFloat(value);
                                var min = 0;
                                var max = this.duration;

                                if ((v >= min) && (v <= max)) {
                                    this.media.currentTime = v;
                                }
                            }
                        }

                        break;
                    case 'loop'    :
                    case 'muted'   :
                    case 'controls':
                        if (value === undefined) {
                            return (this.media instanceof HTMLMediaElement) ? this.media[k] : this[k];
                        } else {
                            if (this.media instanceof HTMLMediaElement) {
                                this.media[k] = Boolean(value);
                            }

                            this[k] = Boolean(value);
                        }

                        break;
                    case 'width' :
                    case 'height':
                        if (value === undefined) {
                            return (this.media instanceof HTMLVideoElement) ? this.media[k] : 0;
                        } else {
                            var v   = parseInt(value);
                            var min = 0;

                            if (v >= min) {
                                if (this.media instanceof HTMLVideoElement) {
                                    this.media[k] = v;
                                }
                            }
                        }

                        break;
                    case 'duration':
                        return this.duration;  // Getter only
                    case 'channels':
                        return (this.source instanceof MediaElementAudioSourceNode) ? this.source.channelCount : 0;  // Getter only
                    default:
                        break;
                }
            }
        }

        return this;
    };

    /**
     * This method prepares for playing the media anytime after loading the media resource.
     * @param {string} source This argument is path name or Data URL or Object URL for the media resource.
     * @return {MediaModule} This is returned for method chain.
     * @override
     */
    MediaModule.prototype.ready = function(source) {
        var src = String(source);

        try {
            // Data URL or Object URL ?
            if ((src.indexOf('data:') !== -1) || (src.indexOf('blob:') !== -1)) {
                this.media.src = src;  // Data URL or Object URL
            } else {
                this.media.src = src + '.' + this.ext;  // Path
            }
        } catch (error) {
            throw new Error('The designated resource cannot be loaded.');
        }

        return this;
    };

    /**
     * This method starts media from the designated time.
     * @param {number} position This argument is the time that media is started at. The default value is 0.
     * @param {Array.<Effector>} connects This argument is the array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {MediaModule} This is returned for method chain.
     * @override
     */
    MediaModule.prototype.start = function(position, connects, processCallback) {
        if ((this.source instanceof MediaElementAudioSourceNode) && this.media.paused) {
            // MediaElementAudioSourceNode (Input) -> ScriptProcessorNode -> ... -> AudioDestinationNode (Output)
            this.source.connect(this.processor);
            this.connect(this.processor, connects);

            this.media.play();

            var pos = parseFloat(position);

            this.media.currentTime  = ((pos >= 0) && (pos <= this.duration)) ? pos : 0;
            this.media.playbackRate = this.playbackRate;
            this.media.controls     = this.controls;
            this.media.loop         = this.loop;
            this.media.muted        = this.muted;

            this.on(this.context.currentTime);

            this.analyser.start('time');
            this.analyser.start('fft');

            var self = this;

            if (Object.prototype.toString.call(processCallback) === '[object Function]') {
                this.processor.onaudioprocess = processCallback;
            } else {
                this.processor.onaudioprocess = function(event) {
                    var inputLs  = event.inputBuffer.getChannelData(0);
                    var inputRs  = event.inputBuffer.getChannelData(1);
                    var outputLs = event.outputBuffer.getChannelData(0);
                    var outputRs = event.outputBuffer.getChannelData(1);

                    for (var i = 0; i < this.bufferSize; i++) {
                        outputLs[i] = self.vocalcanceler.start(inputLs[i], inputRs[i]);
                        outputRs[i] = self.vocalcanceler.start(inputRs[i], inputLs[i]);
                    }
                };
            }
        }

        return this;
    };

    /**
     * This method stops media.
     * @return {MediaModule} This is returned for method chain.
     * @override
     */
    MediaModule.prototype.stop = function() {
        if ((this.source instanceof MediaElementAudioSourceNode) && !this.media.paused) {
            this.media.pause();

            this.off(this.context.currentTime, true);

            this.analyser.stop('time');
            this.analyser.stop('fft');

            // Stop onaudioprocess event
            this.processor.disconnect(0);
            this.processor.onaudioprocess = null;
        }

        return this;
    };

    /**
     * This method gets the instance of HTMLMediaElement.
     * @return {HTMLMediaElement}
     * @override
     */
    MediaModule.prototype.get = function() {
        return this.media;
    };

    /**
     * This method starts or stops media according to media state.
     * @param {number} position This argument is time that media is started at.
     * @param {Array.<Effector>} connects This argument is the array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {MediaModule} This is returned for method chain.
     * @override
     */
    MediaModule.prototype.toggle = function(position, connects, processCallback) {
        if (this.media instanceof HTMLMediaElement) {
            if (this.media.paused) {
                this.start(position, connects, processCallback);
            } else {
                this.stop();
            }
        }

        return this;
    };

    /**
     * This method determines whether the instance of HTMLMediaElement exists.
     * @return {boolean} If the instance of HTMLMediaElement already exists, this value is true. Otherwise, this value is false.
     */
    MediaModule.prototype.isMedia = function() {
        return this.media instanceof HTMLMediaElement;
    };

    /**
     * This method determines whether the instance of MediaElementAudioSourceNode exists.
     * @return {boolean} If the instance of MediaElementAudioSourceNode already exists, this value is true. Otherwise, this value is false.
     * @override
     */
    MediaModule.prototype.isSource = function() {
        return this.source instanceof MediaElementAudioSourceNode;
    };

    /**
     * This method determines whether the media is paused.
     * @return {boolean} If the media is paused or does not exists, this value is true. Otherwise, this value is false.
     * @override
     */
    MediaModule.prototype.isPaused = function() {
        return (this.media instanceof HTMLMediaElement) ? this.media.paused : true;
    };

    /** @override */
    MediaModule.prototype.params = function() {
        var params = Mocks.SoundModule.prototype.params.call(this);

        params.media = {
            'playbackrate' : this.playbackRate,
            'vocalcanceler': {
                'depth': this.vocalcanceler.param('depth')
            }
        };

        return params;
    };

    /** @override */
    MediaModule.prototype.toString = function() {
        return '[MediaModule]';
    };

    // Export
    global.MediaModule = MediaModule;
    global.mediaModule = new MediaModule(audiocontext);

})(window);
