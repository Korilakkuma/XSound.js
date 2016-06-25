/**
 * xsound.js
 * @fileoverview Web Audio API Library
 *
 * Copyright (c) 2012, 2013, 2014 Tomohiro IKEDA (Korilakkuma)
 * Released under the MIT license
 */



(function(global) {
    'use strict';

    // Global object
    var XSound;

    // Global constant for determining whether it is possible to use Web Audio API.
    var IS_XSOUND = (global.AudioContext || global.webkitAudioContext) ? true : false;

    /**
     * This interface is in order to manage state of module that implements this interface.
     * @constructor
     */
    function Statable() {
    }

    /**
     * This method gets or sets module's state.
     * @param {string|boolean} state If this argument is undefined, this method returns state as getter.
     *     If this argument is 'toggle', this method changes state according to current state. Otherwise, this method sets state.
     * @return {boolean|object} This is returned as module's state in the case of getter. This is returned for method chain in the case of setter.
     * @abstruct
     */
    Statable.prototype.state = function(state) {
    };

    // These functions are class (static) methods for "XSound".

    /**
     * This class (static) method reads file of audio or text.
     * @param {Blob} file This argument is the instance of Blob. This is entity of file.
     * @param {string} type This argument is one of 'ArrayBuffer', 'DataURL', 'Text'.
     * @param {function} successCallback This argument is invoked as next process when reading file is successful.
     * @param {function} errorCallback This argument is invoked when reading file failed.
     * @param {function} progressCallback This argument is invoked as "onprogress" event handler in the instance of FileReader.
     */
    var read = function(file, type, successCallback, errorCallback, progressCallback) {
        // The argument is associative array ?
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            var properties = arguments[0];

            if ('file'     in properties) {file             = properties.file;}
            if ('type'     in properties) {type             = properties.type;}
            if ('success'  in properties) {successCallback  = properties.success;}
            if ('error'    in properties) {errorCallback    = properties.error;}
            if ('progress' in properties) {progressCallback = properties.progress;}
        }

        if (!(file instanceof Blob)) {
            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(null, 'FILE_IS_NOT_BLOB');
            }

            return;
        }

        var reader = new FileReader();

        reader.onprogress = function(event) {
            if (Object.prototype.toString.call(progressCallback) === '[object Function]') {
                progressCallback(event);
            }
        };

        reader.onerror = function(event) {
            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                var error = '';

                switch (reader.error.code) {
                    case reader.error.NOT_FOUND_ERR   : error = 'NOT_FOUND_ERR';    break;
                    case reader.error.SECURITY_ERR    : error = 'SECURITY_ERR';     break;
                    case reader.error.ABORT_ERR       : error = 'ABORT_ERR';        break;
                    case reader.error.NOT_READABLE_ERR: error = 'NOT_READABLE_ERR'; break;
                    case reader.error.ENCODING_ERR    : error = 'ENCODING_ERR' ;    break;
                    default                           : error = 'ERR';              break;
                }

                errorCallback(event, error);
            }
        };

        reader.onload = function(event) {
            if (Object.prototype.toString.call(successCallback) === '[object Function]') {
                var result = reader.result;

                // Escape <script> in the case of text
                if ((Object.prototype.toString.call(result) === '[object String]') && (result.indexOf('data:') === -1) && (result.indexOf('blob:') === -1)) {
                    result = result.replace(/<(\/?script.*?)>/gi, '&lt;$1&gt;');
                }

                successCallback(event, result);
            }
        };

        if (/arraybuffer/i.test(type)) {
            reader.readAsArrayBuffer(file);
        } else if (/dataurl/i.test(type)) {
            reader.readAsDataURL(file);
        } else if (/text/i.test(type)) {
            reader.readAsText(file, 'UTF-8');
        }
    };

    /**
     * This class (static) method gets the instance of File (extends Blob).
     * @param {Event} event This argument is the instance of Event by Drag & Drop or "<input type="file">".
     * @param {string} type This argument is one of 'ArrayBuffer', 'DataURL', 'Text'.
     * @param {function} successCallback This argument is invoked as next process when reading file is successful.
     * @param {function} errorCallback This argument is invoked when reading file failed.
     * @param {function} progressCallback This argument is invoked as "onprogress" event handler in the instance of FileReader.
     * @return {File} This is returned as the instance of File (extends Blob).
     */
    var file = function(event, type, successCallback, errorCallback, progressCallback) {
        // The argument is associative array ?
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            var properties = arguments[0];

            if ('event'    in properties) {event            = properties.event;}
            if ('type'     in properties) {type             = properties.type;}
            if ('success'  in properties) {successCallback  = properties.success;}
            if ('error'    in properties) {errorCallback    = properties.error;}
            if ('progress' in properties) {progressCallback = properties.progress;}
        }

        if (!(event instanceof Event)) {
            return;
        }

        // for the instance of File (extends Blob)
        var file = null;

        if (event.type === 'drop') {
            // Drag & Drop
            event.stopPropagation();
            event.preventDefault();

            file = /*('items' in event.dataTransfer) ? event.dataTransfer.items[0].getAsFile() : */event.dataTransfer.files[0];
        } else if ((event.type === 'change') && ('files' in event.target)) {
            // <input type="file">
            file = event.target.files[0];
        } else {
            return;
        }

        if (!(file instanceof File)) {
            throw new Error('Please upload file.');
        } else if ((/text/i.test(type)) && (file.type.indexOf('text') === -1)) {
            throw new Error('Please upload text file.');
        } else if ((/arraybuffer|dataurl/i.test(type)) && (file.type.indexOf('audio') === -1)) {
            throw new Error('Please upload audio file.');
        } else {
            this.read({
                'file'    : file,
                'type'    : type,
                'success' : successCallback,
                'error'   : errorCallback,
                'progress': progressCallback
            });

            return file;
        }
    };

    /**
     * This class (static) method gets audio data as ArrayBuffer by Ajax.
     * @param {string} url This argument is URL for audio resource.
     * @param {number} timeout This argument is timeout of Ajax. The default value is 60000 msec (1 minutes).
     * @param {function} successCallback This argument is invoked as next process when reading file is successful.
     * @param {function} errorCallback This argument is invoked when error occurred.
     * @param {function} progressCallback This argument is invoked during receiving audio data.
     */
    var ajax = function(url, timeout, successCallback, errorCallback, progressCallback) {
        // The argument is associative array ?
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            var properties = arguments[0];

            if ('url'      in properties) {url              = properties.url;}
            if ('timeout'  in properties) {timeout          = properties.timeout;}
            if ('success'  in properties) {successCallback  = properties.success;}
            if ('error'    in properties) {errorCallback    = properties.error;}
            if ('progress' in properties) {progressCallback = properties.progress;}
        }

        // for errorCallback
        var ERROR_AJAX         = 'error';
        var ERROR_AJAX_TIMEOUT = 'timeout';

        var xhr = new XMLHttpRequest();

        var t = parseInt(timeout);

        xhr.timeout = (t > 0) ? t : 60000;

        xhr.ontimeout = function(event) {
            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(event, ERROR_AJAX_TIMEOUT);
            }
        };

        xhr.onprogress = function(event) {
            if (Object.prototype.toString.call(progressCallback) === '[object Function]') {
                progressCallback(event);
            }
        };

        xhr.onerror = function(event) {
            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(event, ERROR_AJAX);
            }
        };

        xhr.onload = function(event) {
            if (xhr.status === 200) {
                var arrayBuffer = xhr.response;

                if ((arrayBuffer instanceof ArrayBuffer) && (Object.prototype.toString.call(successCallback) === '[object Function]')) {
                    successCallback(event, arrayBuffer);
                }
            }
        };

        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';  // XMLHttpRequest Level 2
        xhr.send(null);
    };

    /**
     * This class (static) method creates the instance of AudioBuffer from ArrayBuffer.
     * @param {AudioContext} context This argument is the instance of AudioContext for "decodeAudioData" method.
     * @param {ArrayBuffer} arrayBuffer This argument is converted to the instance of AudioBuffer.
     * @param {function} successCallback This argument is invoked when "decodeAudioData" method is successful.
           The 1st argument in this callback function is the instance of AudioBuffer.
     * @param {function} errorCallback This argument is invoked when "decodeAudioData" method failed.
     * @return {Promise} This is returned as Promise.
     */
    var decode = function(context, arrayBuffer, successCallback, errorCallback) {
        if (!(context instanceof AudioContext)) {
            return;
        }

        if (!(arrayBuffer instanceof ArrayBuffer)) {
            return;
        }

        if (Object.prototype.toString.call(successCallback) !== '[object Function]') {
            successCallback = function() {};
        }

        if (Object.prototype.toString.call(errorCallback) !== '[object Function]') {
            errorCallback = function() {};
        }

        return context.decodeAudioData(arrayBuffer, successCallback, errorCallback);
    };

    /**
     * This class (static) method calculates frequency from the index that corresponds to the 12 equal temperament.
     * @param {Array.<number>} indexes This argument is array of index that corresponds to the 12 equal temperament.
     *     For example, This value is between 0 and 88 in the case of piano.
     * @return {Array.<number>} This is returned as array that contains frequencies.
     */
    var toFrequencies = function(indexes) {
        // The 12 equal temperament
        //
        // Min -> 27.5 Hz (A), Max -> 4186 Hz (C)
        //
        // A * 1.059463 -> A# (half up)

        var FREQUENCY_RATIO = Math.pow(2, (1 / 12));  // about 1.059463
        var MIN_A           = 27.5;

        if (!Array.isArray(indexes)) {
            indexes = [indexes];
        }

        var frequencies = new Array(indexes.length);

        for (var i = 0, len = indexes.length; i < len; i ++) {
            var index = parseInt(indexes[i]);

            frequencies[i] = (index >= 0) ? (MIN_A * Math.pow(FREQUENCY_RATIO, index)) : 0;
        }

        return frequencies;
    };

    /**
     * This class (static) method calculates minutes and seconds from the designated time in seconds.
     * @param {number} time This argument is the time in seconds.
     * @return {object} This is returned as associative array that contains "minutes", "seconds" and "milliseconds" keys.
     */
    var convertTime = function(time) {
        var t = parseFloat(time);

        if (t >= 0) {
            var m  = Math.floor(t / 60);
            var s  = Math.floor(t % 60);
            var ms = t - parseInt(t);

            return {
                'minutes'     : m,
                'seconds'     : s,
                'milliseconds': ms
            };
        }
    };

    /**
     * This class (static) method shows the designated Element in full screen.
     * @param {Element} element This argument is the instance of Element that is the target of full screen.
     */
    var fullscreen = function(element) {
        if (!(element instanceof Element)) {
            return;
        }

        if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.requestFullscreen) {
            element.requestFullscreen();
        } else {
            throw new Error('Cannot change to full screen.');
        }
    };

    /**
     * This class (method) shows Element in original size from full screen.
     */
    var exitFullscreen = function() {
        if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        } else {
            throw new Error('Cannot exit from full screen.');
        }
    };

    /**
     * This class (static) method removes one of the global objects or both of the global objects.
     * @param {boolean} deep This argument is in order to select whether removing both of global objects.
     *     If this value is true, both of global objects are removed.
     * @return {XSound}
     */
    var noConflict = function(deep) {
        if (global.X === XSound) {
            global.X = undefined;
        }

        // both of global objects are removed ?
        if (deep && (global.XSound === XSound)) {
            global.XSound = undefined;
        }

        return XSound;
    };

    /**
     * This class is fallback for MediaModule.
     * Namely, even if browser cannot use MediaElementAudioSourceNode, HTMLMediaElement can be used by the same methods of MediaModule.
     * Therefore, it is not necessary that the users of this class consider to use either Web Audio API or HTMLMediaElement.
     * @constructor
     */
    function MediaFallbackModule() {
        this.media = null;  // for the instance of HTMLMediaElement
        this.ext   = ''  ;  // 'wav', 'ogg', 'mp3, 'webm', 'ogv', 'mp4' ...etc

        this.duration     = 0;
        this.volume       = 1;
        this.playbackRate = 1;
        this.controls     = false;
        this.loop         = false;
        this.muted        = false;

        // The keys are the event interfaces that are defined by HTMLMediaElement.
        // For example, "loadstart", "loadedmetadata", "loadeddata", "canplay", "canplaythrough", "timeupdate", "ended" ...etc
        this.listeners = {};
    }

    /**
     * Class (Static) properties
     */
    MediaFallbackModule.TYPES       = {};
    MediaFallbackModule.TYPES.AUDIO = 'audio';
    MediaFallbackModule.TYPES.VIDEO = 'video';

    /**
     * This method gets HTMLMediaElement and selects media format. In addition, this method adds event listeners that are defined by HTMLMediaElement.
     * @param {HTMLAudioElement|HTMLVideoElement} media This argument is either HTMLAudioElement or HTMLVideoElement.
     * @param {Array.<string>|string} formats This argument is usable media format. For example, 'wav', 'ogg', 'webm', 'mp4' ...etc.
     * @param {object} listeners This argument is event listeners that are defined by HTMLMediaElement.
     * @return {MediaFallbackModule} This is returned for method chain.
     */
    MediaFallbackModule.prototype.setup = function(media, formats, listeners) {
        // The argument is associative array ?
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            var properties = arguments[0];

            if ('media'     in properties) {media     = properties.media;}
            if ('formats'   in properties) {formats   = properties.formats;}
            if ('listeners' in properties) {listeners = properties.listeners;}
        }

        var type = '';

        if (media instanceof HTMLAudioElement) {
            type = MediaFallbackModule.TYPES.AUDIO;
        } else if (media instanceof HTMLVideoElement) {
            type = MediaFallbackModule.TYPES.VIDEO;
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

        this.media.addEventListener('loadedmetadata', function(event) {
            self.duration = this.duration;

            if ('loadedmetadata' in self.listeners) {
                self.listeners.loadedmetadata(event);
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
     * @return {number|boolean|MediaFallbackModule} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     */
    MediaFallbackModule.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'mastervolume':
                    if (value === undefined) {
                        // Getter
                        return (this.media instanceof HTMLMediaElement) ? this.media.volume : this.volume;
                    } else {
                        // Setter
                        var v   = parseFloat(value);
                        var min = 0;
                        var max = 1;

                        if ((v >= min) && (v <= max)) {
                            if (this.media instanceof HTMLMediaElement) {
                                this.media.volume = v;
                            }

                            this.volume = v;
                        }
                    }

                    break;
                case 'playbackrate':
                    if (value === undefined) {
                        // Getter
                        return (this.media instanceof HTMLMediaElement) ? this.media.playbackRate : this.playbackRate;
                    } else {
                        // Setter
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
                        // Getter
                        return (this.media instanceof HTMLMediaElement) ? this.media.currentTime : 0;
                    } else {
                        // Setter
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
                        // Getter
                        return (this.media instanceof HTMLMediaElement) ? this.media[k] : this[k];
                    } else {
                        // Setter
                        if (this.media instanceof HTMLMediaElement) {
                            this.media[k] = Boolean(value);
                        }

                        this[k] = Boolean(value);
                    }

                    break;
                case 'width' :
                case 'height':
                    if (value === undefined) {
                        // Getter
                        return (this.media instanceof HTMLVideoElement) ? this.media[k] : 0;
                    } else {
                        // Setter
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
                    return;  // for MediaModule
                default:
                    break;
            }
        }

        return this;
    };

    /**
     * This method prepares for playing the media anytime after loading the media resource.
     * @param {string} source This argument is path name or Data URL or Object URL for the media resource.
     * @return {MediaFallbackModule} This is returned for method chain.
     */
    MediaFallbackModule.prototype.ready = function(source) {
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
     * @return {MediaFallbackModule} This is returned for method chain.
     */
    MediaFallbackModule.prototype.start = function(position) {
        if ((this.media instanceof HTMLMediaElement) && this.media.paused) {
            this.media.play();

            var pos = parseFloat(position);

            this.media.currentTime  = ((pos >= 0) && (pos <= this.duration)) ? pos : 0;
            this.media.playbackRate = this.playbackRate;
            this.media.controls     = this.controls;
            this.media.loop         = this.loop;
            this.media.muted        = this.muted;
        }

        return this;
    };

    /**
     * This method stops media.
     * @return {MediaFallbackModule} This is returned for method chain.
     */
    MediaFallbackModule.prototype.stop = function() {
        if ((this.media instanceof HTMLMediaElement) && !this.media.paused) {
            this.media.pause();
        }

        return this;
    };

    /**
     * This method gets the instance of HTMLMediaElement.
     * @return {HTMLMediaElement}
     */
    MediaFallbackModule.prototype.get = function() {
        return this.media;
    };

    /**
     * This method starts or stops media according to media state.
     * @param {number} position This argument is time that media is started at.
     * @return {MediaFallbackModule} This is returned for method chain.
     */
    MediaFallbackModule.prototype.toggle = function(position) {
        if (this.media instanceof HTMLMediaElement) {
            if (this.media.paused) {
                this.start(position);
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
    MediaFallbackModule.prototype.isMedia = function() {
        return this.media instanceof HTMLMediaElement;
    };

    /**
     * This method is the same as "isMedia" method. This method is defined in order to use the same interface that is defined by MediaModule.
     * @return {boolean} If the instance of HTMLMediaElement already exists, this value is true. Otherwise, this value is false.
     */
    MediaFallbackModule.prototype.isSource = function() {
        return this.isMedia();
    };

    /**
     * This method determines whether the media is paused.
     * @return {boolean} If the media is paused or does not exists, this value is true. Otherwise, this value is false.
     */
    MediaFallbackModule.prototype.isPaused = function() {
        return (this.media instanceof HTMLMediaElement) ? this.media.paused : true;
    };

    /** @override */
    MediaFallbackModule.prototype.toString = function() {
        return '[MediaFallbackModule]';
    };

    ////////////////////////////////////////////////////////////////////////////////

    if (!IS_XSOUND) {
        // Internet Explorer

        var media = new MediaFallbackModule();

        /**
         * This function is global object for getting the instance of MediaFallbackModule.
         * @return {MediaFallbackModule}
         */
        XSound = function() {
            return media;
        };

        /**
         * Class (Static) properties
         */
        XSound.IS_XSOUND         = IS_XSOUND;
        XSound.SAMPLE_RATE       = null;
        XSound.NUMBER_OF_INPUTS  = null;
        XSound.NUMBER_OF_OUTPUTS = null;

        /**
         * Class (Static) methods
         */
        XSound.read           = read;
        XSound.file           = file;
        XSound.ajax           = ajax;
        XSound.decode         = decode;
        XSound.toFrequencies  = toFrequencies;
        XSound.convertTime    = convertTime;
        XSound.fullscreen     = fullscreen;
        XSound.exitFullscreen = exitFullscreen;
        XSound.noConflict     = noConflict;
        XSound.get            = function() {return null;};  // for defining the same interface
        XSound.getCurrentTime = function() {return 0;};     // for defining the same interface

        /**
         * This class (static) method returns function as closure for getter of cloned module.
         * @return {function} This is returned as closure for getter of cloned module.
         */
        XSound.clone = function() {
            // Closure
            return function() {
                return new MediaFallbackModule();
            };
        };

        /** @override */
        XSound.prototype.toString = function() {
            return '[XSound]';
        };

        // Export
        global.XSound = XSound;
        global.X      = XSound;  // Alias of XSound

        return;
    }

    // If the browser can use Web Audio API, the following code is executed.

    // Chrome, Opera, Firefox (Mac / Windows), Safari (Mac)
    global.AudioContext = global.AudioContext || global.webkitAudioContext;

    var audiocontext = new AudioContext();

    // for legacy browsers
    audiocontext.createScriptProcessor = audiocontext.createScriptProcessor || audiocontext.createJavaScriptNode;
    audiocontext.createGain            = audiocontext.createGain            || audiocontext.createGainNode;
    audiocontext.createDelay           = audiocontext.createDelay           || audiocontext.createDelayNode;
    audiocontext.createPeriodicWave    = audiocontext.createPeriodicWave    || audiocontext.createWaveTable;

    /**
     * This class is superclass that is the top in "xsound.js".
     * This library's users do not create the instance of SoundModule.
     * This class is used for inherit in subclass (OscillatorModule, OneshotModule, AudioModule, MediaModule, StreamModule, MixerModule).
     * Therefore, this class defines the common properties for each sound sources.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     *     This value is one of 256, 512, 1024, 2048, 4096, 8192, 16384.
     *     However, the opportunity for designating buffer size is not so much.
     *     The reason why is that the constructor of SoundModule selects buffer size automaticly.
     *     This buffer size can be changed explicitly by calling "resize" method.
     * @constructor
     */
    function SoundModule(context, bufferSize) {
        this.context = context;

        this.sampleRate = context.sampleRate;

        this.numberOfInputs  = 2;
        this.numberOfOutputs = 2;

        var userAgent = navigator.userAgent;

        if (bufferSize !== undefined) {
            switch (parseInt(bufferSize)) {
                case   256:
                case   512:
                case  1024:
                case  2048:
                case  4096:
                case  8192:
                case 16384:
                    this.bufferSize = parseInt(bufferSize);
                    break;
                default:
                    return;
            }
        } else if (/(Win(dows )?NT 6\.2)/.test(userAgent)) {
            this.bufferSize = 1024;  // Windows 8
        } else if (/(Win(dows )?NT 6\.1)/.test(userAgent)) {
            this.bufferSize = 1024;  // Windows 7
        } else if (/(Win(dows )?NT 6\.0)/.test(userAgent)) {
            this.bufferSize = 2048;  // Windows Vista
        } else if (/Win(dows )?(NT 5\.1|XP)/.test(userAgent)) {
            this.bufferSize = 4096;  // Windows XP
        } else if (/Mac|PPC/.test(userAgent)) {
            this.bufferSize = 1024;  // Mac OS X
        } else if (/Linux/.test(userAgent)) {
            this.bufferSize = 8192;  // Linux
        } else if (/iPhone|iPad|iPod/.test(userAgent)) {
            this.bufferSize = 2048;  // iOS
        } else {
            this.bufferSize = 16384;  // Otherwise
        }

        this.mastervolume = context.createGain();
        this.processor    = context.createScriptProcessor(this.bufferSize, SoundModule.NUMBER_OF_INPUTS, SoundModule.NUMBRE_OF_OUTPUTS);

        /** @implements {Statable} */
        Session.prototype  = Object.create(Statable.prototype);
        Effector.prototype = Object.create(Statable.prototype);

        Session.prototype.constructor  = Session;
        Effector.prototype.constructor = Effector;

        /** @extends {Effector} */
        Compressor.prototype         = Object.create(Effector.prototype);
        Distortion.prototype         = Object.create(Effector.prototype);
        Wah.prototype                = Object.create(Effector.prototype);
        Equalizer.prototype          = Object.create(Effector.prototype);
        Filter.prototype             = Object.create(Effector.prototype);
        Tremolo.prototype            = Object.create(Effector.prototype);
        Ringmodulator.prototype      = Object.create(Effector.prototype);
        Autopanner.prototype         = Object.create(Effector.prototype);
        AutopannerFallback.prototype = Object.create(Effector.prototype);
        Phaser.prototype             = Object.create(Effector.prototype);
        Flanger.prototype            = Object.create(Effector.prototype);
        Chorus.prototype             = Object.create(Effector.prototype);
        Delay.prototype              = Object.create(Effector.prototype);
        Reverb.prototype             = Object.create(Effector.prototype);
        Panner.prototype             = Object.create(Effector.prototype);

        Compressor.prototype.constructor         = Compressor;
        Distortion.prototype.constructor         = Distortion;
        Wah.prototype.constructor                = Wah;
        Equalizer.prototype.constructor          = Equalizer;
        Filter.prototype.constructor             = Filter;
        Tremolo.prototype.constructor            = Tremolo;
        Ringmodulator.prototype.constructor      = Ringmodulator;
        Autopanner.prototype.constructor         = Autopanner;
        AutopannerFallback.prototype.constructor = AutopannerFallback;
        Phaser.prototype.constructor             = Phaser;
        Flanger.prototype.constructor            = Flanger;
        Chorus.prototype.constructor             = Chorus;
        Delay.prototype.constructor              = Delay;
        Reverb.prototype.constructor             = Reverb;
        Panner.prototype.constructor             = Panner;

        // for modules that user creates
        this.Effector = Effector;
        this.plugins  = [];

        /**
         * This private class manages 4 private classes (Visualizer, TimeOverview, Time, FFT) for drawing sound wave.
         * @param {AudioContext} context This argument is This argument is in order to use the interfaces of Web Audio API.
         * @constructor
         */
        function Analyser(context) {
            global.requestAnimationFrame = global.requestAnimationFrame       ||
                                           global.webkitRequestAnimationFrame ||
                                           global.mozRequestAnimationFrame    ||
                                           function(callback) {
                                               global.setTimeout(callback, (1000 / 60));
                                           };

            global.cancelAnimationFrame = global.cancelAnimationFrame       ||
                                          global.webkitCancelAnimationFrame ||
                                          global.mozCancelAnimationFrame    ||
                                          global.clearTimeout;

            this.analyser = context.createAnalyser();
            this.input    = context.createGain();
            this.output   = context.createGain();

            // GainNode (Input) -> AnalyserNode -> GainNode (Output)
            this.input.connect(this.analyser);
            this.analyser.connect(this.output);

            /** @implements {Statable} */
            Visualizer.prototype = Object.create(Statable.prototype);
            Visualizer.prototype.constructor = Visualizer;

            /** @extends {Visualizer} */
            TimeOverview.prototype = Object.create(Visualizer.prototype);  // The purpose of "Object.create" is that the inherited instance is not shared in the instances of subclass
            Time.prototype         = Object.create(Visualizer.prototype);
            FFT.prototype          = Object.create(Visualizer.prototype);

            TimeOverview.prototype.constructor = TimeOverview;
            Time.prototype.constructor         = Time;
            FFT.prototype.constructor          = FFT;

            // Set default value
            this.analyser.fftSize               = 2048;
            this.analyser.minDecibels           = -100;
            this.analyser.maxDecibels           = -30;
            this.analyser.smoothingTimeConstant = 0.8;

            /**
             * This private class defines the properties that subclasses (TimeOverview, Time, FFT) require.
             * @param {number} sampleRate This argument is sample rate.
             * @constructor
             * @implements {Statable}
             */
            function Visualizer(sampleRate) {
                // Call interface constructor
                Statable.call(this);

                this.isActive = false;

                this.sampleRate = sampleRate;

                // either 'canvas' or 'svg'
                this.graphics = '';

                // in the case of using HTML5 Canvas
                this.canvas  = null;
                this.context = null;

                // in the case of using HTML5 SVG
                this.svg = null;

                // for timer
                this.interval = 1000;
                this.timerid  = null;

                this.styles = {
                    'shape' : 'line',
                    'grad'  : [
                        {'offset': 0, 'color': 'rgba(0, 128, 255, 1.0)'},
                        {'offset': 1, 'color': 'rgba(0,   0, 255, 1.0)'}
                    ],
                    'wave'  : 'rgba(0, 0, 255, 1.0)',
                    'grid'  : 'rgba(255, 0, 0, 1.0)',
                    'text'  : 'rgba(255, 255, 255, 1.0)',
                    'font'  : {
                        'family': 'Arial',
                        'size'  : '13px',
                        'style' : 'normal',
                        'weight': 'normal'
                    },
                    'width' : 1.5,
                    'cap'   : 'round',
                    'join'  : 'miter',
                    'top'   : 15,
                    'right' : 30,
                    'bottom': 15,
                    'left'  : 30
                };
            }

            /**
             * Class (Static) properties
             */
            Visualizer.GRAPHICS        = {};
            Visualizer.GRAPHICS.CANVAS = 'canvas';
            Visualizer.GRAPHICS.SVG    = 'svg';

            Visualizer.XMLNS = 'http://www.w3.org/2000/svg';
            Visualizer.XLINK = 'http://www.w3.org/1999/xlink';

            Visualizer.SVG_LINEAR_GRADIENT_IDS               = {};
            Visualizer.SVG_LINEAR_GRADIENT_IDS.TIME_OVERVIEW = 'svg-linear-gradient-time-overview';
            Visualizer.SVG_LINEAR_GRADIENT_IDS.TIME          = 'svg-linear-gradient-time';
            Visualizer.SVG_LINEAR_GRADIENT_IDS.FFT           = 'svg-linear-gradient-fft';

            /**
             * This method sets up for using Canvas or SVG.
             * @param {HTMLCanvasElement|SVGElement} element This argument is either HTMLCanvasElement or SVGElement.
             * @return {Visualizer} This is returned for method chain.
             */
            Visualizer.prototype.setup = function(element) {
                if (element instanceof HTMLCanvasElement) {
                    this.graphics = Visualizer.GRAPHICS.CANVAS;
                    this.canvas   = element;
                    this.context  = this.canvas.getContext('2d');
                } else if (element instanceof SVGElement) {
                    this.graphics = Visualizer.GRAPHICS.SVG;
                    this.svg      = element;

                    this.svg.setAttribute('xmlns',       Visualizer.XMLNS);
                    this.svg.setAttribute('xmlns:xlink', Visualizer.XLINK);
                }

                return this;
            };

            /**
             * This method is getter or setter for parameters.
             * @param {string|object} key This argument is property name in the case of string type.
             *     This argument is pair of property and value in the case of associative array.
             * @param {string|number|Array.<object>} value This argument is the value of designated property. If this argument is omitted, This method is getter.
             * @return {string|number|Array.<object>} This is returned as the value of designated property in the case of getter.
             */
            Visualizer.prototype.param = function(key, value) {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'interval':
                        if (value === undefined) {
                            // Getter
                            return this.interval;
                        } else {
                            // Setter
                            if (String(value).toLowerCase() === 'auto') {
                                this.interval = 'auto';
                            } else {
                                var v = parseFloat(value);

                                if (v >= 0) {
                                    this.interval = v;
                                }
                            }
                        }

                        break;
                    case 'shape':
                        if (value === undefined) {
                            // Getter
                            return this.styles.shape;
                        } else {
                            // Setter
                            var v = String(value).toLowerCase();

                            if ((v === 'line') || (v === 'rect')) {
                                this.styles.shape = (this.styles.wave !== 'gradient') ? v : 'rect';
                            }
                        }

                        break;
                    case 'grad':
                        if (value === undefined) {
                            // Getter
                            return this.styles.grad;
                        } else {
                            // Setter
                            if (!Array.isArray(value)) {
                                value = [value];
                            }

                            var isError = false;

                            for (var i = 0, len = value.length; i < len; i++) {
                                var grads = value[i];

                                if (('offset' in grads) && ('color' in grads)) {
                                    var offset = parseFloat(grads.offset);

                                    if (isNaN(offset) || (offset < 0) || (offset > 1)) {
                                        isError = true;
                                        break;
                                    }
                                } else {
                                    isError = true;
                                    break;
                                }
                            }

                            if (!isError) {
                                this.styles.grad = value;
                            }
                        }

                        break;
                    case 'font':
                        if (value === undefined) {
                            return this.styles[k];
                        } else {
                            // Setter
                            if (Object.prototype.toString.call(value) === '[object Object]') {
                                for (var prop in value) {
                                    if (/family|size|style|weight/i.test(prop)) {
                                        this.styles['font'][prop] = String(value[prop]);
                                    }
                                }
                            }
                        }

                        break;
                    case 'wave':
                    case 'grid':
                    case 'text':
                    case 'cap' :
                    case 'join':
                        if (value === undefined) {
                            // Getter
                            return this.styles[k];
                        } else {
                            // Setter
                            if (Object.prototype.toString.call(value) === '[object String]') {
                                if ((k === 'wave') && (value === 'gradient')) {
                                    this.styles.shape = 'rect';
                                }

                                this.styles[k] = value.toLowerCase();
                            }
                        }

                        break;
                    case 'width' :
                    case 'top'   :
                    case 'right' :
                    case 'bottom':
                    case 'left'  :
                        if (value === undefined) {
                            // Getter
                            return this.styles[k];
                        } else {
                            // Setter
                            var v = (k === 'width') ? parseFloat(value) : parseInt(value);

                            if (v >= 0) {
                                this.styles[k] = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            };

            /**
             * This method draws sound wave to Canvas or SVG. This method conceals difference of API for drawing.
             * @param {Uint8Array|Float32Array} data This argument is data for drawing.
             * @param {number} minDecibels This argument is parameter for spectrum. The default value is -100 dB.
             * @param {number} maxDecibels This argument is parameter for spectrum. The default value is -30 dB.
             * @return {Visualizer} This is returned for method chain.
             */
            Visualizer.prototype.start = function(data, minDecibels, maxDecibels) {
                switch (this.graphics) {
                    case Visualizer.GRAPHICS.CANVAS:
                        this.drawToCanvas(data, minDecibels, maxDecibels);
                        break;
                    case Visualizer.GRAPHICS.SVG:
                        this.drawToSVG(data, minDecibels, maxDecibels);
                        break;
                    default:
                        break;
                }

                return this;
            };

            /**
             * This method creates string for Data URL or HTML for the drawn figure.
             * @return {string|Visualizer} This is returned as Data URL or HTML string. If "setup" method has not been invoked, this is returned for method chain.
             */
            Visualizer.prototype.create = function() {
                switch (this.graphics) {
                    case Visualizer.GRAPHICS.CANVAS:
                        return this.canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                    case Visualizer.GRAPHICS.SVG:
                        return this.svg.outerHTML;
                    default:
                        return this;
                }
            };

            /** @override */
            Visualizer.prototype.state = function(state) {
                if (state === undefined) {
                    return this.isActive;  // Getter
                } else if (String(state).toLowerCase() === 'toggle') {
                    this.isActive = !this.isActive;  // Setter
                } else {
                    this.isActive = Boolean(state);  // Setter
                }

                // in the case of setter
                return this;
            };

            /**
             * This method draws time domain data of Float32Array to Canvas.
             * @param {CanvasRenderingContext2D} context This argument is the instance of CanvasRenderingContext2D.
             * @param {Float32Array} data This argument is time domain data.
             * @param {number} innerWidth This argument is the width of drawing area.
             * @param {number} innerHeight This argument is the height of drawing area.
             * @param {number} middle This argument is the middle of drawn area.
             * @param {number} nPlotinterval This argument is the interval of drawing.
             */
            Visualizer.prototype.drawTimeDomainFloat32ArrayToCanvas = function(context, data, innerWidth, innerHeight, middle, nPlotinterval) {
                if (!(context instanceof CanvasRenderingContext2D)) {
                    return this;
                }

                if (!(data instanceof Float32Array)) {
                    return this;
                }

                var x = 0;
                var y = 0;

                var w = parseInt(innerWidth);
                var h = parseInt(innerHeight);
                var m = parseInt(middle);

                if (isNaN(w)) {w = 0;}
                if (isNaN(h)) {h = 0;}
                if (isNaN(m)) {m = 0;}

                // Begin drawing
                switch (this.styles.shape) {
                    case 'line':
                        // Set style
                        context.strokeStyle = this.styles.wave;
                        context.lineWidth   = this.styles.width;
                        context.lineCap     = this.styles.cap;
                        context.lineJoin    = this.styles.join;

                        // Draw wave
                        context.beginPath();

                        for (var i = 0, len = data.length; i < len; i++) {
                            if ((nPlotinterval === undefined) || ((i % nPlotinterval) === 0)) {
                                x = Math.floor((i / len) * w) + this.styles.left;
                                y = Math.floor((1 - data[i]) * (h / 2)) + this.styles.top;

                                if (i === 0) {
                                    context.moveTo((x + (this.styles.width / 2)),  y);
                                } else {
                                    context.lineTo(x, y);
                                }
                            }
                        }

                        context.stroke();

                        break;
                    case 'rect':
                       // Set style
                       if (this.styles.wave !== 'gradient') {
                           context.fillStyle = this.styles.wave;
                       }

                        // Draw wave
                        for (var i = 0, len = data.length; i < len; i++) {
                            if ((nPlotinterval === undefined) || ((i % nPlotinterval) === 0)) {
                                x = Math.floor((i / len) * w) + this.styles.left;
                                y = -1 * Math.floor(data[i] * (h / 2));

                               // Set style
                               if (this.styles.wave === 'gradient') {
                                    var upside   = (innerHeight / 2) + this.styles.top;
                                    var gradient = context.createLinearGradient(0 , upside, 0, (upside + y));

                                    for (var j = 0, num = this.styles.grad.length; j < num; j++) {
                                        var gradients = this.styles.grad[j];

                                        gradient.addColorStop(gradients.offset, gradients.color);
                                    }

                                    context.fillStyle = gradient;
                                }

                                context.fillRect(x, m, this.styles.width, y);
                            }
                        }

                        break;
                    default:
                        break;
                }

                return this;
            };

            /**
             * This method draws time domain data of Float32Array to SVG.
             * @param {Float32Array} data This argument is time domain data.
             * @param {number} innerWidth This argument is the width of drawing area.
             * @param {number} innerHeight This argument is the height of drawing area.
             * @param {number} middle This argument is the middle of drawn area.
             * @param {number} nPlotinterval This argument is the interval of drawing.
             * @param {string} linearGradientId This argument is id attribute for SVGLinearGradientElement.
             * @return {SVGPathElement|SVGGElement} This is returned as SVGElement.
             */
            Visualizer.prototype.drawTimeDomainFloat32ArrayToSVG = function(data, innerWidth, innerHeight, middle, nPlotinterval, linearGradientId) {
                var x = 0;
                var y = 0;

                var w = parseInt(innerWidth);
                var h = parseInt(innerHeight);
                var m = parseInt(middle);

                if (isNaN(w)) {w = 0;}
                if (isNaN(h)) {h = 0;}
                if (isNaN(m)) {m = 0;}

                switch (this.styles.shape) {
                    case 'line':
                        // Draw wave
                        var path = document.createElementNS(Visualizer.XMLNS, 'path');

                        var d = '';

                        for (var i = 0, len = data.length; i < len; i++) {
                            if ((nPlotinterval === undefined) || ((i % nPlotinterval) === 0)) {
                                x = Math.floor((i / len) * w) + this.styles.left;
                                y = Math.floor((1 - data[i]) * (h / 2)) + this.styles.top;

                                if (i === 0) {
                                    d += 'M' + (x + (this.styles.width / 2)) + ' ' + y;
                                } else {
                                    d += ' ';
                                    d += 'L' + x + ' ' + y;
                                }
                            }
                        }

                        path.setAttribute('d', d);

                        path.setAttribute('stroke',          this.styles.wave);
                        path.setAttribute('fill',            'none');
                        path.setAttribute('stroke-width',    this.styles.width);
                        path.setAttribute('stroke-linecap',  this.styles.cap);
                        path.setAttribute('stroke-linejoin', this.styles.join);

                        return path;
                    case 'rect':
                        var defs = null;

                        if (this.styles.wave === 'gradient') {
                            defs = this.createSVGLinearGradient(linearGradientId);
                        }

                        // Draw wave
                        var g = document.createElementNS(Visualizer.XMLNS, 'g');

                        if (defs !== null) {
                            g.appendChild(defs);
                        }

                        for (var i = 0, len = data.length; i < len; i++) {
                            if ((nPlotinterval === undefined) || ((i % nPlotinterval) === 0)) {
                                var rect = document.createElementNS(Visualizer.XMLNS, 'rect');

                                x = Math.floor((i / len) * w) + this.styles.left;
                                y = Math.floor(data[i] * (innerHeight / 2));

                                rect.setAttribute('x',     x);
                                rect.setAttribute('y',     m);
                                rect.setAttribute('width', this.styles.width);

                                if (y < 0) {
                                    rect.setAttribute('height', -y);
                                } else {
                                    rect.setAttribute('height',    y);
                                    rect.setAttribute('transform', 'rotate(180 ' + (x + (this.styles.width / 2)) + ' ' + m + ')');
                                }

                                rect.setAttribute('stroke', 'none');
                                rect.setAttribute('fill',   (defs === null) ? this.styles.wave : ('url(#' + linearGradientId + ')'));

                                g.appendChild(rect);
                            }
                        }

                        return g;
                    default:
                        return null;
                }
            };

            /**
             * This method creates elements for SVG linear gradient.
             * @param {string} linearGradientId This argument is id attribute for SVGLinearGradientElement.
             * @return {SVGDefsElement} This is returned as the instance of SVGDefsElement.
             */
            Visualizer.prototype.createSVGLinearGradient = function(linearGradientId) {
                var defs           = document.createElementNS(Visualizer.XMLNS, 'defs');
                var linearGradient = document.createElementNS(Visualizer.XMLNS, 'linearGradient');

                linearGradient.setAttribute('id', String(linearGradientId));
                linearGradient.setAttribute('x1', '0%');
                linearGradient.setAttribute('y1', '0%');
                linearGradient.setAttribute('x2', '0%');
                linearGradient.setAttribute('y2', '100%');

                for (var i = 0, len = this.styles.grad.length; i < len; i++) {
                    var stop      = document.createElementNS(Visualizer.XMLNS, 'stop');
                    var gradients = this.styles.grad[i];

                    stop.setAttribute('offset',     gradients.offset);
                    stop.setAttribute('stop-color', gradients.color);

                    linearGradient.appendChild(stop);
                }

                defs.appendChild(linearGradient);

                return defs;
            };

            /**
             * This method creates string for font.
             * @return {string} This is returned as string for font.
             */
            Visualizer.prototype.createFontString = function() {
                return this.styles.font.size + ' ' + this.styles.font.style + ' ' + this.styles.font.weight + ' "' + this.styles.font.family + '"';
            };

            /** @abstract */
            Visualizer.prototype.drawToCanvas = function(data) {
            };

            /** @abstract */
            Visualizer.prototype.drawToSVG = function(data) {
            };

            /** @override */
            Visualizer.prototype.toString = function() {
                return '[SoundModule Analyser Visualizer]';
            };

            /**
             * This private class defines properties for drawing audio wave in overview of time domain.
             * @param {number} sampleRate This argument is sample rate.
             * @constructor
             * @extends {Visualizer}
             */
            function TimeOverview(sampleRate) {
                Visualizer.call(this, sampleRate);

                // for TimeOverview.prototype.update, TimeOverview.prototype.drag
                this.savedImage = null;
                this.length     = 0;

                this.currentTime  = 'rgba(255, 255, 255, 1.0)';  // This style is used for the rectangle that displays current time of audio
                this.plotInterval = 0.0625;                      // Draw wave at intervals of this value [sec]
                this.textInterval = 60;                          // Draw text at intervals of this value [sec]
            }

            /** @override */
            TimeOverview.prototype.param = function(key, value) {
                if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                    // Associative array
                    for (var k in arguments[0]) {
                        this.param(k, arguments[0][k]);
                    }
                } else {
                    var k = String(key).replace(/-/g, '').toLowerCase();

                    var r = Visualizer.prototype.param.call(this, k, value);

                    if (r !== undefined) {
                        // Getter
                        return r;
                    } else {
                        switch (k) {
                            case 'currenttime':
                                if (value === undefined) {
                                    // Getter
                                    return this.currentTime;
                                } else {
                                    // Setter
                                    this.currentTime = String(value).toLowerCase();
                                }

                                break;
                            case 'plotinterval':
                            case 'textinterval':
                                if (value === undefined) {
                                    // Getter
                                    return this[k.replace('interval', 'Interval')];
                                } else {
                                    // Setter
                                    var v = parseFloat(value);

                                    if (v > 0) {
                                        this[k.replace('interval', 'Interval')] = v;
                                    }
                                }

                                break;
                            default:
                                break;
                        }
                    }
                }

                return this;
            };

            /**
             * This method draws audio wave in overview of time domain to Canvas.
             * @param {Float32Array} data This argument is data for drawing.
             * @return {TimeOverview} This is returned for method chain.
             * @override
             */
            TimeOverview.prototype.drawToCanvas = function(data) {
                if (!((this.canvas instanceof HTMLCanvasElement) && this.isActive)) {
                    return this;
                }

                var context = this.context;

                var width       = this.canvas.width;
                var height      = this.canvas.height;
                var innerWidth  = width  - (this.styles.left + this.styles.right);
                var innerHeight = height - (this.styles.top  + this.styles.bottom);
                var middle      = Math.floor(innerHeight / 2) + this.styles.top;

                var x = 0;
                var y = 0;
                var t = '';

                // Draw wave at intervals of "this.plotInterval"
                var nPlotinterval = Math.floor(this.plotInterval * this.sampleRate);

                // Draw text at intervals of "this.textInterval"
                var nTextinterval = Math.floor(this.textInterval * this.sampleRate);

                // Erase previous wave
                context.clearRect(0, 0, width, height);

                // Begin drawing
                this.drawTimeDomainFloat32ArrayToCanvas(context, data, innerWidth, innerHeight, middle, nPlotinterval);

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    // Draw grid and text (X axis)
                    for (var i = 0, len = data.length; i < len; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            t = Math.floor((i / this.sampleRate) / 60) + ' min';

                            // Draw grid
                            if (this.styles.grid !== 'none') {
                                context.fillStyle = this.styles.grid;
                                context.fillRect(x, this.styles.top, 1, innerHeight);
                            }

                            // Draw text
                            if (this.styles.text !== 'none') {
                                context.fillStyle = this.styles.text;
                                context.font      = this.createFontString();
                                context.fillText(t, (x - (context.measureText(t).width / 2)), (this.styles.top + innerHeight + parseInt(this.styles.font.size)));
                            }
                        }
                    }

                    // Draw grid and text (Y axis)
                    var texts = ['-1.00', '-0.50', ' 0.00', ' 0.50', ' 1.00'];

                    for (var i = 0, len = texts.length; i < len; i++) {
                        t = texts[i];
                        x = Math.floor(this.styles.left - context.measureText(t).width);
                        y = Math.floor((1 - parseFloat(t.trim())) * (innerHeight / 2)) + this.styles.top;

                        // Draw grid
                        if (this.styles.grid !== 'none') {
                            context.fillStyle = this.styles.grid;
                            context.fillRect(this.styles.left, y, innerWidth, 1);
                        }

                        y -= Math.floor(parseInt(this.styles.font.size) / 4);

                        // Draw text
                        if (this.styles.text !== 'none') {
                            context.fillStyle = this.styles.text;
                            context.font      = this.createFontString();
                            context.fillText(t, x, y);
                        }
                    }
                }

                // for TimeOverview.prototype.update, TimeOverview.prototype.drag
                this.savedImage = context.getImageData(0, 0, width, height);
                this.length     = data.length;

                // This rectangle displays current time of audio
                context.fillStyle = this.currentTime;
                context.fillRect(this.styles.left, this.styles.top, 1, innerHeight);

                return this;
            };

            /**
             * This method draws audio wave in overview of time domain to SVG.
             * @param {Float32Array} data This argument is data for drawing.
             * @return {TimeOverview} This is returned for method chain.
             * @override
             */
            TimeOverview.prototype.drawToSVG = function(data) {
                if (!((this.svg instanceof SVGElement) && this.isActive)) {
                    return this;
                }

                var svg = this.svg;

                var width       = parseInt(this.svg.getAttribute('width'));
                var height      = parseInt(this.svg.getAttribute('height'));
                var innerWidth  = width  - (this.styles.left + this.styles.right);
                var innerHeight = height - (this.styles.top  + this.styles.bottom);
                var middle      = Math.floor(innerHeight / 2) + this.styles.top;

                var x = 0;
                var y = 0;
                var t = '';

                // Draw wave at intervals of "this.plotInterval"
                var nPlotinterval = Math.floor(this.plotInterval * this.sampleRate);

                // Draw text at intervals of "this.textInterval"
                var nTextinterval = Math.floor(this.textInterval * this.sampleRate);

                // Erase previous wave
                svg.innerHTML = '';

                // Begin drawing
                svg.appendChild(this.drawTimeDomainFloat32ArrayToSVG(data, innerWidth, innerHeight, middle, nPlotinterval, Visualizer.SVG_LINEAR_GRADIENT_IDS.TIME_OVERVIEW));

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    // Draw grid and text (X axis)
                    for (var i = 0, len = data.length; i < len; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            t = Math.floor((i / this.sampleRate) / 60) + ' min';

                            // Draw grid
                            if (this.styles.grid !== 'none') {
                                var rect = document.createElementNS(Visualizer.XMLNS, 'rect');

                                rect.setAttribute('x',      x);
                                rect.setAttribute('y',      this.styles.top);
                                rect.setAttribute('width',  1);
                                rect.setAttribute('height', innerHeight);

                                rect.setAttribute('stroke', 'none');
                                rect.setAttribute('fill',   this.styles.grid);

                                svg.appendChild(rect);
                            }

                            // Draw text
                            if (this.styles.text !== 'none') {
                                var text = document.createElementNS(Visualizer.XMLNS, 'text');

                                text.textContent = t;

                                text.setAttribute('x', x);
                                text.setAttribute('y', (this.styles.top + innerHeight + parseInt(this.styles.font.size)));

                                text.setAttribute('text-anchor', 'middle');
                                text.setAttribute('stroke',      'none');
                                text.setAttribute('fill',        this.styles.text);
                                text.setAttribute('font-family', this.styles.font.family);
                                text.setAttribute('font-size',   this.styles.font.size);
                                text.setAttribute('font-style',  this.styles.font.style);
                                text.setAttribute('font-weight', this.styles.font.weight);

                                svg.appendChild(text);
                            }
                        }
                    }

                    // Draw grid and text (Y axis)
                    var texts = ['-1.00', '-0.50', ' 0.00', ' 0.50', ' 1.00'];

                    for (var i = 0, len = texts.length; i < len; i++) {
                        t = texts[i];
                        x = this.styles.left;
                        y = Math.floor((1 - parseFloat(t.trim())) * (innerHeight / 2)) + this.styles.top;

                        // Draw grid
                        if (this.styles.grid !== 'none') {
                            var rect = document.createElementNS(Visualizer.XMLNS, 'rect');

                            rect.setAttribute('x',      x);
                            rect.setAttribute('y',      y);
                            rect.setAttribute('width',  innerWidth);
                            rect.setAttribute('height', 1);

                            rect.setAttribute('stroke', 'none');
                            rect.setAttribute('fill',   this.styles.grid);

                            svg.appendChild(rect);
                        }

                        y -= Math.floor(parseInt(this.styles.font.size) / 4);

                        // Draw text
                        if (this.styles.text !== 'none') {
                            var text = document.createElementNS(Visualizer.XMLNS, 'text');

                            text.textContent = t;

                            text.setAttribute('x', x);
                            text.setAttribute('y', y);

                            text.setAttribute('text-anchor', 'end');
                            text.setAttribute('stroke',      'none');
                            text.setAttribute('fill',        this.styles.text);
                            text.setAttribute('font-family', this.styles.font.family);
                            text.setAttribute('font-size',   this.styles.font.size);
                            text.setAttribute('font-style',  this.styles.font.style);
                            text.setAttribute('font-weight', this.styles.font.weight);

                            svg.appendChild(text);
                        }
                    }
                }

                // This rectangle displays current time of audio
                var rect = document.createElementNS(Visualizer.XMLNS, 'rect');

                rect.setAttribute('class',  'svg-current-time');
                rect.setAttribute('x',      this.styles.left);
                rect.setAttribute('y',      this.styles.top);
                rect.setAttribute('width',  1);
                rect.setAttribute('height', innerHeight);

                rect.setAttribute('stroke', 'none');
                rect.setAttribute('fill',   this.currentTime);

                svg.appendChild(rect);

                // for TimeOverview.prototype.update, TimeOverview.prototype.drag
                this.savedImage = svg;
                this.length     = data.length;

                return this;
            };

            /**
             * This method draws current time of audio on Canvas or SVG.
             * @param {number} time This argument is current time of audio.
             * @return {TimeOverview} This is returned for method chain.
             */
            TimeOverview.prototype.update = function(time) {
                var t = parseFloat(time);

                if (isNaN(t) || (t < 0)) {
                    return;
                }

                var width       = 0;
                var height      = 0;
                var innerWidth  = 0;
                var innerHeight = 0;
                var x           = 0;

                switch (this.graphics) {
                    case Visualizer.GRAPHICS.CANVAS:
                        if (this.savedImage instanceof ImageData) {
                            var context = this.context;

                            width       = this.canvas.width;
                            height      = this.canvas.height;
                            innerWidth  = width  - (this.styles.left + this.styles.right);
                            innerHeight = height - (this.styles.top  + this.styles.bottom);
                            x           = Math.floor(((t * this.sampleRate) / this.length) * innerWidth) + this.styles.left;

                            context.clearRect(0, 0, width, height);
                            context.putImageData(this.savedImage, 0, 0);

                            context.fillStyle = this.currentTime;
                            context.fillRect(x, this.styles.top, 1, innerHeight);
                        }

                        break;
                    case Visualizer.GRAPHICS.SVG:
                        var svg = this.svg.querySelector('.svg-current-time');

                        if (svg instanceof SVGElement) {
                            width       = parseInt(this.svg.getAttribute('width'));
                            height      = parseInt(this.svg.getAttribute('height'));
                            innerWidth  = width  - (this.styles.left + this.styles.right);
                            innerHeight = height - (this.styles.top  + this.styles.bottom);
                            x           = Math.floor(((t * this.sampleRate) / this.length) * innerWidth);

                            svg.setAttribute('transform', ('translate(' + x + ' 0)'));
                        }

                        break;
                    default:
                        break;
                }

                return this;
            };

            /**
             * This method registers event listener for setting current time by drag.
             * @param {function} callback This argument is invoked when current time is changed.
             * @return {TimeOverview} This is returned for method chain.
             */
            TimeOverview.prototype.drag = function(callback) {
                var drawNode = null;
                var self     = this;

                var start = '';
                var move  = '';
                var end   = '';

                // Touch Panel ?
                if (/iPhone|iPad|iPod|Android/.test(navigator.userAgent)) {
                    start = 'touchstart';
                    move  = 'touchmove';
                    end   = 'touchend';
                } else {
                    start = 'mousedown';
                    move  = 'mousemove';
                    end   = 'mouseup';
                }

                switch (this.graphics) {
                    case Visualizer.GRAPHICS.CANVAS:
                        drawNode = this.canvas;
                        break;
                    case Visualizer.GRAPHICS.SVG:
                        drawNode = this.svg;
                        break;
                    default:
                        return;
                }

                var draw = function(offsetX) {
                    var offsetLeft = 0;
                    var width      = 0;

                    switch (self.graphics) {
                        case Visualizer.GRAPHICS.CANVAS:
                            offsetLeft = self.canvas.offsetLeft;
                            width      = self.canvas.width;
                            break;
                        case Visualizer.GRAPHICS.SVG:
                            offsetLeft = self.svg.parentNode.offsetLeft;
                            width      = parseInt(self.svg.getAttribute('width'));
                            break;
                        default:
                            break;
                    }

                    var x = offsetX - (offsetLeft + self.styles.left);

                    width -= (self.styles.left + self.styles.right);

                    // Exceed ?
                    if (x < 0)     {x = 0;}
                    if (x > width) {x = width;}

                    var plot = (x / width) * self.length;
                    var time = plot / self.sampleRate;

                    self.update(time);

                    if (Object.prototype.toString.call(callback) === '[object Function]') {
                        callback(time);
                    }
                };

                var getOffsetX = function(event) {
                    if (event.pageX) {
                        return event.pageX;
                    } else if (event.touches[0]) {
                        return event.touches[0].pageX;
                    }
                };

                var isDown = false;

                drawNode.addEventListener(start, function(event) {
                    draw(getOffsetX(event));
                    isDown = true;
                }, true);

                drawNode.addEventListener(move, function(event) {
                    if (isDown) {
                        event.preventDefault();  // for Touch Panel
                        draw(getOffsetX(event));
                    }
                }, true);

                global.addEventListener(end, function(event) {
                    if (isDown) {
                        isDown = false;
                    }
                }, true);

                return this;
            };

            /** @override */
            TimeOverview.prototype.toString = function() {
                return '[SoundModule Analyser TimeOverview]';
            };

            /**
             * This private class defines properties for drawing sound wave in time domain.
             * @param {number} sampleRate This argument is sample rate.
             * @constructor
             * @extends {Visualizer}
             */
            function Time(sampleRate) {
                Visualizer.call(this, sampleRate);

                this.type         = Time.TYPES.UINT;  // unsigned int 8 bit (Uint8Array) or float 32 bit (Float32Array)
                this.textInterval = 0.005;            // Draw text at intervals this value [sec]
            }

            /**
             * Class (Static) properties
             */
            Time.TYPES       = {};
            Time.TYPES.UINT  = 'uint';
            Time.TYPES.FLOAT = 'float';

            /** @override */
            Time.prototype.param = function(key, value) {
                if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                    // Associative array
                    for (var k in arguments[0]) {
                        this.param(k, arguments[0][k]);
                    }
                } else {
                    var k = String(key).replace(/-/g, '').toLowerCase();

                    var r = Visualizer.prototype.param.call(this, k, value);

                    if (r !== undefined) {
                        // Getter
                        return r;
                    } else {
                        switch (k) {
                            case 'type':
                                if (value === undefined) {
                                    // Gettre
                                    return this.type;
                                } else {
                                    // Setter
                                    var v = String(value).toLowerCase();

                                    if ((v === Time.TYPES.UINT) || (v === Time.TYPES.FLOAT)) {
                                        this.type = v;
                                    }
                                }

                                break;
                            case 'textinterval':
                                if (value === undefined) {
                                    // Getter
                                    return this.textInterval;
                                } else {
                                    // Setter
                                    var v = parseFloat(value);

                                    if (v > 0) {
                                        this.textInterval = v;
                                    }
                                }

                                break;
                            default:
                                break;
                        }
                    }
                }

                return this;
            };

            /**
             * This method draws sound wave in time domain to Canvas.
             * @param {Uint8Array|Float32Array} data This argument is data for drawing.
             * @return {Time} This is returned for method chain.
             * @override
             */
            Time.prototype.drawToCanvas = function(data, minDecibels, maxDecibels) {
                if (!((this.canvas instanceof HTMLCanvasElement) && this.isActive)) {
                    return this;
                }

                var context = this.context;

                var width       = this.canvas.width;
                var height      = this.canvas.height;
                var innerWidth  = width  - (this.styles.left + this.styles.right);
                var innerHeight = height - (this.styles.top  + this.styles.bottom);
                var middle      = Math.floor(innerHeight / 2) + this.styles.top;

                var x = 0;
                var y = 0;
                var t = '';

                // Draw text at intervals of "this.textInterval"
                var nTextinterval = Math.floor(this.textInterval * this.sampleRate);

                // Erase previous wave
                context.clearRect(0, 0, width, height);

                // Begin drawing
                switch (this.type) {
                    case Time.TYPES.FLOAT:
                        this.drawTimeDomainFloat32ArrayToCanvas(context, data, innerWidth, innerHeight, middle);
                        break;
                    case Time.TYPES.UINT:
                    default:
                        switch (this.styles.shape) {
                            case 'line':
                                // Set style
                                context.strokeStyle = this.styles.wave;
                                context.lineWidth   = this.styles.width;
                                context.lineCap     = this.styles.cap;
                                context.lineJoin    = this.styles.join;

                                // Draw wave
                                context.beginPath();

                                for (var i = 0, len = data.length; i < len; i++) {
                                    x = Math.floor((i / len) * innerWidth) + this.styles.left;
                                    y = Math.floor((1 - (data[i] / 255)) * innerHeight) + this.styles.top;

                                    if (i === 0) {
                                        context.moveTo((x + (this.styles.width / 2)), y);
                                    } else {
                                        context.lineTo(x, y);
                                    }
                                }

                                context.stroke();

                                break;
                            case 'rect':
                               // Set style
                               if (this.styles.wave !== 'gradient') {
                                   context.fillStyle = this.styles.wave;
                               }

                                // Draw wave
                                for (var i = 0, len = data.length; i < len; i++) {
                                    x = Math.floor((i / len) * innerWidth) + this.styles.left;
                                    y = Math.floor((0.5 - (data[i] / 255)) * innerHeight);

                                   // Set style
                                   if (this.styles.wave === 'gradient') {
                                        var upside   = (innerHeight / 2) + this.styles.top;
                                        var gradient = context.createLinearGradient(0 , upside, 0, (upside + y));

                                        for (var j = 0, num = this.styles.grad.length; j < num; j++) {
                                            var gradients = this.styles.grad[j];

                                            gradient.addColorStop(gradients.offset, gradients.color);
                                        }

                                        context.fillStyle = gradient;
                                    }

                                    context.fillRect(x, middle, this.styles.width, y);
                                }

                                break;
                            default:
                                break;
                        }

                        break;
                }

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    // Draw grid and text (X axis)
                    for (var i = 0, len = data.length; i < len; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            t = Math.floor((i / this.sampleRate) * 1000) + ' ms';

                            // Draw grid
                            if (this.styles.grid !== 'none') {
                                context.fillStyle = this.styles.grid;
                                context.fillRect(x, this.styles.top, 1, innerHeight);
                            }

                            // Draw text
                            if (this.styles.text !== 'none') {
                                context.fillStyle = this.styles.text;
                                context.font      = this.createFontString();
                                context.fillText(t, (x - (context.measureText(t).width / 2)), (this.styles.top + innerHeight + parseInt(this.styles.font.size)));
                            }
                        }
                    }

                    // Draw grid and text (Y axis)
                    var texts = ['-1.00', '-0.50', ' 0.00', ' 0.50', ' 1.00'];

                    for (var i = 0, len = texts.length; i < len; i++) {
                        t = texts[i];
                        x = Math.floor(this.styles.left - context.measureText(t).width);
                        y = Math.floor((1 - parseFloat(t.trim())) * (innerHeight / 2)) + this.styles.top;

                        // Draw grid
                        if (this.styles.grid !== 'none') {
                            context.fillStyle = this.styles.grid;
                            context.fillRect(this.styles.left, y, innerWidth, 1);
                        }

                        y -= Math.floor(parseInt(this.styles.font.size) / 4);

                        // Draw text
                        if (this.styles.text !== 'none') {
                            context.fillStyle = this.styles.text;
                            context.font      = this.createFontString();
                            context.fillText(t, x, y);
                        }
                    }
                }

                return this;
            };

            /**
             * This method draws sound wave in time domain to SVG.
             * @param {Uint8Array|Float32Array} data This argument is data for drawing.
             * @return {Time} This is returned for method chain.
             * @override
             */
            Time.prototype.drawToSVG = function(data) {
                if (!((this.svg instanceof SVGElement) && this.isActive)) {
                    return this;
                }

                var svg = this.svg;

                var width       = parseInt(this.svg.getAttribute('width'));
                var height      = parseInt(this.svg.getAttribute('height'));
                var innerWidth  = width  - (this.styles.left + this.styles.right);
                var innerHeight = height - (this.styles.top  + this.styles.bottom);
                var middle      = Math.floor(innerHeight / 2) + this.styles.top;

                var x = 0;
                var y = 0;
                var t = '';

                // Draw text at intervals of "this.textInterval"
                var nTextinterval = Math.floor(this.textInterval * this.sampleRate);

                // Begin drawing
                svg.innerHTML = '';

                // Begin drawing
                switch (this.type) {
                    case Time.TYPES.FLOAT:
                        svg.appendChild(this.drawTimeDomainFloat32ArrayToSVG(data, innerWidth, innerHeight, middle, Visualizer.SVG_LINEAR_GRADIENT_IDS.TIME));
                        break;
                    case Time.TYPES.UINT:
                    default:
                        switch (this.styles.shape) {
                            case 'line':
                                // Draw wave
                                var path = document.createElementNS(Visualizer.XMLNS, 'path');

                                var d = '';

                                for (var i = 0, len = data.length; i < len; i++) {
                                    x = Math.floor((i / len) * innerWidth) + this.styles.left;
                                    y = Math.floor((1 - (data[i] / 255)) * innerHeight) + this.styles.top;

                                    if (i === 0) {
                                        d += 'M' + (x + (this.styles.width / 2)) + ' ' + y;
                                    } else {
                                        d += ' ';
                                        d += 'L' + x + ' ' + y;
                                    }
                                }

                                path.setAttribute('d', d);

                                path.setAttribute('stroke',          this.styles.wave);
                                path.setAttribute('fill',            'none');
                                path.setAttribute('stroke-width',    this.styles.width);
                                path.setAttribute('stroke-linecap',  this.styles.cap);
                                path.setAttribute('stroke-linejoin', this.styles.join);

                                svg.appendChild(path);

                                break;
                            case 'rect':
                                var defs = null;

                                if (this.styles.wave === 'gradient') {
                                    defs = this.createSVGLinearGradient(Visualizer.SVG_LINEAR_GRADIENT_IDS.TIME);
                                }

                                // Draw wave
                                var g = document.createElementNS(Visualizer.XMLNS, 'g');

                                if (defs !== null) {
                                    g.appendChild(defs);
                                }

                                for (var i = 0, len = data.length; i < len; i++) {
                                    var rect = document.createElementNS(Visualizer.XMLNS, 'rect');

                                    x = Math.floor((i / len) * innerWidth) + this.styles.left;
                                    y = Math.floor(((data[i] / 255) - 0.5) * innerHeight);

                                    rect.setAttribute('x',     x);
                                    rect.setAttribute('y',     middle);
                                    rect.setAttribute('width', this.styles.width);

                                    if (y < 0) {
                                        rect.setAttribute('height', -y);
                                    } else {
                                        rect.setAttribute('height',    y);
                                        rect.setAttribute('transform', 'rotate(180 ' + (x + (this.styles.width / 2)) + ' ' + middle + ')');
                                    }

                                    rect.setAttribute('stroke', 'none');
                                    rect.setAttribute('fill',   (defs === null) ? this.styles.wave : ('url(#' + Visualizer.SVG_LINEAR_GRADIENT_IDS.TIME + ')'));

                                    g.appendChild(rect);
                                }

                                svg.appendChild(g);

                                break;
                            default:
                                break;
                        }

                        break;
                }

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    // Draw grid and text (X axis)
                    for (var i = 0, len = data.length; i < len; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            t = Math.floor((i / this.sampleRate) * 1000) + ' ms';

                            // Draw grid
                            if (this.styles.grid !== 'none') {
                                var rect = document.createElementNS(Visualizer.XMLNS, 'rect');

                                rect.setAttribute('x',      x);
                                rect.setAttribute('y',      this.styles.top);
                                rect.setAttribute('width',  1);
                                rect.setAttribute('height', innerHeight);

                                rect.setAttribute('stroke', 'none');
                                rect.setAttribute('fill',   this.styles.grid);

                                svg.appendChild(rect);
                            }

                            // Draw text
                            if (this.styles.text !== 'none') {
                                var text = document.createElementNS(Visualizer.XMLNS, 'text');

                                text.textContent = t;

                                text.setAttribute('x', x);
                                text.setAttribute('y', (this.styles.top + innerHeight + parseInt(this.styles.font.size)));

                                text.setAttribute('text-anchor', 'middle');
                                text.setAttribute('stroke',      'none');
                                text.setAttribute('fill',        this.styles.text);
                                text.setAttribute('font-family', this.styles.font.family);
                                text.setAttribute('font-size',   this.styles.font.size);
                                text.setAttribute('font-style',  this.styles.font.style);
                                text.setAttribute('font-weight', this.styles.font.weight);

                                svg.appendChild(text);
                            }
                        }
                    }

                    // Draw grid and text (Y axis)
                    var texts = ['-1.00', '-0.50', ' 0.00', ' 0.50', ' 1.00'];

                    for (var i = 0, len = texts.length; i < len; i++) {
                        t = texts[i];
                        x = this.styles.left;
                        y = Math.floor((1 - parseFloat(t.trim())) * (innerHeight / 2)) + this.styles.top;

                        // Draw grid
                        if (this.styles.grid !== 'none') {
                            var rect = document.createElementNS(Visualizer.XMLNS, 'rect');

                            rect.setAttribute('x',      x);
                            rect.setAttribute('y',      y);
                            rect.setAttribute('width',  innerWidth);
                            rect.setAttribute('height', 1);

                            rect.setAttribute('stroke', 'none');
                            rect.setAttribute('fill',   this.styles.grid);

                            svg.appendChild(rect);
                        }

                        y -= Math.floor(parseInt(this.styles.font.size) / 4);

                        // Draw text
                        if (this.styles.text !== 'none') {
                            var text = document.createElementNS(Visualizer.XMLNS, 'text');

                            text.textContent = t;

                            text.setAttribute('x', x);
                            text.setAttribute('y', y);

                            text.setAttribute('text-anchor', 'end');
                            text.setAttribute('stroke',      'none');
                            text.setAttribute('fill',        this.styles.text);
                            text.setAttribute('font-family', this.styles.font.family);
                            text.setAttribute('font-size',   this.styles.font.size);
                            text.setAttribute('font-style',  this.styles.font.style);
                            text.setAttribute('font-weight', this.styles.font.weight);

                            svg.appendChild(text);
                        }
                    }
                }

                return this;
            };

            /** @override */
            Time.prototype.toString = function() {
                return '[SoundModule Analyser Time]';
            };

            /**
             * This private class defines properties for drawing sound wave in frequency domain (spectrum).
             * @param {number} sampleRate This argument is sample rate.
             * @constructor
             * @extends {Visualizer}
             */
            function FFT(sampleRate) {
                Visualizer.call(this, sampleRate);

                this.type         = FFT.TYPES.UINT;  // unsigned int 8 bit (Uint8Array) or float 32 bit (Float32Array)
                this.size         = 256;             // Range for drawing
                this.textInterval = 1000;            // Draw text at intervals of this value [Hz]
            }

            /**
             * Class (Static) properties
             */
            FFT.TYPES       = {};
            FFT.TYPES.UINT  = 'uint';
            FFT.TYPES.FLOAT = 'float';

            /** @override */
            FFT.prototype.param = function(key, value) {
                if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                    // Associative array
                    for (var k in arguments[0]) {
                        this.param(k, arguments[0][k]);
                    }
                } else {
                    var k = String(key).replace(/-/g, '').toLowerCase();

                    var r = Visualizer.prototype.param.call(this, k, value);

                    if (r !== undefined) {
                        // Getter
                        return r;
                    } else {
                        switch (k) {
                            case 'type':
                                if (value === undefined) {
                                    // Getter
                                    return this.type;
                                } else {
                                    // Setter
                                    var v = String(value).toLowerCase();

                                    if ((v === FFT.TYPES.UINT) || (v === FFT.TYPES.FLOAT)) {
                                        this.type = v;
                                    }
                                }

                                break;
                            case 'size':
                                if (value === undefined) {
                                    // Getter
                                    return this.size;
                                } else {
                                    // Setter
                                    var v   = parseInt(value);
                                    var min = 0;
                                    var max = 1024;  // AnalyserNode#fftSize max 2048 -> half 1024

                                    if ((v > 0) && (v <= max)) {
                                        this.size = v;
                                    }
                                }

                                break;
                            case 'textinterval':
                                if (value === undefined) {
                                    // Getter
                                    return this.textInterval;
                                } else {
                                    // Setter
                                    var v = parseFloat(value);

                                    if (v > 0) {
                                        this.textInterval = v;
                                    }
                                }

                                break;
                            default:
                                break;
                        }
                    }
                }

                return this;
            };

            /**
             * This method draws sound wave in frequency domain (spectrum) to Canvas.
             * @param {Uint8Array|Float32Array} data This argument is data for drawing.
             * @param {number} minDecibels This argument is in order to determine the range of drawing. The default value is -100 dB.
             * @param {number} maxDecibels This argument is in order to determine the range of drawing. The default value is -30 dB.
             * @return {FFT} This is returned for method chain.
             * @override
             */
            FFT.prototype.drawToCanvas = function(data, minDecibels, maxDecibels) {
                if (!((this.canvas instanceof HTMLCanvasElement) && this.isActive)) {
                    return this;
                }

                var mindB = parseFloat(minDecibels);
                var maxdB = parseFloat(maxDecibels);

                var range = maxdB - mindB;

                var context = this.context;

                var width       = this.canvas.width;
                var height      = this.canvas.height;
                var innerWidth  = width  - (this.styles.left + this.styles.right);
                var innerHeight = height - (this.styles.top  + this.styles.bottom);

                var x = 0;
                var y = 0;
                var t = '';

                var drawnSize = (this.size > data.length) ? data.length : this.size;

                // Frequency resolution (Sampling rate / FFT size)
                var fsDivN = this.sampleRate / (2 * data.length);

                // Draw text at intervals of "this.textInterval"
                var nTextinterval = Math.floor(this.textInterval / fsDivN);

                // Erase previous wave
                context.clearRect(0, 0, width, height);

                // Begin drawing
                switch (this.type) {
                    case FFT.TYPES.FLOAT:
                        // Set style
                        context.strokeStyle = (this.styles.wave !== 'gradient') ? this.styles.wave : 'rgba(0, 0, 255, 1.0)';  // line only
                        context.lineWidth   = this.styles.width;
                        context.lineCap     = this.styles.cap;
                        context.lineJoin    = this.styles.join;

                        // Draw wave
                        context.beginPath();

                        for (var i = 0; i < drawnSize; i++) {
                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                            y = (Math.abs(data[i] - maxdB) * (innerHeight / range)) + this.styles.top;  // [dB] * [px / dB] = [px]

                            if (i === 0) {
                                context.moveTo((x + (this.styles.width / 2)), y);
                            } else {
                                context.lineTo(x, y);
                            }
                        }

                        context.stroke();

                        break;
                    case FFT.TYPES.UINT:
                    default:
                        switch (this.styles.shape) {
                            case 'line':
                                // Set style
                                context.strokeStyle = this.styles.wave;
                                context.lineWidth   = this.styles.width;
                                context.lineCap     = this.styles.cap;
                                context.lineJoin    = this.styles.join;

                                context.beginPath();

                                // Draw wave
                                for (var i = 0; i < drawnSize; i++) {
                                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                                    y = Math.floor((1 - (data[i] / 255)) * innerHeight) + this.styles.top;

                                    if (i === 0) {
                                        context.moveTo((x + (this.styles.width / 2)), y);
                                    } else {
                                        context.lineTo(x, y);
                                    }
                                }

                                context.stroke();

                                break;
                            case 'rect':
                               // Set style
                               if (this.styles.wave !== 'gradient') {
                                   context.fillStyle = this.styles.wave;
                               }

                                // Draw wave
                                for (var i = 0; i < drawnSize; i++) {
                                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                                    y = -1 * Math.floor((data[i] / 255) * innerHeight);

                                   // Set style
                                   if (this.styles.wave === 'gradient') {
                                        var upside   = innerHeight + this.styles.top;
                                        var gradient = context.createLinearGradient(0 , upside, 0, (upside + y));

                                        for (var j = 0, num = this.styles.grad.length; j < num; j++) {
                                            var gradients = this.styles.grad[j];

                                            gradient.addColorStop(gradients.offset, gradients.color);
                                        }

                                        context.fillStyle = gradient;
                                    }

                                    context.fillRect(x, (innerHeight + this.styles.top), this.styles.width, y);
                                }

                                break;
                            default:
                                break;
                        }

                        break;
                }

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    // Draw grid and text (X axis)
                    var f = 0;

                    for (var i = 0; i < drawnSize; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;

                            f = Math.floor(this.textInterval * (i / nTextinterval));
                            t = (f < 1000) ? (f + ' Hz') : (String(f / 1000).slice(0, 3) + ' kHz');

                            // Draw grid
                            if (this.styles.grid !== 'none') {
                                context.fillStyle = this.styles.grid;
                                context.fillRect(x, this.styles.top, 1, innerHeight);
                            }

                            // Draw text
                            if (this.styles.text !== 'none') {
                                context.fillStyle = this.styles.text;
                                context.font      = this.createFontString();
                                context.fillText(t, (x - (context.measureText(t).width / 2)), (this.styles.top + innerHeight + parseInt(this.styles.font.size)));
                            }
                        }
                    }

                    // Draw grid and text (Y axis)
                    switch (this.type) {
                        case FFT.TYPES.FLOAT:
                            for (var i = mindB; i <= maxdB; i += 10) {
                                t = i + ' dB';
                                x = Math.floor(this.styles.left - context.measureText(t).width);
                                y = Math.floor(((-1 * (i - maxdB)) / range) * innerHeight) + this.styles.top;

                                // Draw grid
                                if (this.styles.grid !== 'none') {
                                    context.fillStyle = this.styles.grid;
                                    context.fillRect(this.styles.left, y, innerWidth, 1);
                                }

                                y -= Math.floor(parseInt(this.styles.font.size) / 4);

                                // Draw text
                                if (this.styles.text !== 'none') {
                                    context.fillStyle = this.styles.text;
                                    context.font      = this.createFontString();
                                    context.fillText(t, x, y);
                                }
                            }

                            break;
                        case FFT.TYPES.UINT:
                        default:
                            var texts = ['0.00', '0.25', '0.50', '0.75', '1.00'];

                            for (var i = 0, len = texts.length; i < len; i++) {
                                t = texts[i];
                                x = Math.floor(this.styles.left - context.measureText(t).width);
                                y = ((1 - parseFloat(t)) * innerHeight) + this.styles.top;

                                // Draw grid
                                if (this.styles.grid !== 'none') {
                                    context.fillStyle = this.styles.grid;
                                    context.fillRect(this.styles.left, y, innerWidth, 1);
                                }

                                y -= Math.floor(parseInt(this.styles.font.size) / 4);

                                // Draw text
                                if (this.styles.text !== 'none') {
                                    context.fillStyle = this.styles.text;
                                    context.font      = this.createFontString();
                                    context.fillText(t, x, y);
                                }
                            }

                            break;
                    }
                }

                return this;
            };

            /**
             * This method draws sound wave in frequency domain (spectrum) to SVG.
             * @param {Uint8Array|Float32Array} data This argument is data for drawing.
             * @param {number} minDecibels This argument is in order to determine the range of drawing. The default value is -100 dB.
             * @param {number} maxDecibels This argument is in order to determine the range of drawing. The default value is -30 dB.
             * @return {FFT} This is returned for method chain.
             * @override
             */
            FFT.prototype.drawToSVG = function(data, minDecibels, maxDecibels) {
                if (!((this.svg instanceof SVGElement) && this.isActive)) {
                    return this;
                }

                var mindB = parseFloat(minDecibels);
                var maxdB = parseFloat(maxDecibels);

                var range = maxdB - mindB;

                var svg = this.svg;

                var width       = this.svg.getAttribute('width');
                var height      = this.svg.getAttribute('height');
                var innerWidth  = width  - (this.styles.left + this.styles.right);
                var innerHeight = height - (this.styles.top  + this.styles.bottom);

                var x = 0;
                var y = 0;
                var t = '';

                var drawnSize = (this.size > data.length) ? data.length : this.size;

                // Frequency resolution (sample rate / FFT size)
                var fsDivN = this.sampleRate / (2 * data.length);

                // Draw text at intervals of "this.textInterval"
                var nTextinterval = Math.floor(this.textInterval / fsDivN);

                // Erase previous wave
                this.svg.innerHTML = '';

                // Begin drawing
                switch (this.type) {
                    case FFT.TYPES.FLOAT:
                        // Draw wave
                        var path = document.createElementNS(Visualizer.XMLNS, 'path');

                        var d = '';

                        for (var i = 0; i < drawnSize; i++) {
                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                            y = Math.floor(-1 * (data[i] - maxdB) * (innerHeight / range)) + this.styles.top;

                            if (i === 0) {
                                d += 'M' + (x + (this.styles.width / 2)) + ' ' + y;
                            } else {
                                d += ' ';
                                d += 'L' + x + ' ' + y;
                            }
                        }

                        path.setAttribute('d', d);

                        path.setAttribute('stroke',          this.styles.wave);
                        path.setAttribute('fill',            'none');
                        path.setAttribute('stroke-width',    this.styles.width);
                        path.setAttribute('stroke-linecap',  this.styles.cap);
                        path.setAttribute('stroke-linejoin', this.styles.join);

                        svg.appendChild(path);

                        break;
                    case FFT.TYPES.UINT:
                    default:
                        switch (this.styles.shape) {
                            case 'line':
                                // Draw wave
                                var path = document.createElementNS(Visualizer.XMLNS, 'path');

                                var d = '';

                                for (var i = 0; i < drawnSize; i++) {
                                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                                    y = Math.floor((1 - (data[i] / 255)) * innerHeight) + this.styles.top;

                                    if (i === 0) {
                                        d += 'M' + (x + this.styles.width / 2) + ' ' + y;
                                    } else {
                                        d += ' ';
                                        d += 'L' + x + ' ' + y;
                                    }
                                }

                                path.setAttribute('d', d);

                                path.setAttribute('stroke',          this.styles.wave);
                                path.setAttribute('fill',            'none');
                                path.setAttribute('stroke-width',    this.styles.width);
                                path.setAttribute('stroke-linecap',  this.styles.cap);
                                path.setAttribute('stroke-linejoin', this.styles.join);

                                svg.appendChild(path);

                                break;
                            case 'rect':
                                // Draw wave
                                var defs = null;

                                if (this.styles.wave === 'gradient') {
                                    defs = this.createSVGLinearGradient(Visualizer.SVG_LINEAR_GRADIENT_IDS.FFT);
                                }

                                // Draw wave
                                var g = document.createElementNS(Visualizer.XMLNS, 'g');

                                if (defs !== null) {
                                    g.appendChild(defs);
                                }

                                for (var i = 0; i < drawnSize; i++) {
                                    var rect = document.createElementNS(Visualizer.XMLNS, 'rect');

                                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                                    y = Math.floor((data[i] / 255) * innerHeight);

                                    rect.setAttribute('x',     x);
                                    rect.setAttribute('y',     (this.styles.top + innerHeight));
                                    rect.setAttribute('width', this.styles.width);

                                    if (y < 0) {
                                        rect.setAttribute('height', -y);
                                    } else {
                                        rect.setAttribute('height',    y);
                                        rect.setAttribute('transform', 'rotate(180 ' + (x + this.styles.width / 2) + ' ' + (this.styles.top + innerHeight) + ')');
                                    }

                                    rect.setAttribute('stroke', 'none');
                                    rect.setAttribute('fill',   (defs === null) ? this.styles.wave : ('url(#' + Visualizer.SVG_LINEAR_GRADIENT_IDS.FFT + ')'));

                                    g.appendChild(rect);
                                }

                                svg.appendChild(g);

                                break;
                            default:
                                break;
                        }

                        break;
                }

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    // Draw grid and text (X axis)
                    var f = 0;

                    for (var i = 0; i < drawnSize; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;

                            f = Math.floor(this.textInterval * (i / nTextinterval));
                            t = (f < 1000) ? (f + ' Hz') : (String(f / 1000).slice(0, 3) + ' kHz');

                            // Draw grid
                            if (this.styles.grid !== 'none') {
                                var rect = document.createElementNS(Visualizer.XMLNS, 'rect');

                                rect.setAttribute('x',      x);
                                rect.setAttribute('y',      this.styles.top);
                                rect.setAttribute('width',  1);
                                rect.setAttribute('height', innerHeight);

                                rect.setAttribute('stroke', 'none');
                                rect.setAttribute('fill',   this.styles.grid);

                                svg.appendChild(rect);
                            }

                            // Draw text
                            if (this.styles.text !== 'none') {
                                var text = document.createElementNS(Visualizer.XMLNS, 'text');

                                text.textContent = t;

                                text.setAttribute('x', x);
                                text.setAttribute('y', (this.styles.top + innerHeight + parseInt(this.styles.font.size)));

                                text.setAttribute('text-anchor', 'middle');
                                text.setAttribute('stroke',      'none');
                                text.setAttribute('fill',        this.styles.text);
                                text.setAttribute('font-family', this.styles.font.family);
                                text.setAttribute('font-size',   this.styles.font.size);
                                text.setAttribute('font-style',  this.styles.font.style);
                                text.setAttribute('font-weight', this.styles.font.weight);

                                svg.appendChild(text);
                            }
                        }
                    }

                    // Draw grid and text (Y axis)
                    switch (this.type) {
                        case FFT.TYPES.FLOAT:
                            for (var i = mindB; i <= maxdB; i += 10) {
                                t = i + 'dB';
                                x = this.styles.left;
                                y = Math.floor(((-1 * (i - maxdB)) / range) * innerHeight) + this.styles.top;

                                // Draw grid
                                if (this.styles.grid !== 'none') {
                                    var rect = document.createElementNS(Visualizer.XMLNS, 'rect');

                                    rect.setAttribute('x',      x);
                                    rect.setAttribute('y',      y);
                                    rect.setAttribute('width',  innerWidth);
                                    rect.setAttribute('height', 1);

                                    rect.setAttribute('stroke', 'none');
                                    rect.setAttribute('fill',   this.styles.grid);

                                    svg.appendChild(rect);
                                }

                                y -= Math.floor(parseInt(this.styles.font.size) / 4);

                                // Draw text
                                if (this.styles.text !== 'none') {
                                    var text = document.createElementNS(Visualizer.XMLNS, 'text');

                                    text.textContent = t;

                                    text.setAttribute('x', x);
                                    text.setAttribute('y', y);

                                    text.setAttribute('text-anchor', 'end');
                                    text.setAttribute('stroke',      'none');
                                    text.setAttribute('fill',        this.styles.text);
                                    text.setAttribute('font-family', this.styles.font.family);
                                    text.setAttribute('font-size',   this.styles.font.size);
                                    text.setAttribute('font-style',  this.styles.font.style);
                                    text.setAttribute('font-weight', this.styles.font.weight);

                                    svg.appendChild(text);
                                }
                            }

                            break;
                        case FFT.TYPES.UINT:
                        default:
                            var texts = ['0.00', '0.25', '0.50', '0.75', '1.00'];

                            for (var i = 0, len = texts.length; i < len; i++) {
                                t = texts[i];
                                x = this.styles.left;
                                y = ((1 - parseFloat(t)) * innerHeight) + this.styles.top;

                                // Draw grid
                                if (this.styles.grid !== 'none') {
                                    var rect = document.createElementNS(Visualizer.XMLNS, 'rect');

                                    rect.setAttribute('x',      x);
                                    rect.setAttribute('y',      y);
                                    rect.setAttribute('width',  innerWidth);
                                    rect.setAttribute('height', 1);

                                    rect.setAttribute('stroke', 'none');
                                    rect.setAttribute('fill',   this.styles.grid);

                                    svg.appendChild(rect);
                                }

                                y -= Math.floor(parseInt(this.styles.font.size) / 4);

                                // Draw text
                                if (this.styles.text !== 'none') {
                                    var text = document.createElementNS(Visualizer.XMLNS, 'text');

                                    text.textContent = t;

                                    text.setAttribute('x', x);
                                    text.setAttribute('y', y);

                                    text.setAttribute('text-anchor', 'end');
                                    text.setAttribute('stroke',      'none');
                                    text.setAttribute('fill',        this.styles.text);
                                    text.setAttribute('font-family', this.styles.font.family);
                                    text.setAttribute('font-size',   this.styles.font.size);
                                    text.setAttribute('font-style',  this.styles.font.style);
                                    text.setAttribute('font-weight', this.styles.font.weight);

                                    svg.appendChild(text);
                                }
                            }

                            break;
                    }
                }

                return this;
            };

            /** @override */
            FFT.prototype.toString = function() {
                return '[SoundModule Analyser FFT]';
            };

            this.timeOverviewL = new TimeOverview(context.sampleRate);
            this.timeOverviewR = new TimeOverview(context.sampleRate);
            this.time          = new Time(context.sampleRate);
            this.fft           = new FFT(context.sampleRate);
        }

        /**
         * This method is getter or setter for parameters.
         * @param {string|object} key This argument is property name in the case of string type.
         *     This argument is pair of property and value in the case of associative array.
         * @param {number|} value This argument is the value of designated property. If this argument is omitted, This method is getter.
         * @return {number|Analyser} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
         */
        Analyser.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'fftsize':
                        if (value === undefined) {
                            // Getter
                            return this.analyser.fftSize;
                        } else {
                            // Setter
                            var v = parseInt(value);

                            switch (v) {
                                case   32:
                                case   64:
                                case  128:
                                case  256:
                                case  512:
                                case 1024:
                                case 2048:
                                    this.analyser.fftSize = v;
                                    break;
                                default:
                                    break;
                            }
                        }

                        break;
                    case 'frequencybincount':
                        return this.analyser.frequencyBinCount;  // Getter only
                    case 'mindecibels':
                        if (value === undefined) {
                            // Getter
                            return this.analyser.minDecibels;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var max = -30;

                            if (v < max) {
                                this.analyser.minDecibels = v;
                            }
                        }

                        break;
                    case 'maxdecibels':
                        if (value === undefined) {
                            // Getter
                            return this.analyser.maxDecibels;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = -100;

                            if (v > min) {
                                this.analyser.maxDecibels = v;
                            }
                        }

                        break;
                    case 'smoothingtimeconstant':
                        if (value === undefined) {
                            // Getter
                            return this.analyser.smoothingTimeConstant;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                this.analyser.smoothingTimeConstant = v;
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
         * This method creates data for drawing and executes drawing.
         * @param {string} domain This argument is one of 'timeOverviewL', 'timeOverviewR', 'time', 'fft'.
         * @param {AudioBuffer} buffer This argument is the instance of AudioBuffer. The data for drawing audio wave in overview of time domain is gotten from this argument.
         * @return {Analyser} This is returned for method chain.
         */
        Analyser.prototype.start = function(domain, buffer) {
            var d = String(domain).replace(/-/g, '').toLowerCase();

            var self = this;

            switch (d) {
                case 'timeoverviewl':
                    if (buffer instanceof AudioBuffer) {
                        if (buffer.numberOfChannels > 0) {
                            var data = new Float32Array(buffer.length);
                            data.set(buffer.getChannelData(0));
                            this.timeOverviewL.start(data);
                        }
                    }

                    break;
                case 'timeoverviewr':
                    if (buffer instanceof AudioBuffer) {
                        if (buffer.numberOfChannels > 1) {
                            var data = new Float32Array(buffer.length);
                            data.set(buffer.getChannelData(1));
                            this.timeOverviewR.start(data);
                        }
                    }

                    break;
                case 'time':
                    var data = null;

                    if (this.time.param('type') === 'uint') {
                        data = new Uint8Array(this.analyser.fftSize);
                        this.analyser.getByteTimeDomainData(data);
                        this.time.start(data);
                    } else {
                        data = new Float32Array(this.analyser.fftSize);
                        this.analyser.getFloatTimeDomainData(data);
                        this.time.start(data, this.analyser.minDecibels, this.analyser.maxDecibels);
                    }

                    if (this.time.param('interval') === 'auto') {
                        this.time.timerid = requestAnimationFrame(function() {
                            self.start(domain);
                        });
                    } else {
                        this.time.timerid = global.setTimeout(function() {
                            self.start(domain);
                        }, this.time.param('interval'));
                    }

                    break;
                case 'fft':
                    var data = null;

                    if (this.fft.param('type') === 'uint') {
                        data = new Uint8Array(this.analyser.frequencyBinCount);
                        this.analyser.getByteFrequencyData(data);
                        this.fft.start(data);
                    } else {
                        data = new Float32Array(this.analyser.frequencyBinCount);
                        this.analyser.getFloatFrequencyData(data);
                        this.fft.start(data, this.analyser.minDecibels, this.analyser.maxDecibels);
                    }

                    if (this.fft.param('interval') === 'auto') {
                        this.fft.timerid = requestAnimationFrame(function() {
                            self.start(domain);
                        });
                    } else {
                        this.fft.timerid = global.setTimeout(function() {
                            self.start(domain);
                        }, this.fft.param('interval'));
                    }

                    break;
                default:
                    break;
            }

            return this;
        };

        /**
         * This method stops drawing.
         * @param {string} domain This argument is one of 'timeOverviewL', 'timeOverview-R', 'time', 'fft'.
         * @return {Analyser} This is returned for method chain.
         */
        Analyser.prototype.stop = function(domain) {
            var d = String(domain).replace(/-/g, '').toLowerCase();

            switch (d) {
                case 'timeoverviewl':
                case 'timeoverviewr':
                    break;
                case 'time':
                    if (this.time.param('interval') === 'auto') {
                        global.cancelAnimationFrame(this.time.timerid);
                    } else {
                        global.clearTimeout(this.time.timerid);
                    }

                    this.time.timerid = null;

                    break;
                case 'fft':
                    if (this.fft.param('interval') === 'auto') {
                        global.cancelAnimationFrame(this.fft.timerid);
                    } else {
                        global.clearTimeout(this.fft.timerid);
                    }

                    this.fft.timerid = null;

                    break;
                default:
                    break;
            }

            return this;
        };

        /**
         * This method selects domain for drawing.
         * @param {string} domain This argument is one of 'timeOverviewL', 'timeOverviewR', 'time', 'fft'.
         * @return {TimeOverview|Time|FFT} This value is the instance of selected class.
         */
        Analyser.prototype.domain = function(domain) {
            var d = String(domain).replace(/-/g, '').toLowerCase();

            switch (d) {
                case 'timeoverviewl':
                case 'timeoverviewr':
                    return this['timeOverview' + d.slice(-1).toUpperCase()];
                case 'time':
                case 'fft' :
                    return this[d];
                default:
                    break;
            }
        };

        /**
         * This method gets the instance of AnalyserNode.
         * @return {AnalyserNode} This value is the instance of AnalyserNode.
         */
        Analyser.prototype.get = function() {
            return this.analyser;
        };

        /** @override */
        Analyser.prototype.toString = function() {
            return '[SoundModule Analyser]';
        };

        /**
         * This private class defines properties for multi track recording.
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @param {number} numInput This argument is the number of inputs for ScriptProcessorNode.
         * @param {number} numOutput This argument the number of outputs for ScriptProcessorNode.
         * @constructor
         */
        function Recorder(context, bufferSize, numberOfInputs, numberOfOutputs) {
            this.sampleRate = context.sampleRate;

            this.context   = context;
            this.processor = context.createScriptProcessor(bufferSize, numberOfInputs, numberOfOutputs);

            this.mixedLs = null;  /** @type {Float32Array} */
            this.mixedRs = null;  /** @type {Float32Array} */

            this.numberOfTracks = 0;
            this.trackLs        = [];  /** @type {Array.<Array.<Float32Array>>} 2 dimensions array */
            this.trackRs        = [];  /** @type {Array.<Array.<Float32Array>>} 2 dimensions array */

            this.activeTrack = -1;      // There is not any active track in the case of -1
            this.paused      = true;    // for preventing from the duplicate onaudioprocess event ("start" method)

            this.gainL = 1;  // Gain of L channel
            this.gainR = 1;  // Gain of R channel
        };

        /**
         * This method sets the max number of tracks.
         * @param {number} numberOfTracks This argument is the max number of tracks. The default value is 1.
         * @return {Recorder} This is returned for method chain.
         */
        Recorder.prototype.setup = function(numberOfTracks) {
            var n = parseInt(numberOfTracks);

            if (n > 0) {
                this.numberOfTracks = n;

                this.trackLs = new Array(this.numberOfTracks);
                this.trackRs = new Array(this.numberOfTracks);

                for (var i = 0; i < n; i++) {this.trackLs[i] = [];}  // n * array
                for (var i = 0; i < n; i++) {this.trackRs[i] = [];}  // n * array
            } else {
                this.numberOfTracks = 1;

                this.trackLs = new Array(this.numberOfTracks);
                this.trackRs = new Array(this.numberOfTracks);

                this.trackLs[0] = [];  // 1 * array
                this.trackRs[0] = [];  // 1 * array
            }

            return this;
        };

        /**
         * This method is getter or setter for parameters.
         * @param {string|object} key This argument is property name in the case of string type.
         *     This argument is pair of property and value in the case of associative array.
         * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
         * @return {number|Recorder} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
         */
        Recorder.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'gainl':
                    case 'gainr':
                        if (value === undefined) {
                            // Getter
                            return this['gain' + k.slice(-1).toUpperCase()];
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                this['gain' + k.slice(-1).toUpperCase()] = v;
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
         * This method selects active track.
         * @param {number} track This argument is in order to select active track.
         * @return {Recorder} This is returned for method chain.
         */
        Recorder.prototype.ready = function(track) {
            if (this.isTrack(track)) {
                this.activeTrack = track;
            } else {
                this.activeTrack = -1;
            }

            return this;
        };

        /**
         * This method starts recording. If there is not any active track, this method stops "onaudioprocess" event handler in the instance of ScriptProcessorNode.
         * @return {Recorder} This is returned for method chain.
         */
        Recorder.prototype.start = function() {
            if ((this.activeTrack !== -1) && this.paused) {
                var self = this;

                this.paused = false;

                this.processor.onaudioprocess = function(event) {
                    if (self.activeTrack !== -1) {
                        var inputLs = event.inputBuffer.getChannelData(0);
                        var inputRs = event.inputBuffer.getChannelData(1);

                        var recordedLs = new Float32Array(this.bufferSize);
                        var recordedRs = new Float32Array(this.bufferSize);

                        for (var i = 0; i < this.bufferSize; i++) {
                            recordedLs[i] = self.gainL * inputLs[i];
                            recordedRs[i] = self.gainR * inputRs[i];
                        }

                        self.trackLs[self.activeTrack].push(recordedLs);
                        self.trackRs[self.activeTrack].push(recordedRs);
                    } else {
                        this.disconnect(0);
                        this.onaudioprocess = null;
                    }
                };
            }

            return this;
        };

        /**
         * This method turns off the all of tracks, and stops "onaudioprocess" event handler in the instance of ScriptProcessorNode.
         * @return {Recorder} This is returned for method chain.
         */
        Recorder.prototype.stop = function() {
            this.activeTrack = -1;  // Flag becomes inactive
            this.paused      = true;

            this.processor.disconnect(0);  // Stop onaudioprocess event
            this.processor.onaudioprocess = null;

            return this;
        };

        /**
         * This method determines whether the designated track number is valid.
         * @param {number} track This argument is track number for validation.
         * @return {boolean} If the designated track is valid range, this value is true. Otherwise, this value is false.
         */
        Recorder.prototype.isTrack = function(track) {
            var t = parseInt(track);

            return (t >= 0) && (t < this.numberOfTracks);
        };

        /**
         * This method determines whether active track exists.
         * @return {number} This is returned as active track.
         */
        Recorder.prototype.getActiveTrack = function() {
            return this.activeTrack;
        };

        /**
         * This method synthesizes recorded sounds in track.
         * @param {string} channel This argument is either 'L' or 'R'.
         * @return {Float32Array} This is returned as array for synthesized sound.
         */
        Recorder.prototype.mixTrack = function(channel) {
            var tracks        = this['track' + channel + 's'];
            var mixs          = {'values': null, 'sum': 0, 'num': 0};
            var currentBuffer = 0;
            var index         = 0;

            // Calculate sound data size
            var numberOfMaxBuffers = 0;

            // Search the max number of Float32Arrays each track
            for (var i = 0, num = tracks.length; i < num; i++) {
                if (numberOfMaxBuffers < tracks[i].length) {
                    numberOfMaxBuffers = tracks[i].length;
                }
            }

            mixs.values = new Float32Array(numberOfMaxBuffers * this.processor.bufferSize);

            while (true) {
                for (var currentTrack = 0, len = tracks.length; currentTrack < len; currentTrack++) {
                    if (tracks[currentTrack][currentBuffer] instanceof Float32Array) {
                        mixs.sum += tracks[currentTrack][currentBuffer][index];
                        mixs.num++;
                    }
                }

                if (mixs.num > 0) {
                    var offset = currentBuffer * this.processor.bufferSize;

                    // Average
                    mixs.values[offset + index] = mixs.sum / mixs.num;

                    // Clear
                    mixs.sum = 0;
                    mixs.num = 0;

                    // Next data
                    if (index < (this.processor.bufferSize - 1)) {
                        // Next element in Float32Array
                        index++;
                    } else {
                        // Next Float32Array
                        currentBuffer++;
                        index = 0;
                    }
                } else {
                    return mixs.values;
                }
            }
        };

        /**
         * This method synthesizes the all of recorded sounds in track.
         * @return {Recorder} This is returned for method chain.
         */
        Recorder.prototype.mix = function() {
            // on the way of recording ?
            if (this.activeTrack !== -1) {
                this.stop();
            }

            this.mixedLs = this.mixTrack('L');
            this.mixedRs = this.mixTrack('R');

            return this;
        };

        /**
         * This method clears recorded sound of the designated track.
         * @param {number|string} track This argument is track for clearing.
         * @return {Recorder} This is returned for method chain.
         */
        Recorder.prototype.clear = function(track) {
            // on the way of recording ?
            if (this.activeTrack !== -1) {
                this.stop();
            }

            if (String(track).toLowerCase() === 'all') {
                for (var i = 0, len = this.trackLs.length; i < len; i++) {this.trackLs[i].length = 0;}
                for (var i = 0, len = this.trackRs.length; i < len; i++) {this.trackRs[i].length = 0;}
            } else {
                if (this.isTrack(track)) {
                    this.trackLs[track].length = 0;
                    this.trackRs[track].length = 0;
                }
            }

            return this;
        };

        /**
         * This method creates WAVE file as Object URL or Data URL.
         * @param {string|number} track This argument is the target track.
         * @param {number} numberOfChannels This argument is in order to select stereo or monaural of WAVE file. The default value is 2.
         * @param {number} qbit This argument is quantization bit of PCM. The default value is 16 (bit).
         * @return {string} This is returned as Object URL or Data URL for WAVE file.
         */
        Recorder.prototype.create = function(track, numberOfChannels, qbit) {
            // on the way of recording ?
            if (this.activeTrack !== -1) {
                this.stop();
            }

            /** @type {Float32Array} */
            var soundLs = null;

            /** @type {Float32Array} */
            var soundRs = null;

            if (String(track).toLowerCase() === 'all') {
                this.mix();

                soundLs = this.mixedLs;
                soundRs = this.mixedRs;
            } else {
                if (this.isTrack(track)) {
                    soundLs = this.trackLs[track - 1];
                    soundRs = this.trackRs[track - 1];
                }
            }

            // Sound data exists ?
            if ((soundLs.length === 0) && (soundRs.length === 0)) {
                return;
            }

            // PCM parameters
            var CHANNEL = (numberOfChannels === 1) ? 1 : 2;
            var QBIT    = (qbit === 8) ? 8 : 16;
            var SIZE    = (CHANNEL === 1) ? Math.min(soundLs.length, soundRs.length) : (2 * Math.min(soundLs.length, soundRs.length));

            /** @type {Uint8Array|Int16Array} */
            var sounds = null;

            switch (QBIT) {
                case 8:
                    sounds = new Uint8Array(SIZE);

                    for (var i = 0; i < SIZE; i++) {
                        // Convert 8 bit unsigned integer (-1 -> 0, 0 -> 128, 1 -> 255)
                        var binary = 0;

                        if ((i % CHANNEL) === 0) {
                            binary = ((soundLs[Math.floor(i / CHANNEL)] + 1) / 2) * (Math.pow(2, 8) - 1);  // Left channel
                        } else {
                            binary = ((soundRs[Math.floor(i / CHANNEL)] + 1) / 2) * (Math.pow(2, 8) - 1);  // Right channel
                        }

                        // for preventing from clipping
                        if (binary > (Math.pow(2, 8) - 1)) {binary = (Math.pow(2, 8) - 1);}
                        if (binary < (Math.pow(2, 0) - 1)) {binary = (Math.pow(2, 0) - 1);}

                        sounds[i] = binary;
                    }

                    break;
                case 16:
                    sounds = new Int16Array(SIZE);

                    for (var i = 0; i < SIZE; i++) {
                        // Convert 16 bit integer (-1 -> -32768, 0 -> 0, 1 -> 32767)
                        var binary = 0;

                        if ((i % CHANNEL) === 0) {
                            binary = soundLs[Math.floor(i / CHANNEL)] * Math.pow(2, 15);  // Left channel
                        } else {
                            binary = soundRs[Math.floor(i / CHANNEL)] * Math.pow(2, 15);  // Right channel
                        }

                        // for preventing from clipping
                        if (binary > (+Math.pow(2, 15) - 1)) {binary =  Math.pow(2, 15) - 1;}
                        if (binary < (-Math.pow(2, 15) - 1)) {binary = -Math.pow(2, 15) - 1;}

                        sounds[i] = binary;
                    }

                    break;
                default:
                    break;
            }

            // Create WAVE file (Object URL or Data URL)
            var FMT_CHUNK  = 28;
            var DATA_CHUNK =  8 + (SIZE * (QBIT / 8));
            var CHUNK_SIZE = 36 + (SIZE * (QBIT / 8));
            var RIFF_CHUNK =  8 + (FMT_CHUNK + DATA_CHUNK);
            var RATE       = this.sampleRate;
            var BPS        = RATE * CHANNEL * (QBIT / 8);
            var DATA_SIZE  = SIZE * (QBIT / 8);

            global.URL = global.URL || global.webkitURL || global.mozURL;

            if (global.URL && global.URL.createObjectURL) {
                // Object URL

                var waves = [];

                waves[0] = 0x52;  // 'R'
                waves[1] = 0x49;  // 'I'
                waves[2] = 0x46;  // 'F'
                waves[3] = 0x46;  // 'F'

                waves[4] = (CHUNK_SIZE >>  0) & 0xFF;
                waves[5] = (CHUNK_SIZE >>  8) & 0xFF;
                waves[6] = (CHUNK_SIZE >> 16) & 0xFF;
                waves[7] = (CHUNK_SIZE >> 24) & 0xFF;

                waves[8]  = 0x57;  // 'W'
                waves[9]  = 0x41;  // 'A'
                waves[10] = 0x56;  // 'V'
                waves[11] = 0x45;  // 'E'

                // fmt chunk
                waves[12] = 0x66;  // 'f'
                waves[13] = 0x6D;  // 'm'
                waves[14] = 0x74;  // 't'
                waves[15] = 0x20;  // ' '

                waves[16] = 16;
                waves[17] =  0;
                waves[18] =  0;
                waves[19] =  0;

                waves[20] = 1;
                waves[21] = 0;

                // fmt chunk -> Channels (Monaural or Stereo)
                waves[22] = CHANNEL;
                waves[23] = 0;

                // fmt chunk -> Sample rate
                waves[24] = (RATE >>  0) & 0xFF;
                waves[25] = (RATE >>  8) & 0xFF;
                waves[26] = (RATE >> 16) & 0xFF;
                waves[27] = (RATE >> 24) & 0xFF;

                // fmt chunk -> Byte per second
                waves[28] = (BPS >>  0) & 0xFF;
                waves[29] = (BPS >>  8) & 0xFF;
                waves[30] = (BPS >> 16) & 0xFF;
                waves[31] = (BPS >> 24) & 0xFF;

                // fmt chunk -> Block size
                waves[32] = CHANNEL * (QBIT / 8);
                waves[33] = 0;

                // fmt chunk -> Byte per Sample
                waves[34] = QBIT;
                waves[35] = 0;

                // data chunk
                waves[36] = 0x64;  // 'd'
                waves[37] = 0x61;  // 'a'
                waves[38] = 0x74;  // 't
                waves[39] = 0x61;  // 'a'

                waves[40] = (DATA_SIZE >>  0) & 0xFF;
                waves[41] = (DATA_SIZE >>  8) & 0xFF;
                waves[42] = (DATA_SIZE >> 16) & 0xFF;
                waves[43] = (DATA_SIZE >> 24) & 0xFF;

                for (var i = 0; i < SIZE; i++) {
                    switch (QBIT) {
                        case  8:
                            waves[(RIFF_CHUNK - DATA_SIZE) + i] = sounds[i];
                            break;
                        case 16:
                            // The byte order in WAVE file is little endian
                            waves[(RIFF_CHUNK - DATA_SIZE) + (2 * i) + 0] = ((sounds[i] >> 0) & 0xFF);
                            waves[(RIFF_CHUNK - DATA_SIZE) + (2 * i) + 1] = ((sounds[i] >> 8) & 0xFF);
                            break;
                        default:
                            break;
                    }
                }

                var blob      = new Blob([new Uint8Array(waves)], {type : 'audio/wav'});
                var objectURL = global.URL.createObjectURL(blob);

                return objectURL;
            } else {
                // Data URL

                var wave = '';

                wave += 'RIFF';
                wave += String.fromCharCode(((CHUNK_SIZE >> 0) & 0xFF), ((CHUNK_SIZE >> 8) & 0xFF), ((CHUNK_SIZE >> 16) & 0xFF), ((CHUNK_SIZE >> 24) & 0xFF));
                wave += 'WAVE';

                // fmt chunk
                wave += 'fmt' + ' ' + String.fromCharCode(16, 0, 0, 0);
                wave += String.fromCharCode(1, 0);

                // fmt chunk -> Channels (Monaural or Stereo)
                wave += String.fromCharCode(CHANNEL, 0);

                // fmt chunk -> Sample rate
                wave += String.fromCharCode(((RATE >> 0) & 0xFF), ((RATE >> 8) & 0xFF), ((RATE >> 16) & 0xFF), ((RATE >> 24) & 0xFF));

                // fmt chunk -> Byte per second
                wave += String.fromCharCode(((BPS >> 0) & 0xFF), ((BPS >> 8) & 0xFF), ((BPS >> 16) & 0xFF), ((BPS >> 24) & 0xFF));

                // fmt chunk -> Block size
                wave += String.fromCharCode((CHANNEL * (QBIT / 8)), 0);

                // fmt chunk -> Byte per Sample
                wave += String.fromCharCode(QBIT, 0);

                // data chunk
                wave += 'data';
                wave += String.fromCharCode(((DATA_SIZE >> 0) & 0xFF), ((DATA_SIZE >> 8) & 0xFF), ((DATA_SIZE >> 16) & 0xFF), ((DATA_SIZE >> 24) & 0xFF));

                for (var i = 0; i < SIZE; i++) {
                    switch (QBIT) {
                        case  8:
                            wave += String.fromCharCode(sounds[i]);
                            break;
                        case 16:
                            // The byte order in WAVE file is little endian
                            wave += String.fromCharCode(((sounds[i] >> 0) & 0xFF), ((sounds[i] >> 8) & 0xFF));
                            break;
                        default:
                            break;
                    }
                }

                var base64  = global.btoa(wave);
                var dataURL = 'data:audio/wav;base64,' + base64;

                return dataURL;
            }
        };

        /** @override */
        Recorder.prototype.toString = function() {
            return '[SoundModule Recorder]';
        };

        /**
         * This private class defines properties for sound session on network.
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @param {number} numberOfInputs This argument is the number of inputs for ScriptProcessorNode.
         * @param {number} numberOfOutputs This argument the number of outputs for ScriptProcessorNode.
         * @param {Analyser} analyser This argument is the instance of Analyser.
         * @constructor
         * @implements {Statable}
         */
        function Session(context, bufferSize, numberOfInputs, numberOfOutputs, analyser) {
            // Call interface constructor
            Statable.call(this);

            this.isActive = false;

            this.context  = context;
            this.analyser = analyser;  // the instance of Analyser

            this.sender   = context.createScriptProcessor(bufferSize, numberOfInputs, numberOfOutputs);
            this.receiver = context.createScriptProcessor(bufferSize, numberOfInputs, numberOfOutputs);

            this.websocket = null;  // for the instance of WebSocket
            this.paused    = true;  // for preventing from  the duplicate onaudioprocess event ("start" method)
        }

        /**
         * This method creates the instance of WebSocket and registers event handlers.
         * @param {boolean} tls This argument is in order to select protocol (either 'wss' or 'ws').
         * @param {string} host This argument is server's hostname.
         * @param {number} port This argument is port number for connection.
         * @param {string} path This argument is file that is executed in server side.
         * @param {function} openCallback This argument is invoked as "onopen" event handler in the instance of WebSocket.
         * @param {function} closeCallback This argument is invoked as "onclose" event handler in the instance of WebSocket.
         * @param {function} errorCallback This argument is invoked as "onerror" event handler in the instance of WebSocket.
         * @return {Session} This is returned for method chain.
         */
        Session.prototype.setup = function(tls, host, port, path, openCallback, closeCallback, errorCallback) {
            if (!navigator.onLine) {
                // Clear
                this.isActive = false;
                this.paused   = true;
                this.connect();
                this.websocket = null;

                throw new Error('Now Offline.');
            }

            // The argument is associative array ?
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                var properties = arguments[0];

                if ('tls'   in properties) {tls           = properties.tls;}
                if ('host'  in properties) {host          = properties.host;}
                if ('port'  in properties) {port          = properties.port;}
                if ('path'  in properties) {path          = properties.path;}
                if ('open'  in properties) {openCallback  = properties.open;}
                if ('close' in properties) {closeCallback = properties.close;}
                if ('error' in properties) {errorCallback = properties.error;}
            }

            var scheme = tls ? 'wss://' : 'ws://';

            if (path.charAt(0) !== '/') {
                path = '/' + path;
            }

            var p = parseInt(port);

            if (isNaN(p) || (p < 0) || (p > 65535)) {
                return this;
            }

            this.websocket = new WebSocket(scheme + host + ':' + p + path);
            this.websocket.binaryType = 'arraybuffer';

            var self = this;

            this.websocket.onopen = function(event) {
                if (Object.prototype.toString.call(openCallback) === '[object Function]') {
                    openCallback(event);
                }
            };

            this.websocket.onclose = function(event) {
                self.isActive = false;
                self.paused   = true;

                self.connect();

                if (Object.prototype.toString.call(closeCallback) === '[object Function]') {
                    closeCallback(event);
                }
            };

            this.websocket.onerror = function(event) {
                self.isActive = false;
                self.paused   = true;

                self.connect();

                if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                    errorCallback(event);
                }
            };

            this.websocket.onmessage = function(event) {
                if (!self.isActive) {
                    self.analyser.stop('time');
                    self.analyser.stop('fft');

                    return;
                }

                if (event.data instanceof ArrayBuffer) {
                    var total  = event.data.byteLength / Float32Array.BYTES_PER_ELEMENT;
                    var length = Math.floor(total / 2);
                    var offset = length * Float32Array.BYTES_PER_ELEMENT;

                    var bufferLs = new Float32Array(event.data,      0, length);  // Get Left  channel data
                    var bufferRs = new Float32Array(event.data, offset, length);  // Get Right channel data

                    // Start drawing sound wave
                    self.analyser.start('time');
                    self.analyser.start('fft');

                    self.receiver.onaudioprocess = function(event) {
                        var outputLs = event.outputBuffer.getChannelData(0);
                        var outputRs = event.outputBuffer.getChannelData(1);

                        if (bufferLs instanceof Float32Array) {outputLs.set(bufferLs);}
                        if (bufferRs instanceof Float32Array) {outputRs.set(bufferRs);}

                        bufferLs = null;
                        bufferRs = null;

                        if (!self.isActive || (self.websocket === null)) {
                            self.analyser.stop('time');
                            self.analyser.stop('fft');
                        }
                    };
                }
            };

            return this;
        };

        /**
         * This method connects nodes according to state.
         * @return {Session} This is returned for method chain.
         */
        Session.prototype.connect = function() {
            // Clear connection
            this.receiver.disconnect(0);
            this.sender.disconnect(0);

            this.receiver.onaudioprocess = null;
            this.sender.onaudioprocess   = null;

            if (this.isActive) {
                // ScriptProcessorNode (Input) -> Analyser -> AudioDestinationNode (Output)
                this.receiver.connect(this.analyser.input);
                this.analyser.output.connect(this.context.destination);
            } else {
                this.paused = true;
            }

            return this;
        };

        /**
         * This method sends sound data to server.
         * @return {Session} This is returned for method chain.
         */
        Session.prototype.start = function() {
            if (this.isActive && this.isConnected() && this.paused) {
                this.paused = false;

                var self = this;

                this.sender.onaudioprocess = function(event) {
                    if (self.isActive && self.isConnected()) {
                        var inputLs = event.inputBuffer.getChannelData(0);
                        var inputRs = event.inputBuffer.getChannelData(1);

                        var buffers = new Float32Array(2 * this.bufferSize);
                        var offset  = parseInt(buffers.length / 2);

                        for (var i = 0; i < this.bufferSize; i++) {
                            buffers[i]          = inputLs[i];
                            buffers[offset + i] = inputRs[i];
                        }

                        if (self.websocket.bufferedAmount === 0) {
                            self.websocket.send(buffers);
                        }
                    }
                };
            }

            return this;
        };

        /**
         * This method closes connection to server and destroys the instance of WebSocket.
         * @return {Session} This is returned for method chain.
         */
        Session.prototype.close = function() {
            if (this.websocket instanceof WebSocket) {
                this.isActive = false;
                this.paused   = true;

                this.connect();
                this.websocket.close();

                this.websocket = null;
            }

            return this;
        };

        /**
         * This method determines whether there is the connection to server.
         * @return {boolean} If the connection to server exists, this value is true. Otherwise, this value is false.
         */
        Session.prototype.isConnected = function() {
            return (this.websocket instanceof WebSocket) && (this.websocket.readyState === WebSocket.OPEN);
        };

        /** @override */
        Session.prototype.state = function(state, stateCallback, waitCallback) {
            if (state === undefined) {
                // Getter
                return this.isActive;
            }

            if (Object.prototype.toString.call(waitCallback) === '[object Function]') {
                waitCallback();
            }

            var self = this;

            var intervalid = global.setInterval(function() {
                if ((self.websocket instanceof WebSocket) && (self.websocket.bufferedAmount !== 0)) {
                    return;
                }

                // Setter
                if (String(state).toLowerCase() === 'toggle') {
                    self.isActive = !self.isActive;
                } else {
                    self.isActive = Boolean(state);
                }

                self.connect();

                if (Object.prototype.toString.call(stateCallback) === '[object Function]') {
                    stateCallback();
                }

                global.clearInterval(intervalid);
            }, 10);

            // in the case of setter
            return this;
        };

        /**
         * This method gets the instance of WebSocket.
         * @return {WebSocket} This value is the instance of WebSocket.
         */
        Session.prototype.get = function() {
            return this.websocket;
        };

        /** @override */
        Session.prototype.toString = function() {
            return '[SoundModule Session]';
        };

        /**
         * This private class defines common properties for effector classes.
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @implements {Statable}
         */
        function Effector(context, bufferSize) {
            // Call interface constructor
            Statable.call(this);

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
                return this.isActive;  // Getter
            } else if (String(state).toLowerCase() === 'toggle') {
                this.isActive = !this.isActive;  // Setter
            } else {
                this.isActive = Boolean(state);  // Setter
            }

            // in the case of setter

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

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Compressor(context, bufferSize) {
            Effector.call(this, context, bufferSize);

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
                        // Getter
                        return this.compressor[k].value;
                    } else {
                        // Setter
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

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Distortion(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.distortion = context.createWaveShaper();
            this.drive      = context.createGain();
            this.color      = context.createBiquadFilter();
            this.tone       = context.createBiquadFilter();

            // Distortion type
            this.type = Distortion.CURVES.CLEAN;

            // for creating curve
            this.numberOfSamples = 4096;

            // Initialize parameters
            this.drive.gain.value      = 1;
            this.color.type            = (Object.prototype.toString.call(this.color.type) === '[object String]') ? 'bandpass' : (this.color.BANDPASS || 2);
            this.color.frequency.value = 350;
            this.color.Q.value         = Math.SQRT1_2;
            this.color.gain.value      = 0;  // Not used
            this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
            this.tone.frequency.value  = 350;
            this.tone.Q.value          = Math.SQRT1_2;
            this.tone.gain.value       = 0;  // Not used

            // Distortion is not connected by default
            this.state(false);
        }

        /**
         * Class (Static) properties
         */
        Distortion.CURVES            = {};
        Distortion.CURVES.CLEAN      = 'clean';
        Distortion.CURVES.CRUNCH     = 'crunch';
        Distortion.CURVES.OVERDRIVE  = 'overdrive';
        Distortion.CURVES.DISTORTION = 'distortion';
        Distortion.CURVES.FUZZ       = 'fuzz';

        /**
         * This class (static) method creates the instance of Float32Array for distortion.
         * @param {number} amount This argument is the depth of distortion.
         * @param {number} numberOfSamples This argument is the size of Float32Array.
         * @return {Float32Array|null} This is "curve" property in WaveShaperNode.
         */
        Distortion.createCurve = function(amount, numberOfSamples) {
            if ((amount > 0) && (amount < 1)) {
                var curves = new Float32Array(numberOfSamples);

                var k = (2 * amount) / (1 - amount);

                for (var i = 0; i < numberOfSamples; i++) {
                    // LINEAR INTERPOLATION: x := (c - a) * (z - y) / (b - a) + y
                    // a = 0, b = 2048, z = 1, y = -1, c = i
                    var x = (((i - 0) * (1 - (-1))) / (numberOfSamples - 0)) + (-1);
                    curves[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
                }

                return curves;
            } else {
                return null;  // Clean sound (default value)
            }
        };

        /** @override */
        Distortion.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else  {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'curve':
                        if (value === undefined) {
                            // Getter
                            return this.distortion.curve;
                        } else {
                            // Setter
                            var AMOUNTS = {
                                'CLEAN'     : 0.0,
                                'CRUNCH'    : 0.5,
                                'OVERDRIVE' : 0.7,
                                'DISTORTION': 0.8,
                                'FUZZ'      : 0.9
                            };

                            var curve = null;

                            switch (String(value).toLowerCase()) {
                                case Distortion.CURVES.CLEAN:
                                    this.type = Distortion.CURVES.CLEAN;
                                    curve = Distortion.createCurve(AMOUNTS.CLEAN, this.numberOfSamples);
                                    break;
                                case Distortion.CURVES.CRUNCH:
                                    this.type = Distortion.CURVES.CRUNCH;
                                    curve = Distortion.createCurve(AMOUNTS.CRUNCH, this.numberOfSamples);
                                    break;
                                case Distortion.CURVES.OVERDRIVE:
                                    this.type = Distortion.CURVES.OVERDRIVE;
                                    curve = Distortion.createCurve(AMOUNTS.OVERDRIVE, this.numberOfSamples);
                                    break;
                                case Distortion.CURVES.DISTORTION:
                                    this.type = Distortion.CURVES.DISTORTION;
                                    curve = Distortion.createCurve(AMOUNTS.DISTORTION, this.numberOfSamples);
                                    break;
                                case Distortion.CURVES.FUZZ:
                                    this.type = Distortion.CURVES.FUZZ;
                                    curve = Distortion.createCurve(AMOUNTS.FUZZ, this.numberOfSamples);
                                    break;
                                default:
                                    if (value instanceof Float32Array) {
                                        curve = value;
                                    }

                                    break;
                            }

                            this.distortion.curve = curve;
                        }

                        break;
                    case 'samples':
                        if (value === undefined) {
                            // Getter
                            return this.numberOfSamples;
                        } else {
                            // Setter
                            var v = parseInt(value);

                            if (v >= 0) {
                                this.numberOfSamples = v;
                                this.param('curve', this.type);
                            }
                        }

                        break;
                    case 'drive':
                        if (value === undefined) {
                            // Getter
                            return this.drive.gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.drive.gain.minValue || 0;
                            var max = this.drive.gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.drive.gain.value = v;
                            }
                        }

                        break;
                    case 'color':
                    case 'tone' :
                        if (value === undefined) {
                            // Getter
                            return this[k].frequency.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this[k].frequency.minValue || 10;
                            var max = this[k].frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this[k].frequency.value = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Distortion.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.distortion.disconnect(0);
            this.drive.disconnect(0);
            this.color.disconnect(0);
            this.tone.disconnect(0);

            if (this.isActive) {
                // Effect ON

                // GainNode (Input) -> BiquadFilterNode (Color) -> WaveShaperNode (Distortion) -> GainNode (Drive) -> BiquadFilterNode (Tone) -> GainNode (Output)
                this.input.connect(this.color);
                this.color.connect(this.distortion);
                this.distortion.connect(this.drive);
                this.drive.connect(this.tone);
                this.tone.connect(this.output);
            } else {
                // Effect OFF

                // GainNode (Input) -> GainNode (Output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Distortion.prototype.params = function() {
            var params = {
                'state'  : this.isActive,
                'curve'  : this.type,
                'samples': this.numberOfSamples,
                'drive'  : this.drive.gain.value,
                'color'  : this.color.frequency.value,
                'tone'   : this.tone.frequency.value
            };

            return params;
        };

        /** @ovreride */
        Distortion.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Distortion.prototype.toString = function() {
            return '[SoundModule Distortion]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Wah(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.lowpass = context.createBiquadFilter();

            // Initialize parameters
            this.lowpass.type            = (Object.prototype.toString.call(this.lowpass.type) === '[object String]') ? 'lowpass' : (this.lowpass.LOWPASS || 0);
            this.lowpass.frequency.value = 350;
            this.lowpass.Q.value         = 1;
            this.lowpass.gain.value      = 0;    // Not used

            this.depth.gain.value  = 0;
            this.rate.value        = 0;
            this.depthRate         = 0;

            // Wah is not connected by default
            this.state(false);

            // LFO
            // OscillatorNode (LFO) -> GainNode (Depth) -> AudioParam (frequency)
            this.lfo.connect(this.depth);
            this.depth.connect(this.lowpass.frequency);
        };

        /** @override */
        Wah.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'frequency':
                    case 'cutoff'   :
                        if (value === undefined) {
                            // Getter
                            return this.lowpass.frequency.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.lowpass.frequency.minValue || 10;
                            var max = this.lowpass.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this.lowpass.frequency.value = v;
                                this.depth.gain.value        = this.lowpass.frequency.value * this.depthRate;
                            }
                        }

                        break;
                    case 'depth':
                        if (value === undefined) {
                            // Getter
                            return this.depthRate;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth.gain.value = this.lowpass.frequency.value * v;
                                this.depthRate        = v;
                            }
                        }

                        break;
                    case 'rate':
                        if (value === undefined) {
                            // Getter
                            return this.rate.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;
                            }
                        }

                        break;
                    case 'resonance':
                        if (value === undefined) {
                            // Getter
                            return this.lowpass.Q.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.lowpass.Q.minValue || 0.0001;
                            var max = this.lowpass.Q.maxValue || 1000;

                            if ((v >= min) && (v <= max)) {
                                this.lowpass.Q.value = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Wah.prototype.stop = function(stopTime, releaseTime) {
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            // Effector's state is active ?
            if (this.isActive) {
                // Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.lowpass.frequency);
            }

            return this;
        };

        /** @override */
        Wah.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.lowpass.disconnect(0);

            if (this.isActive) {
                // Effect ON

                // GainNode (Input) -> BiquadFilterNode (Low-Pass Filter) -> GainNode (Output)
                this.input.connect(this.lowpass);
                this.lowpass.connect(this.output);
            } else {
                // Effect OFF

                // GainNode (Input) -> GainNode (Output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Wah.prototype.params = function() {
            var params = {
                'state'    : this.isActive,
                'cutoff'   : this.lowpass.frequency.value,
                'depth'    : this.depthRate,
                'rate'     : this.rate.value,
                'resonance': this.lowpass.Q.value
            };

            return params;
        };

        /** @override */
        Wah.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Wah.prototype.toString = function() {
            return '[SoundModule Wah]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Equalizer(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.bass     = context.createBiquadFilter();
            this.middle   = context.createBiquadFilter();
            this.treble   = context.createBiquadFilter();
            this.presence = context.createBiquadFilter();

            // Set filter type
            this.bass.type     = (Object.prototype.toString.call(this.bass.type)     === '[object String]') ? 'lowshelf'  : (this.bass.LOWSHELF      || 3);
            this.middle.type   = (Object.prototype.toString.call(this.middle.type)   === '[object String]') ? 'peaking'   : (this.middle.PEAKING     || 5);
            this.treble.type   = (Object.prototype.toString.call(this.treble.type)   === '[object String]') ? 'peaking'   : (this.treble.PEAKING     || 5);
            this.presence.type = (Object.prototype.toString.call(this.presence.type) === '[object String]') ? 'highshelf' : (this.presence.HIGHSHELF || 4);

            // Set cutoff frequency
            this.bass.frequency.value     =  500;  // 500 Hz
            this.middle.frequency.value   = 1000;  // 1 kHz
            this.treble.frequency.value   = 2000;  // 2 kHz
            this.presence.frequency.value = 4000;  // 4 kHz

            // Set Q
            // this.bass.Q.value     = Math.SQRT1_2;  // Not used
            this.middle.Q.value   = Math.SQRT1_2;
            this.treble.Q.value   = Math.SQRT1_2;
            // this.presence.Q.value = Math.SQRT1_2;  // Not used

            // Set Gain
            this.bass.gain.value     = 0;
            this.middle.gain.value   = 0;
            this.treble.gain.value   = 0;
            this.presence.gain.value = 0;

            // Equalizer is not connected by default
            this.state(false);
        }

        /** @override */
        Equalizer.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'bass'    :
                    case 'middle'  :
                    case 'treble'  :
                    case 'presence':
                        if (value === undefined) {
                            // Getter
                            return this[k].gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || -40;
                            var max = this[k].gain.maxValue ||  40;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;
                            }
                        }

                        break
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Equalizer.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.bass.disconnect(0);
            this.middle.disconnect(0);
            this.treble.disconnect(0);
            this.presence.disconnect(0);

            if (this.isActive) {
                // Effect ON

                // GainNode (Input) -> BiquadFilterNode (Bass) -> BiquadFilterNode (Middle) -> BiquadFilterNode (Treble) -> BiquadFilterNode (Presence) -> GainNode (Output)
                this.input.connect(this.bass);
                this.bass.connect(this.middle);
                this.middle.connect(this.treble);
                this.treble.connect(this.presence);
                this.presence.connect(this.output);
            } else {
                // Effect OFF

                // GainNode (Input) -> GainNode (Output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Equalizer.prototype.params = function() {
            var params = {
                'state'   : this.isActive,
                'bass'    : this.bass.gain.value,
                'middle'  : this.middle.gain.value,
                'treble'  : this.treble.gain.value,
                'presence': this.presence.gain.value
            };

            return params;
        };

        /** @override */
        Equalizer.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Equalizer.prototype.toString = function() {
            return '[SoundModule Equalizer]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Filter(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.filter = context.createBiquadFilter();

            // for legacy browsers
            this.filter.frequency.setTargetAtTime = this.filter.frequency.setTargetAtTime || this.filter.frequency.setTargetValueAtTime;

            // Initialize parameters
            this.filter.type            = (Object.prototype.toString.call(this.filter.type) === '[object String]') ? 'lowpass' : (this.filter.LOWPASS || 0);
            this.filter.frequency.value = 350;
            this.filter.Q.value         = 1;
            this.filter.gain.value      = 0;

            this.maxFrequency = this.filter.frequency.value;
            this.range        = 0.1;  // 10% -> between this.maxFrequency * 0.1 and this.maxFrequency

            this.attack  = 0.01;
            this.decay   = 0.3;
            this.sustain = 1.0;
            this.release = 1.0;

            // Filter is not connected by default
            this.state(false);
        }

        /** @override */
        Filter.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'type':
                        if (value === undefined) {
                            // Getter
                            return this.filter.type;
                        } else {
                            // Setter
                            var v = String(value).toLowerCase();

                            // for legacy browsers
                            var FILTER_TYPES = {
                                'lowpass'  : this.filter.LOWPASS   || 0,
                                'highpass' : this.filter.HIGHPASS  || 1,
                                'bandpass' : this.filter.BANDPASS  || 2,
                                'lowshelf' : this.filter.LOWSHELF  || 3,
                                'highshelf': this.filter.HIGHSHELF || 4,
                                'peaking'  : this.filter.PEAKING   || 5,
                                'notch'    : this.filter.NOTCH     || 6,
                                'allpass'  : this.filter.ALLPASS   || 7
                            };

                            if (v in FILTER_TYPES) {
                                this.filter.type = (Object.prototype.toString.call(this.filter.type) === '[object String]') ? v : FILTER_TYPES[v];
                            }
                        }

                        break;
                    case 'frequency':
                    case 'cutoff'   :
                        if (value === undefined) {
                            // Getter
                            return this.filter.frequency.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.filter.frequency.minValue || 10;
                            var max = this.filter.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this.maxFrequency           = v;
                                this.filter.frequency.value = v;
                            }
                        }

                        break;
                    case 'gain':
                        if (value === undefined) {
                            // Getter
                            return this.filter.gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.filter.gain.minValue || -40;
                            var max = this.filter.gain.maxValue ||  40;

                            if ((v >= min) && (v <= max)) {
                                this.filter.gain.value = v;
                            }
                        }

                        break;
                    case 'q':
                        if (value === undefined) {
                            // Getter
                            return this.filter.Q.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.filter.Q.minValue || 0.0001;
                            var max = this.filter.Q.maxValue || 1000;

                            if ((v >= min) && (v <= max)) {
                                this.filter.Q.value = v;
                            }
                        }

                        break;
                    case 'range':
                        if (value === undefined) {
                            // Getter
                            return this.range;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                this.range= v;
                            }
                        }

                        break;
                    case 'attack' :
                    case 'decay'  :
                    case 'sustain':
                    case 'release':
                        if (value === undefined) {
                            // Getter
                            return this[k];
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (v >= 0) {
                                this[k] = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Filter.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.filter.disconnect(0);

            if (this.isActive) {
                // Effector ON

                // GainNode (Input) -> BiquadFilterNode -> GainNode (Output)
                this.input.connect(this.filter);
                this.filter.connect(this.output);
            } else {
                // Effector OFF

                // GainNode (Input) -> GainNode (Output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Filter.prototype.start = function(startTime) {
            if (this.isActive) {
                var s = parseFloat(startTime);

                if (isNaN(s) || (s < this.context.currentTime)) {
                    s = this.context.currentTime;
                }

                var t0      = s;
                var t1      = t0 + this.attack;
                var t2      = this.decay;
                var t2Value = this.sustain * this.maxFrequency;

                var minFrequnecy = this.maxFrequency * this.range;

                // Envelope Generator for filter
                this.filter.frequency.cancelScheduledValues(t0);
                this.filter.frequency.setValueAtTime(minFrequnecy, t0);
                this.filter.frequency.linearRampToValueAtTime(this.maxFrequency, t1);  // Attack
                this.filter.frequency.setTargetAtTime(t2Value, t1, t2);  // Decay -> Sustain
            }

            return this;
        };

        /** @override */
        Filter.prototype.stop = function(stopTime) {
            if (this.isActive) {
                var s = parseFloat(stopTime) - this.release;

               if (isNaN(s) || (s < this.context.currentTime)) {
                   s = this.context.currentTime;
               }

                var t3 = s;
                var t4 = this.release;

                var minFrequnecy = this.maxFrequency * this.range;

                // Envelope Generator for filter
                this.filter.frequency.cancelScheduledValues(t3);
                this.filter.frequency.setValueAtTime(this.filter.frequency.value, t3);
                this.filter.frequency.setTargetAtTime(minFrequnecy, t3, t4);  // Sustain -> Release
            }

            return this;
        };

        /** @override */
        Filter.prototype.state = function(state) {
            if (state === undefined) {
                return this.isActive;  // Getter
            } else if (String(state).toLowerCase() === 'toggle') {
                this.isActive = !this.isActive;  // Setter
            } else {
                this.isActive = Boolean(state);  // Setter
            }

            // in the case of setter

            // Change connection
            this.connect();

            return this;
        };

        /** @override */
        Filter.prototype.params = function() {
            var params = {
                'state'    : this.isActive,
                'type'     : this.filter.type,
                'frequency': this.filter.frequency.value,
                'Q'        : this.filter.Q.value,
                'gain'     : this.filter.gain.value,
                'range'    : this.range,
                'attack'   : this.attack,
                'decay'    : this.decay,
                'sustain'  : this.sustain,
                'release'  : this.release
            };

            return params;
        };

        /** @override */
        Filter.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Filter.prototype.toString = function() {
            return '[SoundModule Filter]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Autopanner(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.panner = context.createStereoPanner();

            // Initialize parameters
            this.panner.pan.value = 0;
            this.depth.gain.value = 0;
            this.rate.value       = 0;

            // Autopanner is not connected by default
            this.state(false);

            // LFO
            // OscillatorNode (LFO) -> GainNode (Depth) -> AudioParam (pan)
            this.lfo.connect(this.depth);
            this.depth.connect(this.panner.pan);
        };

        /** @override */
        Autopanner.prototype.param = function(key, value) {
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
                            // Getter
                           return this.depth.gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.depth.gain.minValue || 0;
                            var max = this.depth.gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth.gain.value = v;
                            }
                        }

                        break;
                    case 'rate':
                        if (value === undefined) {
                            // Getter
                           return this.rate.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Autopanner.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.panner.disconnect(0);

            if (this.isActive) {
                // Effect ON

                // GainNode (Input) -> StereoPannerNode -> GainNode (Output)
                this.input.connect(this.panner);
                this.panner.connect(this.output);
            } else {
                // Effect OFF

                // GainNode (Input) -> GainNode (Output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Autopanner.prototype.stop = function(stopTime, releaseTime) {
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            // Effector's state is active ?
            if (this.isActive) {
                // Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.panner.pan);
            }

            return this;
        };

        /** @override */
        Autopanner.prototype.params = function() {
            var params = {
                'state': this.isActive,
                'depth': this.depth.gain.value,
                'rate' : this.rate.value
            };

            return params;
        };

        /** @override */
        Autopanner.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Autopanner.prototype.toString = function() {
            return '[SoundModule Autopanner]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function AutopannerFallback(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.amplitudeL = context.createGain();
            this.amplitudeR = context.createGain();
            this.splitter   = context.createChannelSplitter(2);
            this.merger     = context.createChannelMerger(2);

            this.amplitudeL.gain.value = 1;  // 1 +- depth
            this.amplitudeR.gain.value = 1;  // 1 +- depth

            // Initialize parameters
            this.depth.gain.value = 0;
            this.rate.value       = 0;

            // AutopannerFallback is not connected by default
            this.state(false);

            // LFO
            this.lfoSplitter = context.createChannelSplitter(2);

            // OscillatorNode (LFO) -> GainNode (Depth) -> ScriptProcessorNode -> ChannelSplitterNode -> AudioParam (gain) (L) / (R)
            this.lfo.connect(this.depth);
            this.depth.connect(this.processor);
            this.processor.connect(this.lfoSplitter);
            this.lfoSplitter.connect(this.amplitudeL.gain, 0);
            this.lfoSplitter.connect(this.amplitudeR.gain, 1);
        };

        /** @override */
        AutopannerFallback.prototype.param = function(key, value) {
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
                            // Getter
                            return this.depth.gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.depth.gain.minValue || 0;
                            var max = this.depth.gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth.gain.value = v;
                            }
                        }

                        break;
                    case 'rate':
                        if (value === undefined) {
                            // Getter
                            return this.rate.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        AutopannerFallback.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.amplitudeL.disconnect(0);
            this.amplitudeR.disconnect(0);
            this.splitter.disconnect(0);
            this.splitter.disconnect(1);
            this.merger.disconnect(0);

            if (this.isActive) {
                // GainNode (Input) -> ChannelSplitterNode -> GainNode (L) / (R) -> ChannelMergerNode -> GainNode (Output)
                this.input.connect(this.splitter);
                this.splitter.connect(this.amplitudeL, 0, 0);
                this.splitter.connect(this.amplitudeR, 1, 0);
                this.amplitudeL.connect(this.merger, 0, 0);
                this.amplitudeR.connect(this.merger, 0, 1);
                this.merger.connect(this.output);
            } else {
                // GainNode (Input) -> GainNode (Output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        AutopannerFallback.prototype.start = function(startTime) {
            if (this.isActive && this.isStop) {
                var s = parseFloat(startTime);

                if (isNaN(s) || (s < this.context.currentTime)) {
                    s = this.context.currentTime;
                }

                this.lfo.start(s);
                this.isStop = false;

                var self = this;

                this.processor.onaudioprocess = function(event) {
                    var inputs   = event.inputBuffer.getChannelData(0);
                    var outputLs = event.outputBuffer.getChannelData(0);
                    var outputRs = event.outputBuffer.getChannelData(1);

                    if (self.isActive && (self.depth.gain.value !== 0) && (self.rate.value !== 0)) {
                        for (var i = 0; i < this.bufferSize; i++) {
                            outputLs[i] =  inputs[i];
                            outputRs[i] = -inputs[i];
                        }
                    } else {
                        for (var i = 0; i < this.bufferSize; i++) {
                            outputLs[i] = 0;
                            outputRs[i] = 0;
                        }
                    }
                };
            }

            return this;
        };

        /** @override */
        AutopannerFallback.prototype.stop = function(stopTime, releaseTime) {
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            // Effector's state is active ?
            if (this.isActive) {
                // Stop onaudioprocess event
                this.processor.disconnect(0);
                this.processor.onaudioprocess = null;

                // Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.processor);
                this.processor.connect(this.lfoSplitter);
                this.lfoSplitter.connect(this.amplitudeL.gain, 0);
                this.lfoSplitter.connect(this.amplitudeR.gain, 1);
            }

            return this;
        };

        /** @override */
        AutopannerFallback.prototype.params = function() {
            var params = {
                'state': this.isActive,
                'depth': this.depth.gain.value,
                'rate' : this.rate.value
            };

            return params;
        };

        /** @override */
        AutopannerFallback.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        AutopannerFallback.prototype.toString = function() {
            return '[SoundModule AutopannerFallback]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Tremolo(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.amplitude = context.createGain();

            this.amplitude.gain.value = 1;  // 1 +- depth

            // Initialize parameter
            this.depth.gain.value = 0;
            this.rate.value       = 0;

            // Tremolo is not connected by default
            this.state(false);

            // LFO
            // OscillatorNode (LFO) -> GainNode (Depth) -> AudioParam (gain)
            this.lfo.connect(this.depth);
            this.depth.connect(this.amplitude.gain);
        }

        /** @override */
        Tremolo.prototype.param = function(key, value) {
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
                            // Getter
                            return this.depth.gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.depth.gain.minValue || 0;
                            var max = this.depth.gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth.gain.value = v;
                            }
                        }

                        break;
                    case 'rate':
                        if (value === undefined) {
                            // Getter
                            return this.rate.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;
                            }
                        }

                        break;
                    case 'wave':
                        if (value === undefined) {
                            // Getter
                            return this.lfo.type;
                        } else {
                            // Setter
                            var v = String(value).toLowerCase();

                            // for legacy browsers
                            var WAVE_TYPE = {
                                'sine'    : this.lfo.SINE     || 0,
                                'square'  : this.lfo.SQUARE   || 1,
                                'sawtooth': this.lfo.SAWTOOTH || 2,
                                'triangle': this.lfo.TRIANGLE || 3
                            };

                            if (v in WAVE_TYPE) {
                                this.lfo.type = (Object.prototype.toString.call(this.lfo.type) === '[object String]') ? v : WAVE_TYPE[v];
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Tremolo.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.amplitude.disconnect(0);

            if (this.isActive) {
                // Effect ON

                // GainNode (Input) -> GainNode -> GainNode (Output)
                this.input.connect(this.amplitude);
                this.amplitude.connect(this.output);
            } else {
                // Effect OFF

                // GainNode (Input) -> GainNode (Output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Tremolo.prototype.stop = function(stopTime, releaseTime) {
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            // Effector's state is active ?
            if (this.isActive) {
                // Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.amplitude.gain);
            }

            return this;
        };

        /** @override */
        Tremolo.prototype.params = function() {
            var params = {
                'state': this.isActive,
                'depth': this.depth.gain.value,
                'rate' : this.rate.value,
                'wave' : this.lfo.type
            };

            return params;
        };

        /** @override */
        Tremolo.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Tremolo.prototype.toString = function() {
            return '[SoundModule Tremolo]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Ringmodulator(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.amplitude = context.createGain();

            this.amplitude.gain.value = 0;  // 0 +- depth

            // Initialize parameter
            this.depth.gain.value = 1;
            this.rate.value       = 0;

            // Ring Modulator is not connected by default
            this.state(false);

            // LFO
            // OscillatorNode (LFO) -> GainNode (Depth) -> AudioParam (gain)
            this.lfo.connect(this.depth);
            this.depth.connect(this.amplitude.gain);
        }

        /** @override */
        Ringmodulator.prototype.param = function(key, value) {
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
                            // Getter
                            return this.depth.gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.depth.gain.minValue || 0;
                            var max = this.depth.gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth.gain.value = v;
                            }
                        }

                        break;
                    case 'rate':
                        if (value === undefined) {
                            // Getter
                            return this.rate.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Ringmodulator.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.amplitude.disconnect(0);

            if (this.isActive) {
                // Effect ON

                // GainNode (Input) -> GainNode -> GainNode (Output)
                this.input.connect(this.amplitude);
                this.amplitude.connect(this.output);
            } else {
                // Effect OFF

                // GainNode (Input) -> GainNode (Output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Ringmodulator.prototype.stop = function(stopTime, releaseTime) {
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            // Effector's state is active ?
            if (this.isActive) {
                // Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.amplitude.gain);
            }

            return this;
        };

        /** @override */
        Ringmodulator.prototype.params = function() {
            var params = {
                'state': this.isActive,
                'depth': this.depth.gain.value,
                'rate' : this.rate.value
            };

            return params;
        };

        /** @override */
        Ringmodulator.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Ringmodulator.prototype.toString = function() {
            return '[SoundModule Ringmodulator]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Phaser(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.numberOfStages = 12;  // The default number of All-Pass Filters
            this.filters        = new Array(Phaser.MAXIMUM_STAGES);

            for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
                this.filters[i]                 = context.createBiquadFilter();
                this.filters[i].type            = (Object.prototype.toString.call(this.filters[i].type) === '[object String]') ? 'allpass' : (this.filters[i].ALLPASS || 7);
                this.filters[i].frequency.value = 350;
                this.filters[i].Q.value         = 1;
                this.filters[i].gain.value      = 0;  // Not used
            }

            this.mix      = context.createGain();
            this.feedback = context.createGain();

            // Initialize parameters
            this.depth.gain.value    = 0;
            this.rate.value          = 0;
            this.mix.gain.value      = 0;
            this.feedback.gain.value = 0;
            this.depthRate           = 0;

            // Phaser is not connected by default
            this.state(false);

            // LFO
            // GainNode (LFO) -> GainNode (Depth) -> AudioParam (frequency)
            this.lfo.connect(this.depth);

            for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
                this.depth.connect(this.filters[i].frequency);
            }
        }

        /**
         * Class (Static) property
         */
        Phaser.MAXIMUM_STAGES = 24;  // The maximum number of All-Pass Filters

        /** @override */
        Phaser.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'stage':
                        if (value === undefined) {
                            // Getter
                            return this.numberOfStages;
                        } else {
                            // Setter
                            var v = parseInt(value);

                            switch (v) {
                                case  0:
                                case  2:
                                case  4:
                                case  8:
                                case 12:
                                case 24:
                                    this.numberOfStages = v;
                                    this.connect();
                                    break;
                                default:
                                    break;
                            }
                        }

                        break;
                    case 'frequency':
                    case 'cutoff'   :
                        if (value === undefined) {
                            // Getter
                            return this.filters[0].frequency.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.filters[0].frequency.minValue || 10;
                            var max = this.filters[0].frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                // Setter
                                for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
                                    this.filters[i].frequency.value = v;
                                }

                                this.depth.gain.value = this.filters[0].frequency.value * this.depthRate;
                            }
                        }

                        break;
                    case 'resonance':
                        if (value === undefined) {
                            // Getter
                            return this.filters[0].Q.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.filters[0].Q.minValue || 0.0001;
                            var max = this.filters[0].Q.maxValue || 1000;

                            if ((v >= min) && (v <= max)) {
                                for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
                                    this.filters[0].Q.value = v;
                                }
                            }
                        }

                        break;
                    case 'depth':
                        if (value === undefined) {
                            // Getter
                            return this.depthRate;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth.gain.value = this.filters[0].frequency.value * v;
                                this.depthRate        = v;
                            }
                        }

                        break;
                    case 'rate':
                        if (value === undefined) {
                            // Getter
                            return this.rate.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;
                            }
                        }

                        break;
                    case 'mix'     :
                    case 'feedback':
                        if (value === undefined) {
                            // Getter
                            return this[k].gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || 0;
                            var max = this[k].gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Phaser.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);

            for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
                this.filters[i].disconnect(0);
            }

            this.mix.disconnect(0);
            this.feedback.disconnect(0);

            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);

            // Effect ON
            if (this.isActive && (this.numberOfStages > 0)) {
                // GainNode (Input) -> BiquadFilterNode (All-Pass Filter x 12) -> GainNode (Mix) -> GainNode (Output)
                this.input.connect(this.filters[0]);

                for (var i = 0; i < this.numberOfStages; i++) {
                    if (i < (this.numberOfStages - 1)) {
                        this.filters[i].connect(this.filters[i + 1]);
                    } else {
                        this.filters[i].connect(this.mix);
                        this.mix.connect(this.output);

                        // Feedback
                        // GainNode (Input) -> BiquadFilterNode (All-Pass Filter x 12) -> GainNode (Feedback) -> BiquadFilterNode (All-Pass Filter x 12) ...
                        this.filters[i].connect(this.feedback);
                        this.feedback.connect(this.filters[0]);
                    }
                }
            }
        };

        /** @override */
        Phaser.prototype.stop = function(stopTime, releaseTime) {
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            // Effector's state is active ?
            if (this.isActive) {
               // Connect nodes again
               this.lfo.connect(this.depth);

               for (var i = 0; i < Phaser.MAXIMUM_STAGES; i++) {
                   this.depth.connect(this.filters[i].frequency);
               }
            }

            return this;
        };

        /** @override */
        Phaser.prototype.params = function() {
            var params = {
                'state'    : this.isActive,
                'stage'    : this.numberOfStages,
                'frequency': this.filters[0].frequency.value,
                'resonance': this.filters[0].Q.value,
                'depth'    : this.depthRate,
                'rate'     : this.rate.value,
                'mix'      : this.mix.gain.value,
                'feedback' : this.feedback.gain.value
            };

            return params;
        };

        /** @override */
        Phaser.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Phaser.prototype.toString = function() {
            return '[SoundModule Phaser]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Flanger(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.delay    = context.createDelay();
            this.mix      = context.createGain();
            this.tone     = context.createBiquadFilter();
            this.feedback = context.createGain();

            // Initialize parameters
            this.delay.delayTime.value = 0;
            this.depth.gain.value      = 0;
            this.rate.value            = 0;
            this.mix.gain.value        = 0;
            this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
            this.tone.frequency.value  = 350;
            this.tone.Q.value          = Math.SQRT1_2;
            this.tone.gain.value       = 0;  // Not used
            this.feedback.gain.value   = 0;
            this.depthRate             = 0;

            // Flanger is not connected by default
            this.state(false);

            // LFO
            // OscillatorNode (LFO) -> GainNode (Depth) -> AudioParam (delayTime)
            this.lfo.connect(this.depth);
            this.depth.connect(this.delay.delayTime);
        }

        /** @override */
        Flanger.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'delaytime':
                    case 'time'     :
                        if (value === undefined) {
                            // Getter
                            return this.delay.delayTime.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.delay.delayTime.minValue || 0;
                            var max = this.delay.delayTime.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.delay.delayTime.value = v;
                                this.depth.gain.value      = this.delay.delayTime.value * this.depthRate;
                            }
                        }

                        break;
                    case 'depth':
                        if (value === undefined) {
                            // Getter
                            return this.depthRate;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth.gain.value = this.delay.delayTime.value * v;
                                this.depthRate        = v;
                            }
                        }

                        break;
                    case 'rate':
                        if (value === undefined) {
                            // Getter
                            return this.rate.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;
                            }
                        }

                        break;
                    case 'mix'     :
                    case 'feedback':
                        if (value === undefined) {
                            // Getter
                            return this[k].gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || 0;
                            var max = this[k].gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;
                            }
                        }

                        break;
                    case 'tone':
                        if (value === undefined) {
                            // Getter
                            return this.tone.frequency.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.tone.frequency.minValue || 10;
                            var max = this.tone.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this.tone.frequency.value = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Flanger.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.delay.disconnect(0);
            this.mix.disconnect(0);
            this.tone.disconnect(0);
            this.feedback.disconnect(0);

            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);

            // Effect ON
            if (this.isActive) {
                // GainNode (Input) -> BiquadFilterNode (Tone) -> DelayNode -> GainNode (Mix) -> GainNode (Output)
                this.input.connect(this.tone);
                this.tone.connect(this.delay);
                this.delay.connect(this.mix);
                this.mix.connect(this.output);

                // Feedback
                // GainNode (Input) -> DelayNode -> GainNode (Feedback) -> DelayNode ...
                this.delay.connect(this.feedback);
                this.feedback.connect(this.delay);
            }
        };

        /** @override */
        Flanger.prototype.stop = function(stopTime, releaseTime) {
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            // Effector's state is active ?
            if (this.isActive) {
                // Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.delay.delayTime);
            }

            return this;
        };

        /** @override */
        Flanger.prototype.params = function() {
            var params = {
                'state'   : this.isActive,
                'time'    : this.delay.delayTime.value,
                'depth'   : this.depthRate,
                'rate'    : this.rate.value,
                'mix'     : this.mix.gain.value,
                'tone'    : this.tone.frequency.value,
                'feedback': this.feedback.gain.value
            };

            return params;
        };

        /** @override */
        Flanger.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Flanger.prototype.toString = function() {
            return '[SoundModule Flanger]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Chorus(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.delay    = context.createDelay();
            this.mix      = context.createGain();
            this.tone     = context.createBiquadFilter();
            this.feedback = context.createGain();

            // Initialize parameters
            this.delay.delayTime.value = 0;
            this.depth.gain.value      = 0;
            this.rate.value            = 0;
            this.mix.gain.value        = 0;
            this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
            this.tone.frequency.value  = 350;
            this.tone.Q.value          = Math.SQRT1_2;
            this.tone.gain.value       = 0;  // Not used
            this.feedback.gain.value   = 0;
            this.depthRate             = 0;

            // Chorus is not connected by default
            this.state(false);

            // LFO
            // OscillatorNode (LFO) -> GainNode (Depth) -> AudioParam (elayTime)
            this.lfo.connect(this.depth);
            this.depth.connect(this.delay.delayTime);
        }

        /** @override */
        Chorus.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'delaytime':
                    case 'time'     :
                        if (value === undefined) {
                            // Getter
                            return this.delay.delayTime.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.delay.delayTime.minValue || 0;
                            var max = this.delay.delayTime.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.delay.delayTime.value = v;
                                this.depth.gain.value      = this.delay.delayTime.value * this.depthRate;
                            }
                        }

                        break;
                    case 'depth':
                        if (value === undefined) {
                            // Getter
                            return this.depthRate;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth.gain.value = this.delay.delayTime.value * v;
                                this.depthRate        = v;
                            }
                        }

                        break;
                    case 'rate':
                        if (value === undefined) {
                            // Getter
                            return this.rate.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;
                            }
                        }

                        break;
                    case 'mix'     :
                    case 'feedback':
                        if (value === undefined) {
                            // Getter
                            return this[k].gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || 0;
                            var max = this[k].gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;
                            }
                        }

                        break;
                    case 'tone':
                        if (value === undefined) {
                            // Getter
                            return this.tone.frequency.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.tone.frequency.minValue || 10;
                            var max = this.tone.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this.tone.frequency.value = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Chorus.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.delay.disconnect(0);
            this.mix.disconnect(0);
            this.tone.disconnect(0);
            this.feedback.disconnect(0);

            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);

            // Effect ON
            if (this.isActive) {
                // GainNode (Input) -> BiquadFilterNode (Tone) -> DelayNode -> GainNode (Mix) -> GainNode (Output)
                this.input.connect(this.tone);
                this.tone.connect(this.delay);
                this.delay.connect(this.mix);
                this.mix.connect(this.output);

                // Feedback
                // GainNode (Input) -> DelayNode -> GainNode (Feedback) -> DelayNode ...
                this.delay.connect(this.feedback);
                this.feedback.connect(this.delay);
            }
        };

        /** @override */
        Chorus.prototype.stop = function(stopTime, releaseTime) {
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            // Effector's state is active ?
            if (this.isActive) {
                // Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.delay.delayTime);
            }

            return this;
        };

        /** @override */
        Chorus.prototype.params = function() {
            var params = {
                'state'   : this.isActive,
                'time'    : this.delay.delayTime.value,
                'depth'   : this.depthRate,
                'rate'    : this.rate.value,
                'mix'     : this.mix.gain.value,
                'tone'    : this.tone.frequency.value,
                'feedback': this.feedback.gain.value
            };

            return params;
        };

        /** @override */
        Chorus.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Chorus.prototype.toString = function() {
            return '[SoundModule Chorus]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Delay(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.delay    = context.createDelay(Delay.MAX_DELAY_TIME);
            this.dry      = context.createGain();
            this.wet      = context.createGain();
            this.tone     = context.createBiquadFilter();
            this.feedback = context.createGain();

            // Initialize parameters
            this.delay.delayTime.value = 0;
            this.dry.gain.value        = 1;
            this.wet.gain.value        = 0;
            this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
            this.tone.frequency.value  = 350;
            this.tone.Q.value          = Math.SQRT1_2;
            this.tone.gain.value       = 0;  // Not used
            this.feedback.gain.value   = 0;

            // Delay is not connected by default
            this.state(false);
        };

        /**
         * Class (Static) property
         */
        Delay.MAX_DELAY_TIME = 5;  // Max delay time is 5000 [ms]

        /** @override */
        Delay.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'delaytime':
                    case 'time'     :
                        if (value === undefined) {
                            // Getter
                            return this.delay.delayTime.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.delay.delayTime.minValue || 0;
                            var max = this.delay.delayTime.maxValue || Delay.MAX_DELAY_TIME;

                            if ((v >= min) && (v <= max)) {
                                this.delay.delayTime.value = v;
                            }
                        }

                        break;
                    case 'dry'     :
                    case 'wet'     :
                    case 'feedback':
                        if (value === undefined) {
                            // Getter
                            return this[k].gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || 0;
                            var max = this[k].gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;
                            }
                        }

                        break;
                    case 'tone':
                        if (value === undefined) {
                            // Getter
                            return this.tone.frequency.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.tone.frequency.minValue || 10;
                            var max = this.tone.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this.tone.frequency.value = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Delay.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.delay.disconnect(0);
            this.dry.disconnect(0);
            this.wet.disconnect(0);
            this.tone.disconnect(0);
            this.feedback.disconnect(0);

            if (this.isActive) {
                // Effect ON

                // GainNode (Input) -> GainNode (Dry) -> GainNode (Output)
                this.input.connect(this.dry);
                this.dry.connect(this.output);

                // (GainNode (Input)) -> BiquadFilterNode (Tone) -> DelayNode -> GainNode (Wet) -> GainNode (Output)
                this.input.connect(this.tone);
                this.tone.connect(this.delay);
                this.delay.connect(this.wet);
                this.wet.connect(this.output);

                // Feedback
                // GainNode (Input) -> DelayNode -> GainNode (Feedback) -> DelayNode ...
                this.delay.connect(this.feedback);
                this.feedback.connect(this.delay);
            } else {
                // Effect OFF

                // GainNode (Input) -> GainNode (Output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Delay.prototype.params = function() {
            var params = {
                'state'   : this.isActive,
                'time'    : this.delay.delayTime.value,
                'dry'     : this.dry.gain.value,
                'wet'     : this.wet.gain.value,
                'tone'    : this.tone.frequency.value,
                'feedback': this.feedback.gain.value
            };

            return params;
        };

        /** @override */
        Delay.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Delay.prototype.toString = function() {
            return '[SoundModule Delay]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number|AudioBuffer} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Reverb(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.rirs      = [];
            this.convolver = context.createConvolver();
            this.dry       = context.createGain();
            this.wet       = context.createGain();
            this.tone      = context.createBiquadFilter();

            // Initialize parameters
            this.dry.gain.value        = 1;
            this.wet.gain.value        = 0;
            this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
            this.tone.frequency.value  = 350;
            this.tone.Q.value          = Math.SQRT1_2;
            this.tone.gain.value       = 0;  // Not used

            // Reverb is not connected by default
            this.state(false);
        }

        /**
         * Class (Static) properties
         */
        Reverb.ERROR_AJAX         = 'error';
        Reverb.ERROR_AJAX_TIMEOUT = 'timeout';
        Reverb.ERROR_DECODE       = 'decode';

        /** @override */
        Reverb.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'type':
                        if (value === undefined) {
                            // Getter
                            return this.convolver.buffer;
                        } else {
                            // Setter
                            var v   = parseInt(value);
                            var min = 0;
                            var max = this.rirs.length - 1;

                            if (value === null) {
                                this.convolver.buffer = null;

                                // If "buffer" in ConvolverNode is null after setting the instance of AudioBuffer, Reverb is not OFF.
                                // Therefore, Reverb is OFF by disconnecting nodes.
                                this.input.disconnect(0);
                                this.input.connect(this.output);
                            } else if ((v >= min) && (v <= max)) {
                                this.convolver.buffer = this.rirs[v];
                                this.connect();
                            }
                        }

                        break;
                    case 'dry':
                    case 'wet':
                        if (value === undefined) {
                            // Getter
                            return this[k].gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || 0;
                            var max = this[k].gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;
                            }
                        }

                        break;
                    case 'tone':
                        if (value === undefined) {
                            // Getter
                            return this.tone.frequency.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.tone.frequency.minValue || 10;
                            var max = this.tone.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this.tone.frequency.value = v;
                            }
                        }

                        break;
                    case 'rirs':
                        return this.rirs;  // Getter only
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Reverb.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.convolver.disconnect(0);
            this.dry.disconnect(0);
            this.wet.disconnect(0);
            this.tone.disconnect(0);

            if (this.isActive) {
                // Effect ON

                // GainNode (Input) -> GainNode (Dry) -> GainNode (Output)
                this.input.connect(this.dry);
                this.dry.connect(this.output);

                // GainNode (Input) -> ConvolverNode -> GainNode (Mix) -> GainNode (Output)
                this.input.connect(this.tone);
                this.tone.connect(this.convolver);
                this.convolver.connect(this.wet);
                this.wet.connect(this.output);
            } else {
                // Effect OFF

                // GainNode (Input) -> GainNode (Output)
                this.input.connect(this.output);
            }
        };

        /**
         * This method sets instance of AudioBuffer to ConvolverNode.
         * @param {AudioBuffer|ArrayBuffer} impulse This argument is in order to convolve impulse response.
         *     This argument is the instance of AudioBuffer or ArrayBuffer for impulse response.
         * @param {function} errorCallback This argument is in order to be invoked when error occurs.
         * @return {Reverb} This is returned for method chain.
         * @override
         */
        Reverb.prototype.start = function(impulse, errorCallback) {
            if ((impulse instanceof AudioBuffer) || (impulse === null)) {
                this.convolver.buffer = impulse;
                this.rirs.push(impulse);  // Add to preset
            } else if (impulse instanceof ArrayBuffer) {
                var self = this;

                var successCallback = function(buffer) {
                    self.convolver.buffer = buffer;
                    self.rirs.push(buffer);  // Add to preset
                };

                if (Object.prototype.toString.call(errorCallback) !== '[object Function]') {
                    errorCallback = function() {};
                }

                this.context.decodeAudioData(impulse, successCallback, errorCallback);
            }

            return this;
        };

        /**
         * This method creates the instances of AudioBuffer by Ajax for Revreb presets.
         * @param {Array.<string>|Array.<AudioBuffer>} rirs This argument is either URLs or the instances of AudioBuffer for Impulse Response.
         * @param {number} timeout This argument is timeout of Ajax. The default value is 60000 msec (1 minutes).
         * @param {function} successCallback This argument is invoked when the creating AudioBuffers was completed.
         * @param {function} errorCallback This argument is invoked when error occurred.
         * @param {function} progressCallback This argument is invoked during receiving audio data.
         * @return {Reverb} This is returned for method chain.
         */
        Reverb.prototype.preset = function(rirs, timeout, successCallback, errorCallback, progressCallback) {
            // The argument is associative array ?
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                var properties = arguments[0];

                if ('rirs'     in properties) {rirs             = properties.rirs;}
                if ('timeout'  in properties) {timeout          = properties.timeout;}
                if ('success'  in properties) {successCallback  = properties.success;}
                if ('error'    in properties) {errorCallback    = properties.error;}
                if ('progress' in properties) {progressCallback = properties.progress;}
            }

            if (!Array.isArray(rirs)) {
                rirs = [rirs];
            }

            this.rirs = new Array(rirs.length);

            // If the error is at least 1, this method aborts the all of connections.
            // Therefore, this flag are shared with the all instances of XMLHttpRequest.
            var isError = false;

            var t = parseInt(timeout);

            var self = this;

            // Get ArrayBuffer by Ajax -> Create the instances of AudioBuffer
            var load = function(url, index) {
                var xhr = new XMLHttpRequest();

                xhr.timeout = (t > 0) ? t : 60000;

                xhr.ontimeout = function(event) {
                    if (!isError && (Object.prototype.toString.call(errorCallback) === '[object Function]')) {
                        errorCallback(event, Reverb.ERROR_AJAX_TIMEOUT);
                    }

                    isError = true;
                };

                xhr.onprogresss = function(event) {
                    if (isError) {
                        xhr.abort();
                    } else if (Object.prototype.toString.call(progressCallback) === '[object Function]') {
                        progressCallback(event);
                    }
                };

                xhr.onerror = function(event) {
                    if (!isError && (Object.prototype.toString.call(errorCallback) === '[object Function]')) {
                        errorCallback(event, Reverb.ERROR_AJAX);
                    }

                    isError = true;
                };

                xhr.onload = function(event) {
                    if (xhr.status === 200) {
                        var arrayBuffer = xhr.response;

                        if (!(arrayBuffer instanceof ArrayBuffer)) {
                            return;
                        }

                        var decodeSuccessCallback = function(audioBuffer) {
                            self.rirs[index] = audioBuffer;

                            // The creating the instances of AudioBuffer has completed ?
                            for (var i = 0, len = self.rirs.length; i < len; i++) {
                                if (self.rirs[i] === undefined) {
                                    return;
                                }
                            }

                            if (Object.prototype.toString.call(successCallback) === '[object Function]') {
                                successCallback(event);
                            }
                        };

                        var decodeErrorCallback = function(error) {
                            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                                errorCallback(error, Reverb.ERROR_DECODE);
                            }
                        };

                        self.context.decodeAudioData(arrayBuffer, decodeSuccessCallback, decodeErrorCallback);
                    }
                };

                xhr.open('GET', url, true);
                xhr.responseType = 'arraybuffer';  // XMLHttpRequest Level 2
                xhr.send(null);
            };

            for (var i = 0, len = rirs.length; i < len; i++) {
                if (Object.prototype.toString.call(rirs[i]) === '[object String]') {
                    // Get the instances of AudioBuffer from the designated URLs.
                    load(rirs[i], i);
                } else if (rirs[i] instanceof AudioBuffer) {
                    // Get the instances of AudioBuffer directly
                    this.rirs[i] = rirs[i];
                }
            }

            return this;
        };

        /** @override */
        Reverb.prototype.state = function(state) {
            if (state === undefined) {
                return this.isActive;  // Getter
            } else if (String(state).toLowerCase() === 'toggle') {
                this.isActive = !this.isActive;  // Setter
            } else {
                this.isActive = Boolean(state);  // Setter
            }

            // in the case of setter

            // Change connection
            this.connect();

            return this;
        };

        /** @override */
        Reverb.prototype.params = function() {
            var params = {
                'state': this.isActive,
                'dry'  : this.dry.gain.value,
                'wet'  : this.wet.gain.value,
                'tone' : this.tone.frequency.value
            };

            return params;
        };

        /** @override */
        Reverb.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Reverb.prototype.toString = function() {
            return '[SoundModule Reverb]';
        };

        /**
         * Effector's subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Panner(context, bufferSize) {
            Effector.call(this, context, bufferSize);

            this.panner = context.createPanner();

            this.positions    = {'x': 0, 'y': 0, 'z': 0};
            this.orientations = {'x': 1, 'y': 0, 'z': 0};
            this.velocities   = {'x': 0, 'y': 0, 'z': 0};

            this.panner.refDistance   = 1;
            this.panner.maxDistance   = 10000;
            this.panner.rolloffFactor = 1;

            this.panner.coneInnerAngle = 360;
            this.panner.coneOuterAngle = 360;
            this.panner.coneOuterGain  = 0;

            this.panner.panningModel  = (Object.prototype.toString.call(this.panner.panningModel)  === '[object String]') ? 'HRTF'    : (this.panner.HRTF || 1);
            this.panner.distanceModel = (Object.prototype.toString.call(this.panner.distanceModel) === '[object String]') ? 'inverse' : (this.panner.INVERSE_DISTANCE || 1);

            this.panner.setPosition(this.positions.x, this.positions.y, this.positions.z);
            this.panner.setOrientation(this.orientations.x, this.orientations.y, this.orientations.z);
            this.panner.setVelocity(this.velocities.x, this.velocities.y, this.velocities.z);

            // Panner is not connected by default
            this.state(false);
        }

        /** @override */
        Panner.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'x':
                    case 'y':
                    case 'z':
                        if (value === undefined) {
                            // Getter
                            return this.positions[k];
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.positions[k] = v;
                                this.panner.setPosition(this.positions.x, this.positions.y, this.positions.z);
                            }
                        }

                        break;
                    case 'ox':
                    case 'oy':
                    case 'oz':
                        if (value === undefined) {
                            // Getter
                            return this.orientations[k.charAt(1)];
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.orientations[k.charAt(1)] = v;
                                this.panner.setOrientation(this.orientations.x, this.orientations.y, this.orientations.z);
                            }
                        }

                        break;
                    case 'vx':
                    case 'vy':
                    case 'vz':
                        if (value === undefined) {
                            // Getter
                            return this.velocities[k.charAt(1)];
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.velocities[k.charAt(1)] = v;
                                this.panner.setVelocity(this.velocities.x, this.velocities.y, this.velocities.z);
                            }
                        }

                        break;
                    case 'refdistance':
                        if (value === undefined) {
                            // Getter
                            return this.panner.refDistance;
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.refDistance = v;
                            }
                        }

                        break;
                    case 'maxdistance':
                        if (value === undefined) {
                            // Getter
                            return this.panner.maxDistance;
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.maxDistance = v;
                            }
                        }

                        break;
                    case 'rollofffactor':
                        if (value === undefined) {
                            // Getter
                            return this.panner.rolloffFactor;
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.rolloffFactor = v;
                            }
                        }

                        break;
                    case 'coneinnerangle':
                        if (value === undefined) {
                            // Getter
                            return this.panner.coneInnerAngle;
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.coneInnerAngle = v;
                            }
                        }

                        break;
                    case 'coneouterangle':
                        if (value === undefined) {
                            // Getter
                            return this.panner.coneOuterAngle;
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.coneOuterAngle = v;
                            }
                        }

                        break;
                    case 'coneoutergain':
                        if (value === undefined) {
                            // Getter
                            return this.panner.coneOuterGain;
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.coneOuterGain = v;
                            }
                        }

                        break;
                    case 'panningmodel':
                        if (value === undefined) {
                            // Getter
                            return this.panner.panningModel;
                        } else {
                            // Setter
                            var v = /HRTF/i.test(value) ? String(value).toUpperCase() : String(value).toLowerCase();

                            var MODELS = {
                                'equalpower': this.panner.EQUALPOWER || 0,
                                'HRTF'      : this.panner.HRTF       || 1
                            };

                            if (v in MODELS) {
                                this.panner.panningModel = (Object.prototype.toString.call(this.panner.panningModel) === '[object String]') ? v : MODELS[v];
                            }
                        }

                        break;
                    case 'distancemodel':
                        if (value === undefined) {
                            // Getter
                            return this.panner.distanceModel;
                        } else {
                            // Setter
                            var v = String(value).replace(/-/g, '').toLowerCase();

                            var MODELS = {
                                'linear'     : this.panner.LINEAR_DISTANCE      || 0,
                                'inverse'    : this.panner.INVERSE_DISTANCE     || 1,
                                'exponential': this.panner.EXPONENTIAL_DISTANCE || 2
                            };

                            if (v in MODELS) {
                                this.panner.distanceModel = (Object.prototype.toString.call(this.panner.distanceModel) === '[object String]') ? v : MODELS[v];
                            }
                        }

                        break;
                    default:
                        break;
                }
            }

            return this;
        };

        /** @override */
        Panner.prototype.connect = function() {
            // Clear connection
            this.input.disconnect(0);
            this.panner.disconnect(0);

            if (this.isActive) {
                // Effect ON

                // GainNode (Input) -> PannerNode -> GainNode (Output)
                this.input.connect(this.panner);
                this.panner.connect(this.output);
            } else {
                // Effect OFF

                // GainNode (Input) -> GainNode (Output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Panner.prototype.params = function() {
            var params = {
                'state'         : this.isActive,
                'positions'     : this.positions,
                'orientations'  : this.orientations,
                'velocities'    : this.velocities,
                'refDistance'   : this.panner.refDistance,
                'maxDistance'   : this.panner.maxDistance,
                'rolloffFactor' : this.panner.rolloffFactor,
                'coneInnerAngle': this.panner.coneInnerAngle,
                'coneOuterAngle': this.panner.coneOuterAngle,
                'coneOuterGain' : this.panner.coneOuterGain,
                'panningModel'  : this.panner.panningModel,
                'distanceModel' : this.panner.distanceModel
            };

            return params;
        };

        /** @override */
        Panner.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Panner.prototype.toString = function() {
            return '[SoundModule Panner]';
        };

        /**
         * This private class defines property for audio listener.
         * These properties relate to properties of PannerNode.
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @constructor
         */
        function Listener(context) {
            // the instance of AudioListener
            this.listener = context.listener;

            // Set default value
            this.listener.dopplerFactor = 1;
            this.listener.speedOfSound  = 343.3;

            this.positions  = {'x': 0, 'y': 0, 'z': 0};
            this.fronts     = {'x': 0, 'y': 0, 'z': -1};
            this.ups        = {'x': 0, 'y': 1, 'z': 0};
            this.velocities = {'x': 0, 'y': 0, 'z': 0};

            this.listener.setPosition(this.positions.x, this.positions.y, this.positions.z);
            this.listener.setOrientation(this.fronts.x, this.fronts.y, this.fronts.z, this.ups.x, this.ups.y, this.ups.z);
            this.listener.setVelocity(this.velocities.x, this.velocities.y, this.velocities.z);
        }

        /**
         * This method is getter or setter for parameters.
         * @param {string|object} key This argument is property name in the case of string type.
         *     This argument is pair of property and value in the case of associative array.
         * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
         * @return {number|Listener} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
         */
        Listener.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'dopplerfactor':
                        if (value === undefined) {
                            // Getter
                            return this.listener.dopplerFactor;
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (v >= 0) {
                                this.listener.dopplerFactor = v;
                            }
                        }

                        break;
                    case 'speedofsound':
                        if (value === undefined) {
                            // Getter
                            return this.listener.speedOfSound;
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (v >= 0) {
                                this.listener.speedOfSound = v;
                            }
                        }

                        break;
                    case 'x':
                    case 'y':
                    case 'z':
                        if (value === undefined) {
                            // Getter
                            return this.positions[k];
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.positions[k] = v;
                                this.listener.setPosition(this.positions.x, this.positions.y, this.positions.z);
                            }
                        }

                        break;
                    case 'fx':
                    case 'fy':
                    case 'fz':
                        if (value === undefined) {
                            // Getter
                            return this.fronts[k.charAt(1)];
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.fronts[k.charAt(1)] = v;
                                this.listener.setOrientation(this.fronts.x, this.fronts.y, this.fronts.z, this.ups.x, this.ups.y, this.ups.z);
                            }
                        }

                        break;
                    case 'ux':
                    case 'uy':
                    case 'uz':
                        if (value === undefined) {
                            // Getter
                            return this.ups[k.charAt(1)];
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.ups[k.charAt(1)] = v;
                                this.listener.setOrientation(this.fronts.x, this.fronts.y, this.fronts.z, this.ups.x, this.ups.y, this.ups.z);
                            }
                        }

                        break;
                    case 'vx':
                    case 'vy':
                    case 'vz':
                        if (value === undefined) {
                            // Setter
                            return this.velocities[k.charAt(1)];
                        } else {
                            // Getter
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.velocities[k.charAt(1)] = v;
                                this.listener.setVelocity(this.velocities.x, this.velocities.y, this.velocities.z);
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
         * This method gets effecter's parameters as associative array.
         * @return {object}
         */
        Listener.prototype.params = function() {
            var params = {
                'dopplerFactor': this.listener.dopplerFactor,
                'speedOfSound' : this.listener.speedOfSound,
                'positions'    : this.positions,
                'fronts'       : this.fronts,
                'ups'          : this.ups,
                'velocities'   : this.velocities
            };

            return params;
        };

        /**
         * This method gets effecter's parameters as JSON.
         * @return {string}
         */
        Listener.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        Listener.prototype.toString = function() {
            return '[SoundModule Listener]';
        };

        /**
         * This private class defines properties for Envelope Generator.
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @constructor
         */
        function EnvelopeGenerator(context) {
            this.context = context;

            /** @type {Array.<GainNode>} */
            this.generators = [];

            // for GainNode
            this.activeIndexes = [];
            this.activeCounter = 0;

            this.attack  = 0.01;
            this.decay   = 0.3;
            this.sustain = 0.5;
            this.release = 1.0;
        }

        /**
         * Class (Static) property
         */
        EnvelopeGenerator.MIN_GAIN = 1e-3;

        /**
         * This method is getter or setter for parameters.
         * @param {string|object} key This argument is property name in the case of string type.
         *     This argument is pair of property and value in the case of associative array.
         * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
         * @return {number|EnvelopeGenerator} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
         */
        EnvelopeGenerator.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'attack' :
                    case 'decay'  :
                    case 'sustain':
                    case 'release':
                        if (value === undefined) {
                            // Getter
                            return this[k];
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (v >= 0) {
                                this[k] = v;
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
         * This method connects the instance of AudioNode.
         * @param {number} index This argument is in order to select the instance of GainNode that is Envelope Generator.
         * @param {AudioNode} input This argument is the instance of AudioNode as input.
         * @param {AudioNode} output This argument is the instance of AudioNode as output.
         * @return {EnvelopeGenerator} This is returned for method chain.
         */
        EnvelopeGenerator.prototype.ready = function(index, input, output) {
            var i = (parseInt(index) >= 0) ? parseInt(index) : 0;

            input.connect(this.generators[i]);
            this.generators[i].connect(output);

            this.activeIndexes[i] = i;
            this.activeCounter++;

            return this;
        };

        /**
         * This method changes gain (Attack -> Decay -> Sustain).
         * @param {number} startTime This argument is the start time of Attack.
         * @return {EnvelopeGenerator} This is returned for method chain.
         */
        EnvelopeGenerator.prototype.start = function(startTime) {
            var s = parseFloat(startTime);

            if (isNaN(s) || (s < this.context.currentTime)) {
                s = this.context.currentTime;
            }

            // Attack -> Decay -> Sustain
            var t0      = s;
            var t1      = t0 + this.attack;
            var t2      = this.decay;
            var t2Value = this.sustain;

            for (var i = 0, len = this.activeIndexes.length; i < len; i++) {
                var activeIndex = this.activeIndexes[i];

                if (activeIndex === undefined) {
                    continue;
                }

                // Start from gain.value = 0
                this.generators[activeIndex].gain.cancelScheduledValues(t0);
                this.generators[activeIndex].gain.setValueAtTime(0, t0);

                // Attack : gain.value increases linearly until assigned time (t1)
                this.generators[activeIndex].gain.linearRampToValueAtTime(1, t1);

                // Decay -> Sustain : gain.value gradually decreases to value of sustain during of Decay time (t2) from assigned time (t1)
                this.generators[activeIndex].gain.setTargetAtTime(t2Value, t1, t2);
            }

            return this;
        };

        /**
         * This method changes gain (Attack or Decay or Sustain -> Release).
         * @param {number} stopTime This argument is the start time of Release.
         * @return {EnvelopeGenerator} This is returned for method chain.
         */
        EnvelopeGenerator.prototype.stop = function(stopTime) {
            var s = parseFloat(stopTime) - this.release;

            if (isNaN(s) || (s < this.context.currentTime)) {
                s = this.context.currentTime;
            }

            // Sustain -> Release
            var t3 = s;
            var t4 = this.release;

            for (var i = 0, len = this.activeIndexes.length; i < len; i++) {
                var activeIndex = this.activeIndexes[i];

                if (activeIndex === undefined) {
                    continue;
                }

                // in the case of mouseup on the way of Decay
                this.generators[activeIndex].gain.cancelScheduledValues(t3);
                this.generators[activeIndex].gain.setValueAtTime(this.generators[activeIndex].gain.value, t3);

                // Release : gain.value gradually decreases to 0 during of Release time (t4) from assigned time (t3)
                this.generators[activeIndex].gain.setTargetAtTime(0, t3, t4);
            }

            return this;
        };

        /**
         * This method gets the instance of GainNode for Envelope Generator.
         * @param {number} index This argument is the index of array that contains the instance of GainNode for Envelope Generator.
         * @return {GainNode} This is returned as the instance of GainNode for Envelope Generator.
         */
        EnvelopeGenerator.prototype.getGenerator = function(index) {
            var i = (parseInt(index) >= 0) ? parseInt(index) : 0;

            return this.generators[i];
        };

        /**
         * This method sets the instance of GainNode for Envelope Generator.
         * @param {number} index This argument is the index of array that contains the instance of GainNode for Envelope Generator.
         * @return {EnvelopeGenerator} This is returned for method chain.
         */
        EnvelopeGenerator.prototype.setGenerator = function(index) {
            var i = (parseInt(index) >= 0) ? parseInt(index) : 0;

            this.generators[i] = this.context.createGain();

            // for legacy browsers
            this.generators[i].gain.setTargetAtTime = this.generators[i].gain.setTargetAtTime || this.generators[i].gain.setTargetValueAtTime;

            return this;
        };

        /**
         * This method determines whether the all of gain schedulings have ended.
         * @return {boolean} If the all of gain schedulings have ended, this value is true. Otherwise, this value is false.
         */
        EnvelopeGenerator.prototype.isStop = function() {
            var counter = 0;

            for (var i = 0, len = this.activeIndexes.length; i < len; i++) {
                var activeIndex = this.activeIndexes[i];

                if (activeIndex === undefined) {
                    continue;
                }

                if (this.generators[activeIndex].gain.value > EnvelopeGenerator.MIN_GAIN) {
                    return false;
                } else {
                    counter++;

                    // the all of schedulings are stopped ?
                    if (counter === this.activeCounter) {
                        return true;
                    }
                }
            }
        };

        /**
         * This method clears variables for managing the instance of GainNode.
         * @return {EnvelopeGenerator} This is returned for method chain.
         */
        EnvelopeGenerator.prototype.clear = function() {
            this.activeIndexes.length = 0;
            this.activeCounter = 0;

            for (var i = 0, len = this.generators.length; i < len; i++) {
                this.generators[i].gain.value = 1;
            }

            return this;
        };

        /**
         * This method gets effecter's parameters as associative array.
         * @return {object}
         */
        EnvelopeGenerator.prototype.params = function() {
            var params = {
                'attack' : this.attack,
                'decay'  : this.decay,
                'sustain': this.sustain,
                'release': this.release
            };

            return params;
        };

        /**
         * This method gets effecter's parameters as JSON.
         * @return {string}
         */
        EnvelopeGenerator.prototype.toJSON = function() {
            return JSON.stringify(this.params());
        };

        /** @override */
        EnvelopeGenerator.prototype.toString = function() {
            return '[SoundModule EnvelopeGenerator]';
        };

        this.analyser = new Analyser(context);
        this.recorder = new Recorder(context, this.bufferSize, SoundModule.NUMBER_OF_INPUTS, SoundModule.NUMBER_OF_OUTPUTS);
        this.session  = new Session(context, this.bufferSize, SoundModule.NUMBER_OF_INPUTS, SoundModule.NUMBER_OF_OUTPUTS, this.analyser);

        // for OscillatorModule, OneshotModule
        this.envelopegenerator = new EnvelopeGenerator(context);

        this.compressor    = new Compressor(context, this.bufferSize);
        this.distortion    = new Distortion(context, this.bufferSize);
        this.wah           = new Wah(context, this.bufferSize);
        this.equalizer     = new Equalizer(context, this.bufferSize);
        this.filter        = new Filter(context, this.bufferSize);
        this.tremolo       = new Tremolo(context, this.bufferSize);
        this.ringmodulator = new Ringmodulator(context, this.bufferSize);
        this.autopanner    = context.createStereoPanner ? new Autopanner(context, this.bufferSize) : new AutopannerFallback(context, this.bufferSize);
        this.phaser        = new Phaser(context, this.bufferSize);
        this.flanger       = new Flanger(context, this.bufferSize);
        this.chorus        = new Chorus(context, this.bufferSize);
        this.delay         = new Delay(context, this.bufferSize);
        this.reverb        = new Reverb(context, this.bufferSize);
        this.panner        = new Panner(context, this.bufferSize);
        this.listener      = new Listener(context);

        // The default order for connection
        this.modules = [
            this.panner,
            this.compressor,
            this.distortion,
            this.wah,
            this.equalizer,
            this.filter,
            this.autopanner,
            this.tremolo,
            this.ringmodulator,
            this.phaser,
            this.flanger,
            this.chorus,
            this.delay,
            this.reverb
        ];
    }

    /**
     * Class (Static) properties
     */
    SoundModule.NUMBER_OF_INPUTS  = 2;
    SoundModule.NUMBER_OF_OUTPUTS = 2;

    /** @abstract */
    SoundModule.prototype.setup = function() {
    };

    /**
     * This method is getter or setter for parameters.
     * @param {string} key This argument is property name.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number} This is returned as the value of designated property in the case of getter.
     */
    SoundModule.prototype.param = function(key, value) {
        var k = String(key).replace(/-/g, '').toLowerCase();

        switch (k) {
            case 'mastervolume':
                if (value === undefined) {
                    // Getter
                    return this.mastervolume.gain.value;
                } else {
                    // Setter
                    var v   = parseFloat(value);
                    var min = this.mastervolume.gain.minValue || 0;
                    var max = this.mastervolume.gain.maxValue || 1;

                    if ((v >= min) && (v <= max)) {
                        this.mastervolume.gain.value = v;
                    }
                }

                break;
            default:
                break;
        }
    };

    /** @abstract */
    SoundModule.prototype.ready = function() {
    };

    /** @abstract */
    SoundModule.prototype.start = function() {
    };

    /** @abstract */
    SoundModule.prototype.stop = function() {
    };

    /** @abstract */
    SoundModule.prototype.get = function() {
    };

    /**
     * This method changes buffer size for ScriptProcessorNode and invokes constructor again.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     *     This value is one of 256, 512, 1024, 2048, 4096, 8192, 16384.
     * @return {SoundModule} This is returned for method chain.
     */
    SoundModule.prototype.resize = function(bufferSize) {
        SoundModule.call(this, this.context, bufferSize);
        return this;
    };

    /**
     * This method connects nodes that are defined by this library and Web Audio API.
     * @param {AudioNode} source This argument is AudioNode for input of sound.
     * @param {Array.<Effector>} connects This argument is array for changing the default connection.
     * @return {SoundModule} This is returned for method chain.
     */
    SoundModule.prototype.connect = function(source, connects) {
        // Customize connection ?
        if (Array.isArray(connects)) {
            this.modules = connects;
        }

        // Start connection
        // AudioSourceNode (Input)-> node -> ... -> node -> GainNode (Master Volume) -> AnalyserNode (analyser) -> AudioDestinationNode (output)
        source.disconnect(0);  // Clear connection

        if (this.modules.length > 0) {
            source.connect(this.modules[0].input);
        } else {
            source.connect(this.mastervolume);
        }

        for (var i = 0, len = this.modules.length; i < len; i++) {
            // Clear connection
            this.modules[i].output.disconnect(0);

            if (i < (this.modules.length - 1)) {
                // Connect to next node
                this.modules[i].output.connect(this.modules[i + 1].input);
            } else {
                this.modules[i].output.connect(this.mastervolume);
            }
        }

        this.mastervolume.connect(this.analyser.input);
        this.analyser.output.connect(this.context.destination);

        // for recording
        this.mastervolume.connect(this.recorder.processor);
        this.recorder.processor.connect(this.context.destination);

        // for session
        this.mastervolume.connect(this.session.sender);
        this.session.sender.connect(this.context.destination);

        return this;
    };

    /**
     * This method gets the instance of module that is defined by this library. This method enables to access the instance of module by unified call.
     * @param {string} module This argument is module's name.
     * @return {Listener|Analyser|Recorder|Session|Effector|EnvelopeGenerator|Glide|VocalCanceler|NoiseGate} This value is the instance of module.
     */
    SoundModule.prototype.module = function(module) {
        var m = String(module).replace(/-/g, '').toLowerCase();

        switch (m) {
            case 'listener'     :
            case 'analyser'     :
            case 'recorder'     :
            case 'session'      :
            case 'compressor'   :
            case 'distortion'   :
            case 'wah'          :
            case 'equalizer'    :
            case 'filter'       :
            case 'tremolo'      :
            case 'ringmodulator':
            case 'autopanner'   :
            case 'phaser'       :
            case 'flanger'      :
            case 'chorus'       :
            case 'delay'        :
            case 'reverb'       :
            case 'panner'       :
                return this[m];
            case 'envelopegenerator':
            case 'eg'               :
                // OscillatorModule, OneshotModule
                return this.envelopegenerator;
            case 'glide':
                if (m in this) {
                    return this[m];  // OscillatorModule
                }

                // fall through
            case 'vocalcanceler':
                if (m in this) {
                    return this[m];  // AudioModule, MediaModule
                }

                // fall through
            case 'noisegate':
                if (m in this) {
                    return this[m];  // StreamModule
                }

                // fall through
            default:
                for (var i = 0, len = this.plugins.length; i < len; i++) {
                    if (m === this.plugins[i].name) {
                        return this.plugins[i].plugin;
                    }
                }

                break;
        }
    };

    /**
     * This method starts effectors.
     * @param {number} startTime This argument is used for scheduling parameter.
     * @return {SoundModule} This is returned for method chain.
     */
    SoundModule.prototype.on = function(startTime) {
        var s = parseFloat(startTime);

        if (isNaN(s) || (s < this.context.currentTime)) {
            s = this.context.currentTime;
        }

        this.chorus.start(s);
        this.flanger.start(s);
        this.phaser.start(s);
        this.autopanner.start(s);
        this.tremolo.start(s);
        this.ringmodulator.start(s);
        this.wah.start(s);
        this.filter.start(s);

        for (var i = 0, len = this.plugins.length; i < len; i++) {
            this.plugins[i].plugin.start(s);
        }

        return this;
    };

    /**
     * This method stops effectors.
     * @param {number} stopTime This argument is used for scheduling parameter.
     * @param {boolean} isPlugin This argument is in order to determine whether effectors that were added as plug-in are stopped.
     * @return {SoundModule} This is returned for method chain.
     */
    SoundModule.prototype.off = function(stopTime, isPlugin) {
        var s = parseFloat(stopTime);

        if (isNaN(s) || (s < this.context.currentTime)) {
            s = this.context.currentTime;
        }

        this.chorus.stop(s);
        this.flanger.stop(s);
        this.phaser.stop(s);
        this.autopanner.stop(s);
        this.tremolo.stop(s);
        this.ringmodulator.stop(s);
        this.wah.stop(s);
        // this.filter.stop(s);

        if (isPlugin) {
            for (var i = 0, len = this.plugins.length; i < len; i++) {
                this.plugins[i].plugin.stop(s);
            }
        }

        return this;
    };

    /**
     * This method extends the assigned class for Effector, and creates the instance of CustomizedEffector.
     * @param {string} effector This argument is in order to select the instance of CustomizedEffector.
     * @param {CustomizedEffector} CustomizedEffector This argument is the subclass of Effector.
     * @return {SoundModule} This is returned for method chain.
     */
    SoundModule.prototype.install = function(effector, CustomizedEffector) {
        if (Object.prototype.toString.call(CustomizedEffector) === '[object Function]') {
            CustomizedEffector.prototype = new this.Effector(this.context, this.BUFFER_SIZE);
            this.plugins.push({'name': String(effector).toLowerCase(), 'plugin': new CustomizedEffector(this.context)});
        }

        return this;
    };

    /**
     * This method gets effecter's parameters as associative array.
     * @return {object}
     */
    SoundModule.prototype.params = function() {
        var params = {};

        for (var module in this) {
            if (Object.prototype.toString.call(this[module]) === '[object Function]') {
                continue;
            }

            var m = module.toLowerCase();

            if (m === 'mastervolume') {
                params[m] = this[module].gain.value;  // AudioParam
            } else if ((Object.prototype.toString.call(this[module]) === '[object Object]') && ('params' in this[module])) {
                params[m] = this[module].params();
            }
        }

        return params;
    };

    /**
     * This method gets effecter's parameters as JSON.
     * @return {string}
     */
    SoundModule.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    SoundModule.prototype.toString = function() {
        return '[SoundModule]';
    };

    /**
     * This subclass defines properties for creating sound.
     * Actually, properties for creating sound is defined in private class (Oscillator).
     * Therefore, This class manages these private classes for creating sound.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {SoundModule}
     */
    function OscillatorModule(context) {
        SoundModule.call(this, context);

        /** @type {Array.<Oscillator>} */
        this.sources = [];

        // for scheduling
        this.times = {
            'start': 0,
            'stop' : 0
        };

        // This flag determines whether sound wave is drawn
        this.isAnalyser = false;

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
                            // Getter
                            return this.time;
                        } else {
                            // Setter
                            var v = parseFloat(value);

                            if (v >= 0) {
                                this.time = v;
                            }
                        }

                        break;
                    case 'type':
                        if (value === undefined) {
                            // Getter
                            return this.type;
                        } else {
                            // Setter
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

        this.glide = new Glide(context);
    }

    /** @extends {SoundModule} */
    OscillatorModule.prototype = Object.create(SoundModule.prototype);
    OscillatorModule.prototype.constructor = OscillatorModule;

    /**
     * This method creates the instances of Oscillator.
     * @param {Array.<boolean>|boolean} states This argument is initial state in the instance of Oscillator.
     * @return {OscillatorModule} This is returned for method chain.
     * @override
     */
    OscillatorModule.prototype.setup = function(states) {
        /**
         * This private class defines properties for the instance of OscillatorNode.
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {boolean} state This argument is initial state.
         * @constructor
         * @implements {Statable}
         */
        function Oscillator(context, state) {
            // Call interface constructor
            Statable.call(this);

            this.isActive = state;

            this.context = context;

            this.source = context.createOscillator();

            // for legacy browsers
            this.source.setPeriodicWave = this.source.setPeriodicWave || this.source.setWaveTable;
            this.source.start           = this.source.start           || this.source.noteOn;
            this.source.stop            = this.source.stop            || this.source.noteOff;

            this.volume = context.createGain();

            // in order to not call in duplicate "start" or "stop"  method in the instance of OscillatorNode
            this.isStop = true;

            this.octave  = 0;
            this.fine    = 0;
            this.customs = {
                'real': new Float32Array([0, 1]),
                'imag': new Float32Array([0, 1])
            };
        };

        /** @implements {Statable} */
        Oscillator.prototype = Object.create(Statable.prototype);
        Oscillator.prototype.constructor = Oscillator;

        /**
         * This method is getter or setter for parameters.
         * @param {string|object} key This argument is property name in the case of string type.
         *     This argument is pair of property and value in the case of associative array.
         * @param {number|string} value This argument is the value of designated property. If this argument is omitted, This method is getter.
         * @return {number|string|Oscillator} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
         */
        Oscillator.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                // Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                var OCTAVE = 1200;  // 1 Octave = 1200 cent

                switch (k) {
                    case 'type':
                        if (value === undefined) {
                            // Getter
                            return this.source.type;
                        } else {
                            // Setter
                            if (Object.prototype.toString.call(value) !== '[object Object]') {
                                var v = String(value).toLowerCase();

                                // for legacy browsers
                                var WAVE_TYPE = {
                                    'sine'    : this.source.SINE     || 0,
                                    'square'  : this.source.SQUARE   || 1,
                                    'sawtooth': this.source.SAWTOOTH || 2,
                                    'triangle': this.source.TRIANGLE || 3
                                };

                                if (v in WAVE_TYPE) {
                                    this.source.type = (Object.prototype.toString.call(this.source.type) === '[object String]') ? v : WAVE_TYPE[v];
                                }
                            } else {
                                // Custom wave
                                if (('real' in value) && ('imag' in value)) {
                                    var reals = null;
                                    var imags = null;

                                    if (value.real instanceof Float32Array) {
                                        reals = value.real;
                                    } else if (Array.isArray(value.real)) {
                                        reals = new Float32Array(value.real);
                                    }

                                    if (value.imag instanceof Float32Array) {
                                        imags = value.imag;
                                    } else if (Array.isArray(value.imag)) {
                                        imags = new Float32Array(value.imag);
                                    }

                                    if ((reals instanceof Float32Array) && (imags instanceof Float32Array)) {
                                        var MAX_SIZE = 4096;  // This size is defined by specification

                                        if (reals.length > MAX_SIZE) {reals = reals.subarray(0, MAX_SIZE);}
                                        if (imags.length > MAX_SIZE) {imags = imags.subarray(0, MAX_SIZE);}

                                        // The 1st value is fixed by 0 (This is is defined by specification)
                                        if (reals[0] !== 0) {reals[0] = 0;}
                                        if (imags[0] !== 0) {imags[0] = 0;}

                                        var periodicWave = this.context.createPeriodicWave(reals, imags);

                                        this.source.setPeriodicWave(periodicWave);
                                        this.customs.real = reals;
                                        this.customs.imag = imags;
                                    }
                                }
                            }
                        }

                        break;
                    case 'octave':
                        if (value === undefined) {
                            // Getter
                            return this.octave;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = (this.source.detune.minValue || -4800) / OCTAVE;
                            var max = (this.source.detune.maxValue ||  4800) / OCTAVE;

                            if ((v >= min) && (v <= max)) {
                                this.octave = v;
                                this.source.detune.value = this.fine + (v * OCTAVE);
                            }
                        }

                        break;
                    case 'fine':
                        if (value === undefined) {
                            // Getter
                            return this.fine;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = -OCTAVE;
                            var max =  OCTAVE;

                            if ((v >= min) && (v <= max)) {
                                this.fine = v;
                                this.source.detune.value = v + (this.octave * OCTAVE);
                            }
                        }

                        break;
                    case 'volume':
                    case 'gain'  :
                        if (value === undefined) {
                            // Getter
                            return this.volume.gain.value;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = this.volume.gain.minValue || 0;
                            var max = this.volume.gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.volume.gain.value = v;
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
         * This method connects nodes.
         * @param {AudioNode} output This argument is the instance of AudioNode as output.
         * @return {Oscillator} This is returned for method chain.
         */
        Oscillator.prototype.ready = function(output) {
            if (this.isActive) {
                // for saving value
                var params = {
                    'type'     : this.source.type,
                    'frequency': this.source.frequency.value,
                    'detune'   : this.source.detune.value
                };

                if (!this.isStop) {
                    this.source.stop(this.context.currentTime);
                    this.source.disconnect(0);
                }

                this.source = this.context.createOscillator();

                // for legacy browsers
                this.source.setPeriodicWave = this.source.setPeriodicWave || this.source.setWaveTable;
                this.source.start           = this.source.start           || this.source.noteOn;
                this.source.stop            = this.source.stop            || this.source.noteOff;

                if (params.type === 'custom') {
                    // Custom wave
                    var reals        = this.customs.real;
                    var imags        = this.customs.imag;
                    var periodicWave = this.context.createPeriodicWave(reals, imags);

                    this.source.setPeriodicWave(periodicWave);
                } else {
                    this.source.type = params.type;
                }

                this.source.frequency.value = params.frequency;
                this.source.detune.value    = params.detune;

                this.volume.connect(output);
            }

            return this;
        };

        /**
         * This method starts sound.
         * @param {number} startTime This argument is the start time.
         * @return {Oscillator} This is returned for method chain.
         */
        Oscillator.prototype.start = function(startTime) {
            if (this.isActive) {
                this.source.start(startTime);
                this.isStop = false;
            } else {
                if (!this.isStop) {
                    this.source.stop(this.context.currentTime);
                    this.isStop = true;
                }

                this.source.disconnect(0);
            }

            return this;
        };

        /**
         * This method stops sound.
         * @param {number} stopTime This argument is the stop time.
         * @return {Oscillator} This is returned for method chain.
         */
        Oscillator.prototype.stop = function(stopTime) {
            if (!this.isStop) {
                this.source.stop(stopTime);
                this.source.disconnect(0);

                this.isStop = true;
            }

            return this;
        };

        /** @override */
        Oscillator.prototype.state = function(state) {
            if (state === undefined) {
                return this.isActive;  // Getter
            } else if (String(state).toLowerCase() === 'toggle') {
                this.isActive = !this.isActive;  // Setter
            } else {
                this.isActive = Boolean(state);  // Setter
            }

            // in the case of setter
            return this;
        };

        /**
         * This method gets the instance of OscillatorNode.
         * @return {OscillatorNode}
         */
        Oscillator.prototype.get = function() {
            return this.source;
        };

        /** @override */
        Oscillator.prototype.toString = function() {
            return '[OscillatorModule Oscillator]';
        };

        // Clear
        this.sources.length = 0;

        if (!Array.isArray(states)) {
            states = [states];
        }

        for (var i = 0, len = states.length ; i < len; i++) {
            this.sources[i] = new Oscillator(this.context, Boolean(states[i]));
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

            var r = SoundModule.prototype.param.call(this, k, value);
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

        if (Object.prototype.toString.call(processCallback) === '[object Function]') {
            this.processor.onaudioprocess = processCallback;
        } else {
            this.processor.onaudioprocess = function(event) {
                var inputLs  = event.inputBuffer.getChannelData(0);
                var inputRs  = event.inputBuffer.getChannelData(1);
                var outputLs = event.outputBuffer.getChannelData(0);
                var outputRs = event.outputBuffer.getChannelData(1);

                outputLs.set(inputLs);
                outputRs.set(inputRs);
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

        var self = this;

        if (Object.prototype.toString.call(processCallback) === '[object Function]') {
            this.processor.onaudioprocess = processCallback;
        } else {
            this.processor.onaudioprocess = function(event) {
                var inputLs  = event.inputBuffer.getChannelData(0);
                var inputRs  = event.inputBuffer.getChannelData(1);
                var outputLs = event.outputBuffer.getChannelData(0);
                var outputRs = event.outputBuffer.getChannelData(1);

                outputLs.set(inputLs);
                outputRs.set(inputRs);

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
                    // Release
                }
            };
        }

        return this;
    };

    /**
     * This method gets the instance of Oscillator that is used in OscillatorModule.
     * @param {number} index This argument is required in the case of designating OscillatorNode.
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
        var params = SoundModule.prototype.params.call(this);

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

    /**
     * This subclass defines properties for playing the one-shot audio.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {SoundModule}
     */
    function OneshotModule(context) {
        SoundModule.call(this, context);

        this.sources   = [];  /** @type {Array.<AudioBufferSourceNode>} */
        this.resources = [];  /** @type {Array.<string>} */
        this.buffers   = [];  /** @type {Array.<AudioBuffer>} */
        this.volumes   = [];  /** @type {Array.<GainNode>} */
        this.isStops   = [];  /** @type {Array.<boolean>} in order to not call in duplicate "start" or "stop" method in the instance of AudioBufferSourceNode */

        // for audio sources
        this.settings = [];  /** @type {Array.<object>} */

        // for scheduling
        this.times = {
            'start': 0,
            'stop' : 0
        };

        this.transpose = 1.0;

        this.isStop = true;

        // This flag determines whether sound wave is drawn
        this.isAnalyser = false;
    }

    /** @extends {SoundModule} */
    OneshotModule.prototype = Object.create(SoundModule.prototype);
    OneshotModule.prototype.constructor = OneshotModule;

    /**
     * Class (Static) properties
     */
    OneshotModule.ERROR_AJAX         = 'error';
    OneshotModule.ERROR_AJAX_TIMEOUT = 'timeout';
    OneshotModule.ERROR_DECODE       = 'decode';

    /**
     * This method creates the instances of AudioBuffer by Ajax.
     * @param {Array.<string>|Array.<AudioBuffer>} resources This argument is either URLs or the instances of AudioBuffer for audio resources.
     * @param {Array.<object>} settings This argument is the properties of each audio sources.
     * @param {number} timeout This argument is timeout of Ajax. The default value is 60000 msec (1 minutes).
     * @param {function} successCallback This argument is invoked as next process when reading file is successful.
     * @param {function} errorCallback This argument is invoked when error occurred.
     * @param {function} progressCallback This argument is invoked during receiving audio data.
     * @return {OneshotModule} This is returned for method chain.
     * @override
     */
    OneshotModule.prototype.setup = function(resources, settings, timeout, successCallback, errorCallback, progressCallback) {
        // The argument is associative array ?
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            var properties = arguments[0];

            if ('resources' in properties) {resources        = properties.resources;}
            if ('settings'  in properties) {settings         = properties.settings;}
            if ('timeout'   in properties) {timeout          = properties.timeout;}
            if ('success'   in properties) {successCallback  = properties.success;}
            if ('error'     in properties) {errorCallback    = properties.error;}
            if ('progress'  in properties) {progressCallback = properties.progress;}
        }

        if (!Array.isArray(resources)) {
            resources = [resources];
        }

        this.resources = resources;

        if (!Array.isArray(settings)) {
            settings = [settings];
        }

        this.buffers.length = resources.length;

        for (var i = 0, len = settings.length; i < len; i++) {
            if ('buffer' in settings[i]) {
                var buffer = parseInt(settings[i].buffer);

                if ((buffer >= 0) && (buffer < this.buffers.length)) {
                    settings[i].buffer = buffer;
                } else {
                    return;
                }
            } else {
                return;
            }

            settings[i].rate   = (('rate'   in settings[i]) && (settings[i].rate >= 0))                               ? parseFloat(settings[i].rate)   : 1;
            settings[i].loop   =  ('loop'   in settings[i])                                                           ? Boolean(settings[i].loop)      : false;
            settings[i].start  = (('start'  in settings[i]) && (settings[i].start >= 0))                              ? parseFloat(settings[i].start)  : 0;
            settings[i].end    = (('end'    in settings[i]) && (settings[i].end   >= 0))                              ? parseFloat(settings[i].end)    : 0;
            settings[i].volume = (('volume' in settings[i]) && (settings[i].volume >=0) && (settings[i].volume <= 1)) ? parseFloat(settings[i].volume) : 1;

            this.isStops[i] = true;
            this.volumes[i] = this.context.createGain();
            this.envelopegenerator.setGenerator(i);
        }

        this.settings = settings;

        // If the error is at least 1, this method aborts the all of connections.
        // Therefore, this flag are shared with the all instances of XMLHttpRequest.
        var isError = false;

        var t = parseInt(timeout);

        var self = this;

        // Get ArrayBuffer by Ajax -> Create the instances of AudioBuffer
        var load = function(url, index) {
            var xhr = new XMLHttpRequest();

            xhr.timeout = (t > 0) ? t : 60000;

            xhr.ontimeout = function(error) {
                if (!isError && (Object.prototype.toString.call(errorCallback) === '[object Function]')) {
                    errorCallback(error, OneshotModule.ERROR_AJAX_TIMEOUT);
                }

                isError = true;
            };

            xhr.onprogress = function(event) {
                if (isError) {
                    xhr.abort();
                } else if (Object.prototype.toString.call(progressCallback) === '[object Function]') {
                    progressCallback(event);
                }
            };

            xhr.onerror = function(event) {
                if (!isError && (Object.prototype.toString.call(errorCallback) === '[object Function]')) {
                    errorCallback(event, OneshotModule.ERROR_AJAX);
                }

                isError = true;
            };

            // Success
            xhr.onload = function(event) {
                if (xhr.status === 200) {
                    var arrayBuffer = xhr.response;

                    if (!(arrayBuffer instanceof ArrayBuffer)) {
                        return;
                    }

                    var decodeSuccessCallback = function(audioBuffer) {
                        self.buffers[index] = audioBuffer;

                        // The creating the instances of AudioBuffer has completed ?
                        for (var i = 0, len = self.buffers.length; i < len; i++) {
                            if (self.buffers[i] === undefined) {
                                return;
                            }
                        }

                        if (Object.prototype.toString.call(successCallback) === '[object Function]') {
                            successCallback.call(self, event, self.buffers);
                        }
                    };

                    var decodeErrorCallback = function(error) {
                        if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                            errorCallback(error, OneshotModule.ERROR_DECODE);
                        }
                    };

                    self.context.decodeAudioData(arrayBuffer, decodeSuccessCallback, decodeErrorCallback);
                }
            };

            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';  // XMLHttpRequest Level 2
            xhr.send(null);
        };

        for (var i = 0, len = this.resources.length; i < len; i++) {
            if (Object.prototype.toString.call(this.resources[i]) === '[object String]') {
                // Get the instances of AudioBuffer from the designated URLs.
                load(this.resources[i], i);
            } else if (this.resources[i] instanceof AudioBuffer) {
                // Get the instances of AudioBuffer directly
                this.buffers[i] = this.resources[i];
            }
        }

        return this;
    };

    /**
     * This method is getter or setter for parameters.
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|OneshotModule} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     * @override
     */
    OneshotModule.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            var r = SoundModule.prototype.param.call(this, k, value);

            if (r !== undefined) {
                // Getter
                return r;
            } else {
                switch (k) {
                    case 'transpose':
                        if (value === undefined) {
                            // Getter
                            return this.transpose;
                        } else {
                            // Setter
                            var v   = parseFloat(value);
                            var min = 0;

                            if (v > min) {
                                this.transpose = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }
        }

        return this;
    };

    /**
     * This method schedules the time of start and stop.
     * @param {number} startTime This argument is the start time. The default value is 0.
     * @param {number} stopTime This argument is the stop time. The default value is 0.
     * @return {OneshotModule} This is returned for method chain.
     * @override
     */
    OneshotModule.prototype.ready = function(startTime, stopTime) {
        var st = parseFloat(startTime);
        var sp = parseFloat(stopTime);

        if (st >=  0) {this.times.start = st;} else {this.times.start = 0;}
        if (sp >= st) {this.times.stop  = sp;} else {this.times.stop  = 0;}

        this.envelopegenerator.clear();

        return this;
    };

    /**
     * This method starts one-shot audio with the designated playback rate and volume.
     * @param {number} index This argument is in order to select the instance of AudioBufferSourceNode.
     * @param {Array.<Effector>} connects This argument is the array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {OneshotModule} This is returned for method chain.
     * @override
     */
    OneshotModule.prototype.start = function(index, connects, processCallback) {
        var selectedIndex = parseInt(index);

        if (isNaN(selectedIndex) || (selectedIndex < 0) || (selectedIndex >= this.settings.length)) {
            return;
        }

        var bufferIndex  = this.settings[selectedIndex].buffer;
        var playbackRate = this.settings[selectedIndex].rate;
        var loop         = this.settings[selectedIndex].loop;
        var loopStart    = this.settings[selectedIndex].start;
        var loopEnd      = this.settings[selectedIndex].end;
        var volume       = this.settings[selectedIndex].volume;

        if (!(this.buffers[bufferIndex] instanceof AudioBuffer)) {
            // "setup" method has not been invoked
            return;
        }

        // the instance of AudioBufferSourceNode already exists ?
        if (this.sources[selectedIndex] instanceof AudioBufferSourceNode) {
            this.sources[selectedIndex].stop(this.context.currentTime);
            this.sources[selectedIndex].disconnect(0);
            this.sources[selectedIndex] = null;
        }

        var source = this.context.createBufferSource();

        // for legacy browsers
        source.start = source.start || source.noteGrainOn;
        source.stop  = source.stop  || source.noteOff;

        source.buffer = this.buffers[bufferIndex];

        // Set properties
        source.playbackRate.value = playbackRate * this.transpose;
        source.loop               = loop;
        source.loopStart          = loopStart;
        source.loopEnd            = loopEnd;

        this.volumes[selectedIndex].gain.value = volume;

        this.envelopegenerator.clear();

        // AudioBufferSourceNode (Input) -> GainNode (Envelope Generator) -> GainNode (Volume) -> ScriptProcessorNode -> ... -> AudioDestinationNode (Output)
        this.envelopegenerator.ready(selectedIndex, source, this.volumes[selectedIndex]);
        this.volumes[selectedIndex].connect(this.processor);
        this.connect(this.processor, connects);

        var startTime = this.context.currentTime + this.times.start;

        source.start(startTime);

        this.sources[selectedIndex] = source;

        // Attack -> Decay -> Sustain
        this.envelopegenerator.start(startTime);

        this.on(startTime);

        if (!this.isAnalyser) {
            this.analyser.start('time');
            this.analyser.start('fft');
            this.isAnalyser = true;
        }

        this.isStops[selectedIndex] = false;

        var self = this;

        // in the case of scheduling stop time
        if (this.times.stop > 0) {
            global.setTimeout(function() {
                self.stop(selectedIndex);
            }, (this.times.stop * 1000));
        }

        // Call on stopping audio
        source.onended = function() {
            self.isStops[selectedIndex] = true;
        };

        if (Object.prototype.toString.call(processCallback) === '[object Function]') {
            this.processor.onaudioprocess = processCallback;
        } else {
            this.processor.onaudioprocess = function(event) {
                self.isStop = self.isStops.every(function(element, index, array) {
                    return element;
                });

                if (self.isStop) {
                    // Stop

                    self.off(self.context.currentTime);

                    self.envelopegenerator.clear();

                    self.analyser.stop('time');
                    self.analyser.stop('fft');
                    self.isAnalyser = false;

                    // Stop onaudioprocess event
                    this.disconnect(0);
                    this.onaudioprocess = null;
                } else {
                    var inputLs  = event.inputBuffer.getChannelData(0);
                    var inputRs  = event.inputBuffer.getChannelData(1);
                    var outputLs = event.outputBuffer.getChannelData(0);
                    var outputRs = event.outputBuffer.getChannelData(1);

                    outputLs.set(inputLs);
                    outputRs.set(inputRs);
                }
            };
        }

        return this;
    };

    /**
     * This method stops the designated one-shot audio.
     * @param {number} index This argument is in order to select the instance of AudioBufferSourceNode.
     * @return {OneshotModule} This is returned for method chain.
     * @override
     */
    OneshotModule.prototype.stop = function(index) {
        var selectedIndex = parseInt(index);

        if (isNaN(selectedIndex) || (selectedIndex < 0) || (selectedIndex >= this.settings.length)) {
            return;
        }

        var bufferIndex= this.settings[selectedIndex].buffer;

        if (!((this.buffers[bufferIndex] instanceof AudioBuffer) && (this.sources[selectedIndex] instanceof AudioBufferSourceNode))) {
            return;
        }

        var stopTime = this.context.currentTime + this.times.stop;

        // Attack or Decay or Sustain -> Release
        this.envelopegenerator.stop(stopTime);

        this.filter.stop(stopTime);

        for (var i = 0, len = this.plugins.length; i < len; i++) {
            this.plugins[i].plugin.stop(stopTime, this.envelopegenerator.param('release'));
        }

        return this;
    };

    /**
     * This method gets the instance of AudioBuffer that is used in OneshotModule.
     * @param {number} index This argument is required in the case of designating AudioBuffer.
     * @return {Array.<AudioBuffer>|AudioBuffer}
     * @override
     */
    OneshotModule.prototype.get = function(index) {
        var i = parseInt(index);

        if ((i >= 0) && (i < this.buffers.length)) {
            return this.buffers[i];
        } else {
            return this.buffers;
        }
    };

    /** @override */
    OneshotModule.prototype.params = function() {
        var params = SoundModule.prototype.params.call(this);

        params.oneshot = {
            'transpose': this.transpose
        };

        return params;
    };

    /**
     * This method resets settings.
     * @param {number} index This argument is in order to select target setting.
     * @param {string} key This argument is in order to select parameter.
     * @param {number|boolean} value This argument is new value.
     * @return {OneshotModule} This is returned for method chain.
     */
    OneshotModule.prototype.reset = function(index, key, value) {
        var selectedIndex = parseInt(index);

        if (String(key).toLowerCase() in this.settings[selectedIndex]) {
            this.settings[selectedIndex][key.toLowerCase()] = value;
        }

        return this;
    };

    /** @override */
    OneshotModule.prototype.toString = function() {
        return '[OneshotModule]';
    };

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
        SoundModule.call(this, context);

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
                            // Getter
                            return this.depth;
                        } else {
                            // Setter
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

        this.vocalcanceler = new VocalCanceler();
    }

    /** @extends {SoundModule} */
    AudioModule.prototype = Object.create(SoundModule.prototype);
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

            var r = SoundModule.prototype.param.call(this, k, value);

            if (r !== undefined) {
                // Getter
                return r;
            } else {
                switch (k) {
                    case 'playbackrate':
                        if (value === undefined) {
                            // Getter
                            return this.source.playbackRate.value;
                        } else {
                            // Setter
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
                            // Getter
                            return this.source.loop;
                        } else {
                            // Setter
                            this.source.loop = Boolean(value);
                        }

                        break;
                    case 'currenttime':
                        if (value === undefined) {
                            // Getter
                            return this.currentTime;
                        } else {
                            // Setter
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
        var params = SoundModule.prototype.params.call(this);

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
        AudioModule.call(this, context);

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

    /** @extends {AudioModule} */
    MediaModule.prototype = Object.create(AudioModule.prototype);
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

            var r = SoundModule.prototype.param.call(this, k, value);

            if (r !== undefined) {
                // Getter
                return r;
            } else {
                switch (k) {
                    case 'playbackrate':
                        if (value === undefined) {
                            // Getter
                            return (this.media instanceof HTMLMediaElement) ? this.media.playbackRate : this.playbackRate;
                        } else {
                            // Setter
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
                            // Getter
                            return (this.media instanceof HTMLMediaElement) ? this.media.currentTime : 0;
                        } else {
                            // Setter
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
                            // Getter
                            return (this.media instanceof HTMLMediaElement) ? this.media[k] : this[k];
                        } else {
                            // Setter
                            if (this.media instanceof HTMLMediaElement) {
                                this.media[k] = Boolean(value);
                            }

                            this[k] = Boolean(value);
                        }

                        break;
                    case 'width' :
                    case 'height':
                        if (value === undefined) {
                            // Getter
                            return (this.media instanceof HTMLVideoElement) ? this.media[k] : 0;
                        } else {
                            // Setter
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
        var params = SoundModule.prototype.params.call(this);

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

    /**
     * This class defines properties that processes sound data from WebRTC in Web Audio API.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {SoundModule}
     */
    function StreamModule(context) {
        SoundModule.call(this, context);

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

        this.noisegate = new NoiseGate();
    }

    /** @extends {SoundModule} */
    StreamModule.prototype = Object.create(SoundModule.prototype);
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

            var r = SoundModule.prototype.param.call(this, k, value);
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
        var params = SoundModule.prototype.params.call(this);

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

    /**
     * This class defines properties for mixing sound sources  that is defined in this library.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {SoundModule}
     */
    function MixerModule(context) {
        SoundModule.call(this, context);

        /** @type {Array.<OscillatorModule>|Array.<OneshotModule>|Array.<AudioModule>|Array.<MediaModule>}|Array.<StreamModule> */
        this.sources = [];

        this.isAnalyser = false;
    };

    /** @extends {SoundModule} */
    MixerModule.prototype = Object.create(SoundModule.prototype);
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

    /**
     * This class defines properties for using Web MIDI API.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     */
    function MIDI(context) {
        this.context = context;

        this.midiAccess = null;  // for the instance of MIDIAccess
        this.inputs     = [];    // for the instances of MIDIInput
        this.outputs    = [];    // for the instances of MIDIOutput
    }

    /**
     * This method invokes requestMIDIAccess and gets objects for using Web MIDI API.
     * @param {function} sysex This argument is in order to select whether using system exclusive message.
     * @param {function} successCallback This argument is invoked when requestMIDIAccess succeeds.
     * @param {function} errorCallback This argument is invoked when requestMIDIAccess fails.
     * @return {MIDI} This is returned for method chain.
     */
    MIDI.prototype.setup = function(sysex, successCallback, errorCallback) {
        if (!navigator.requestMIDIAccess) {
            throw new Error('Cannot use Web MIDI API.');
        }

        var self = this;

        navigator.requestMIDIAccess({sysex : Boolean(sysex)}).then(function(midiAccess) {
            self.midiAccess = midiAccess;

            if (Object.prototype.toString.call(midiAccess) === '[object Function]') {
                // Legacy Chrome
                self.inputs  = midiAccess.inputs();
                self.outputs = midiAccess.outputs();
            } else {
                // Chrome 39 and later
                var inputIterator  = midiAccess.inputs.values();
                var outputIterator = midiAccess.outputs.values();

                for (var i = inputIterator.next(); !i.done; i = inputIterator.next()) {
                    self.inputs.push(i.value);
                }

                for (var o = outputIterator.next(); !o.done; o = outputIterator.next()) {
                    self.outputs.push(o.value);
                }
            }

            if (Object.prototype.toString.call(successCallback) === '[object Function]') {
                successCallback(self.midiAccess, self.inputs, self.outputs);
            }
        }, function(error) {
            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(error);
            }
        });

        return this;
    };

    /**
     * This method gets the instance of MIDIAccess.
     * @return {MIDIAccess}
     */
    MIDI.prototype.get = function() {
        return this.midiAccess;
    };

    /** @override */
    MIDI.prototype.toString = function() {
        return '[MIDI]';
    };

    /**
     * This class defines properties for playing the MML (Music Macro Language).
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     */
    function MML(context) {
        this.context = context;

        // for the array of OscillatorNode or OscillatorModule or OneshotModule
        this.source = null;

        this.sequences = [];  /** @type {Array.<Array.<object>>} */
        this.timerids  = [];  /** @type {Array.<number>} */
        this.prev      = [];  /** @type {Array.<object>} */

        this.callbacks = {
            'start': function() {},
            'stop' : function() {},
            'ended': function() {},
            'error': function() {}
        };
    }

    /**
     * Class (Static) properties
     */
    MML.ONE_MINUTES       = 60;  // sec
    MML.EQUAL_TEMPERAMENT = 12;
    MML.QUARTER_NOTE      = 4;
    MML.REGEXP_MML        = /\s*(?:T\d+)\s*|\s*(?:O\d+)\s*|\s*(?:(?:[CDEFGABR][#+-]?)+(?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)\.?)(?:&(?:[CDEFGABR][#+-]?)+(?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)\.?)*\s*/gi;
    MML.REGEXP_TEMPO      = /T\d+/i;
    MML.REGEXP_OCTAVE     = /O\d+/i;
    MML.REGEXP_NOTE       = /(?:(?:[CDEFGABR][#+-]?)+)(?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)(?:&(?:[CDEFGABR][#+-]?)+(?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)\.?)*/i;
    MML.REGEXP_CHORD      = /((?:[CDEFGABR][#+-]?)+)(?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)\.?.*/i;
    MML.REGEXP_DURATION   = /(?:[CDEFGABR][#+-]?)+((?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)\.?.*)/i;
    MML.ERROR_STRING      = 'MML';
    MML.ERROR_TEMPO       = 'TEMPO';
    MML.ERROR_OCTAVE      = 'OCTAVE';
    MML.ERROR_NOTE        = 'NOTE';

    /**
     * This class (static) method computes index by octave and pitch name.
     * @param {number} octave This argument is octave.
     * @param {string} pitchname This argument is pitch name.
     * @return {number} This is returned as index that is computed by octave and pitch name.
     */
    MML.computeIndex = function(octave, pitchname) {
        var index = 0;

        switch (pitchname) {
            case 'C': index =  3; break;
            case 'D': index =  5; break;
            case 'E': index =  7; break;
            case 'F': index =  8; break;
            case 'G': index = 10; break;
            case 'A': index = 12; break;
            case 'B': index = 14; break;
            case 'R': return 'R';
            default : break;
        }

        var computedIndex = (MML.EQUAL_TEMPERAMENT * (octave - 1)) + index;

        if (computedIndex >= 0) {
            return computedIndex;
        } else {
            return -1;
        }
    };

    /**
     * This class (static) method computes frequency from the index that corresponds to the 12 equal temperament.
     * @param {number} index This argument is the index that corresponds to the 12 equal temperament.
     *     For example, This value is between 0 and 88 in the case of piano.
     * @return {number} This is returned as frequency.
     */
    MML.computeFrequency = function(index) {
        // The 12 equal temperament
        //
        // Min -> 27.5 Hz (A), Max -> 4186 Hz (C)
        //
        // A * 1.059463 -> A# (half up)

        var FREQUENCY_RATIO = Math.pow(2, (1 / 12));  // about 1.059463
        var MIN_A           = 27.5;

        if (index >= 0) {
            return MIN_A * Math.pow(FREQUENCY_RATIO, index);
        } else {
            return -1;
        }
    };

    /**
     * This class (static) method converts string to ASCII string.
     * @param {string} string This argument is string.
     * @return {string} This is returned as string that is converted to ASCII string.
     */
    MML.toAscii = function(string) {
        var converted = '';

        for (var i = 0, len = string.length; i < len; i++) {
            var charCode = string.charCodeAt(i);

            if (charCode > 0xFF) {
                converted += ('&#' + charCode + ';');
            } else {
                converted += string.charAt(i);
            }
        }

        return converted;
    };

    /**
     * This method sets callback functions.
     * @param {string|object} key This argument is property name.
     *     This argument is pair of property and value in the case of associative array.
     * @param {function} value This argument is callback function.
     * @return {MML} This is returned for method chain.
     */
    MML.prototype.setup = function(key, value) {
        if ((arguments.length > 0) && (Object.prototype.toString.call(arguments[0]) === '[object Object]')) {
            // Associative array
            for (var k in arguments[0]) {
                this.setup(k, arguments[0][k]);
            }
        } else if (arguments.length > 1) {
            var k = String(key).toLowerCase();

            if (k in this.callbacks) {
                if (Object.prototype.toString.call(value) === '[object Function]') {
                    this.callbacks[k] = value;
                }
            }
        }

        return this;
    };

    /**
     * This method parses MML string.
     * @param {Array.<OscillatorNode>|OscillatorModule|OneshotModule} source This argument is in order to select sound source.
     * @param {Array.<string>} mmls This argument is MML strings.
     * @return {Array.<Array.<object>>} This is returned as array that contains object for playing the MML.
     */
    MML.prototype.ready = function(source, mmls) {
        if (this.source !== null) {
            this.stop();  // Stop the previous MML
        }

        // Clear
        this.sequences.length = 0;
        this.timerids.length  = 0;
        this.prev.length      = 0;

        if (Array.isArray(source)) {
            for (var i = 0, len = source.length; i < len; i++) {
                if (!(source[i] instanceof OscillatorNode)) {
                    return this;
                }
            }

            this.source = source;
        } else if (source instanceof OscillatorNode) {
            this.source = [source];
        } else if ((source instanceof OscillatorModule) || (source instanceof OneshotModule)) {
            this.source = source;
        } else {
            return this;
        }

        if (!Array.isArray(mmls)) {
            mmls = [mmls];
        }

        while (mmls.length > 0) {
            var mml = String(mmls.shift());

            /** @type {Array.<object>}*/
            var sequences = [];

            var notes = mml.match(MML.REGEXP_MML);

            if (notes === null) {
                this.callbacks.error(MML.ERROR_STRING, '');
                return;
            }

            var currentTime = 0;

            while (notes.length > 0) {
                var note = notes.shift().trim();

                if (MML.REGEXP_TEMPO.test(note)) {
                    var bpm = parseInt(note.slice(1));

                    if (bpm > 0) {
                        var timeOf4note = MML.ONE_MINUTES / bpm;
                    } else {
                        this.callbacks.error(MML.ERROR_TEMPO, note);
                        return;
                    }
                } else if (MML.REGEXP_OCTAVE.test(note)) {
                    var octave = parseInt(note.slice(1));

                    if (octave < 0) {
                        this.callbacks.error(MML.ERROR_OCTAVE, note);
                        return;
                    }
                } else if (MML.REGEXP_NOTE.test(note)) {
                    if (timeOf4note === undefined) {
                        this.callbacks.error(MML.ERROR_TEMPO, note);
                        return;
                    }

                    if (octave === undefined) {
                        this.callbacks.error(MML.ERROR_OCTAVE, note);
                        return;
                    }

                    var chord = note.match(MML.REGEXP_CHORD)[1];

                    var indexes = [];

                    for (var i = 0, len = chord.length; i < len; i++) {
                        var pitchname = chord.charAt(i);
                        var index     = MML.computeIndex(octave, pitchname.toUpperCase());

                        // Half up or Half down (Sharp or Flat) ?
                        switch (chord.charAt(i + 1)) {
                            case '#':
                            case '+':
                                // Half up (Sharp)
                                index++;
                                i++;
                                break;
                            case '-':
                                // Half down (Flat)
                                index--;
                                i++;
                                break;
                            default:
                                // Normal (Natural)
                                break;
                        }

                        // in the case of chord
                        if (index >= indexes[0]) {
                            index -= MML.EQUAL_TEMPERAMENT;
                        }

                        // Validation
                        if (index < 0) {
                            this.callbacks.error(MML.ERROR_NOTE, note);
                            return;
                        }

                        indexes.push(index);
                    }

                    var frequencies = [];

                    for (var i = 0, len = indexes.length; i < len; i++) {
                        var frequency = (indexes[i] !== 'R') ? MML.computeFrequency(indexes[i]) : 0;

                        // Validation
                        if (frequency === -1) {
                            this.callbacks.error(MML.ERROR_NOTE, note);
                            return;
                        }

                        frequencies.push(frequency);
                    }

                    var durations = note.split('&');  // Tie
                    var duration  = 0;

                    while (durations.length > 0) {
                        var d = durations.shift().match(MML.REGEXP_DURATION)[1];

                        switch (parseInt(d)) {
                            case   1:
                            case   2:
                            case   4:
                            case   8:
                            case  16:
                            case  32:
                            case  64:
                            case 128:
                            case 256:
                                var numOf4note = MML.QUARTER_NOTE / parseInt(d);

                                // a dotted note ?
                                duration += (d.indexOf('.') !== -1) ? ((1.5 * numOf4note) * timeOf4note) : (numOf4note * timeOf4note);
                                break;
                            case   6:
                                // Triplet of half note
                                duration += (2 * timeOf4note) / 3;
                                break;
                            case  12:
                                // Triplet of quarter note
                                duration += timeOf4note / 3;
                                break;
                            case  18:
                                // Nonuplet of half note
                                duration += (2 * timeOf4note) / 9;
                                break;
                            case  24:
                                // Triplet of 8th note
                                duration += (0.5 * timeOf4note) / 3;
                                break;
                            case  36:
                                // Nonuplet of quarter note
                                duration += timeOf4note / 9;
                                break;
                            case  48:
                                // Triplet of 16th note
                                duration += (0.25 * timeOf4note) / 3;
                                break;
                            case  72:
                                // Nonuplet of 8th note
                                duration += (0.5 * timeOf4note) / 9;
                                break;
                            case  96:
                                // Triplet of 32th note
                                duration += (0.125 * timeOf4note) / 3;
                                break;
                            case 144:
                                // Nonuplet of 16th note
                                duration += (0.25 * timeOf4note) / 9;
                                break;
                            case 192:
                                // Triplet of 64th note
                                duration += (0.0625 * timeOf4note) / 3;
                                break;
                            default:
                                this.callbacks.error(MML.ERROR_NOTE, note);
                                break;
                        }
                    }

                    var start = currentTime;
                    var stop  = start + duration;

                    currentTime += duration;

                    sequences.push({
                        'indexes'    : indexes,
                        'frequencies': frequencies,
                        'start'      : start,
                        'duration'   : duration,
                        'stop'       : stop
                    });
                }
            };

            if (sequences.length > 0) {
                // "start" method gets element by "pop" for performance
                sequences.reverse();

                this.sequences.push(sequences);
                this.timerids.push(null);
            }
        }

        return this.sequences;
    };

    /**
     * This method starts the designated MML part. Moreover, this method schedules next sound.
     * @param {number} part This argument is the part of MML.
     * @param {Array.<Effector>|Array.<AudioNode>} connects This argument is the array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {MML} This is returned for method chain.
     */
    MML.prototype.start = function(part, connects, processCallback) {
        var p = parseInt(part);

        if ((p >= 0) && (p < this.sequences.length)) {
            if (!Array.isArray(this.sequences[p])) {
                return this;
            }

            // End ?
            if (this.sequences[p].length === 0) {
                this.stop(processCallback);
                this.callbacks.ended();

                return this;
            }

            var sequence = this.sequences[p].pop();

            if (Array.isArray(this.source)) {
                for (var i = 0, len = this.source.length; i < len; i++) {
                    var source = this.source[i];

                    var type   = source.type;
                    var detune = source.detune.value;

                    source = this.context.createOscillator();

                    // for legacy browsers
                    source.start = source.start || source.noteOn;
                    source.stop  = source.stop  || source.noteOff;

                    source.type            = type;
                    source.frequency.value = sequence.frequencies[i];
                    source.detune.value    = detune;

                    if (Array.isArray(connects)) {
                        // OscillatorNode (Input) -> AudioNode -> ... -> AudioNode -> AudioDestinationNode (Output)
                        source.connect(connects[0]);

                        for (var i = 0, len = connects.length; i < len; i++) {
                            var node = connects[i];

                            if (i < (len - 1)) {
                                var next = connects[i + 1];

                                if (!((node instanceof AudioNode) && (next instanceof AudioNode))) {
                                    return;
                                }

                                node.connect(next);
                            } else {
                                node.connect(this.context.destination);
                            }
                        }
                    } else {
                        // OscillatorNode (Input) -> AudioDestinationNode (Output)
                        source.connect(this.context.destination);
                    }

                    source.start(this.context.currentTime);
                    source.stop(this.context.currentTime + sequence.duration);

                    this.source[i] = source;
                }

                for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                    if (sequence.indexes[i] !== 'R') {
                        this.callbacks.start(sequence, i);
                    }
                }
            } else if (this.source instanceof OscillatorModule) {
                this.source.start(sequence.frequencies, connects, processCallback);

                for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                    if (sequence.indexes[i] !== 'R') {
                        this.callbacks.start(sequence, i);
                    }
                }
            } else if (this.source instanceof OneshotModule) {
                for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                    if (sequence.indexes[i] !== 'R') {
                        this.source.start(sequence.indexes[i], connects, processCallback);
                        this.callbacks.start(sequence, i);
                    }
                }
            }

            var self = this;

            this.timerids[p] = global.setTimeout(function() {
                if (Array.isArray(self.source)) {
                    for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                        if (sequence.indexes[i] !== 'R') {
                            self.callbacks.stop(sequence, i);
                        }
                    }
                } else if (self.source instanceof OscillatorModule) {
                    self.source.stop(sequence.frequencies, processCallback);

                    for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                        if (sequence.indexes[i] !== 'R') {
                            self.callbacks.stop(sequence, i);
                        }
                    }
                } else if (self.source instanceof OneshotModule) {
                    for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                        if (sequence.indexes[i] !== 'R') {
                            self.source.stop(sequence.indexes[i], processCallback);
                            self.callbacks.stop(sequence, i);
                        }
                    }
                }

                // for MML.prototype.stop
                self.prev = sequence;

                // Start next sound by recursive call
                self.start(p, connects, processCallback);

                sequence = null;
            }, (sequence.duration * 1000));
        }

        return this;
    };

    /**
     * This method stops the all of MML parts.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {MML} This is returned for method chain.
     */
    MML.prototype.stop = function(processCallback) {
        var sequence = this.prev;

        if (sequence.length === 0) {
            return this;
        }

        if (Array.isArray(this.source)) {
            for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                if (sequence.indexes[i] !== 'R') {
                    this.callbacks.stop(sequence, i);
                }
            }
        } else if (this.source instanceof OscillatorModule) {
            this.source.stop(sequence.frequencies, processCallback);

            for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                if (sequence.indexes[i] !== 'R') {
                    this.callbacks.stop(sequence, i);
                }
            }
        } else if (this.source instanceof OneshotModule) {
            for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                if (sequence.indexes[i] !== 'R') {
                    this.source.stop(sequence.indexes[i], processCallback);
                    this.callbacks.stop(sequence, i);
                }
            }
        }

        for (var i = 0, len = this.timerids.length; i < len; i++) {
            global.clearTimeout(this.timerids[i]);
            this.timerids[i] = null;
        }

        return this;
    };

    /**
     * This method gets the array that contains object for playing the MML.
     * @param {number} index This argument is required in the case of designating sequence.
     * @return {Array.<Array.<object>>|Array.<object>}
     */
    MML.prototype.get = function(index) {
        var i = parseInt(index);

        if ((i >= 0) && (i < this.sequences.length)) {
            return this.sequences[i];
        } else {
            return this.sequences;
        }
    };

    /**
     * This method starts or stops MML according to state.
     * @param {number} part This argument is the part of MML.
     * @param {Array.<Effector>} connects This argument is the array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {MML} This is returned for method chain.
     */
    MML.prototype.toggle = function(part, connects, processCallback) {
        if (this.isPaused()) {
            this.start(part, connects, processCallback);
        } else {
            this.stop();
        }

        return this;
    };

    /**
     * This method determines whether the array that is used to play the MML exists.
     * @return {boolean} If the array exists, this value is true. Otherwise, this value is false.
     */
    MML.prototype.isSequences = function() {
        return Array.isArray(this.sequences[0]);
    };

    /**
     * This method determines whether the MML is paused.
     * @return {boolean} If the MML is paused, this value is true. Otherwise, this value is false.
     */
    MML.prototype.isPaused = function() {
        for (var i = 0, len = this.timerids.length; i < len; i++) {
            var timerid = this.timerids[i];

            if ((timerid === null) || (timerid === undefined)) {
                // Next timer
            } else {
                // Playing the MML
                return false;
            }
        }

        return true;
    };

    /**
     * This method creates text file for MML.
     * @param {string} mml This argument is MML string.
     * @return {string} This is returned as text file that MML is written.
     */
    MML.prototype.create = function(mml) {
        var base64  = global.btoa(MML.toAscii(String(mml)));
        var dataURL = 'data:text/plain;base64,' + base64;

        return dataURL;
    };

    /** @override */
    MML.prototype.toString = function() {
        return '[MML]';
    };

////////////////////////////////////////////////////////////////////////////////

    var sources = {
        'oscillator': new OscillatorModule(audiocontext),
        'oneshot'   : new OneshotModule(audiocontext),
        'audio'     : new AudioModule(audiocontext),
        'media'     : new MediaModule(audiocontext),
        'fallback'  : new MediaFallbackModule(),
        'stream'    : new StreamModule(audiocontext),
        'mixer'     : new MixerModule(audiocontext),
        'midi'      : new MIDI(audiocontext),
        'mml'       : new MML(audiocontext)
    };

    /**
     * This function is global object for getting the instance of OscillatorModule or Oscillator or OneshotModule or AudioModule or MediaModule or MediaFallbackModule or StreamModule or MixerModule or MIDI or MML.
     * @param {string} source This argument is one of 'oscillator', 'oneshot', 'audio', 'media', 'fallback', 'stream', 'mixer', 'midi', 'mml'.
     * @param {number} index This argument is in order to select one of some oscillators.
     * @return {OscillatorModule|Oscillator|OneshotModule|AudioModule|MediaModule|MediaFallbackModule|StreamModule|MixerModule|MIDI|MML}
     */
    XSound = function(source, index) {
        var s = String(source).replace(/-/g, '').toLowerCase();

        switch (s) {
            case 'oscillator':
                if (index === undefined) {
                    return sources.oscillator;
                } else {
                    var i = parseInt(index);

                    if ((i >= 0) && (i < sources.oscillator.length())) {
                        return sources.oscillator.get(i);
                    }
                }

                break;
            case 'oneshot' :
            case 'audio'   :
            case 'media'   :
            case 'fallback':
            case 'stream'  :
            case 'mixer'   :
            case 'midi'    :
            case 'mml'     :
                return sources[s];
            default :
                break;
        }
    };

    /**
     * Class (Static) properties
     */
    XSound.IS_XSOUND         = IS_XSOUND;
    XSound.SAMPLE_RATE       = audiocontext.sampleRate
    XSound.NUMBER_OF_INPUTS  = SoundModule.NUMBER_OF_INPUTS;
    XSound.NUMBER_OF_OUTPUTS = SoundModule.NUMBER_OF_OUTPUTS;

    /**
     * Class (Static) methods
     */
    XSound.read           = read;
    XSound.file           = file;
    XSound.ajax           = ajax;
    XSound.decode         = decode;
    XSound.toFrequencies  = toFrequencies;
    XSound.convertTime    = convertTime;
    XSound.fullscreen     = fullscreen;
    XSound.exitFullscreen = exitFullscreen;
    XSound.noConflict     = noConflict;

    /**
     * This class (static) method returns function as closure that is getter of cloned module.
     * @return {function} This is returned as closure that is getter of cloned module.
     */
    XSound.clone = function() {
        var clones = {
            'oscillator': new OscillatorModule(audiocontext),
            'oneshot'   : new OneshotModule(audiocontext),
            'audio'     : new AudioModule(audiocontext),
            'media'     : new MediaModule(audiocontext),
            'fallback'  : new MediaFallbackModule(),
            'stream'    : new StreamModule(audiocontext),
            'mixer'     : new MixerModule(audiocontext),
            'midi'      : new MIDI(audiocontext),
            'mml'       : new MML(audiocontext)
        };

        var C = function(source, index) {
            var s = String(source).replace(/-/g, '').toLowerCase();

            switch (s) {
                case 'oscillator':
                    if (index === undefined) {
                        return clones.oscillator;
                    } else {
                        var i = parseInt(index);

                        if ((i >= 0) && (i < clones.oscillator.length())) {
                            return clones.oscillator.get(i);
                        }
                    }

                    break;
                case 'oneshot' :
                case 'audio'   :
                case 'media'   :
                case 'fallback':
                case 'stream'  :
                case 'mixer'   :
                case 'midi'    :
                case 'mml'     :
                    return clones[s];
                default :
                    break;
            };
        };

        C.free  = function(sourceList) {
            if (!Array.isArray(sourceList)) {
                sourceList = [sourceList];
            }

            for (var i = 0, len = sourceList.length; i < len; i++) {
                var source = sourceList[i];

                // Already deleted ?
                if (source === null) {
                    continue;
                }

                for (var key in clones) {
                    if (source === clones[key]) {
                        clones[key] = null;
                    }
                }
            }
        };

        // Closure
        return C;
    };

    /**
     * This class (static) method releases memory of unnecessary instances.
     * @param {Array.<SoundModule|MIDI|MML|MediaFallbackModule>} sourceList This argument is the array that contains the instances of SoundModule or MIDI or MML or MediaFallbackModule.
     */
    XSound.free = function(sourceList) {
        if (!Array.isArray(sourceList)) {
            sourceList = [sourceList];
        }

        for (var i = 0, len = sourceList.length; i < len; i++) {
            var source = sourceList[i];

            // Already deleted ?
            if (source === null) {
                continue;
            }

            for (var key in sources) {
                if (source === sources[key]) {
                    sources[key] = null;
                }
            }
        }
    };

    /**
     * This class (static) method gets the instance of AudioContext.
     * @return {AudioContext}
     */
    XSound.get = function() {
        return audiocontext;
    };

    /**
     * This class (static) method gets "currentTime" property in the instance of AudioContext.
     * @return {number}
     */
    XSound.getCurrentTime = function() {
        return audiocontext.currentTime;
    };

    /** @override */
    XSound.prototype.toString = function() {
        return '[XSound]';
    };

    // Export
    global.XSound = XSound;
    global.X      = XSound;  // Alias of XSound

})(window);
