/** 
 * xsound.js
 * @fileoverview Web Audio API Library
 *
 * Copyright 2012, 2013, 2014@Tomohiro IKEDA
 * Released under the MIT license
 */
 
 
 
(function(global) {
    'use strict';

    //Global object
    var XSound;

    //Global constant value for the determination that Web Audio API is either enabled or disabled.
    var IS_XSOUND = (global.AudioContext || global.webkitAudioContext) ? true : false;
    var FULL_MODE = global.webkitAudioContext ? true : false;  //for Firefox

    /** 
     * This interface is in order to manage state of module that implements this interface.
     * @constructor
     */
    function Statable() {
    }

    /** 
     * This method gets or sets module's state.
     * @param {string|boolean} value If this argument is undefined, this method returns state as getter.
     *     If this argument is 'toggle', this method changes state according to current state. Otherwise, this method sets state.
     * @return {boolean|object} This is returned as module's state in the case of getter. This is returned for method chain in the case of setter.
     * @abstruct
     */
    Statable.prototype.state = function(value) {
    };

    //These functions are static methods for "XSound".

    /** 
     * TThis static method reads file of audio or text.
     * @param {Blob} file This argument is the instance of Blob. This is entity of file.
     * @param {string} type This argument is one of 'ArrayBuffer', 'DataURL', 'Text'.
     * @param {function} successCallback This argument is executed as next process when reading file is successful.
     * @param {function} errorCallback This argument is executed when reading file failed.
     * @param {function} progressCallback This argument is executed as "onprogress" event handler in the instance of FileReader.
     */
    var read = function(file, type, successCallback, errorCallback, progressCallback) {
        //The argument is associative array ?
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            var properties = arguments[0];

            if ('file'     in properties) {file             = properties.file;}
            if ('type'     in properties) {type             = properties.type;}
            if ('success'  in properties) {successCallback  = properties.success;}
            if ('error'    in properties) {errorCallback    = properties.error;}
            if ('progress' in properties) {progressCallback = properties.progress;}
        }

        if (!(file instanceof Blob)) {
            var FILE_IS_NOT_BLOB = 'FILE_IS_NOT_BLOB';

            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(null, FILE_IS_NOT_BLOB);
            }

            return;
        }

        //Create the instance of FileReader
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
                    case reader.error.NOT_FOUND_ERR    : error = 'NOT_FOUND_ERR';    break;
                    case reader.error.SECURITY_ERR     : error = 'SECURITY_ERR';     break;
                    case reader.error.ABORT_ERR        : error = 'ABORT_ERR';        break;
                    case reader.error.NOT_READABLE_ERR : error = 'NOT_READABLE_ERR'; break;
                    case reader.error.ENCODING_ERR     : error = 'ENCODING_ERR' ;    break;
                    default                            : error = 'ERR';              break;
                }

                errorCallback(event, error);
            }
        };

        reader.onload = function(event) {
            if (Object.prototype.toString.call(successCallback) === '[object Function]') {
                var result = reader.result;

                //Escape <script> in the case of text
                if ((Object.prototype.toString.call(result) === '[object String]') && (result.indexOf('data:') === -1) && (result.indexOf('blob:') === -1)) {
                    result = result.replace(/<(\/?script.*?)>/gi, '<$1>');
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
     * This static method gets the instance of File (extends Blob).
     * @param {Event} event This argument is the instance of Event by Drag & Drop or "<input type="file">".
     * @param {string} type This argument is one of 'ArrayBuffer', 'DataURL', 'Text'.
     * @param {function} successCallback This argument is executed as next process when reading file is successful.
     * @param {function} errorCallback This argument is executed when reading file failed.
     * @param {function} progressCallback This argument is executed as "onprogress" event handler in the instance of FileReader.
     * @return {File} This is returned as the instance of File (extends Blob).
     */
    var file = function(event, type, successCallback, errorCallback, progressCallback) {
        //The argument is associative array ?
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

        //for the instance of File (extends Blob)
        var file = null;

        if (event.type === 'drop') {
            //Drag & Drop
            event.stopImmediatePropagation();
            event.preventDefault();

            file = /*('items' in event.dataTransfer) ? event.dataTransfer.items[0].getAsFile() : */event.dataTransfer.files[0];
        } else if ((event.type === 'change') && ('files' in event.target)) {
            //<input type="file">
            file = event.target.files[0];
        } else {
            return;
        }

        if (!(file instanceof File)) {
            throw new Error('Please upload file !!');
        } else if ((/text/i.test(type)) && (file.type.indexOf('text') === -1)) {
            throw new Error('Please upload text file !!');
        } else if ((/arraybuffer|dataurl/i.test(type)) && (file.type.indexOf('audio') === -1)) {
            throw new Error('Please upload audio file !!');
        } else {
            //Asynchronously
            this.read({
                file     : file,
                type     : type,
                success  : successCallback,
                error    : errorCallback,
                progress : progressCallback
            });

            return file;
        }
    };

    /** 
     * This static method gets audio data as ArrayBuffer by Ajax.
     * @param {string} url This argument is URL for audio resource.
     * @param {number} timeout This argument is timeout of Ajax. The default value is 60000 msec (1 minutes).
     * @param {function} successCallback This argument is executed as next process when reading file is successful.
     * @param {function} errorCallback This argument is executed when error occurred.
     * @param {function} progressCallback This argument is executed during receiving audio data.
     */
    var ajax = function(url, timeout, successCallback, errorCallback, progressCallback) {
        //The argument is associative array ?
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            var properties = arguments[0];

            if ('url'      in properties) {url              = properties.url;}
            if ('timeout'  in properties) {timeout          = properties.timeout;}
            if ('success'  in properties) {successCallback  = properties.success;}
            if ('error'    in properties) {errorCallback    = properties.error;}
            if ('progress' in properties) {progressCallback = properties.progress;}
        }

        //for errorCallback
        var ERROR_AJAX         = 'error';
        var ERROR_AJAX_TIMEOUT = 'timeout';

        //Create the instance of XMLHttpRequest
        var xhr = new XMLHttpRequest();

        if ((FULL_MODE === undefined) || FULL_MODE) {
            //XMLHttpRequest Level 2
            xhr.responseType = 'arraybuffer';
        } else {
            xhr.overrideMimeType('text/plain; charset=x-user-defined');
        }

        var t = parseInt(timeout);

        //Timeout
        xhr.timeout = (t > 0) ? t : 60000;

        xhr.ontimeout = function(event) {
            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(event, ERROR_AJAX_TIMEOUT);
            }
        };

        //Progress
        xhr.onprogress = function(event) {
            if (Object.prototype.toString.call(progressCallback) === '[object Function]') {
                progressCallback(event);
            }
        };

        //Error
        xhr.onerror = function(event) {
            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(event, ERROR_AJAX);
            }
        };

        //Success
        xhr.onload = function(event) {
            if (xhr.status === 200) {
                var arrayBuffer = null;

                if ((FULL_MODE === undefined) || FULL_MODE) {
                    arrayBuffer = xhr.response;

                    if ((arrayBuffer instanceof ArrayBuffer) && (Object.prototype.toString.call(successCallback) === '[object Function]')) {
                        successCallback(event, arrayBuffer);
                    }
                } else {
                    var binary = xhr.responseText;
                    var buffer = [];

                    for (var i = 0, len = binary.length; i < len; i++) {
                        buffer.push(binary.charCodeAt(i) & 0xFF);
                    }

                    var ext    = url.slice(-3);
                    var mime   = 'audio/' + ext;
                    var blob   = new Blob([new Uint8Array(buffer)], {type : mime});
                    var reader = new FileReader();

                    reader.readAsArrayBuffer(blob);

                    reader.onerror = function(event) {
                        if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                            var error = '';

                            switch (reader.error.code) {
                                case reader.error.NOT_FOUND_ERR    : error = 'NOT_FOUND_ERR';    break;
                                case reader.error.SECURITY_ERR     : error = 'SECURITY_ERR';     break;
                                case reader.error.ABORT_ERR        : error = 'ABORT_ERR';        break;
                                case reader.error.NOT_READABLE_ERR : error = 'NOT_READABLE_ERR'; break;
                                case reader.error.ENCODING_ERR     : error = 'ENCODING_ERR' ;    break;
                                default                            : error = 'ERR';              break;
                            }

                            errorCallback(event, error);
                        }
                    };

                    reader.onload = function() {
                        arrayBuffer = reader.result;

                        if ((arrayBuffer instanceof ArrayBuffer) && (Object.prototype.toString.call(successCallback) === '[object Function]')) {
                            successCallback(event, arrayBuffer);
                        }
                    };
                }
            }
        };

        xhr.open('GET', url, true);
        xhr.send(null);
    };

    /** 
     * This static method creates the instance of AudioBuffer from ArrayBuffer.
     * @param {AudioContext} context This argument is the instance of AudioContext for "decodeAudioData" method.
     * @param {ArrayBuffer} arrayBuffer This argument is converted to the instance of AudioBuffer
     * @param {function} successCallback This argument is executed when "decodeAudioData" method is successful.
           The 1st argument in this callback function is the instance of AudioBuffer;
     * @param {function} errorCallback This argument is executed when "decodeAudioData" method failed.
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

        context.decodeAudioData(arrayBuffer, successCallback, errorCallback);
    };

    /** 
     * This static method calculates frequency from the index that corresponds to the 12 equal temperament.
     * @param {Array.<number>} indexes This argument is array of index that corresponds to the 12 equal temperament.
     *     For example, This value is between 0 and 88 in the case of piano.
     * @return {Array.<number>} This is returned as array of frequencies.
     */
    var toFrequencies = function(indexes) {
        //The 12 equal temperament
        //
        //Min -> 27.5 Hz (A), Max -> 4186 Hz (C)
        //
        //A * 1.059463 -> A# (half up)

        var FREQUENCY_RATIO = Math.pow(2, (1 / 12));  //about 1.059463
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
     * This static method calculates minutes and seconds from the designated time in seconds.
     * @param {number} time This argument is the time in seconds.
     * @return {object} This is returned as associative array that has "minutes", "seconds" and "milliseconds" keys.
     */
    var convertTime = function(time) {
        var t = parseFloat(time);

        if (t >= 0) {
            var m  = Math.floor(t / 60);
            var s  = Math.floor(t % 60);
            var ms = t - parseInt(t);

            return {
                minutes      : m,
                seconds      : s,
                milliseconds : ms
            };
        }
    };

    /** 
     *  This static method removes one of the global objects or both of the global objects.
     * @param {boolean} deep This argument is in order to select whether removing both of global objects.
     *     If this value is true, both of global objects are removed.
     * @return {XSound}
     */
    var noConflict = function(deep) {
        if (global.X === XSound) {
            global.X = undefined;
        }

        //both of global objects are removed ?
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
        this.media = null;  //for HTMLMediaElement
        this.ext   = ''  ;  //'wav', 'ogg', 'mp3, 'webm', 'ogv', 'mp4' ...etc

        this.duration     = 0;
        this.volume       = 1;
        this.playbackRate = 1;
        this.controls     = false;
        this.loop         = false;
        this.muted        = false;

        //The keys are the event interfaces that are defined by HTMLMediaElement.
        //For example, "loadstart", "loadedmetadata", "loadeddata", "canplay", "canplaythrough", "timeupdate", "ended" ...etc
        this.callbacks = {};
    };

    /** 
     * This method gets HTMLMediaElement and selects media format. In addition, this method sets event handlers that are defined by HTMLMediaElement.
     * @param {string} id This argument is id attribute of HTMLMediaElement.
     *     If new HTMLMediaElement is created, either null or empty string must be designated to this method.
     * @param {string} type This argument is either 'audio' or 'video'. The default value is 'audio'.
     * @param {Array.<string>|string} formats This argument is usable media format. For example, 'wav', 'ogg', 'webm', 'mp4' ...etc.
     * @param {object} callbacks This argument is event handlers that are defined by HTMLMediaElement.
     * @return {MediaFallbackModule} This is returned for method chain.
     */
    MediaFallbackModule.prototype.setup = function(id, type, formats, callbacks) {
        //The argument is associative array ?
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            var properties = arguments[0];

            if ('id'        in properties) {id        = properties.id;}
            if ('type'      in properties) {type      = properties.type;}
            if ('formats'   in properties) {formats   = properties.formats;}
            if ('callbacks' in properties) {callbacks = properties.callbacks;}
        }

        var elementId = String(id);
        var mediaType = (String(type).toLowerCase() !== 'video') ? 'audio' : 'video';

        this.media = ((id !== null) && (elementId !=='')) ? document.getElementById(elementId) : document.createElement(mediaType);

        if (!(this.media instanceof HTMLMediaElement)) {
            this.media = null;
            return;
        }

        if (!Array.isArray(formats)) {
            formats = [formats];
        }

        for (var i = 0, len = formats.length; i < len; i++) {
            var format = mediaType + '/' + String(formats[i]).toLowerCase();

            if (/^(?:maybe|probably)/.test(this.media.canPlayType(format))) {
                this.ext = formats[i];
                break;
            }
        }

        if (this.ext === '') {
            throw new Error('Media format that can be played does not exist !!');
        }

        if (Object.prototype.toString.call(callbacks) === '[object Object]') {
            for (var k in callbacks) {
                this.callbacks[k.toLowerCase()] = (Object.prototype.toString.call(callbacks[k]) === '[object Function]') ? callbacks[k] : function() {};
            }
        }

        var self = this;

        for (var k in this.callbacks) {
            switch (k) {
                case 'loadedmetadata' :
                    this.media.addEventListener('loadedmetadata', function(event) {
                        self.duration = this.duration;
                        self.callbacks.loadedmetadata(event, this);
                    }, false);

                    break;
                default :
                    this.media.addEventListener(k, function(event) {
                        self.callbacks[(event.type).toLowerCase()](event, this);
                    }, false);

                    break;
            }
        }

        return this;
    };

    /** 
     * This method is getter or setter for parameters
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number|boolean} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|boolean|MediaFallbackModule} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     */
    MediaFallbackModule.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            //Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'mastervolume' :
                    if (value === undefined) {
                        return (this.media instanceof HTMLMediaElement) ? this.media.volume : this.volume;  //Getter
                    } else {
                        var v   = parseFloat(value);
                        var min = 0;
                        var max = 1;

                        if ((v >= min) && (v <= max)) {
                            //Setter
                            if (this.media instanceof HTMLMediaElement) {
                                this.media.volume = v;
                            }

                            this.volume = v;
                        }
                    }

                    break;
                case 'playbackrate' :
                    if (value === undefined) {
                        return (this.media instanceof HTMLMediaElement) ? this.media.playbackRate : this.playbackRate;  //Getter
                    } else {
                        var v   = parseFloat(value);
                        var min = 0.5;  //for Chrome

                        if (v >= min) {
                            //Setter
                            if (this.media instanceof HTMLMediaElement) {
                                this.media.playbackRate = v;
                            }

                            this.playbackRate = v;
                        }
                    }

                    break;
                case 'currenttime' :
                    if (value === undefined) {
                        return (this.media instanceof HTMLMediaElement) ? this.media.currentTime : 0;  //Getter
                    } else {
                        var v = parseFloat(value);

                        if (this.media instanceof HTMLMediaElement) {
                            var min = 0;
                            var max = this.duration;
                        } else {
                            return;
                        }

                        if ((v >= min) && (v <= max)) {
                            //Setter
                            this.media.currentTime = v;
                        }
                    }

                    break;
                case 'loop'     :
                case 'muted'    :
                case 'controls' :
                    if (value === undefined) {
                        return (this.media instanceof HTMLMediaElement) ? this.media[k] : this[k];  //Getter
                    } else {
                        //Setter
                        if (this.media instanceof HTMLMediaElement) {
                            this.media[k] = Boolean(value);
                        }

                        this[k] = Boolean(value);
                    }

                    break;
                case 'width'  :
                case 'height' :
                    if (value === undefined) {
                        return (this.media instanceof HTMLVideoElement) ? this.media[k] : 0;  //Getter
                    } else {
                        var v   = parseInt(value);
                        var min = 0;

                        if (v >= min) {
                            //Setter
                            if (this.media instanceof HTMLVideoElement) {
                                this.media[k] = v;
                            }
                        }
                    }

                    break;
                case 'duration' :
                    return this.duration;  //Getter only
                case 'channels' :
                    return;  //for MediaModule
                default :
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
            //Data URL or Object URL ?
            if ((src.indexOf('data:') !== -1) || (src.indexOf('blob:') !== -1)) {
                this.media.src = src;  //Data URL or Object URL
            } else {
                this.media.src = src + '.' + this.ext;  //Path
            }
        } catch (error) {
            throw new Error('The designated resource cannot be loaded !!');
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
     * This method gets the HTMLMediaElement that is used in MediaFallbackModule.
     * @return {HTMLMediaElement}
     */
    MediaFallbackModule.prototype.get = function() {
        return this.media;
    };

    /** 
     * This method determines whether the HTMLMediaElement exists.
     * @return {boolean} If the HTMLMediaElement already exists, this value is true. Otherwise, this value is false.
     */
    MediaFallbackModule.prototype.isMedia = function() {
        return (this.media instanceof HTMLMediaElement) ? true : false;
    };

    /** 
     * This method is the same as "isMedia" method. This method is defined in order to use the same interface that is defined by MediaModule
     * @return {boolean} If the HTMLMediaElement already exists, this value is true. Otherwise, this value is false.
     */
    MediaFallbackModule.prototype.isSource = function() {
        return this.isMedia();
    };

    /** 
     * This method determines whether the media is paused.
     * @return {boolean} If the media is paused, this value is true. Otherwise, this value is false.
     */
    MediaFallbackModule.prototype.isPaused = function() {
        return (this.media instanceof HTMLMediaElement) ? this.media.paused : true;
    };

    /** 
     * This method shows video in full screen.
     * @return {MediaFallbackModule} This is returned for method chain.
     */
    MediaFallbackModule.prototype.fullscreen = function() {
        if (this.media instanceof HTMLVideoElement) {
            if (this.media.webkitRequestFullscreen) {
                //Chrome Safari
                this.media.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (this.media.mozRequestFullScreen) {
                //Firefox
                this.media.mozRequestFullScreen();
            } else if (this.media.requestFullscreen) {
                //Opera
                this.media.requestFullscreen();
            } else {
                throw new Error('Cannot change to full screen !!');
            }
        }

        return this;
    };

    /** 
     * This method shows video in original size from full screen.
     * @return {MediaFallbackModule} This is returned for method chain.
     */
    MediaFallbackModule.prototype.exitFullscreeen = function() {
        if (document.webkitExitFullscreen) {
            //Chrome Safari
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullscreen) {
            //Firefox
            document.mozCancelFullscreen();
        } else if (document.exitFullscreen) {
            //Opera
            document.exitFullscreen();
        } else {
            throw new Error('Cannot exit from full screen !!');
        }

        return this;
    };

    /** @override */
    MediaFallbackModule.prototype.toString = function() {
        return '[MediaFallbackModule]';
    };

    ////////////////////////////////////////////////////////////////////////////////

    if (!IS_XSOUND) {
        //Internet Explorer

        //Create instance
        var media = new MediaFallbackModule();

        /** 
         * This function is global object for getting the instance of MediaFallbackModule.
         * @return {MediaFallbackModule}
         */
        XSound = function() {
            return media;
        };

        //Static properties
        XSound.IS_XSOUND   = IS_XSOUND;
        XSound.SAMPLE_RATE = null;
        XSound.BUFFER_SIZE = null;
        XSound.NUM_INPUT   = null;
        XSound.NUM_OUTPUT  = null;

        //Static methods
        XSound.read           = read;
        XSound.file           = file;
        XSound.ajax           = ajax;
        XSound.decode         = decode;
        XSound.toFrequencies  = toFrequencies;
        XSound.convertTime    = convertTime;
        XSound.noConflict     = noConflict;
        XSound.get            = function() {return null;};  //for defining the same interface
        XSound.getCurrentTime = function() {return 0;};     //for defining the same interface

        /** 
         * This static method returns function as closure for getter of cloned module.
         * @return {function} This is returned as closure for getter of cloned module.
         */
        XSound.clone = function() {
            var cloned = new MediaFallbackModule();

            //Closure
            return function() {
                return cloned;
            };
        };

        /** @override */
        XSound.toString = function() {
            return '[XSound]';
        };

        //Set 2 objects as property of window object
        global.XSound = XSound;
        global.X      = XSound;  //Alias of XSound

        return;
    }

    //If the browser can use Web Audio API, the following code is executed.

    //Chrome, Opera, Firefox (Mac / Windows), Safari (Mac)
    global.AudioContext = global.AudioContext || global.webkitAudioContext;

    var audiocontext = new AudioContext();

    //for legacy browsers
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

        this.SAMPLE_RATE = context.sampleRate;
        this.NUM_INPUT   = 2;
        this.NUM_OUTPUT  = 2;

        if (bufferSize !== undefined) {
            switch (parseInt(bufferSize)) {
                case   256 :
                case   512 :
                case  1024 :
                case  2048 :
                case  4096 :
                case  8192 :
                case 16384 :
                    this.BUFFER_SIZE = parseInt(bufferSize);
                    break;
                default :
                    return;
            }
        } else if (/(Win(dows )?NT 6\.2)/.test(navigator.userAgent)) {
            this.BUFFER_SIZE = 1024;  //Windows 8
        } else if (/(Win(dows )?NT 6\.1)/.test(navigator.userAgent)) {
            this.BUFFER_SIZE = 1024;  //Windows 7
        } else if (/(Win(dows )?NT 6\.0)/.test(navigator.userAgent)) {
            this.BUFFER_SIZE = 2048;  //Windows Vista
        } else if (/Win(dows )?(NT 5\.1|XP)/.test(navigator.userAgent)) {
            this.BUFFER_SIZE = 4096;  //Windows XP
        } else if (/Mac|PPC/.test(navigator.userAgent)) {
            this.BUFFER_SIZE = 1024;  //Mac OS X
        } else if (/Linux/.test(navigator.userAgent)) {
            this.BUFFER_SIZE = 8192;  //Linux
        } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            this.BUFFER_SIZE = 2048;  //iOS
        } else {
            this.BUFFER_SIZE = 16384;  //Otherwise
        }

        this.masterVolume = context.createGain();
        this.processor    = context.createScriptProcessor(this.BUFFER_SIZE, this.NUM_INPUT, this.NUM_OUTPUT);

        /** @implements {Statable} */
        Session.prototype  = Object.create(Statable.prototype);
        Effector.prototype = Object.create(Statable.prototype);

        Session.prototype.constructor  = Session;
        Effector.prototype.constructor = Effector;

        /** @extends {Effector} */
        Compressor.prototype    = Object.create(Effector.prototype);
        Distortion.prototype    = Object.create(Effector.prototype);
        Wah.prototype           = Object.create(Effector.prototype);
        Equalizer.prototype     = Object.create(Effector.prototype);
        Filter.prototype        = Object.create(Effector.prototype);
        Tremolo.prototype       = Object.create(Effector.prototype);
        Ringmodulator.prototype = Object.create(Effector.prototype);
        Autopanner.prototype    = Object.create(Effector.prototype);
        Phaser.prototype        = Object.create(Effector.prototype);
        Flanger.prototype       = Object.create(Effector.prototype);
        Chorus.prototype        = Object.create(Effector.prototype);
        Delay.prototype         = Object.create(Effector.prototype);
        Reverb.prototype        = Object.create(Effector.prototype);
        Panner.prototype        = Object.create(Effector.prototype);

        Compressor.prototype.constructor    = Compressor;
        Distortion.prototype.constructor    = Distortion;
        Wah.prototype.constructor           = Wah;
        Equalizer.prototype.constructor     = Equalizer;
        Filter.prototype.constructor        = Filter;
        Tremolo.prototype.constructor       = Tremolo;
        Ringmodulator.prototype.constructor = Ringmodulator;
        Autopanner.prototype.constructor    = Autopanner;
        Phaser.prototype.constructor        = Phaser;
        Flanger.prototype.constructor       = Flanger;
        Chorus.prototype.constructor        = Chorus;
        Delay.prototype.constructor         = Delay;
        Reverb.prototype.constructor        = Reverb;
        Panner.prototype.constructor        = Panner;

        //for modules that user creates
        this.Effector = Effector;
        this.plugins  = [];

        /** 
         * This private class defines property for audio listener.
         * These properties relate to properties of PannerNode.
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @constructor
         */
        function Listener(context) {
            //the instance of AudioListener
            this.listener = context.listener;

            //Set default value
            this.dopplerFactor = 1;
            this.speedOfSound  = 343.3;

            this.positions  = {x : 0, y : 0, z : 0};
            this.fronts     = {x : 0, y : 0, z : -1};
            this.ups        = {x : 0, y : 1, z : 0};
            this.velocities = {x : 0, y : 0, z : 0};

            this.listener.setPosition(this.positions.x, this.positions.y, this.positions.z);
            this.listener.setOrientation(this.fronts.x, this.fronts.y, this.fronts.z, this.ups.x, this.ups.y, this.ups.z);
            this.listener.setVelocity(this.velocities.x, this.velocities.y, this.velocities.z);
        };

        /** 
         * This method is getter or setter for parameters
         * @param {string|object} key This argument is property name in the case of string type.
         *     This argument is pair of property and value in the case of associative array.
         * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
         * @return {number|Listener} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
         */
        Listener.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'dopplerfactor' :
                        if (value === undefined) {
                            return this.listener.dopplerFactor;  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (v >= 0) {
                                this.listener.dopplerFactor = v;  //Setter
                            }
                        }

                        break;
                    case 'speedofsound' :
                        if (value === undefined) {
                            return this.listener.speedOfSound;  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (v >= 0) {
                                this.listener.speedOfSound = v;  //Setter
                            }
                        }

                        break;
                    case 'x' :
                    case 'y' :
                    case 'z' :
                        if (value === undefined) {
                            return this.positions[k];  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                //Setter
                                this.positions[k] = v;
                                this.listener.setPosition(this.positions.x, this.positions.y, this.positions.z);
                            }
                        }

                        break;
                    case 'fx' :
                    case 'fy' :
                    case 'fz' :
                        if (value === undefined) {
                            return this.fronts[k.charAt(1)];  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                //Setter
                                this.fronts[k.charAt(1)] = v;
                                this.listener.setOrientation(this.fronts.x, this.fronts.y, this.fronts.z, this.ups.x, this.ups.y, this.ups.z);
                            }
                        }

                        break;
                    case 'ux' :
                    case 'uy' :
                    case 'uz' :
                        if (value === undefined) {
                            return this.ups[k.charAt(1)];  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                //Setter
                                this.ups[k.charAt(1)] = v;
                                this.listener.setOrientation(this.fronts.x, this.fronts.y, this.fronts.z, this.ups.x, this.ups.y, this.ups.z);
                            }
                        }

                        break;
                    case 'vx' :
                    case 'vy' :
                    case 'vz' :
                        if (value === undefined) {
                            return this.velocities[k.charAt(1)];  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                //Setter
                                this.velocities[k.charAt(1)] = v;
                                this.listener.setVelocity(this.velocities.x, this.velocities.y, this.velocities.z);
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Listener.prototype.toString = function() {
            return '[SoundModule Listener]';
        };

        /** 
         * This private class manages 4 private classes (Visualizer, TimeAll, Time, FFT) for drawing sound wave.
         * @param {AudioContext} context This argument is This argument is in order to use the interfaces of Web Audio API.
         * @constructor
         */
        function Analyser(context) {
            global.requestAnimationFrame = global.requestAnimationFrame ||
                                           global.webkitRequestAnimationFrame ||
                                           global.mozRequestAnimationFrame ||
                                           function(callback) {
                                               global.setTimeout(callback, (1000 / 60));
                                           };

            global.cancelAnimationFrame = global.cancelAnimationFrame ||
                                          global.webkitCancelAnimationFrame ||
                                          global.mozCancelAnimationFrame ||
                                          global.clearTimeout;

            this.analyser = context.createAnalyser();
            this.input    = context.createGain();
            this.output   = context.createGain();

            //GainNode (input) -> AnalyserNode -> GainNode (output)
            this.input.connect(this.analyser);
            this.analyser.connect(this.output);

            /** @implements {Statable} */
            Visualizer.prototype = Object.create(Statable.prototype);
            Visualizer.prototype.constructor = Visualizer;

            /** @extends {Visualizer} */
            TimeAll.prototype = Object.create(Visualizer.prototype);  //The purpose of "Object.create" is that the inherited instance is not shared in the instances of subclass
            Time.prototype    = Object.create(Visualizer.prototype);
            FFT.prototype     = Object.create(Visualizer.prototype);

            TimeAll.prototype.constructor = TimeAll;
            Time.prototype.constructor    = Time;
            FFT.prototype.constructor     = FFT;

            //Create the instances of Visualizer's subclass
            this.timeAllL = new TimeAll(context.sampleRate);
            this.timeAllR = new TimeAll(context.sampleRate);
            this.time     = new Time(context.sampleRate);
            this.fft      = new FFT(context.sampleRate);

            //Set default value
            this.analyser.fftSize               = 2048;
            this.analyser.minDecibels           = -100;
            this.analyser.maxDecibels           = -30;
            this.analyser.smoothingTimeConstant = 0.8;

            /** 
             * This private class defines the properties that subclasses (TimeAll, Time, FFT) require.
             * @param {number} sampleRate This argument is sampling rate.
             * @constructor
             * @implements {Statable}
             */
            function Visualizer(sampleRate) {
                //Call interface constructor
                Statable.call(this);

                this.isActive = false;

                this.SAMPLE_RATE = sampleRate;

                //either 'canvas' or 'svg'
                this.drawType = '';

                //In the case of using HTML5 Canvas
                this.canvas  = null;
                this.context = null;

                //In the case of using HTML5 SVG
                this.svg       = null;
                this.svgParent = null;

                //for timer
                this.interval = 1000;
                this.timerid  = null;

                this.styles = {
                    shape  : 'line',
                    grad   : [{offset : 0, color : 'rgba(0, 128, 255, 1.0)'}, {offset : 1, color : 'rgba(0, 0, 255, 1.0)'}],
                    wave   : 'rgba(0, 0, 255, 1.0)',
                    grid   : 'rgba(255, 0, 0, 1.0)',
                    text   : 'rgba(255, 255, 255, 1.0)',
                    font   : '13px Arial',
                    width  : 1.5,
                    cap    : 'round',
                    join   : 'miter',
                    top    : 15,
                    right  : 15,
                    bottom : 15,
                    left   : 15
                };
            }

            /** 
             * This method creates Canvas node object and Canvas context or creates SVG node object.
             * @param {string} type This argument is API for drawing. This value is either 'canvas' or 'svg'.
             * @param {string} id This argument is id attribute of HTMLCanvasElement or SVGElement.
             * @param {string} parentid This argument is required in the case of using SVG.
             * @return {Visualizer} This is returned for method chain.
             */
            Visualizer.prototype.setup = function(type, id, parentid) {
                switch (String(type).toLowerCase()) {
                    case 'canvas' :
                        this.drawType = 'canvas';

                        this.canvas = document.getElementById(String(id));

                        if (this.canvas instanceof HTMLCanvasElement) {
                            this.context = this.canvas.getContext('2d');
                        }

                        break;
                    case 'svg' :
                        this.drawType = 'svg';

                        this.svg = document.getElementById(String(id));

                        if (this.svg instanceof SVGElement) {
                            this.svgParent = document.getElementById(String(parentid));
                        }

                        break;
                    default :
                        break;
                }

                return this;
            };

            /** 
             * This method is getter or setter for parameters
             * @param {string|object} key This argument is property name in the case of string type.
             *     This argument is pair of property and value in the case of associative array.
             * @param {string|number|Array.<object>} value This argument is the value of designated property. If this argument is omitted, This method is getter.
             * @return {string|number|Array.<object>|Visualizer} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
             */
            Visualizer.prototype.param = function(key, value) {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'interval' :
                        if (value === undefined) {
                            return this.interval;  //Getter
                        } else {
                            if (String(value).toLowerCase() === 'auto') {
                                this.interval = 'auto';
                            } else {
                                var v = parseFloat(value);

                                if (v >= 0) {
                                    this.interval = v;  //Setter
                                }
                            }
                        }

                        break;
                    case 'shape' :
                        if (value === undefined) {
                            return this.styles.shape;  //Getter
                        } else {
                            var v = String(value).toLowerCase();

                            if ((v === 'line') || (v === 'rect')) {
                                this.styles.shape = (this.styles.wave !== 'gradient') ? v : 'rect';  //Setter
                            }
                        }

                        break;
                    case 'grad' :
                        if (value === undefined) {
                            return this.styles.grad;  //Getter
                        } else {
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
                                this.styles.grad = value;  //Setter
                            }
                        }

                        break;
                    case 'wave' :
                    case 'grid' :
                    case 'text' :
                    case 'font' :
                    case 'cap'  :
                    case 'join' :
                        if (value === undefined) {
                            return this.styles[k];  //Getter
                        } else {
                            if (Object.prototype.toString.call(value) === '[object String]') {
                                if ((k === 'wave') && (value === 'gradient')) {
                                    this.styles.shape = 'rect';
                                }

                                this.styles[k] = (k === 'font') ? value : value.toLowerCase();  //Setter
                            }
                        }

                        break;
                    case 'width'  :
                    case 'top'    :
                    case 'right'  :
                    case 'bottom' :
                    case 'left'   :
                        if (value === undefined) {
                            return this.styles[k];  //Getter
                        } else {
                            var v = (k === 'width') ? parseFloat(value) : parseInt(value);

                            if (v >= 0) {
                                this.styles[k] = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            };

            /** 
             * This method draws sound wave to Canvas or SVG. This method conceals difference of API for drawing.
             * @param {Uint8Array|Float32Array} datas This argument is data for drawing.
             * @param {number} minDecibels This argument is parameter for spectrum. The default value is -100 dB.
             * @param {number} maxDecibels This argument is parameter for spectrum. The default value is -30 dB.
             * @return {Visualizer} This is returned for method chain.
             */
            Visualizer.prototype.start = function(datas, minDecibels, maxDecibels) {
                switch (this.drawType) {
                    case 'canvas' : this.drawToCanvas(datas, minDecibels, maxDecibels); break;
                    case 'svg'    : this.drawToSVG(datas, minDecibels, maxDecibels);    break;
                    default       : break;
                }

                return this;
            };

            /** 
             * This method creates string for Data URL or HTML for the drawn figure.
             * @return {string|Visualizer} This is returned as Data URL or HTML string. If "setup" method has not been executed, this is returned for method chain.
             */
            Visualizer.prototype.download = function() {
                switch (this.drawType) {
                    case 'canvas' : return this.canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                    case 'svg'    : return this.svgParent.innerHTML;
                    default       : return this;
                }
            };

            /** @override */
            Visualizer.prototype.state = function(value) {
                if (value === undefined) {
                    return this.isActive;  //Getter
                } else if (String(value).toLowerCase() === 'toggle') {
                    this.isActive = !this.isActive;  //Setter
                } else {
                    this.isActive = Boolean(value);  //Setter
                }

                //In the case of setter
                return this;
            };

            /** @abstract */
            Visualizer.prototype.drawToCanvas = function(datas) {
            };

            /** @abstract */
            Visualizer.prototype.drawToSVG = function(datas) {
            };

            /** @override */
            Visualizer.prototype.toString = function() {
                return '[SoundModule Visualizer]';
            };

            /** 
             * This private class defines properties for drawing audio wave in entire of time domain.
             * @param {number} sampleRate This argument is sampling rate.
             * @constructor
             * @extends {Visualizer}
             */
            function TimeAll(sampleRate) {
                //Call superclass constructor
                Visualizer.call(this, sampleRate);

                //for update(), drag()
                this.savedImage = null;
                this.length     = 0;

                this.currentTime  = 'rgba(255, 255, 255, 1.0)';  //This style is used for the rectangle that displays current time of audio
                this.plotinterval = 0.0625;                      //Draw wave at intervals of this value [sec]
                this.textinterval = 60;                          //Draw text at intervals of this value [sec]
            }

            /** @override */
            TimeAll.prototype.param = function(key, value) {
                if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                    //Associative array
                    for (var k in arguments[0]) {
                        this.param(k, arguments[0][k]);
                    }
                } else {
                    var k = String(key).replace(/-/g, '').toLowerCase();

                    //Call superclass method
                    var r = Visualizer.prototype.param.call(this, k, value);

                    if (r !== undefined) {
                        return r;  //Getter
                    } else {
                        switch (k) {
                            case 'currenttime' :
                                if (value === undefined) {
                                    return this.currentTime;  //Getter
                                } else {
                                    if (Object.prototype.toString.call(value) === '[object String]') {
                                        this.currentTime = value.toLowerCase();  //Setter
                                    }
                                }

                                break;
                            case 'plotinterval' :
                            case 'textinterval' :
                                if (value === undefined) {
                                    return this[k]; //Getter
                                } else {
                                    var v = parseFloat(value);

                                    if (v > 0) {
                                        this[k] = v;  //Setter
                                    }
                                }

                                break;
                            default :
                                break;
                        }
                    }
                }

                return this;
            };

            /** 
             * This method draws audio wave in entire of time domain to Canvas.
             * @param {Float32Array} datas This argument is data for drawing.
             * @return {TimeAll} This is returned for method chain.
             * @override
             */
            TimeAll.prototype.drawToCanvas = function(datas) {
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

                //Draw wave at intervals of "this.plotinterval" [sec]
                var nPlotinterval = Math.floor(this.plotinterval * this.SAMPLE_RATE);

                //Draw text at intervals of "this.textinterval" [sec]
                var nTextinterval = Math.floor(this.textinterval * this.SAMPLE_RATE);

                //Erase previous wave
                context.clearRect(0, 0, width, height);

                //Begin drawing
                switch (this.styles.shape) {
                    case 'line' :
                        //Set style
                        context.strokeStyle = this.styles.wave;
                        context.lineWidth   = this.styles.width;
                        context.lineCap     = this.styles.cap;
                        context.lineJoin    = this.styles.join;

                        //Draw wave
                        context.beginPath();

                        for (var i = 0, len = datas.length; i < len; i++) {
                            if ((i % nPlotinterval) === 0) {
                                x = Math.floor((i / len) * innerWidth) + this.styles.left;
                                y = Math.floor((1 - datas[i]) * (innerHeight / 2)) + this.styles.top;

                                if (i === 0) {
                                    context.moveTo(x, y);
                                } else {
                                    context.lineTo(x, y);
                                }
                            }
                        }

                        context.stroke();

                        break;
                    case 'rect' :
                       //Set style
                       if (this.styles.wave !== 'gradient') {
                           context.fillStyle = this.styles.wave;
                       }

                        //Draw wave
                        for (var i = 0, len = datas.length; i < len; i++) {
                            if ((i % nPlotinterval) === 0) {
                                x = Math.floor((i / len) * innerWidth) + this.styles.left;
                                y = -1 * Math.floor(datas[i] * (innerHeight / 2));

                               //Set style
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
                        }

                        break;
                    default :
                        break;
                }

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    //Draw grid and text (X axis)
                    for (var i = 0, len = datas.length; i < len; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            t = Math.floor(i / this.SAMPLE_RATE) + ' min';

                            //Draw grid
                            if (this.styles.grid !== 'none') {
                                context.fillStyle = this.styles.grid;
                                context.fillRect(x, this.styles.top, 1, innerHeight);
                            }

                            //Draw text
                            if (this.styles.text !== 'none') {
                                context.fillStyle = this.styles.text;
                                context.font      = this.styles.font;
                                context.fillText(t, (x - (context.measureText(t).width / 2)), height);
                            }
                        }
                    }

                    //Draw grid and text (Y axis)
                    var texts = ['-1.00', '-0.50', ' 0.00', ' 0.50', ' 1.00'];

                    for (var i = 0, len = texts.length; i < len; i++) {
                        t = texts[i];
                        x = Math.floor(width - context.measureText(t).width);
                        y = Math.floor((1 - parseFloat(t.trim())) * (innerHeight / 2)) + this.styles.top;

                        //Draw grid
                        if (this.styles.grid !== 'none') {
                            context.fillStyle = this.styles.grid;
                            context.fillRect(this.styles.left, y, innerWidth, 1);
                        }

                        y -= parseInt(context.font.match(/\s*(\d+)px.*/)[1] / 4);

                        //Draw text
                        if (this.styles.text !== 'none') {
                            context.fillStyle = this.styles.text;
                            context.font      = this.styles.font;
                            context.fillText(t, x, y);
                        }
                    }
                }

                //for update(), drag()
                this.savedImage = context.getImageData(0, 0, width, height);
                this.length     = datas.length;

                //This rectangle displays current time of audio
                context.fillStyle = this.currentTime;
                context.fillRect(this.styles.left, this.styles.top, 1, innerHeight);

                return this;
            };

            /** 
             * This method draws audio wave in entire of time domain to SVG.
             * @param {Float32Array} datas This argument is data for drawing.
             * @return {TimeAll} This is returned for method chain.
             * @override
             */
            TimeAll.prototype.drawToSVG = function(datas) {
                if (!((this.svg instanceof SVGElement) && (this.svgParent instanceof HTMLElement) && this.isActive)) {
                    return this;
                }

                var svg = this.svgParent.innerHTML.match(/(<svg[^<>]*>).*<\/svg>/)[1] + '</svg>';

                var width       = this.svg.getAttribute('width');
                var height      = this.svg.getAttribute('height');
                var innerWidth  = width  - (this.styles.left + this.styles.right);
                var innerHeight = height - (this.styles.top  + this.styles.bottom);
                var middle      = Math.floor(innerHeight / 2) + this.styles.top;

                var x = 0;
                var y = 0;
                var t = '';

                //Draw wave at intervals of "this.plotinterval" [sec]
                var nPlotinterval = Math.floor(this.plotinterval * this.SAMPLE_RATE);

                //Draw text at intervals of "this.textinterval" [sec]
                var nTextinterval = Math.floor(this.textinterval * this.SAMPLE_RATE);

                //Set style
                var waveStyle = '';

                switch (this.styles.shape) {
                    case 'line' :
                        waveStyle += 'stroke : ' + this.styles.wave + '; ';
                        waveStyle += 'fill : none; ';
                        waveStyle += 'stroke-width : ' + this.styles.width + '; ';
                        waveStyle += 'stroke-linecap : ' + this.styles.cap + '; ';
                        waveStyle += 'stroke-linejoin : ' + this.styles.join + ';';

                        break;
                    case 'rect' :
                        if (this.styles.wave === 'gradient') {
                            var gradient = '';

                            gradient += '<defs>';
                            gradient += '<linearGradient id="svg-linear-gradient" x1="0%" y1="0%" x2="0%" y2="100%">';

                            for (var i = 0, len = this.styles.grad.length; i < len; i++) {
                                var gradients = this.styles.grad[i];

                                gradient += '<stop offset="' + gradients.offset + '" stop-color="' + gradients.color + '" />';
                            }

                            gradient += '</linearGradient>';
                            gradient += '</defs>';

                            waveStyle += 'stroke : none; ';
                            waveStyle += 'fill : url(#svg-linear-gradient); ';
                            waveStyle += 'stroke-width : 0;';
                        } else {
                            waveStyle += 'stroke : none; ';
                            waveStyle += 'fill : ' + this.styles.wave + '; ';
                            waveStyle += 'stroke-width : 0;';
                        }

                        break;
                    default :
                        break;
                }

                var gridStyle = '';
                gridStyle += 'stroke : none; ';
                gridStyle += 'fill : ' + this.styles.grid + '; ';
                gridStyle += 'stroke-width : 0;';

                var matches = this.styles.font.match(/\s*(\d+)px (.*)/);
                var family  = matches[2];
                var size    = matches[1];

                var textStyle = '';
                textStyle += 'stroke : none; ';
                textStyle += 'fill : ' + this.styles.text + '; ';
                textStyle += 'font-family : ' + family + '; ';
                textStyle += 'font-size : ' + size + ';';

                var offsetStyle = '';
                offsetStyle += 'stroke : none; ';
                offsetStyle += 'fill : ' + this.currentTime + '; ';
                offsetStyle += 'stroke-width : 0;';

                //Erase previous wave
                this.svgParent.innerHTML = svg;

                //Begin drawing
                svg = this.svgParent.innerHTML.replace('</svg>', '');

                //Gradient ?
                if (this.styles.wave === 'gradient') {
                    svg += gradient;
                }

                switch (this.styles.shape) {
                    case 'line' :
                        //Draw wave
                        svg += '<path style="' + waveStyle + '" d="';

                        for (var i = 0, len = datas.length; i < len; i++) {
                            if ((i % nPlotinterval) === 0) {
                                x = Math.floor((i / len) * innerWidth) + this.styles.left;
                                y = Math.floor((1 - datas[i]) * (innerHeight / 2)) + this.styles.top;

                                if (i === 0) {
                                    svg += 'M' + x + ' ' + y;
                                } else {
                                    svg += ' ';
                                    svg += 'L' + x + ' ' + y;
                                }
                            }
                        }

                        //<path d="..." />
                        svg += '" />';

                        break;
                    case 'rect' :
                        //Draw wave
                        for (var i = 0, len = datas.length; i < len; i++) {
                            if ((i % nPlotinterval) === 0) {
                                x = Math.floor((i / len) * innerWidth) + this.styles.left;
                                y = Math.floor(datas[i] * (innerHeight / 2));

                                svg += (y < 0) ?
                                    '<rect style="' + waveStyle + '" x="' + x + '" y="' + middle + '" width="' + this.styles.width + '" height="' + (-y) + '" />' :
                                    '<rect style="' + waveStyle + '" x="' + x + '" y="' + middle + '" width="' + this.styles.width + '" height="' + y + '" transform="translate(' + this.styles.width + ' 0) rotate(180 ' + x + ' ' + middle + ')" />';
                            }
                        }

                        break;
                    default :
                        break;
                }

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    //Draw grid and text (X axis)
                    for (var i = 0, len = datas.length; i < len; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            t = Math.floor(i / this.SAMPLE_RATE) + ' min';

                            //Draw grid
                            if (this.styles.grid !== 'none') {
                                svg += '<rect style="' + gridStyle + '" x="' + x + '" y="' + this.styles.top + '" width="1" height="' + innerHeight + '" />';
                            }

                            //Draw text
                            if (this.styles.text !== 'none') {
                                svg += '<text text-anchor="middle" style="' + textStyle + '" x="' + x + '" y="' + height + '">' + t + '</text>';
                            }
                        }
                    }

                    //Draw grid and text (Y axis)
                    var texts = ['-1.00', '-0.50', ' 0.00', ' 0.50', ' 1.00'];

                    for (var i = 0, len = texts.length; i < len; i++) {
                        t = texts[i];
                        x = width; 
                        y = Math.floor((1 - parseFloat(t.trim())) * (innerHeight / 2)) + this.styles.top;

                        //Draw grid
                        if (this.styles.grid !== 'none') {
                            svg += '<rect style="' + gridStyle + '" x="' + this.styles.left + '" y="' + y + '" width="' + innerWidth + '" height="1" />';
                        }

                        y -= Math.floor(parseInt(size) / 4);

                        //Draw text
                        if (this.styles.text !== 'none') {
                            svg += '<text text-anchor="end" style="' + textStyle + '" x="' + x + '" y="' + y + '">' + t + '</text>';
                        }
                    }
                }

                //This rectangle displays current time of audio
                svg += '<rect class="svg-current-time" style="' + offsetStyle + '" x="' + this.styles.left + '" y="' + this.styles.top + '" width="1" height="' + innerHeight + '" />';

                //End tag
                svg += '</svg>';

                this.svgParent.innerHTML = svg;

                //for update(), drag()
                this.savedImage = svg;
                this.length     = datas.length;

                return this;
            };

            /** 
             * This method draws current time of audio on Canvas or SVG.
             * @param {number} time This argument is current time.
             * @return {TimeAll} This is returned for method chain.
             */
            TimeAll.prototype.update = function(time) {
                switch (this.drawType) {
                    case 'canvas' :
                        if ((this.canvas instanceof HTMLCanvasElement) && this.isActive) {
                            break;
                        } else {
                            return;
                        }
                    case 'svg' :
                        if ((this.svg instanceof SVGElement) && (this.svgParent instanceof HTMLElement) && this.isActive) {
                            break;
                        } else {
                            return;
                        }
                    default :
                        break;
                }

                var t = parseFloat(time);

                if (isNaN(t) || (t < 0)) {
                    return;
                }

                var width       = 0;
                var height      = 0;
                var innerWidth  = 0;
                var innerHeight = 0;
                var x           = 0;

                switch (this.drawType) {
                    case 'canvas' :
                        if (this.savedImage instanceof ImageData) {
                            var context = this.context;

                            width       = this.canvas.width;
                            height      = this.canvas.height;
                            innerWidth  = width  - (this.styles.left + this.styles.right);
                            innerHeight = height - (this.styles.top  + this.styles.bottom);
                            x           = Math.floor(((t * this.SAMPLE_RATE) / this.length) * innerWidth) + this.styles.left;

                            context.clearRect(0, 0, width, height);
                            context.putImageData(this.savedImage, 0, 0);

                            context.fillStyle = this.currentTime;
                            context.fillRect(x, this.styles.top, 1, innerHeight);
                        }

                        break;
                    case 'svg' :
                        var svg = this.svgParent.getElementsByClassName('svg-current-time')[0];

                        if (svg instanceof SVGElement) {
                            width       = this.svg.getAttribute('width');
                            height      = this.svg.getAttribute('height');
                            innerWidth  = width  - (this.styles.left + this.styles.right);
                            innerHeight = height - (this.styles.top  + this.styles.bottom);
                            x           = Math.floor(((t * this.SAMPLE_RATE) / this.length) * innerWidth);

                            svg.setAttribute('transform', ('translate(' + x + ' 0)'));
                        }

                        break;
                    default :
                        break;
                }

                return this;
            };

            /** 
             * This method registers event listener for setting current time by Drag.
             * @param {function} callback This argument is executed when current time is changed.
             * @return {TimeAll} This is returned for method chain.
             */
            TimeAll.prototype.drag = function(callback) {
                var drawNode  = null;
                var isCapture = true;

                switch (this.drawType) {
                    case 'canvas' :
                        if ((this.canvas instanceof HTMLCanvasElement) && this.isActive) {
                            drawNode  = this.canvas;
                            isCapture = true;
                            break;
                        } else {
                            return;
                        }
                    case 'svg' :
                        if ((this.svg instanceof SVGElement) && (this.svgParent instanceof HTMLElement) && this.isActive) {
                            drawNode  = this.svgParent;
                            isCapture = false;
                            break;
                        } else {
                            return;
                        }
                    default :
                        break;
                }

                var start = '';
                var move  = '';
                var end   = '';

                //Touch Panel ?
                if (/iPhone|iPad|iPod|Android/.test(navigator.userAgent)) {
                    start = 'touchstart';
                    move  = 'touchmove';
                    end   = 'touchend';
                } else {
                    start = 'mousedown';
                    move  = 'mousemove';
                    end   = 'mouseup';
                }

                var draw = function(eventX) {
                    var offset = 0;
                    var width  = 0;

                    switch (this.drawType) {
                        case 'canvas' :
                            offset = this.canvas.offsetLeft;
                            width  = this.canvas.width;
                            break;
                        case 'svg' :
                            offset = this.svgParent.offsetLeft;
                            width  = this.svg.getAttribute('width');
                            break;
                        default :
                            break;
                    }

                    var x     = eventX - (offset + this.styles.left);
                    var width = width  - (this.styles.left + this.styles.right);

                    //Exceed ?
                    if (x < 0)     {x = 0;}
                    if (x > width) {x = width;}

                    var plot = (x / width) * this.length;
                    var time = plot / this.SAMPLE_RATE;

                    this.update(time);

                    if (Object.prototype.toString.call(callback) === '[object Function]') {
                        callback(time);
                    }
                };

                var getX = function(event) {
                    if (event.pageX) {
                        return event.pageX;
                    } else if (event.touches[0]) {
                        return event.touches[0].pageX;
                    }
                };

                var isMouse = false;
                var self = this;

                drawNode.addEventListener(start, function(event) {
                    if (self.savedImage !== null) {
                        draw.call(self, getX(event));
                        isMouse = true;
                    }
                }, isCapture);

                drawNode.addEventListener(move, function(event) {
                    event.preventDefault();  //for Touch Panel

                    if (isMouse && (self.savedImage !== null)) {
                        draw.call(self, getX(event));
                    }
                }, isCapture);

                global.addEventListener(end, function(event) {
                    isMouse = false;
                }, true);

                return this;
            };

            /** @override */
            TimeAll.prototype.toString = function() {
                return '[SoundModule Analyser TimeAll]';
            };

            /** 
             * This private class defines properties for drawing sound wave in time domain.
             * @param {number} sampleRate This argument is sampling rate.
             * @constructor
             * @extends {Visualizer}
             */
            function Time(sampleRate) {
                //Call superclass constructor
                Visualizer.call(this, sampleRate);

                this.textinterval = 0.005;  //Draw text at intervals this value [sec]
            }

            /** @override */
            Time.prototype.param = function(key, value) {
                if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                    //Associative array
                    for (var k in arguments[0]) {
                        this.param(k, arguments[0][k]);
                    }
                } else {
                    var k = String(key).replace(/-/g, '').toLowerCase();

                    //Call superclass method
                    var r = Visualizer.prototype.param.call(this, k, value);

                    if (r !== undefined) {
                        return r;  //Getter
                    } else {
                        switch (k) {
                            case 'textinterval' :
                                if (value === undefined) {
                                    return this.textinterval; //Getter
                                } else {
                                    var v = parseFloat(value);

                                    if (v > 0) {
                                        this.textinterval = v;  //Setter
                                    }
                                }

                                break;
                            default :
                                break;
                        }
                    }
                }

                return this;
            };

            /** 
             * This method draws sound wave in time domain to Canvas.
             * @param {Uint8Array} datas This argument is data for drawing.
             * @return {Time} This is returned for method chain.
             * @override
             */
            Time.prototype.drawToCanvas = function(datas) {
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

                //Draw text at intervals of "this.textinterval" [sec]
                var nTextinterval = Math.floor(this.textinterval * this.SAMPLE_RATE);

                //Erase previous wave
                context.clearRect(0, 0, width, height);

                //Begin drawing
                switch (this.styles.shape) {
                    case 'line' :
                        //Set style
                        context.strokeStyle = this.styles.wave;
                        context.lineWidth   = this.styles.width;
                        context.lineCap     = this.styles.cap;
                        context.lineJoin    = this.styles.join;

                        //Draw wave
                        context.beginPath();

                        for (var i = 0, len = datas.length; i < len; i++) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            y = Math.floor((1 - (datas[i] / 255)) * innerHeight) + this.styles.top;

                            if (i === 0) {
                                context.moveTo(x, y);
                            } else {
                                context.lineTo(x, y);
                            }
                        }

                        context.stroke();

                        break;
                    case 'rect' :
                       //Set style
                       if (this.styles.wave !== 'gradient') {
                           context.fillStyle = this.styles.wave;
                       }

                        //Draw wave
                        for (var i = 0, len = datas.length; i < len; i++) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            y = Math.floor((0.5 - (datas[i] / 255)) * innerHeight);

                           //Set style
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
                    default :
                        break;
                }

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    //Draw grid and text (X axis)
                    for (var i = 0, len = datas.length; i < len; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            t = Math.floor((i / this.SAMPLE_RATE) * 1000) + ' ms';

                            //Draw grid
                            if (this.styles.grid !== 'none') {
                                context.fillStyle = this.styles.grid;
                                context.fillRect(x, this.styles.top, 1, innerHeight);
                            }

                            //Draw text
                            if (this.styles.text !== 'none') {
                                context.fillStyle = this.styles.text;
                                context.font      = this.styles.font;
                                context.fillText(t, (x - (context.measureText(t).width / 2)), height);
                            }
                        }
                    }

                    //Draw grid and text (Y axis)
                    var texts = ['-1.00', '-0.50', ' 0.00', ' 0.50', ' 1.00'];

                    for (var i = 0, len = texts.length; i < len; i++) {
                        t = texts[i];
                        x = Math.floor(width - context.measureText(t).width); 
                        y = Math.floor((1 - parseFloat(t.trim())) * (innerHeight / 2)) + this.styles.top;

                        //Draw grid
                        if (this.styles.grid !== 'none') {
                            context.fillStyle = this.styles.grid;
                            context.fillRect(this.styles.left, y, innerWidth, 1);
                        }

                        y -= parseInt(context.font.match(/\s*(\d+)px.*/)[1] / 4);

                        //Draw text
                        if (this.styles.text !== 'none') {
                            context.fillStyle = this.styles.text;
                            context.font      = this.styles.font;
                            context.fillText(t, x, y);
                        }
                    }
                }

                return this;
            };

            /** 
             * This method draws sound wave in time domain to SVG.
             * @param {Uint8Array} datas This argument is data for drawing.
             * @return {Time} This is returned for method chain.
             * @override
             */
            Time.prototype.drawToSVG = function(datas) {
                if (!((this.svg instanceof SVGElement) && (this.svgParent instanceof HTMLElement) && this.isActive)) {
                    return this;
                }

                var svg = this.svgParent.innerHTML.match(/(<svg[^<>]*>).*<\/svg>/)[1] + '</svg>';

                var width       = this.svg.getAttribute('width');
                var height      = this.svg.getAttribute('height');
                var innerWidth  = width  - (this.styles.left + this.styles.right);
                var innerHeight = height - (this.styles.top  + this.styles.bottom);
                var middle      = Math.floor(innerHeight / 2) + this.styles.top;

                var x = 0;
                var y = 0;
                var t = '';

                //Draw text at intervals of "this.textinterval" [sec]
                var nTextinterval = Math.floor(this.textinterval * this.SAMPLE_RATE);

                //Set style
                var waveStyle = '';

                switch (this.styles.shape) {
                    case 'line' :
                        waveStyle += 'stroke : ' + this.styles.wave + '; ';
                        waveStyle += 'fill : none; ';
                        waveStyle += 'stroke-width : ' + this.styles.width + '; ';
                        waveStyle += 'stroke-linecap : ' + this.styles.cap + '; ';
                        waveStyle += 'stroke-linejoin : ' + this.styles.join + ';';

                        break;
                    case 'rect' :
                        if (this.styles.wave === 'gradient') {
                            var gradient = '';

                            gradient += '<defs>';
                            gradient += '<linearGradient id="svg-linear-gradient" x1="0%" y1="0%" x2="0%" y2="100%">';

                            for (var i = 0, len = this.styles.grad.length; i < len; i++) {
                                var gradients = this.styles.grad[i];

                                gradient += '<stop offset="' + gradients.offset + '" stop-color="' + gradients.color + '" />';
                            }

                            gradient += '</linearGradient>';
                            gradient += '</defs>';

                            waveStyle += 'stroke : none; ';
                            waveStyle += 'fill : url(#svg-linear-gradient); ';
                            waveStyle += 'stroke-width : 0;';
                        } else {
                            waveStyle += 'stroke : none; ';
                            waveStyle += 'fill : ' + this.styles.wave + '; ';
                            waveStyle += 'stroke-width : 0;';
                        }

                        break;
                    default :
                        break;
                }

                var gridStyle = '';
                gridStyle += 'stroke : none; ';
                gridStyle += 'fill : ' + this.styles.grid + '; ';
                gridStyle += 'stroke-width : 0;';

                var matches = this.styles.font.match(/\s*(\d+)px (.*)/);
                var family  = matches[2];
                var size    = matches[1];

                var textStyle = '';
                textStyle += 'stroke : none; ';
                textStyle += 'fill : ' + this.styles.text + '; ';
                textStyle += 'font-family : ' + family + '; ';
                textStyle += 'font-size : ' + size + ';';

                //Erase previous wave
                this.svgParent.innerHTML = svg;

                //Begin drawing
                svg = this.svgParent.innerHTML.replace('</svg>', '');

                //Gradient ?
                if (this.styles.wave === 'gradient') {
                    svg += gradient;
                }

                switch (this.styles.shape) {
                    case 'line' :
                        //Draw wave
                        svg += '<path style="' + waveStyle + '" d="';

                        for (var i = 0, len = datas.length; i < len; i++) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            y = Math.floor((1 - (datas[i] / 255)) * innerHeight) + this.styles.top;

                            if (i === 0) {
                                svg += 'M' + x + ' ' + y;
                            } else {
                                svg += ' ';
                                svg += 'L' + x + ' ' + y;
                            }
                        }

                        //<path d="..." />
                        svg += '" />';

                        break;
                    case 'rect' :
                        //Draw wave
                        for (var i = 0, len = datas.length; i < len; i++) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            y = Math.floor(((datas[i] / 255) - 0.5) * innerHeight);

                            svg += (y < 0) ?
                                '<rect style="' + waveStyle + '" x="' + x + '" y="' + middle + '" width="' + this.styles.width + '" height="' + (-y) + '" />' :
                                '<rect style="' + waveStyle + '" x="' + x + '" y="' + middle + '" width="' + this.styles.width + '" height="' + y + '" transform="translate(' + this.styles.width + ' 0) rotate(180 ' + x + ' ' + middle + ')" />';
                        }

                        break;
                    default :
                        break;
                }

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    //Draw grid and text (X axis)
                    for (var i = 0, len = datas.length; i < len; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            t = Math.floor((i / this.SAMPLE_RATE) * 1000) + ' ms';

                            //Draw grid
                            if (this.styles.grid !== 'none') {
                                svg += '<rect style="' + gridStyle + '" x="' + x + '" y="' + this.styles.top + '" width="1" height="' + innerHeight + '" />';
                            }

                            //Draw text
                            if (this.styles.text !== 'none') {
                                svg += '<text text-anchor="middle" style="' + textStyle + '" x="' + x + '" y="' + height + '">' + t + '</text>';
                            }
                        }
                    }

                    //Draw grid and text (Y axis)
                    var texts = ['-1.00', '-0.50', ' 0.00', ' 0.50', ' 1.00'];

                    for (var i = 0, len = texts.length; i < len; i++) {
                        t = texts[i];
                        x = width; 
                        y = Math.floor((1 - parseFloat(t.trim())) * (innerHeight / 2)) + this.styles.top;

                        //Draw grid
                        if (this.styles.grid !== 'none') {
                            svg += '<rect style="' + gridStyle + '" x="' + this.styles.left + '" y="' + y + '" width="' + innerWidth + '" height="1" />';
                        }

                        y -= Math.floor(parseInt(size) / 4);

                        //Draw text
                        if (this.styles.text !== 'none') {
                            svg += '<text text-anchor="end" style="' + textStyle + '" x="' + x + '" y="' + y + '">' + t + '</text>';
                        }
                    }
                }

                //End tag
                svg += '</svg>';

                this.svgParent.innerHTML = svg;

                return this;
            };

            /** @override */
            Time.prototype.toString = function() {
                return '[SoundModule Analyser Time]';
            };

            /** 
             * This private class defines properties for drawing sound wave in frequency domain (spectrum).
             * @param {number} sampleRate This argument is sampling rate.
             * @constructor
             * @extends {Visualizer}
             */
            function FFT(sampleRate) {
                //Call superclass constructor
                Visualizer.call(this, sampleRate);

                this.type         = 'uint';  //unsigned int 8 bit (Uint8Array) or float 32 bit (Float32Array)
                this.size         = 256;     //Range for drawing
                this.textinterval = 1000;    //Draw text at intervals of this value [Hz]
            }

            /** @override */
            FFT.prototype.param = function(key, value) {
                if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                    //Associative array
                    for (var k in arguments[0]) {
                        this.param(k, arguments[0][k]);
                    }
                } else {
                    var k = String(key).replace(/-/g, '').toLowerCase();

                    //Call superclass method
                    var r = Visualizer.prototype.param.call(this, k, value);

                    if (r !== undefined) {
                        return r;  //Getter
                    } else {
                        switch (k) {
                            case 'type' :
                                if (value === undefined) {
                                    return this.type;  //Getter
                                } else {
                                    var v = String(value).toLowerCase();

                                    if ((v === 'uint') || (v === 'float')) {
                                        this.type = v;  //Setter
                                    }
                                }

                                break;
                            case 'size' :
                                if (value === undefined) {
                                    return this.size; //Getter
                                } else {
                                    var v   = parseFloat(value);
                                    var min = 0;
                                    var max = 1024;  //AnalyserNode fftSize max 2048 -> half 1024

                                    if ((v >= 0) && (v <= max)) {
                                        this.size = v;  //Setter
                                    }
                                }

                                break;
                            case 'textinterval' :
                                if (value === undefined) {
                                    return this.textinterval; //Getter
                                } else {
                                    var v = parseFloat(value);

                                    if (v > 0) {
                                        this.textinterval = v;  //Setter
                                    }
                                }

                                break;
                            default :
                                break;
                        }
                    }
                }

                return this;
            };

            /** 
             * This method draws sound wave in frequency domain (spectrum) to Canvas.
             * @param {Uint8Array|Float32Array} datas This argument is data for drawing.
             * @param {number} minDecibels This argument is in order to determine the range of drawing. The default value is -100 dB.
             * @param {number} maxDecibels This argument is in order to determine the range of drawing. The default value is -30 dB.
             * @return {FFT} This is returned for method chain.
             * @override
             */
            FFT.prototype.drawToCanvas = function(datas, minDecibels, maxDecibels) {
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

                var drawnSize = (this.size > datas.length) ? datas.length : this.size;

                //Frequency resolution (Sampling rate / FFT size)
                var fsDivN = this.SAMPLE_RATE / (2 * datas.length);

                //Draw text at intervals of "this.textinterval" [sec]
                var nTextinterval = Math.floor(this.textinterval / fsDivN);

                //Erase previous wave
                context.clearRect(0, 0, width, height);

                //Begin drawing
                switch (this.type) {
                    case 'float' :
                        //Set style
                        context.strokeStyle = (this.styles.wave !== 'gradient') ? this.styles.wave : 'rgba(0, 0, 255, 1.0)';  //line only
                        context.lineWidth   = this.styles.width;
                        context.lineCap     = this.styles.cap;
                        context.lineJoin    = this.styles.join;

                        //Visualizer wave
                        context.beginPath();

                        for (var i = 0; i < drawnSize; i++) {
                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                            y = (Math.abs(datas[i] - maxdB) * (innerHeight / range)) + this.styles.top;  //[dB] * [px / dB] = [px]

                            if (i === 0) {
                                context.moveTo(x, y);
                            } else {
                                context.lineTo(x, y);
                            }
                        }

                        context.stroke();

                        break;
                    case 'uint' :
                    default     :
                        switch (this.styles.shape) {
                            case 'line' :
                                //Set style
                                context.strokeStyle = this.styles.wave;
                                context.lineWidth   = this.styles.width;
                                context.lineCap     = this.styles.cap;
                                context.lineJoin    = this.styles.join;

                                context.beginPath();

                                //Visualizer wave
                                for (var i = 0; i < drawnSize; i++) {
                                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                                    y = Math.floor((1 - (datas[i] / 255)) * innerHeight) + this.styles.top;

                                    if (i === 0) {
                                        context.moveTo(x, y);
                                    } else {
                                        context.lineTo(x, y);
                                    }
                                }

                                context.stroke();

                                break;
                            case 'rect' :
                               //Set style
                               if (this.styles.wave !== 'gradient') {
                                   context.fillStyle = this.styles.wave;
                               }

                                //Visualizer wave
                                for (var i = 0; i < drawnSize; i++) {
                                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                                    y = -1 * Math.floor((datas[i] / 255) * innerHeight);

                                   //Set style
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
                            default :
                                break;
                        }

                        break;
                }

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    //Visualizer grid and text (X axis)
                    var f = 0;

                    for (var i = 0; i < drawnSize; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;

                            f = Math.floor(this.textinterval * (i / nTextinterval));
                            t = (f < 1000) ? (f + ' Hz') : (String(f / 1000).slice(0, 3) + ' kHz');

                            //Visualizer grid
                            if (this.styles.grid !== 'none') {
                                context.fillStyle = this.styles.grid;
                                context.fillRect(x, this.styles.top, 1, innerHeight);
                            }

                            //Visualizer text
                            if (this.styles.text !== 'none') {
                                context.fillStyle = this.styles.text;
                                context.font      = this.styles.font;
                                context.fillText(t, (x - (context.measureText(t).width / 2)), height);
                            }
                        }
                    }

                    //Draw grid and text (Y axis)
                    switch (this.type) {
                        case 'float' :
                            for (var i = mindB; i <= maxdB; i += 10) {
                                t = i + 'dB';
                                x = width - Math.floor(context.measureText(t).width);
                                y = Math.floor(((-1 * (i - maxdB)) / range) * innerHeight) + this.styles.top;

                                //Draw grid
                                if (this.styles.grid !== 'none') {
                                    context.fillStyle = this.styles.grid;
                                    context.fillRect(this.styles.left, y, innerWidth, 1);
                                }

                                y -= parseInt(context.font.match(/\s*(\d+)px.*/)[1] / 4);

                                //Draw text
                                if (this.styles.text !== 'none') {
                                    context.fillStyle = this.styles.text;
                                    context.font      = this.styles.font;
                                    context.fillText(t, x, y);
                                }
                            }

                            break;
                        case 'uint' :
                        default     :
                            var texts = ['0.00', '0.25', '0.50', '0.75', '1.00'];

                            for (var i = 0, len = texts.length; i < len; i++) {
                                t = texts[i];
                                x = width - Math.floor(context.measureText(t).width);
                                y = ((1 - parseFloat(t)) * innerHeight) + this.styles.top;

                                //Draw grid
                                if (this.styles.grid !== 'none') {
                                    context.fillStyle = this.styles.grid;
                                    context.fillRect(this.styles.left, y, innerWidth, 1);
                                }

                                y -= parseInt(context.font.match(/\s*(\d+)px.*/)[1] / 4);

                                //Draw text
                                if (this.styles.text !== 'none') {
                                    context.fillStyle = this.styles.text;
                                    context.font      = this.styles.font;
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
             * @param {Uint8Array|Float32Array} datas This argument is data for drawing.
             * @param {number} minDecibels This argument is in order to determine the range of drawing. The default value is -100 dB.
             * @param {number} maxDecibels This argument is in order to determine the range of drawing. The default value is -30 dB.
             * @return {FFT} This is returned for method chain.
             * @override
             */
            FFT.prototype.drawToSVG = function(datas, minDecibels, maxDecibels) {
                if (!((this.svg instanceof SVGElement) && (this.svgParent instanceof HTMLElement) && this.isActive)) {
                    return this;
                }

                var mindB = parseFloat(minDecibels);
                var maxdB = parseFloat(maxDecibels);

                var range = maxdB - mindB;

                var svg = this.svgParent.innerHTML.match(/(<svg[^<>]*>).*<\/svg>/)[1] + '</svg>';

                var width       = this.svg.getAttribute('width');
                var height      = this.svg.getAttribute('height');
                var innerWidth  = width  - (this.styles.left + this.styles.right);
                var innerHeight = height - (this.styles.top  + this.styles.bottom);

                var x = 0;
                var y = 0;
                var t = '';

                var drawnSize = (this.size > datas.length) ? datas.length : this.size;

                //Frequency resolution (Sampling rate / FFT size)
                var fsDivN = this.SAMPLE_RATE / (2 * datas.length);

                //Draw text at intervals of "this.textinterval" [sec]
                var nTextinterval = Math.floor(this.textinterval / fsDivN);

                //Set style
                var waveStyle = '';

                switch (this.styles.shape) {
                    case 'line' :
                        waveStyle += 'stroke : ' + this.styles.wave + '; ';
                        waveStyle += 'fill : none; ';
                        waveStyle += 'stroke-width : ' + this.styles.width + '; ';
                        waveStyle += 'stroke-linecap : ' + this.styles.cap + '; ';
                        waveStyle += 'stroke-linejoin : ' + this.styles.join + ';';

                        break;
                    case 'rect' :
                        if ((this.type === 'uint') && (this.styles.wave === 'gradient')) {
                            var gradient = '';

                            gradient += '<defs>';
                            gradient += '<linearGradient id="svg-linear-gradient" x1="0%" y1="0%" x2="0%" y2="100%">';

                            for (var i = 0, len = this.styles.grad.length; i < len; i++) {
                                var gradients = this.styles.grad[i];

                                gradient += '<stop offset="' + gradients.offset + '" stop-color="' + gradients.color + '" />';
                            }

                            gradient += '</linearGradient>';
                            gradient += '</defs>';

                            waveStyle += 'stroke : none; ';
                            waveStyle += 'fill : url(#svg-linear-gradient); ';
                            waveStyle += 'stroke-width : 0;';
                        } else if ((this.type === 'uint') && (this.styles.wave !== 'gradient')) {
                            waveStyle += 'stroke : none; ';
                            waveStyle += 'fill : ' + this.styles.wave + '; ';
                            waveStyle += 'stroke-width : 0;';
                        } else if (this.type !== 'uint') {
                            //this.type === 'float' -> line only
                            waveStyle += 'stroke : rgba(0, 0, 255, 1.0); ';
                            waveStyle += 'fill : none; ';
                            waveStyle += 'stroke-width : ' + this.styles.width + '; ';
                            waveStyle += 'stroke-linecap : ' + this.styles.cap + '; ';
                            waveStyle += 'stroke-linejoin : ' + this.styles.join + ';';
                        }

                        break;
                    default :
                        break;
                }

                var gridStyle = '';
                gridStyle += 'stroke : none; ';
                gridStyle += 'fill : ' + this.styles.grid + '; ';
                gridStyle += 'stroke-width : 0;';

                var matches = this.styles.font.match(/\s*(\d+)px (.*)/);
                var family  = matches[2];
                var size    = matches[1];

                var textStyle = '';
                textStyle += 'stroke : none; ';
                textStyle += 'fill : ' + this.styles.text + '; ';
                textStyle += 'font-family : ' + family + '; ';
                textStyle += 'font-size : ' + size + ';';

                //Erase previous wave
                this.svgParent.innerHTML = svg;

                //Begin drawing
                svg = this.svgParent.innerHTML.replace('</svg>', '');

                //Uint8Array && Gradient ?
                if ((this.type === 'uint') && (this.styles.wave === 'gradient')) {
                    svg += gradient;
                }

                switch (this.type) {
                    case 'float' :
                        //Draw wave
                        svg += '<path style="' + waveStyle + '" d="';

                        for (var i = 0; i < drawnSize; i++) {
                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                            y = Math.floor(-1 * (datas[i] - maxdB) * (innerHeight / range)) + this.styles.top;

                            if (i === 0) {
                                svg += 'M' + x + ' ' + y;
                            } else {
                                svg += ' ';
                                svg += 'L' + x + ' ' + y;
                            }
                        }

                        //<path d="..." />
                        svg += '" />';

                        break;
                    case 'uint' :
                    default     :
                        switch (this.styles.shape) {
                            case 'line' :
                                //Draw wave
                                svg += '<path style="' + waveStyle + '" d="';

                                //Draw wave
                                for (var i = 0; i < drawnSize; i++) {
                                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                                    y = Math.floor((1 - (datas[i] / 255)) * innerHeight) + this.styles.top;

                                    if (i === 0) {
                                        svg += 'M' + x + ' ' + y;
                                    } else {
                                        svg += ' ';
                                        svg += 'L' + x + ' ' + y;
                                    }
                                }

                                //<path d="..." />
                                svg += '" />';

                                break;
                            case 'rect' :
                                //Draw wave
                                for (var i = 0; i < drawnSize; i++) {
                                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                                    y = Math.floor((datas[i] / 255) * innerHeight);

                                    svg += '<rect style="' + waveStyle + '" x="' + x + '" y="' + (this.styles.top + innerHeight) + '" width="' + this.styles.width + '" height="' + y + '" transform="translate(' + this.styles.width + ' 0) rotate(180 ' + x + ' ' + (this.styles.top + innerHeight) + ')" />';
                                }

                                break;
                            default :
                                break;
                        }

                        break;
                }

                if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
                    //Draw grid and text (X axis)
                    var f = 0;

                    for (var i = 0; i < drawnSize; i++) {
                        if ((i % nTextinterval) === 0) {
                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;

                            f = Math.floor(this.textinterval * (i / nTextinterval));
                            t = (f < 1000) ? (f + ' Hz') : (String(f / 1000).slice(0, 3) + ' kHz');

                            //Draw grid
                            if (this.styles.grid !== 'none') {
                                svg += '<rect style="' + gridStyle + '" x="' + x + '" y="' + this.styles.top + '" width="1" height="' + innerHeight + '" />';
                            }

                            //Draw text
                            if (this.styles.text !== 'none') {
                                svg += '<text text-anchor="middle" style="' + textStyle + '" x="' + x + '" y="' + height + '">' + t + '</text>';
                            }
                        }
                    }

                    //Draw grid and text (Y axis)
                    switch (this.type) {
                        case 'float' :
                            for (var i = mindB; i <= maxdB; i += 10) {
                                t = i + 'dB';
                                x = width;
                                y = Math.floor(((-1 * (i - maxdB)) / range) * innerHeight) + this.styles.top;

                                //Draw grid
                                if (this.styles.grid !== 'none') {
                                    svg += '<rect style="' + gridStyle + '" x="' + this.styles.left + '" y="' + y + '" width="' + innerWidth + '" height="1" />';
                                }

                                y -= Math.floor(parseInt(size) / 4);

                                //Draw text
                                if (this.styles.text !== 'none') {
                                    svg += '<text text-anchor="end" style="' + textStyle + '" x="' + x + '" y="' + y + '">' + t + '</text>';
                                }
                            }

                            break;
                        case 'uint' :
                        default     :
                            var texts = ['0.00', '0.25', '0.50', '0.75', '1.00'];

                            for (var i = 0, len = texts.length; i < len; i++) {
                                t = texts[i];
                                x = width;
                                y = ((1 - parseFloat(t)) * innerHeight) + this.styles.top;

                                //Draw grid
                                if (this.styles.grid !== 'none') {
                                    svg += '<rect style="' + gridStyle + '" x="' + this.styles.left + '" y="' + y + '" width="' + innerWidth + '" height="1" />';
                                }

                                y -= Math.floor(parseInt(size) / 4);

                                //Draw text
                                if (this.styles.text !== 'none') {
                                    svg += '<text text-anchor="end" style="' + textStyle + '" x="' + x + '" y="' + y + '">' + t + '</text>';
                                }
                            }

                            break;
                    }
                }

                //End tag
                svg += '</svg>';

                this.svgParent.innerHTML = svg;

                return this;
            };

            /** @override */
            FFT.prototype.toString = function() {
                return '[SoundModule Analyser FFT]';
            };
        }

        /** 
         * This method is getter or setter for parameters
         * @param {string|object} key This argument is property name in the case of string type.
         *     This argument is pair of property and value in the case of associative array.
         * @param {number|} value This argument is the value of designated property. If this argument is omitted, This method is getter.
         * @return {number|Analyser} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
         */
        Analyser.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'fftsize' :
                        if (value === undefined) {
                            return this.analyser.fftSize;  //Getter
                        } else {
                            var v = parseInt(value);

                            switch (v) {
                                case   32 :
                                case   64 :
                                case  128 :
                                case  256 :
                                case  512 :
                                case 1024 :
                                case 2048 :
                                    this.analyser.fftSize = v;   //Setter
                                    break;
                                default :
                                    break;
                            }
                        }

                        break;
                    case 'frequencybincount' :
                        return this.analyser.frequencyBinCount;  //Getter only
                    case 'mindecibels' :
                    case 'maxdecibels' :
                        if (value === undefined) {
                            return this.analyser[k.replace('decibels', 'Decibels')];  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.analyser[k.replace('decibels', 'Decibels')] = v;  //Setter

                                if (this.analyser.minDecibels >= this.analyser.maxDecibels) {
                                    var min = this.analyser.minDecibels;
                                    var max = this.analyser.maxDecibels;

                                    //Set default value
                                    this.analyser.minDecibels = -100;
                                    this.analyser.maxDecibels =  -30;
                                }
                            }
                        }

                        break;
                    case 'smoothingtimeconstant' :
                        if (value === undefined) {
                            return this.analyser.smoothingTimeConstant;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                this.analyser.smoothingTimeConstant = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** 
         * This method creates data for drawing (Float32Array|Uint8Array) and executes drawing.
         * @param {string} domain This argument is one of 'timeAllL', 'timeAllR', 'time', 'fft'.
         * @param {AudioBuffer} buffer This argument is the instance of AudioBuffer. The data for drawing audio wave in entire of time domain is gotten from this argument.
         * @return {Analyser} This is returned for method chain.
         */
        Analyser.prototype.start = function(domain, buffer) {
            var d = String(domain).replace(/-/g, '').toLowerCase();

            var self = this;

            switch (d) {
                case 'timealll' :
                    if (buffer instanceof AudioBuffer) {
                        if (buffer.numberOfChannels > 0) {
                            var datas = new Float32Array(buffer.length);
                            datas.set(buffer.getChannelData(0));
                            this.timeAllL.start(datas);
                        }
                    }

                    break;
                case 'timeallr' :
                    if (buffer instanceof AudioBuffer) {
                        if (buffer.numberOfChannels > 1) {
                            var datas = new Float32Array(buffer.length);
                            datas.set(buffer.getChannelData(1));
                            this.timeAllR.start(datas);
                        }
                    }

                    break;
                case 'time' :
                    var datas = new Uint8Array(this.analyser.fftSize);
                    this.analyser.getByteTimeDomainData(datas);
                    this.time.start(datas);

                    if (this.time.interval === 'auto') {
                        this.time.timerid = requestAnimationFrame(function() {
                            self.start(domain);
                        });
                    } else {
                        this.time.timerid = global.setTimeout(function() {
                            self.start(domain);
                        }, this.time.interval);
                    }

                    break;
                case 'fft' :
                    if (this.fft.type === 'uint') {
                        var datas = new Uint8Array(this.analyser.frequencyBinCount);
                        this.analyser.getByteFrequencyData(datas);
                        this.fft.start(datas);
                    } else {
                        var datas = new Float32Array(this.analyser.frequencyBinCount);
                        this.analyser.getFloatFrequencyData(datas);
                        this.fft.start(datas, this.analyser.minDecibels, this.analyser.maxDecibels);
                    }

                    if (this.fft.interval === 'auto') {
                        this.fft.timerid = requestAnimationFrame(function() {
                            self.start(domain);
                        });
                    } else {
                        this.fft.timerid = global.setTimeout(function() {
                            self.start(domain);
                        }, this.fft.interval);
                    }

                    break;
                default :
                    break;
            }

            return this;
        };

        /** 
         * This method stops drawing.
         * @param {string} domain This argument is one of 'timeAllL', 'timeAllR', 'time', 'fft'.
         * @return {Analyser} This is returned for method chain.
         */
        Analyser.prototype.stop = function(domain) {
            var d = String(domain).replace(/-/g, '').toLowerCase();

            switch (d) {
                case 'timealll' :
                case 'timeallr' :
                    break;
                case 'time' :
                    if (this.time.interval === 'auto') {
                        global.cancelAnimationFrame(this.time.timerid);
                    } else {
                        global.clearTimeout(this.time.timerid);
                    }

                    this.time.timerid = null;

                    break;
                case 'fft' :
                    if (this.fft.interval === 'auto') {
                        global.cancelAnimationFrame(this.fft.timerid);
                    } else {
                        global.clearTimeout(this.fft.timerid);
                    }

                    this.fft.timerid = null;

                    break;
                default :
                    break;
            }

            return this;
        };

        /** 
         * This method selects domain for drawing.
         * @param {string} domain This argument is in order to select private class.
         * @return {TimeAll|Time|FFT} This value is the instance of selected private class.
         */
        Analyser.prototype.domain = function(domain) {
            var d = String(domain).replace(/-/g, '').toLowerCase();

            switch (d) {
                case 'timealll' :
                case 'timeallr' :
                    return this['timeAll' + d.slice(-1).toUpperCase()];
                case 'time' :
                case 'fft'  :
                    return this[d];
                default :
                    break;
            }
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
        function Recorder(context, bufferSize, numInput, numOutput) {
            this.SAMPLE_RATE = context.sampleRate;

            this.context   = context;
            this.processor = context.createScriptProcessor(bufferSize, numInput, numOutput);

            this.mixLs = null;  //{@type Float32Array}
            this.mixRs = null;  //{@type Float32Array}

            this.trackLs     = [];  //{@type Array.<Array.<Float32Array>>} 2 dimensions array
            this.trackRs     = [];  //{@type Array.<Array.<Float32Array>>} 2 dimensions array
            this.numtrack    = 0;

            this.activeTrack = -1;      //There is not any active track in the case of -1
            this.paused      = true;    //for preventing from the duplicate onaudioprocess event ("start" method)

            this.gainL = 1;  //Gain of L channel
            this.gainR = 1;  //Gain of R channel
        };

        /** 
         * This method sets max the number of tracks.
         * @param {number} numTrack This argument is the max number of tracks. The default value is 1.
         * @return {Recorder} This is returned for method chain.
         */
        Recorder.prototype.setup = function(numTrack) {
            var n = parseInt(numTrack);

            if (n > 0) {
                this.numTrack = n;

                this.trackLs = new Array(this.numTrack);
                this.trackRs = new Array(this.numTrack);

                for (var i = 0; i < n; i++) {this.trackLs[i] = [];}  //n * array
                for (var i = 0; i < n; i++) {this.trackRs[i] = [];}  //n * array
            } else {
                this.numTrack = 1;

                this.trackLs = new Array(this.numTrack);
                this.trackRs = new Array(this.numTrack);

                this.trackLs[0] = [];  //1 * array
                this.trackRs[0] = [];  //1 * array
            }

            return this;
        };

        /** 
         * This abstract method gets or sets parameter.
         * @param {string|object} key This argument is in order to select property in the case of string type.
         *     This argument is in order to select property and value in the case of object.
         * @param {number} value This argument is in order to set value. If this argument is omitted, This method is role of getter.
         * @return {number|Recorder} This is returned as value of designated parameter in the case of getter. Otherwise, this is returned for method chain.
         */
        Recorder.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'gainl' :
                    case 'gainr' :
                        if (value === undefined) {
                            return this['gain' + k.slice(-1).toUpperCase()];  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                this['gain' + k.slice(-1).toUpperCase()] = v;  //Setter
                            }
                        }

                        break;
                    default :
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

                        var recordLs = new Float32Array(this.bufferSize);
                        var recordRs = new Float32Array(this.bufferSize);

                        for (var i = 0; i < this.bufferSize; i++) {
                            recordLs[i] = self.gainL * inputLs[i];
                            recordRs[i] = self.gainR * inputRs[i];
                        }

                        self.trackLs[self.activeTrack].push(recordLs);
                        self.trackRs[self.activeTrack].push(recordRs);
                    } else {
                        this.disconnect(0);
                        this.onaudioprocess = null;  //for Firefox
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
            this.activeTrack = -1;  //Flag becomes inactive
            this.paused      = true;
            this.processor.disconnect(0);  //Stop onaudioprocess event
            this.processor.onaudioprocess = null;  //for Firefox
            return this;
        };

        /** 
         * This method determines whether the designated track number is valid.
         * @param {number} track This argument is track number for validation.
         * @return {boolean} If the designated track is valid range, this value is true. Otherwise, this value is false.
         */
        Recorder.prototype.isTrack = function(track) {
            var t = parseInt(track);

            return ((t >= 0) && (t < this.numTrack)) ? true : false;
        };

        /** 
         * This method determines whether active track exists.
         * @return {number} This is returned as active track.
         */
        Recorder.prototype.getActiveTrack = function() {
            return this.activeTrack;
        };

        /** 
         * This method synthesizes the all of recorded sounds in track.
         * @return {Recorder} This is returned for method chain.
         */
        Recorder.prototype.mix = function() {
            //on the way of recording ?
            if (this.activeTrack !== -1) {
                this.stop();
            }

            var mixTrack = function(channel) {
                var tracks        = this['track' + channel + 's'];
                var mixs          = {values : null, sum : 0, num : 0};
                var currentBuffer = 0;
                var index         = 0;

                //Calculate sound data size
                var maxNumBuffers = 0;

                //Search max number of Float32Arrays each track
                for (var i = 0, num = tracks.length; i < num; i++) {
                    if (maxNumBuffers < tracks[i].length) {
                        maxNumBuffers = tracks[i].length;
                    }
                }

                mixs.values = new Float32Array(maxNumBuffers * this.processor.bufferSize);

                while (true) {
                    for (var currentTrack = 0, len = tracks.length; currentTrack < len; currentTrack++) {
                        if (tracks[currentTrack][currentBuffer] instanceof Float32Array) {
                            mixs.sum += tracks[currentTrack][currentBuffer][index];
                            mixs.num++;
                        }
                    }

                    if (mixs.num > 0) {
                        var offset = currentBuffer * this.processor.bufferSize;
                        mixs.values[offset + index] = mixs.sum / mixs.num;  //Average

                        //Clear
                        mixs.sum = 0;
                        mixs.num = 0;

                        //Next data
                        if (index < (this.processor.bufferSize - 1)) {
                            //Next Element in Float32Array
                            index++;
                        } else {
                            //Next Float32Array
                            currentBuffer++;
                            index = 0;
                        }
                    } else {
                        this['mix' + channel + 's'] = mixs.values;

                        //End
                        break;
                    }
                }
            };

            mixTrack.call(this, 'L');
            mixTrack.call(this, 'R');

            return this;
        };

        /** 
         * This method clears recorded sound of the desinated track.
         * @param {number|string} track This argument is track for clearing.
         * @return {Recorder} This is returned for method chain.
         */
        Recorder.prototype.clear = function(track) {
            //on the way of recording ?
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
         * @param {string|number} track This argument is target track.
         * @param {number} channelType This argument is in order to select stereo or monaural of WAVE file. The default value is 2.
         * @param {number} qbit This argument is quantization bit of PCM. The default value is 16 (bit).
         * @param {string} dataType This argument is in order to select Object URL or Data URL. The default value is 'blob' (Object URL).
         * @return {string} This is returned as Object URL or Data URL for WAVE file.
         */
        Recorder.prototype.create = function(track, channelType, qbit, dataType) {
            //on the way of recording ?
            if (this.activeTrack !== -1) {
                this.stop();
            }

            var Ls = null;  //{@type Float32Array}
            var Rs = null;  //{@type Float32Array}

            if (String(track).toLowerCase() === 'all') {
                this.mix();

                Ls = this.mixLs;
                Rs = this.mixRs;
            } else {
                if (this.isTrack(track)) {
                    Ls = this.trackLs[track - 1];
                    Rs = this.trackRs[track - 1];
                }
            }

            //Sound data exists ?
            if ((Ls.length === 0) && (Rs.length === 0)) {
                return;
            }

            //PCM parameters
            var CHANNEL = (channelType === 1) ? 1 : 2;
            var QBIT    = (qbit        === 8) ? 8 : 16;
            var SIZE    = (CHANNEL === 1) ? Math.min(Ls.length, Rs.length) : (2 * Math.min(Ls.length, Rs.length));

            //{@type Uint8Array|Int16Array}
            var sounds = null;

            switch (QBIT) {
                case 8 :
                    sounds = new Uint8Array(SIZE);

                    for (var i = 0; i < SIZE; i++) {
                        //Convert 8bit unsigned integer (-1 -> 0, 0 -> 128, 1 -> 255)
                        var binary = 0;

                        if ((i % CHANNEL) === 0) {
                            binary = ((Ls[parseInt(i / CHANNEL)] + 1) / 2) * (Math.pow(2, 8) - 1);  //Left channel
                        } else {
                            binary = ((Rs[parseInt(i / CHANNEL)] + 1) / 2) * (Math.pow(2, 8) - 1);  //Right channel
                        }

                        //for preventing from clipping
                        if (binary > (Math.pow(2, 8) - 1)) {binary = (Math.pow(2, 8) - 1);}
                        if (binary < (Math.pow(2, 0) - 1)) {binary = (Math.pow(2, 0) - 1);}

                        sounds[i] = parseInt(binary);
                    }

                    break;
                case 16 :
                    sounds = new Int16Array(SIZE);

                    for (var i = 0; i < SIZE; i++) {
                        //Convert 16bit integer (-1 -> -32768, 0 -> 0, 1 -> 32767)
                        var binary = 0;

                        if ((i % CHANNEL) === 0) {
                            binary = Ls[parseInt(i / CHANNEL)] * Math.pow(2, 15);  //Left channel
                        } else {
                            binary = Rs[parseInt(i / CHANNEL)] * Math.pow(2, 15);  //Right channel
                        }

                        //for preventing from clipping
                        if (binary > (+Math.pow(2, 15) - 1)) {binary =  Math.pow(2, 15) - 1;}
                        if (binary < (-Math.pow(2, 15) - 1)) {binary = -Math.pow(2, 15) - 1;}

                        sounds[i] = parseInt(binary);
                    }

                    break;
                default :
                    break;
            }

            //Create WAVE file (Object URL or Data URL)
            var FMT_CHUNK  = 28;
            var DATA_CHUNK =  8 + (SIZE * (QBIT / 8));
            var CHUNK_SIZE = 36 + (SIZE * (QBIT / 8));
            var RIFF_CHUNK =  8 + (FMT_CHUNK + DATA_CHUNK);
            var RATE       = this.SAMPLE_RATE;
            var BPS        = RATE * CHANNEL * (QBIT / 8);
            var DATA_SIZE  = SIZE * (QBIT / 8);

            switch (String(dataType).toLowerCase()) {
                case 'base64' :
                    var wave = '';

                    wave += 'RIFF';
                    wave += String.fromCharCode(((CHUNK_SIZE >> 0) & 0xFF), ((CHUNK_SIZE >> 8) & 0xFF), ((CHUNK_SIZE >> 16) & 0xFF), ((CHUNK_SIZE >> 24) & 0xFF));
                    wave += 'WAVE';

                    //fmt chunk
                    wave += 'fmt' + ' ' + String.fromCharCode(16, 0, 0, 0);
                    wave += String.fromCharCode(1, 0);

                    //fmt chunk -> Channels (Monaural or Stereo)
                    wave += String.fromCharCode(CHANNEL, 0);

                    //fmt chunk -> Sample rate
                    wave += String.fromCharCode(((RATE >> 0) & 0xFF), ((RATE >> 8) & 0xFF), ((RATE >> 16) & 0xFF), ((RATE >> 24) & 0xFF));

                    //fmt chunk -> Byte per second
                    wave += String.fromCharCode(((BPS >> 0) & 0xFF), ((BPS >> 8) & 0xFF), ((BPS >> 16) & 0xFF), ((BPS >> 24) & 0xFF));

                    //fmt chunk -> Block size
                    wave += String.fromCharCode((CHANNEL * (QBIT / 8)), 0);

                    //fmt chunk -> Byte per Sample
                    wave += String.fromCharCode(QBIT, 0);

                    //data chunk
                    wave += 'data';
                    wave += String.fromCharCode(((DATA_SIZE >> 0) & 0xFF), ((DATA_SIZE >> 8) & 0xFF), ((DATA_SIZE >> 16) & 0xFF), ((DATA_SIZE >> 24) & 0xFF));

                    for (var i = 0; i < SIZE; i++) {
                        switch (QBIT) {
                            case  8 :
                                wave += String.fromCharCode(sounds[i]);
                                break;
                            case 16 :
                                //The byte order in WAVE file is little endian
                                wave += String.fromCharCode(((sounds[i] >> 0) & 0xFF), ((sounds[i] >> 8) & 0xFF));
                                break;
                            default :
                                break;
                        }
                    }

                    var base64  = global.btoa(wave);
                    var dataURL = 'data:audio/wav;base64,' + base64;

                    return dataURL;
                case 'blob' :
                default     :
                    var waves = [];

                    waves[0] = 0x52;  //'R'
                    waves[1] = 0x49;  //'I'
                    waves[2] = 0x46;  //'F'
                    waves[3] = 0x46;  //'F'

                    waves[4] = (CHUNK_SIZE >>  0) & 0xFF;
                    waves[5] = (CHUNK_SIZE >>  8) & 0xFF;
                    waves[6] = (CHUNK_SIZE >> 16) & 0xFF;
                    waves[7] = (CHUNK_SIZE >> 24) & 0xFF;

                    waves[8]  = 0x57;  //'W'
                    waves[9]  = 0x41;  //'A'
                    waves[10] = 0x56;  //'V'
                    waves[11] = 0x45;  //'E'

                    //fmt chunk
                    waves[12] = 0x66;  //'f'
                    waves[13] = 0x6D;  //'m'
                    waves[14] = 0x74;  //'t'
                    waves[15] = 0x20;  //' '

                    waves[16] = 16;
                    waves[17] =  0;
                    waves[18] =  0;
                    waves[19] =  0;

                    waves[20] = 1;
                    waves[21] = 0;

                    //fmt chunk -> Channels (Monaural or Stereo)
                    waves[22] = CHANNEL;
                    waves[23] = 0;

                    //fmt chunk -> Sample rate
                    waves[24] = (RATE >>  0) & 0xFF;
                    waves[25] = (RATE >>  8) & 0xFF;
                    waves[26] = (RATE >> 16) & 0xFF;
                    waves[27] = (RATE >> 24) & 0xFF;

                    //fmt chunk -> Byte per second
                    waves[28] = (BPS >>  0) & 0xFF;
                    waves[29] = (BPS >>  8) & 0xFF;
                    waves[30] = (BPS >> 16) & 0xFF;
                    waves[31] = (BPS >> 24) & 0xFF;

                    //fmt chunk -> Block size
                    waves[32] = CHANNEL * (QBIT / 8);
                    waves[33] = 0;

                    //fmt chunk -> Byte per Sample
                    waves[34] = QBIT;
                    waves[35] = 0;

                    //data chunk
                    waves[36] = 0x64;  //'d'
                    waves[37] = 0x61;  //'a'
                    waves[38] = 0x74;  //'t
                    waves[39] = 0x61;  //'a'

                    waves[40] = (DATA_SIZE >>  0) & 0xFF;
                    waves[41] = (DATA_SIZE >>  8) & 0xFF;
                    waves[42] = (DATA_SIZE >> 16) & 0xFF;
                    waves[43] = (DATA_SIZE >> 24) & 0xFF;

                    for (var i = 0; i < SIZE; i++) {
                        switch (QBIT) {
                            case  8 :
                                waves[(RIFF_CHUNK - DATA_SIZE) + i] = sounds[i];
                                break;
                            case 16 :
                                //The byte order in WAVE file is little endian
                                waves[(RIFF_CHUNK - DATA_SIZE) + (2 * i) + 0] = ((sounds[i] >> 0) & 0xFF);
                                waves[(RIFF_CHUNK - DATA_SIZE) + (2 * i) + 1] = ((sounds[i] >> 8) & 0xFF);
                                break;
                            default :
                                break;
                        }
                    }

                    global.URL = global.URL || global.webkitURL;

                    var blob      = new Blob([new Uint8Array(waves)], {type : 'audio/wav'});
                    var objectURL = global.URL.createObjectURL(blob);

                    return objectURL;
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
         * @param {number} numInput This argument is the number of inputs for ScriptProcessorNode.
         * @param {number} numOutput This argument the number of outputs for ScriptProcessorNode.
         * @param {Analyser} analyser This argument is the instance of Analyser.
         * @constructor
         * @implements {Statable}
         */
        function Session(context, bufferSize, numInput, numOutput, analyser) {
            //Call interface constructor
            Statable.call(this);

            this.isActive = false;

            this.context  = context;
            this.analyser = analyser;  //the instance of Analyser

            this.sender   = context.createScriptProcessor(bufferSize, numInput, numOutput);
            this.receiver = context.createScriptProcessor(bufferSize, numInput, numOutput);

            this.websocket = null;  //for the instance of WebSocket
            this.paused    = true;  //for preventing from  the duplicate onaudioprocess event ("start" method)
        }

        /** 
         * This method creates the instance of WebSocket and registers event handlers.
         * @param {boolean} tls This argument is in order to select protocol either 'wss' or 'ws'.
         * @param {string} host This argument is server's host name.
         * @param {number} port This argument is port number for connection.
         * @param {string} path This argument is file that is executed in server side.
         * @param {function} openCallback This argument is executed as "onopen" event handler in the instance of WebSocket.
         * @param {function} closeCallback This argument is executed as "onclose" event handler in the instance of WebSocket.
         * @param {function} errorCallback This argument is executed as "onerror" event handler in the instance of WebSocket.
         * @return {Session} This is returned for method chain.
         */
        Session.prototype.setup = function(tls, host, port, path, openCallback, closeCallback, errorCallback) {
            if (!navigator.onLine) {
                //Clear
                this.isActive = false;
                this.paused   = true;
                this.connect();
                this.websocket = null;

                throw new Error('Now Offline !!');
            }

            //The argument is associative array ?
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
                return;
            }

            this.websocket = new WebSocket(scheme + host + ':' + p + path);
            this.websocket.binaryType = 'arraybuffer';

            var self = this;

            this.websocket.onopen = function(event) {
                if (Object.prototype.toString.call(openCallback) === '[object Function]') {
                    openCallback(event, self.websocket);
                }
            };

            this.websocket.onclose = function(event) {
                self.isActive = false;
                self.paused   = true;

                self.connect();

                if (Object.prototype.toString.call(closeCallback) === '[object Function]') {
                    closeCallback(event, self.websocket);
                }
            };

            this.websocket.onerror = function(event) {
                self.isActive = false;
                self.paused   = true;

                self.connect();

                if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                    errorCallback(event, self.websocket);
                }
            };

            this.websocket.onmessage = function(event) {
                if (!self.isActive) {
                    //Stop drawing sound wave
                    self.analyser.stop('time');
                    self.analyser.stop('fft');

                    return;
                }

                if (event.data instanceof ArrayBuffer) {
                    var total  = event.data.byteLength / Float32Array.BYTES_PER_ELEMENT;
                    var length = Math.floor(total / 2);
                    var offset = length * Float32Array.BYTES_PER_ELEMENT;

                    var bufferLs = new Float32Array(event.data,      0, length);  //Get Left  channel data
                    var bufferRs = new Float32Array(event.data, offset, length);  //Get Right channel data

                    //Start drawing sound wave
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
                            //Stop drawing sound wave
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
            //Clear connection
            this.receiver.disconnect(0);
            this.sender.disconnect(0);

            //for Firefox
            this.receiver.onaudioprocess = null;
            this.sender.onaudioprocess   = null;

            if (this.isActive) {
                //ScriptProcessorNode (input) -> Analyser -> AudioDestinationNode (output)
                this.receiver.connect(this.analyser.input);
                this.analyser.output.connect(this.context.destination);
            } else {
                this.paused = true;
            }

            return this;
        };

        /** 
         * This method sends created sound data to server.
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
            return ((this.websocket instanceof WebSocket) && (this.websocket.readyState === WebSocket.OPEN)) ? true : false;
        };

        /** @override */
        Session.prototype.state = function(value, stateCallback, waitCallback) {
            if (value === undefined) {
                return this.isActive;  //Getter
            }

            if (Object.prototype.toString.call(waitCallback) === '[object Function]') {
                waitCallback();
            }

            var self = this;

            var intervalid = global.setInterval(function() {
                if ((self.websocket instanceof WebSocket) && (self.websocket.bufferedAmount !== 0)) {
                    return;
                }

                if (String(value).toLowerCase() === 'toggle') {
                    self.isActive = !self.isActive;  //Setter
                } else {
                    self.isActive = Boolean(value);  //Setter
                }

                self.connect();

                if (Object.prototype.toString.call(stateCallback) === '[object Function]') {
                    stateCallback();
                }

                global.clearInterval(intervalid);
            }, 10);

            //In the case of setter
            return this;
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
            //Call interface constructor
            Statable.call(this);

            this.isActive = true;

            //for creating instance of OscillatorNode again
            this.context = context;

            //for connecting external node
            this.input  = context.createGain();
            this.output = context.createGain();

            //for LFO (Low Frequency Oscillator)
            //LFO changes parameter cyclically
            this.lfo       = context.createOscillator();
            this.depth     = context.createGain();
            this.rate      = this.lfo.frequency;
            this.processor = context.createScriptProcessor(bufferSize, 1, 2);

            //for legacy browsers
            this.lfo.start = this.lfo.start || this.lfo.noteOn;
            this.lfo.stop  = this.lfo.stop  || this.lfo.noteOff;

            this.values = {};

            this.isStop = true;
        }

        /** 
         * This abstract method gets or sets parameter.
         * @param {string|object} key This argument is in order to select property in the case of string type.
         *     This argument is in order to select property and value in the case of object.
         * @param {number|string} value This argument is in order to set value. If this argument is omitted, This method is role of getter.
         * @return {number|Effector} This is returned as value of designated parameter in the case of getter. Otherwise, this is returned for method chain.
         * @abstract
         */
        Effector.prototype.param = function(key, value) {
        };

        /**
         * This abstract method connects nodes according to state.
         *     Namely, the 2 connections for switching Effect are defined by this method.
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
         * This method stops LFO, and prepares {OscillatorNode} again in the case of "false".
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

                //for keeping value
                var type = this.lfo.type;
                var rate = this.lfo.frequency.value;

                //Destroy the instance of OscillatorNode
                this.lfo.stop(s + r);

                //Create the instance of OscillatorNode again
                this.lfo = this.context.createOscillator();

               //for legacy browsers
                this.lfo.start = this.lfo.start || this.lfo.noteOn;
                this.lfo.stop  = this.lfo.stop  || this.lfo.noteOff;

                //Set the saved value
                this.lfo.type            = type;
                this.lfo.frequency.value = rate;

                this.rate = this.lfo.frequency;

                this.isStop = true;
            }

            return this;
        };

        /** @override */
        Effector.prototype.state = function(value) {
            if (value === undefined) {
                return this.isActive;  //Getter
            } else if (String(value).toLowerCase() === 'toggle') {
                this.isActive = !this.isActive;  //Setter
            } else {
                this.isActive = Boolean(value);  //Setter
            }

            //In the case of setter

            //Change connection
            this.connect();

            //Start LFO
            this.start(this.context.currentTime);

            return this;
        };

        /** @override */
        Effector.prototype.toString = function() {
            return '[SoundModule Effector]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Compressor(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.compressor = context.createDynamicsCompressor();

            //Set default value
            this.compressor.threshold.value = -24;
            this.compressor.knee.value      = 30;
            this.compressor.ratio.value     = 12;
            this.compressor.attack.value    = 0.003;
            this.compressor.release.value   = 0.25;

            //Connect nodes
            this.connect();
        }

        /** @override */
        Compressor.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                if (k in this.compressor) {
                    if (value === undefined) {
                        return this.compressor[k].value;  //Getter
                    } else {
                        var v   = parseFloat(value);

                        var mins = {
                            threshold : -100,
                            knee      : 0,
                            ratio     : 1,
                            attack    : 0,
                            release   : 0
                        };

                        var maxs = {
                            threshold : 0,
                            knee      : 40,
                            ratio     : 20,
                            attack    : 1,
                            release   : 1
                        };

                        var min = this.compressor[k].minValue || mins[k];
                        var max = this.compressor[k].maxValue || maxs[k];

                        if ((v >= min) && (v <= max)) {
                            this.compressor[k].value = v;  //Setter
                        }
                    }
                }
            }

            return this;
        };

        /** @override */
        Compressor.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.compressor.disconnect(0);

            if (this.isActive) {
                //Effect ON
                //GainNode (input) -> DynamicsCompressorNode -> GainNode (output)
                this.input.connect(this.compressor);
                this.compressor.connect(this.output);
            } else {
                //Effect OFF
                //GainNode (input) -> GainNode (output)
                this.input.connect(this.output);
            }

            return this;
        };

        /** @override */
        Compressor.prototype.toString = function() {
            return '[SoundModule Compressor]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Distortion(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.distortion = context.createWaveShaper();
            this.drive      = context.createGain();
            this.color      = context.createBiquadFilter();
            this.tone       = context.createBiquadFilter();

            //Distortion type
            this.type = 'clean';

            //for creating curve
            this.numberOfSamples = 4096;

            //Initialize parameters
            this.drive.gain.value      = 1;
            this.color.type            = (Object.prototype.toString.call(this.color.type) === '[object String]') ? 'bandpass' : (this.color.BANDPASS || 2);
            this.color.frequency.value = 350;
            this.color.Q.value         = Math.SQRT1_2;
            this.color.gain.value      = 0;  //Not used
            this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
            this.tone.frequency.value  = 350;
            this.tone.Q.value          = Math.SQRT1_2;
            this.tone.gain.value       = 0;  //Not used

            //Distortion is not connected by default
            this.state(false);
        }

        /**
         * This static method creates the instance of Float32Array for distortion
         * @param {number} amount This argument is depth of distortion
         * @param {number} numberOfSamples This argument is the size of Float32Array
         * @return {Float32Array|null} This is "curve" property in WaveShaperNode
         */
        Distortion.createCurve = function(amount, numberOfSamples) {
            if ((amount > 0) && (amount < 1)) {
                var curves = new Float32Array(numberOfSamples);

                var k = (2 * amount) / (1 - amount);

                for (var i = 0; i < numberOfSamples; i++) {
                    //LINEAR INTERPOLATION: x := (c - a) * (z - y) / (b - a) + y
                    //a = 0, b = 2048, z = 1, y = -1, c = i
                    var x = (((i - 0) * (1 - (-1))) / (numberOfSamples - 0)) + (-1);
                    curves[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
                }

                return curves;
            } else {
                return null;  //Clean sound (default value)
            }
        };

        /** @override */
        Distortion.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else  {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'curve' :
                        if (value === undefined) {
                            return this.distortion.curve;  //Getter
                        } else {
                            var AMOUNTS = {
                                CLEAN      : 0.0,
                                CRUNCH     : 0.5,
                                OVERDRIVE  : 0.7,
                                DISTORTION : 0.8,
                                FUZZ       : 0.9
                            };

                            //Setter
                            var curve = null;

                            switch (String(value).toLowerCase()) {
                                case 'clean' :
                                    this.type = 'clean';
                                    curve = Distortion.createCurve(AMOUNTS.CLEAN, this.numberOfSamples);
                                    break;
                                case 'crunch' :
                                    this.type = 'crunch';
                                    curve = Distortion.createCurve(AMOUNTS.CRUNCH, this.numberOfSamples);
                                    break;
                                case 'overdrive' :
                                    this.type = 'overdrive';
                                    curve = Distortion.createCurve(AMOUNTS.OVERDRIVE, this.numberOfSamples);
                                    break;
                                case 'distortion' :
                                    this.type = 'distortion';
                                    curve = Distortion.createCurve(AMOUNTS.DISTORTION, this.numberOfSamples);
                                    break;
                                case 'fuzz' :
                                    this.type = 'fuzz';
                                    curve = Distortion.createCurve(AMOUNTS.FUZZ, this.numberOfSamples);
                                    break;
                                default :
                                    if (value instanceof Float32Array) {
                                        curve = value;
                                    }

                                    break;
                            }

                            this.distortion.curve = curve;
                        }

                        break;
                    case 'samples' :
                        if (value === undefined) {
                            return this.numberOfSamples;  //Getter
                        } else {
                            var v = parseInt(value);

                            if (v >= 0) {
                                //Setter
                                this.numberOfSamples = v;
                                this.param('curve', this.type);
                            }
                        }

                        break;
                    case 'drive' :
                        if (value === undefined) {
                            return this.drive.gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.drive.gain.minValue || 0;
                            var max = this.drive.gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.drive.gain.value = v;  //Setter
                            }
                        }

                        break;
                    case 'color' :
                    case 'tone'  :
                        if (value === undefined) {
                            return this[k].frequency.value; //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this[k].frequency.minValue || 10;
                            var max = this[k].frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this[k].frequency.value = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Distortion.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.distortion.disconnect(0);
            this.drive.disconnect(0);
            this.color.disconnect(0);
            this.tone.disconnect(0);

            if (this.isActive) {
                //Effect ON

                //GainNode (input) -> BiquadFilterNode (color) -> WaveShaperNode (distorion) -> GainNode (drive) -> BiquadFilterNode (tone) -> GainNode (output)
                this.input.connect(this.color);
                this.color.connect(this.distortion);
                this.distortion.connect(this.drive);
                this.drive.connect(this.tone);
                this.tone.connect(this.output);
            } else {
                //Effect OFF

                //GainNode (input) -> GainNode (output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Distortion.prototype.toString = function() {
            return '[SoundModule Distortion]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Wah(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.lowpass = context.createBiquadFilter();

            //Initialize parameters
            this.lowpass.type            = (Object.prototype.toString.call(this.lowpass.type) === '[object String]') ? 'lowpass' : (this.lowpass.LOWPASS || 0);
            this.lowpass.frequency.value = 350;
            this.lowpass.gain.value      = 0;    //Not used

            this.lowpass.Q.value   = 1;
            this.depth.gain.value  = 0;
            this.rate.value        = 0;
            this.depthRate         = 0;

            //Wah is not connected by default
            this.state(false);

            //LFO
            //OscillatorNode (LFO) -> GainNode (depth) -> AudioParam (BiquadFilterNode.frequency)
            this.lfo.connect(this.depth);
            this.depth.connect(this.lowpass.frequency);
        };

        /** @override */
        Wah.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'frequency' :
                    case 'cutoff'    :
                        if (value === undefined) {
                            return this.lowpass.frequency.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.lowpass.frequency.minValue || 10;
                            var max = this.lowpass.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                //Setter
                                this.lowpass.frequency.value = v;
                                this.depth.gain.value        = this.lowpass.frequency.value * this.depthRate;
                            }
                        }

                        break;
                    case 'depth' :
                        if (value === undefined) {
                            return this.depthRate;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                //Setter
                                this.depth.gain.value = this.lowpass.frequency.value * v;
                                this.depthRate        = v;
                            }
                        }

                        break;
                    case 'rate' :
                        if (value === undefined) {
                            return this.rate.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;  //Setter
                            }
                        }

                        break;
                    case 'resonance' :
                        if (value === undefined) {
                            return this.lowpass.Q.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.lowpass.Q.minValue || 0.0001;
                            var max = this.lowpass.Q.maxValue || 1000;

                            if ((v >= min) && (v <= max)) {
                                this.lowpass.Q.value = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Wah.prototype.stop = function(stopTime, releaseTime) {
            //Call superclass method
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            //Effector's state is active ?
            if (this.isActive) {
                //Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.lowpass.frequency);
            }

            return this;
        };

        /** @override */
        Wah.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.lowpass.disconnect(0);

            if (this.isActive) {
                //Effect ON

                //GainNode (input) -> BiquadFilterNode (lowpass) -> GainNode (output)
                this.input.connect(this.lowpass);
                this.lowpass.connect(this.output);
            } else {
                //Effect OFF

                //GainNode (input) -> GainNode (output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Wah.prototype.toString = function() {
            return '[SoundModule Wah]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Equalizer(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.bass     = context.createBiquadFilter();
            this.middle   = context.createBiquadFilter();
            this.treble   = context.createBiquadFilter();
            this.presence = context.createBiquadFilter();

            //Set filter type
            this.bass.type     = (Object.prototype.toString.call(this.bass.type)     === '[object String]') ? 'lowshelf'  : (this.bass.LOWSHELF      || 3);
            this.middle.type   = (Object.prototype.toString.call(this.middle.type)   === '[object String]') ? 'peaking'   : (this.middle.PEAKING     || 5);
            this.treble.type   = (Object.prototype.toString.call(this.treble.type)   === '[object String]') ? 'peaking'   : (this.treble.PEAKING     || 5);
            this.presence.type = (Object.prototype.toString.call(this.presence.type) === '[object String]') ? 'highshelf' : (this.presence.HIGHSHELF || 4);

            //Set cutoff frequency
            this.bass.frequency.value     =  500;  //500 Hz
            this.middle.frequency.value   = 1000;  //1 kHz
            this.treble.frequency.value   = 2000;  //2 kHz
            this.presence.frequency.value = 4000;  //4 kHz

            //Set Q
            //this.bass.Q.value     = Math.SQRT1_2;  //Not used
            this.middle.Q.value   = Math.SQRT1_2;
            this.treble.Q.value   = Math.SQRT1_2;
            //this.presence.Q.value = Math.SQRT1_2;  //Not used

            //Set Gain
            this.bass.gain.value     = 0;
            this.middle.gain.value   = 0;
            this.treble.gain.value   = 0;
            this.presence.gain.value = 0;

            //Connect nodes
            this.connect();
        }

        /** @override */
        Equalizer.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'bass'     :
                    case 'middle'   :
                    case 'treble'   :
                    case 'presence' :
                        if (value === undefined) {
                            return this[k].gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || -40;
                            var max = this[k].gain.maxValue ||  40;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;  //Setter
                            }
                        }

                        break
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Equalizer.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.bass.disconnect(0);
            this.middle.disconnect(0);
            this.treble.disconnect(0);
            this.presence.disconnect(0);

            if (this.isActive) {
                //Effect ON

                //GainNode (input) -> BiquadFilterNode (bass) -> BiquadFilterNode (middle) -> BiquadFilterNode (treble) -> BiquadFilterNode (presence) -> GainNode (output)
                this.input.connect(this.bass);
                this.bass.connect(this.middle);
                this.middle.connect(this.treble);
                this.treble.connect(this.presence);
                this.presence.connect(this.output);
            } else {
                //Effect OFF

                //GainNode (input) -> GainNode (output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Equalizer.prototype.toString = function() {
            return '[SoundModule Equalizer]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Filter(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.filter = context.createBiquadFilter();

            //for legacy browsers
            this.filter.frequency.setTargetAtTime = this.filter.frequency.setTargetAtTime || this.filter.frequency.setTargetValueAtTime;

            //Initialize parameters
            this.filter.type            = (Object.prototype.toString.call(this.filter.type) === '[object String]') ? 'lowpass' : (this.filter.LOWPASS || 0);
            this.filter.frequency.value = 350;
            this.filter.Q.value         = 1;
            this.filter.gain.value      = 0;

            this.maxFrequency = this.filter.frequency.value;
            this.attack  = 0.01;
            this.decay   = 0.3;
            this.sustain = 1.0;
            this.release = 1.0;

            //Filter is not connected by default
            this.state(false);
        }

        /** @override */
        Filter.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'type' :
                        if (value === undefined) {
                            return this.filter.type;  //Getter
                        } else {
                            var v = String(value).toLowerCase();

                            //for legacy browsers
                            var FILTER_TYPES = {
                                lowpass   : this.filter.LOWPASS   || 0,
                                highpass  : this.filter.HIGHPASS  || 1,
                                bandpass  : this.filter.BANDPASS  || 2,
                                lowshelf  : this.filter.LOWSHELF  || 3,
                                highshelf : this.filter.HIGHSHELF || 4,
                                peaking   : this.filter.PEAKING   || 5,
                                notch     : this.filter.NOTCH     || 6,
                                allpass   : this.filter.ALLPASS   || 7
                            };

                            if (v in FILTER_TYPES) {
                                this.filter.type = (Object.prototype.toString.call(this.filter.type) === '[object String]') ? v : FILTER_TYPES[v];  //Setter
                            }
                        }

                        break;
                    case 'frequency' :
                    case 'cutoff'    :
                        if (value === undefined) {
                            return this.filter.frequency.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.filter.frequency.minValue || 10;
                            var max = this.filter.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                //Setter
                                this.maxFrequency           = v;
                                this.filter.frequency.value = v;
                            }
                        }

                        break;
                    case 'gain' :
                        if (value === undefined) {
                            return this.filter.gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.filter.gain.minValue || -40;
                            var max = this.filter.gain.maxValue ||  40;

                            if ((v >= min) && (v <= max)) {
                                this.filter.gain.value = v;  //Setter
                            }
                        }

                        break;
                    case 'q' :
                        if (value === undefined) {
                            return this.filter.Q.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.filter.Q.minValue || 0.0001;
                            var max = this.filter.Q.maxValue || 1000;

                            if ((v >= min) && (v <= max)) {
                                this.filter.Q.value = v;  //Setter
                            }
                        }

                        break;
                    case 'attack'  :
                    case 'decay'   :
                    case 'sustain' :
                    case 'release' :
                        if (value === undefined) {
                            return this[k];  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (v >= 0) {
                                this[k] = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Filter.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.filter.disconnect(0);

            if (this.isActive) {
                //Effector ON

                //GainNode (input) -> BiquadFilterNode -> GainNode (output)
                this.input.connect(this.filter);
                this.filter.connect(this.output);
            } else {
                //Effector OFF

                //GainNode (input) -> GainNode (output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Filter.prototype.start = function(startTime) {
            //for the case of end on the way of scheduling
            this.filter.frequency.value = this.maxFrequency;

            if (this.isActive) {
                var s = parseFloat(startTime);

                if (isNaN(s) || (s < this.context.currentTime)) {
                    s = this.context.currentTime;
                }

                var t0      = s;
                var t1      = t0 + this.attack;
                var t2      = this.decay;
                var t2Value = this.sustain * this.filter.frequency.value;

                //Envelope Generator for filter
                this.filter.frequency.cancelScheduledValues(t0);
                this.filter.frequency.setValueAtTime(this.filter.frequency.defaultValue, t0);
                this.filter.frequency.linearRampToValueAtTime(this.maxFrequency, t1);  //Attack
                this.filter.frequency.setTargetAtTime(t2Value, t1, t2);  //Decay -> Sustain
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

                //Envelope Generator for filter
                this.filter.frequency.cancelScheduledValues(t3);
                this.filter.frequency.setValueAtTime(this.filter.frequency.value, t3);
                this.filter.frequency.setTargetAtTime(this.filter.frequency.defaultValue, t3, t4);  //Sustain -> Release
                this.filter.frequency.setValueAtTime(this.maxFrequency, (t3 + t4));
            }

            return this;
        };

        /** @override */
        Filter.prototype.state = function(value) {
            if (value === undefined) {
                return this.isActive;  //Getter
            } else if (String(value).toLowerCase() === 'toggle') {
                this.isActive = !this.isActive;  //Setter
            } else {
                this.isActive = Boolean(value);  //Setter
            }

            //In the case of setter

            //Change connection
            this.connect();

            return this;
        };

        /** @override */
        Filter.prototype.toString = function() {
            return '[SoundModule Filter]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Autopanner(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.amplitudeL = context.createGain();
            this.amplitudeR = context.createGain();
            this.splitter   = context.createChannelSplitter(2);
            this.merger     = context.createChannelMerger(2);

            this.amplitudeL.gain.value = 1;  //1 +- depth
            this.amplitudeR.gain.value = 1;  //1 +- depth

            //Initialize parameters
            this.depth.gain.value = 0;
            this.rate.value       = 0;

            //Autopanner is not connected by default
            this.state(false);

            //LFO
            //OscillatorNode (LFO) -> GainNode (depth) -> ScriptProcessorNode -> ChannelSplitterNode -> AudioParam (GainNode.gain) (L) / (R)
            this.lfoSplitter = context.createChannelSplitter(2);
            this.lfo.connect(this.depth);
            this.depth.connect(this.processor);
            this.processor.connect(this.lfoSplitter);
            this.lfoSplitter.connect(this.amplitudeL.gain, 0);
            this.lfoSplitter.connect(this.amplitudeR.gain, 1);
        };

        /** @override */
        Autopanner.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'depth' :
                        if (value === undefined) {
                           return this.depth.gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.depth.gain.minValue || 0;
                            var max = this.depth.gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth.gain.value = v;  //Setter
                            }
                        }

                        break;
                    case 'rate' :
                        if (value === undefined) {
                           return this.rate.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Autopanner.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.amplitudeL.disconnect(0);
            this.amplitudeR.disconnect(0);
            this.splitter.disconnect(0);
            this.merger.disconnect(0);

            if (this.isActive) {
                //GainNode (input) -> ChannelSplitterNode -> GainNode (L) / (R) -> ChannelMergerNode -> GainNode (output)
                this.input.connect(this.splitter);
                this.splitter.connect(this.amplitudeL, 0, 0);
                this.splitter.connect(this.amplitudeR, 1, 0);
                this.amplitudeL.connect(this.merger, 0, 0);
                this.amplitudeR.connect(this.merger, 0, 1);
                this.merger.connect(this.output);
            } else {
                //GainNode (input) -> GainNode (output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Autopanner.prototype.start = function(startTime) {
            if (this.isActive && this.isStop) {
                var s = parseFloat(startTime);

                if (isNaN(s) || (s < this.context.currentTime)) {
                    s = this.context.currentTime;
                }

                this.lfo.start(s);
                this.isStop = false;

                var self = this;

                this.processor.onaudioprocess = function(event) {
                    var inputs = event.inputBuffer.getChannelData(0);
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
        Autopanner.prototype.stop = function(stopTime, releaseTime) {
            //Call superclass method
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            //Effector's state is active ?
            if (this.isActive) {
                //Stop onaudioprocess event
                this.processor.disconnect(0);
                this.processor.onaudioprocess = null;  //for Firefox

                //Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.processor);
                this.processor.connect(this.lfoSplitter);
                this.lfoSplitter.connect(this.amplitudeL.gain, 0);
                this.lfoSplitter.connect(this.amplitudeR.gain, 1);
            }

            return this;
        };

        /** @override */
        Autopanner.prototype.toString = function() {
            return '[SoundModule Autopanner]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Tremolo(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.amplitude = context.createGain();

            this.amplitude.gain.value = 1;  //1 +- depth

            //Initialize parameter
            this.depth.gain.value = 0;
            this.rate.value       = 0;

            //Tremolo is not connected by default
            this.state(false);

            //LFO
            //OscillatorNode (LFO) -> GainNode (depth) -> AudioParam (GainNode.gain)
            this.lfo.connect(this.depth);
            this.depth.connect(this.amplitude.gain);
        }

        /** @override */
        Tremolo.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'depth' :
                        if (value === undefined) {
                           return this.depth.gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.depth.gain.minValue || 0;
                            var max = this.depth.gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth.gain.value = v;  //Setter
                            }
                        }

                        break;
                    case 'rate' :
                        if (value === undefined) {
                           return this.rate.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;  //Setter
                            }
                        }

                        break;
                    case 'wave' :
                        if (value === undefined) {
                            return this.lfo.type;  //Getter
                        } else {
                            var v = String(value).toLowerCase();

                            this.lfo.SINE     = this.lfo.SINE     || 0;
                            this.lfo.SQUARE   = this.lfo.SQUARE   || 1;
                            this.lfo.SAWTOOTH = this.lfo.SAWTOOTH || 2;
                            this.lfo.TRIANGLE = this.lfo.TRIANGLE || 3;

                            //for legacy browsers
                            var WAVE_TYPE = {
                                sine     : this.lfo.SINE,
                                square   : this.lfo.SQUARE,
                                sawtooth : this.lfo.SAWTOOTH,
                                triangle : this.lfo.TRIANGLE
                            };

                            if (v in WAVE_TYPE) {
                                this.lfo.type = (Object.prototype.toString.call(this.lfo.type) === '[object String]') ? v : WAVE_TYPE[v];  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Tremolo.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.amplitude.disconnect(0);

            if (this.isActive) {
                //Effect ON

                //GainNode (input) -> GainNode -> GainNode (output)
                this.input.connect(this.amplitude);
                this.amplitude.connect(this.output);
            } else {
                //Effect OFF

                //GainNode (input) -> GainNode (output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Tremolo.prototype.stop = function(stopTime, releaseTime) {
            //Call superclass method
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            //Effector's state is active ?
            if (this.isActive) {
                //Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.amplitude.gain);
            }

            return this;
        };

        /** @override */
        Tremolo.prototype.toString = function() {
            return '[SoundModule Tremolo]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Ringmodulator(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.amplitude = context.createGain();

            this.amplitude.gain.value = 0;  //0 +- depth

            //Initialize parameter
            this.depth.gain.value = 1;
            this.rate.value       = 0;

            //Ring Modulator is not connected by default
            this.state(false);

            //LFO
            //OscillatorNode (LFO) -> GainNode (depth) -> AudioParam (GainNode.gain)
            this.lfo.connect(this.depth);
            this.depth.connect(this.amplitude.gain);
        }

        /** @override */
        Ringmodulator.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'depth' :
                        if (value === undefined) {
                           return this.depth.gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.depth.gain.minValue || 0;
                            var max = this.depth.gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth.gain.value = v;  //Setter
                            }
                        }

                        break;
                    case 'rate' :
                        if (value === undefined) {
                           return this.rate.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Ringmodulator.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.amplitude.disconnect(0);

            if (this.isActive) {
                //Effect ON

                //GainNode (input) -> GainNode -> GainNode (output)
                this.input.connect(this.amplitude);
                this.amplitude.connect(this.output);
            } else {
                //Effect OFF

                //GainNode (input) -> GainNode (output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Ringmodulator.prototype.stop = function(stopTime, releaseTime) {
            //Call superclass method
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            //Effector's state is active ?
            if (this.isActive) {
                //Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.amplitude.gain);
            }

            return this;
        };

        /** @override */
        Ringmodulator.prototype.toString = function() {
            return '[SoundModule Ringmodulator]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Phaser(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.MAXIMUM_STAGES = 24;  //The maximum number of All-Pass Filters
            this.numberOfStages = 12;  //The default number of All-Pass Filters
            this.filters        = new Array(this.MAXIMUM_STAGES);

            for (var i = 0; i < this.MAXIMUM_STAGES; i++) {
                this.filters[i]                 = context.createBiquadFilter();
                this.filters[i].type            = (Object.prototype.toString.call(this.filters[i].type) === '[object String]') ? 'allpass' : (this.filters[i].ALLPASS || 7);
                this.filters[i].frequency.value = 350;
                this.filters[i].Q.value         = 1;
                this.filters[i].gain.value      = 0;  //Not used
            }

            this.mix      = context.createGain();
            this.feedback = context.createGain();

            //Initialize parameters
            this.depth.gain.value    = 0;
            this.rate.value          = 0;
            this.mix.gain.value      = 0;
            this.feedback.gain.value = 0;
            this.depthRate           = 0;

            //Phaser is not connected by default
            this.state(false);

            //LFO
            //GainNode (LFO) -> GainNode (depth) -> AudioParam (BiquadFilterNode.frequency)
            this.lfo.connect(this.depth);

            for (var i = 0; i < this.MAXIMUM_STAGES; i++) {
                this.depth.connect(this.filters[i].frequency);
            }
        }

        /** @override */
        Phaser.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'stage' :
                        if (value === undefined) {
                            return this.numberOfStages;  //Getter
                        } else {
                            var v   = parseInt(value);
                            var min = 0;
                            var max = this.MAXIMUM_STAGES;

                            if ((v >= min) && (v <= max)) {
                                this.numberOfStages = v;
                                this.connect();
                            }
                        }

                        break;
                    case 'frequency' :
                    case 'cutoff'    :
                        if (value === undefined) {
                            return this.filters[0].frequency.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.filters[0].frequency.minValue || 10;
                            var max = this.filters[0].frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                //Setter
                                for (var i = 0; i < this.MAXIMUM_STAGES; i++) {
                                    this.filters[i].frequency.value = v;
                                }

                                this.depth.gain.value = this.filters[0].frequency.value * this.depthRate;
                            }
                        }

                        break;
                    case 'resonance' :
                        if (value === undefined) {
                            return this.filters[0].Q.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.filters[0].Q.minValue || 0.0001;
                            var max = this.filters[0].Q.maxValue || 1000;

                            if ((v >= min) && (v <= max)) {
                                for (var i = 0; i < this.MAXIMUM_STAGES; i++) {
                                    this.filters[0].Q.value = v;  //Setter
                                }
                            }
                        }

                        break;
                    case 'depth' :
                        if (value === undefined) {
                            return this.depthRate;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = this.filters[0].frequency.value;

                            if ((v >= min) && (v <= max)) {
                                //Setter
                                this.depth.gain.value = this.filters[0].frequency.value * v;
                                this.depthRate        = v;
                            }
                        }

                        break;
                    case 'rate' :
                        if (value === undefined) {
                            return this.rate.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;  //Setter
                            }
                        }

                        break;
                    case 'mix'      :
                    case 'feedback' :
                        if (value === undefined) {
                            return this[k].gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || 0;
                            var max = this[k].gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Phaser.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);

            for (var i = 0; i < this.MAXIMUM_STAGES; i++) {
                this.filters[i].disconnect(0);
            }

            this.mix.disconnect(0);
            this.feedback.disconnect(0);

            //GainNode (input) -> GainNode (output)
            this.input.connect(this.output);

            //Effect ON
            if (this.isActive && (this.numberOfStages > 0)) {
                //GainNode (input) -> BiquadFilterNode (allpass) (* 12) -> GainNode (mix) -> GainNode (output)
                this.input.connect(this.filters[0]);

                for (var i = 0; i < this.numberOfStages; i++) {
                    if (i < (this.numberOfStages - 1)) {
                        this.filters[i].connect(this.filters[i + 1]);
                    } else {
                        this.filters[i].connect(this.mix);
                        this.mix.connect(this.output);

                        //Feedback
                        //GainNode (input) -> BiquadFilterNode (allpass) (* 12) -> GainNode (feedback) -> BiquadFilterNode (allpass) (* 12) ...
                        this.filters[i].connect(this.feedback);
                        this.feedback.connect(this.filters[0]);
                    }
                }
            }
        };

        /** @override */
        Phaser.prototype.stop = function(stopTime, releaseTime) {
            //Call superclass method
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            //Effector's state is active ?
            if (this.isActive) {
               //Connect nodes again
               this.lfo.connect(this.depth);

               for (var i = 0; i < this.MAXIMUM_STAGES; i++) {
                   this.depth.connect(this.filters[i].frequency);
               }
            }

            return this;
        };

        /** @override */
        Phaser.prototype.toString = function() {
            return '[SoundModule Phaser]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Flanger(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.delay    = context.createDelay();
            this.mix      = context.createGain();
            this.tone     = context.createBiquadFilter();
            this.feedback = context.createGain();

            //Initialize parameters
            this.delay.delayTime.value = 0;
            this.depth.gain.value      = 0;
            this.rate.value            = 0;
            this.mix.gain.value        = 0;
            this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
            this.tone.frequency.value  = 350;
            this.tone.Q.value          = Math.SQRT1_2;
            this.tone.gain.value       = 0;  //Not used
            this.feedback.gain.value   = 0;
            this.depthRate             = 0;

            //Flanger is not connected by default
            this.state(false);

            //LFO
            //OscillatorNode (LFO) -> GainNode (depth) -> AudioParam (DelayNode.delayTime)
            this.lfo.connect(this.depth);
            this.depth.connect(this.delay.delayTime);
        }

        /** @override */
        Flanger.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'delaytime' :
                    case 'time'      :
                        if (value === undefined) {
                            return this.delay.delayTime.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.delay.delayTime.minValue || 0;
                            var max = this.delay.delayTime.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                //Setter
                                this.delay.delayTime.value = v;
                                this.depth.gain.value      = this.delay.delayTime.value * this.depthRate;
                            }
                        }

                        break;
                    case 'depth' :
                        if (value === undefined) {
                            //Getter
                            return this.depthRate;
                        } else {
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                //Setter
                                this.depth.gain.value = this.delay.delayTime.value * v;
                                this.depthRate        = v;
                            }
                        }

                        break;
                    case 'rate' :
                        if (value === undefined) {
                            return this.rate.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;  //Setter
                            }
                        }

                        break;
                    case 'mix'      :
                    case 'feedback' :
                        if (value === undefined) {
                            return this[k].gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || 0;
                            var max = this[k].gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;  //Setter
                            }
                        }

                        break;
                    case 'tone' :
                        if (value === undefined) {
                            return this.tone.frequency.value; //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.tone.frequency.minValue || 10;
                            var max = this.tone.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this.tone.frequency.value = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Flanger.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.delay.disconnect(0);
            this.mix.disconnect(0);
            this.tone.disconnect(0);
            this.feedback.disconnect(0);

            //GainNode (input) -> GainNode (output)
            this.input.connect(this.output);

            //Effect ON
            if (this.isActive) {
                //GainNode (input) -> BiquadFilterNode (tone) -> DelayNode -> GainNode (mix) -> GainNode (output)
                this.input.connect(this.tone);
                this.tone.connect(this.delay);
                this.delay.connect(this.mix);
                this.mix.connect(this.output);

                //Feedback
                //GainNode (input) -> DelayNode -> GainNode (feedback) -> DelayNode ...
                this.delay.connect(this.feedback);
                this.feedback.connect(this.delay);
            }
        };

        /** @override */
        Flanger.prototype.stop = function(stopTime, releaseTime) {
            //Call superclass method
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            //Effector's state is active ?
            if (this.isActive) {
                //Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.delay.delayTime);
            }

            return this;
        };

        /** @override */
        Flanger.prototype.toString = function() {
            return '[SoundModule Flanger]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Chorus(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.delay    = context.createDelay();
            this.mix      = context.createGain();
            this.tone     = context.createBiquadFilter();
            this.feedback = context.createGain();

            //Initialize parameters
            this.delay.delayTime.value = 0;
            this.depth.gain.value      = 0;
            this.rate.value            = 0;
            this.mix.gain.value        = 0;
            this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
            this.tone.frequency.value  = 350;
            this.tone.Q.value          = Math.SQRT1_2;
            this.tone.gain.value       = 0;  //Not used
            this.feedback.gain.value   = 0;
            this.depthRate             = 0;

            //Chorus is not connected by default
            this.state(false);

            //LFO
            //OscillatorNode (LFO) -> GainNode (depth) -> AudioParam (DelayNode.delayTime)
            this.lfo.connect(this.depth);
            this.depth.connect(this.delay.delayTime);
        }

        /** @override */
        Chorus.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'delaytime' :
                    case 'time'      :
                        if (value === undefined) {
                            return this.delay.delayTime.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.delay.delayTime.minValue || 0;
                            var max = this.delay.delayTime.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                //Setter
                                this.delay.delayTime.value = v;
                                this.depth.gain.value      = this.delay.delayTime.value * this.depthRate;
                            }
                        }

                        break;
                    case 'depth' :
                        if (value === undefined) {
                            //Getter
                            return this.depthRate;
                        } else {
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                //Setter
                                this.depth.gain.value = this.delay.delayTime.value * v;
                                this.depthRate        = v;
                            }
                        }

                        break;
                    case 'rate' :
                        if (value === undefined) {
                            return this.rate.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.rate.minValue || 0;
                            var max = this.rate.maxValue || 100000;

                            if ((v >= min) && (v <= max)) {
                                this.rate.value = v;  //Setter
                            }
                        }

                        break;
                    case 'mix'      :
                    case 'feedback' :
                        if (value === undefined) {
                            return this[k].gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || 0;
                            var max = this[k].gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;  //Setter
                            }
                        }

                        break;
                    case 'tone' :
                        if (value === undefined) {
                            return this.tone.frequency.value; //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.tone.frequency.minValue || 10;
                            var max = this.tone.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this.tone.frequency.value = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Chorus.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.delay.disconnect(0);
            this.mix.disconnect(0);
            this.tone.disconnect(0);
            this.feedback.disconnect(0);

            //GainNode (input) -> GainNode (output)
            this.input.connect(this.output);

            //Effect ON
            if (this.isActive) {
                //GainNode (input) -> BiquadFilterNode (tone) -> DelayNode -> GainNode (mix) -> GainNode (output)
                this.input.connect(this.tone);
                this.tone.connect(this.delay);
                this.delay.connect(this.mix);
                this.mix.connect(this.output);

                //Feedback
                //GainNode (input) -> DelayNode -> GainNode (feedback) -> DelayNode ...
                this.delay.connect(this.feedback);
                this.feedback.connect(this.delay);
            }
        };

        /** @override */
        Chorus.prototype.stop = function(stopTime, releaseTime) {
            //Call superclass method
            Effector.prototype.stop.call(this, stopTime, releaseTime);

            //Effector's state is active ?
            if (this.isActive) {
                //Connect nodes again
                this.lfo.connect(this.depth);
                this.depth.connect(this.delay.delayTime);
            }

            return this;
        };

        /** @override */
        Chorus.prototype.toString = function() {
            return '[SoundModule Chorus]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Delay(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            //Max delay time is 5000 [ms]
            this.MAX_DELAY_TIME = 5;

            this.delay    = context.createDelay(this.MAX_DELAY_TIME);
            this.dry      = context.createGain();
            this.wet      = context.createGain();
            this.tone     = context.createBiquadFilter();
            this.feedback = context.createGain();

            //Initialize parameters
            this.delay.delayTime.value = 0;
            this.dry.gain.value        = 1;
            this.wet.gain.value        = 0;
            this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
            this.tone.frequency.value  = 350;
            this.tone.Q.value          = Math.SQRT1_2;
            this.tone.gain.value       = 0;  //Not used
            this.feedback.gain.value   = 0;

            //Delay is not connected by default
            this.state(false);
        };

        /** @override */
        Delay.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'delaytime' :
                    case 'time'      :
                        if (value === undefined) {
                            return this.delay.delayTime.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.delay.delayTime.minValue || 0;
                            var max = this.delay.delayTime.maxValue || this.MAX_DELAY_TIME;

                            if ((v >= min) && (v <= max)) {
                                this.delay.delayTime.value = v;  //Setter
                            }
                        }

                        break;
                    case 'dry'      :
                    case 'wet'      :
                    case 'feedback' :
                        if (value === undefined) {
                            return this[k].gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || 0;
                            var max = this[k].gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;  //Setter
                            }
                        }

                        break;
                    case 'tone' :
                        if (value === undefined) {
                            return this.tone.frequency.value; //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.tone.frequency.minValue || 10;
                            var max = this.tone.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this.tone.frequency.value = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Delay.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.delay.disconnect(0);
            this.dry.disconnect(0);
            this.wet.disconnect(0);
            this.tone.disconnect(0);
            this.feedback.disconnect(0);

            if (this.isActive) {
                //Effect ON

                //GainNode (input) -> GainNode (dry) -> GainNode (output)
                this.input.connect(this.dry);
                this.dry.connect(this.output);

                //(GainNode (input)) -> BiquadFilterNode (tone) -> DelayNode -> GainNode (wet) -> GainNode (output)
                this.input.connect(this.tone);
                this.tone.connect(this.delay);
                this.delay.connect(this.wet);
                this.wet.connect(this.output);

                //Feedback
                //GainNode (input) -> DelayNode -> GainNode (feedback) -> DelayNode ...
                this.delay.connect(this.feedback);
                this.feedback.connect(this.delay);
            } else {
                //Effect OFF

                //GainNode (input) -> GainNode (output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Delay.prototype.toString = function() {
            return '[SoundModule Delay]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number|AudioBuffer} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Reverb(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.rirs      = [];
            this.convolver = context.createConvolver();
            this.dry       = context.createGain();
            this.wet       = context.createGain();
            this.tone     = context.createBiquadFilter();

            //Callback for create the instance of AudioBuffer
            this.decodeAudioData = function(impulse, successCallback, errorCallback) {
                context.decodeAudioData(impulse, successCallback, errorCallback);
            };

            //Initialize parameters
            this.dry.gain.value        = 1;
            this.wet.gain.value        = 0;
            this.tone.type             = (Object.prototype.toString.call(this.tone.type) === '[object String]') ? 'lowpass' : (this.tone.LOWPASS || 0);
            this.tone.frequency.value  = 350;
            this.tone.Q.value          = Math.SQRT1_2;
            this.tone.gain.value       = 0;  //Not used

            //Reverb is not connected by default
            this.state(false);
        }

        /** @override */
        Reverb.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'type' :
                        if (value === undefined) {
                            return this.convolver.buffer;  //Getter
                        } else {
                            var v   = parseInt(value);
                            var min = 0;
                            var max = this.rirs.length - 1;

                            if (value === null) {
                                this.convolver.buffer = null;  //Setter

                                //If "buffer" in ConvolverNode is null after set the instance of AudioBuffer, Reverb is not OFF.
                                //Thefore, Reverb is OFF by disconnecting nodes.
                                this.input.disconnect(0);
                                this.input.connect(this.output);
                            } else if ((v >= min) && (v <= max)) {
                                this.convolver.buffer = this.rirs[v];  //Setter
                                this.connect();
                            }
                        }

                        break;
                    case 'dry' :
                    case 'wet' :
                        if (value === undefined) {
                            return this[k].gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this[k].gain.minValue || 0;
                            var max = this[k].gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this[k].gain.value = v;  //Setter
                            }
                        }

                        break;
                    case 'tone' :
                        if (value === undefined) {
                            return this.tone.frequency.value; //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.tone.frequency.minValue || 10;
                            var max = this.tone.frequency.maxValue || (this.context.sampleRate / 2);

                            if ((v >= min) && (v <= max)) {
                                this.tone.frequency.value = v;  //Setter
                            }
                        }

                        break;
                    case 'rirs' :
                        return this.rirs;  //Getter only
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Reverb.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.convolver.disconnect(0);
            this.dry.disconnect(0);
            this.wet.disconnect(0);
            this.tone.disconnect(0);

            if (this.isActive) {
                //Effect ON

                //GainNode (input) -> GainNode (dry) -> GainNode (output)
                this.input.connect(this.dry);
                this.dry.connect(this.output);

                //GainNode (input) -> ConvolverNode -> GainNode (mix) -> GainNode (output)
                this.input.connect(this.tone);
                this.tone.connect(this.convolver);
                this.convolver.connect(this.wet);
                this.wet.connect(this.output);
            } else {
                //Effect OFF

                //GainNode (input) -> GainNode (output)
                this.input.connect(this.output);
            }
        };

        /** 
         * This method sets instance of AudioBuffer to ConvolverNode.
         * @param {AudioBuffer|ArrayBuffer} impulse This argument is in order to convolve impulse response.
         *     This argument is the instance of AudioBuffer or ArrayBuffer for impulse response.
         * @param {function} errorCallback This argument is in order to be executed when error occurs.
         * @return {Reverb} This is returned for method chain.
         * @override
         */
        Reverb.prototype.start = function(impulse, errorCallback) {
            if ((impulse instanceof AudioBuffer) || (impulse === null)) {
                this.convolver.buffer = impulse;  //Set the instance of AudioBuffer
                this.rirs.push(impulse);          //Add to preset
            } else if (impulse instanceof ArrayBuffer) {
                var self = this;

                var successCallback = function(buffer) {
                    self.convolver.buffer = buffer;  //Set the instance of AudioBuffer
                    self.rirs.push(buffer);          //Add to preset
                };

                if (Object.prototype.toString.call(errorCallback) !== '[object Function]') {
                    errorCallback = function() {};
                }

                //Asynchronously
                this.decodeAudioData(impulse, successCallback, errorCallback);
            }

            return this;
        };

        /** 
         * This method creates the instances of AudioBuffer by Ajax for Revreb presets
         * @param {Array.<string>|Array.<AudioBuffer>} rirs This argument is either URLs or the instances of AudioBuffer for Impulse Response.
         * @param {number} timeout This argument is timeout of Ajax. The default value is 60000 msec (1 minutes).
         * @param {function} successCallback This argument is executed when the creating AudioBuffers was completed.
         * @param {function} errorCallback This argument is executed on error.
         * @param {function} progressCallback This argument is executed during receiving audio data.
         * @return {OneshotModule} This is returned for method chain.
         * @override
         */
        Reverb.prototype.preset = function(rirs, timeout, successCallback, errorCallback, progressCallback) {
            //The argument is associative array ?
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

            //for errorCallback
            var ERROR_AJAX         = 'error';
            var ERROR_AJAX_TIMEOUT = 'timeout';
            var ERROR_DECODE       = 'decode';

            //If the error is at least 1, this method aborts the all of connections.
            //Therefore, this flag are shared with the all instances of XMLHttpRequest.
            var isError = false;

            var t = parseInt(timeout);

            var self = this;

            //Get ArrayBuffer by Ajax -> Create the instances of AudioBuffer
            var load = function(url, index) {
                var xhr = new XMLHttpRequest();

                if ((FULL_MODE === undefined) || FULL_MODE) {
                    //XMLHttpRequest Level 2
                    xhr.responseType = 'arraybuffer';
                } else {
                    xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }

                //Timeout
                xhr.timeout = (t > 0) ? t : 60000;

                xhr.ontimeout = function(event) {
                    if (!isError && (Object.prototype.toString.call(errorCallback) === '[object Function]')) {
                        errorCallback(event, ERROR_AJAX_TIMEOUT);
                    }

                    isError = true;
                };

                //Progress
                xhr.onprogresss = function(event) {
                    if (isError) {
                        xhr.abort();
                    } else if (Object.prototype.toString.call(progressCallback) === '[object Function]') {
                        progressCallback(event);
                    }
                };

                //Error
                xhr.onerror = function(event) {
                    if (!isError && (Object.prototype.toString.call(errorCallback) === '[object Function]')) {
                        errorCallback(event, ERROR_AJAX);
                    }

                    isError = true;
                };

                //Success
                xhr.onload = function(event) {
                    if (xhr.status === 200) {
                        var arrayBuffer = null;

                        var decodeArrayBuffer = function(arrayBuffer) {
                            if (!(arrayBuffer instanceof ArrayBuffer)) {
                                return;
                            }

                            var decodeSuccessCallback = function(audioBuffer) {
                                self.rirs[index] = audioBuffer;  //Save instance of AudioBuffer

                                //The creating the instances of AudioBuffer has completed ?
                                for (var i = 0, len = self.rirs.length; i < len; i++) {
                                    if (self.rirs[i] === undefined) {
                                        return;
                                    }
                                }

                                if (Object.prototype.toString.call(successCallback) === '[object Function]') {
                                    successCallback.call(self, event, self.rirs);
                                }
                            };

                            var decodeErrorCallback = function() {
                                if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                                    errorCallback(null, ERROR_DECODE);
                                }
                            };

                            //Create instance of AudioBuffer (Asynchronously)
                            self.context.decodeAudioData(arrayBuffer, decodeSuccessCallback, decodeErrorCallback);
                        };

                        if ((FULL_MODE === undefined) || FULL_MODE) {
                            arrayBuffer = xhr.response;
                            decodeArrayBuffer.call(self, arrayBuffer);
                        } else {
                            var binary = xhr.responseText;
                            var buffer = [];

                            for (var i = 0, len = binary.length; i < len; i++) {
                                buffer.push(binary.charCodeAt(i) & 0xFF);
                            }

                            var ext    = url.slice(-3);
                            var mime   = 'audio/' + ext;
                            var blob   = new Blob([new Uint8Array(buffer)], {type : mime});
                            var reader = new FileReader();

                            reader.readAsArrayBuffer(blob);

                            reader.onerror = function(event) {
                                if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                                    var error = '';

                                    switch (reader.error.code) {
                                        case reader.error.NOT_FOUND_ERR    : error = 'NOT_FOUND_ERR';    break;
                                        case reader.error.SECURITY_ERR     : error = 'SECURITY_ERR';     break;
                                        case reader.error.ABORT_ERR        : error = 'ABORT_ERR';        break;
                                        case reader.error.NOT_READABLE_ERR : error = 'NOT_READABLE_ERR'; break;
                                        case reader.error.ENCODING_ERR     : error = 'ENCODING_ERR' ;    break;
                                        default                            : error = 'ERR';              break;
                                    }

                                    errorCallback(event, error);
                                }
                            };

                            reader.onload = function() {
                                arrayBuffer = reader.result;
                                decodeArrayBuffer.call(self, arrayBuffer);
                            };
                        }
                    }
                };

                xhr.open('GET', url, true);
                xhr.send(null);
            };

            for (var i = 0, len = rirs.length; i < len; i++) {
                if (Object.prototype.toString.call(rirs[i]) === '[object String]') {
                    //Get the instances of AudioBuffer from the designated URLs.
                    load.call(this, rirs[i], i);
                } else if (rirs[i] instanceof AudioBuffer) {
                    //Get the instances of AudioBuffer directly
                    this.rirs[i] = rirs[i];
                }
            }

            return this;
        };

        /** @override */
        Reverb.prototype.state = function(value) {
            if (value === undefined) {
                return this.isActive;  //Getter
            } else if (String(value).toLowerCase() === 'toggle') {
                this.isActive = !this.isActive;  //Setter
            } else {
                this.isActive = Boolean(value);  //Setter
            }

            //In the case of setter

            //Change connection
            this.connect();

            return this;
        };

        /** @override */
        Reverb.prototype.toString = function() {
            return '[SoundModule Reverb]';
        };

        /** 
         * Subclass
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
         * @constructor
         * @extends {Effector}
         */
        function Panner(context, bufferSize) {
            //Call superclass constructor
            Effector.call(this, context, bufferSize);

            this.panner = context.createPanner();

            this.positions    = {x : 0, y : 0, z : 0};
            this.orientations = {x : 1, y : 0, z : 0};
            this.velocities   = {x : 0, y : 0, z : 0};

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

            //Panner is not connected by default
            this.state(false);
        }

        /** @override */
        Panner.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'x' :
                    case 'y' :
                    case 'z' :
                        if (value === undefined) {
                            return this.positions[k];  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                //Setter
                                this.positions[k] = v;
                                this.panner.setPosition(this.positions.x, this.positions.y, this.positions.z);
                            }
                        }

                        break;
                    case 'ox' :
                    case 'oy' :
                    case 'oz' :
                        if (value === undefined) {
                            return this.orientations[k.charAt(1)];  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                //Setter
                                this.orientations[k.charAt(1)] = v;
                                this.panner.setOrientation(this.orientations.x, this.orientations.y, this.orientations.z);
                            }
                        }

                        break;
                    case 'vx' :
                    case 'vy' :
                    case 'vz' :
                        if (value === undefined) {
                            return this.velocities[k.charAt(1)];  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                //Setter
                                this.velocities[k.charAt(1)] = v;
                                this.panner.setVelocity(this.velocities.x, this.velocities.y, this.velocities.z);
                            }
                        }

                        break;
                    case 'refdistance' :
                        if (value === undefined) {
                            return this.panner.refDistance;  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.refDistance = v;  //Setter
                            }
                        }

                        break;
                    case 'maxdistance' :
                        if (value === undefined) {
                            return this.panner.maxDistance;  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.maxDistance = v;  //Setter
                            }
                        }

                        break;
                    case 'rollofffactor' :
                        if (value === undefined) {
                            return this.panner.rolloffFactor;  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.rolloffFactor = v;  //Setter
                            }
                        }

                        break;
                    case 'coneinnerangle' :
                        if (value === undefined) {
                            return this.panner.coneInnerAngle;  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.coneInnerAngle = v;  //Setter
                            }
                        }

                        break;
                    case 'coneouterangle' :
                        if (value === undefined) {
                            return this.panner.coneOuterAngle;  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.coneOuterAngle = v;  //Setter
                            }
                        }

                        break;
                    case 'coneoutergain' :
                        if (value === undefined) {
                            return this.panner.coneOuterGain;  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (!isNaN(v)) {
                                this.panner.coneOuterGain = v;  //Setter
                            }
                        }

                        break;
                    case 'panningmodel' :
                        if (value === undefined) {
                            return this.panner.panningModel;  //Getter
                        } else {
                            var v = /HRTF/i.test(value) ? String(value).toUpperCase() : String(value).toLowerCase();

                            var MODELS = {
                                equalpower : this.panner.EQUALPOWER || 0,
                                HRTF       : this.panner.HRTF       || 1
                            };

                            if (v in MODELS) {
                                this.panner.panningModel = (Object.prototype.toString.call(this.panner.panningModel) === '[object String]') ? v : MODELS[v];  //Setter
                            }
                        }

                        break;
                    case 'distancemodel' :
                        if (value === undefined) {
                            return this.panner.distanceModel;  //Setter
                        } else {
                            var v = String(value).replace(/-/g, '').toLowerCase();

                            var MODELS = {
                                linear      : this.panner.LINEAR_DISTANCE      || 0,
                                inverse     : this.panner.INVERSE_DISTANCE     || 1,
                                exponential : this.panner.EXPONENTIAL_DISTANCE || 2
                            };

                            if (v in MODELS) {
                                this.panner.distanceModel = (Object.prototype.toString.call(this.panner.distanceModel) === '[object String]') ? v : MODELS[v];  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** @override */
        Panner.prototype.connect = function() {
            //Clear connection
            this.input.disconnect(0);
            this.panner.disconnect(0);

            if (this.isActive) {
                //Effect ON

                //GainNode (input) -> PannerNode -> GainNode (output)
                this.input.connect(this.panner);
                this.panner.connect(this.output);
            } else {
                //Effect OFF

                //GainNode (input) -> GainNode (output)
                this.input.connect(this.output);
            }
        };

        /** @override */
        Panner.prototype.toString = function() {
            return '[SoundModule Panner]';
        };

        /** 
         * This private class defines properties for Envelope Generator.
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @constructor
         */
        function EnvelopeGenerator(context) {
            this.context   = context;

            //{@type Array.<GainNode>}
            this.generators = [];

            //for GainNode
            this.activeIndexes = [];
            this.activeCounter = 0;

            this.attack  = 0.01;
            this.decay   = 0.3;
            this.sustain = 0.5;
            this.release = 1.0;
        }

        /** 
         * This method is getter or setter for parameters
         * @param {string|object} key This argument is property name in the case of string type.
         *     This argument is pair of property and value in the case of associative array.
         * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
         * @return {number|EnvelopeGenerator} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
         */
        EnvelopeGenerator.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'attack'  :
                    case 'decay'   :
                    case 'sustain' :
                    case 'release' :
                        if (value === undefined) {
                            return this[k];  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (v >= 0) {
                                this[k] = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** 
         * This method determines whether the all of gain schedulings have ended.
         * @return {boolean} If the all of gain schedulings have ended, this value is true. Otherwise, this value is false.
         */
        EnvelopeGenerator.prototype.isStop = function() {
            var MIN_GAIN = 1e-3;
            var counter  = 0;

            for (var i = 0, len = this.activeIndexes.length; i < len; i++) {
                var activeIndex = this.activeIndexes[i];

                if (activeIndex === undefined) {
                    continue;
                }

                if (this.generators[activeIndex].gain.value > MIN_GAIN) {
                    return false;
                } else {
                    counter++;

                    //the all of schedulings are stopped ?
                    if (counter === this.activeCounter) {
                        return true;
                    }
                }
            }
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

            //Attack -> Decay -> Sustain
            var t0      = s;
            var t1      = t0 + this.attack;
            var t2      = this.decay;
            var t2Value = this.sustain;

            for (var i = 0, len = this.activeIndexes.length; i < len; i++) {
                var activeIndex = this.activeIndexes[i];

                if (activeIndex === undefined) {
                    continue;
                }

                //Start from gain.value = 0
                this.generators[activeIndex].gain.cancelScheduledValues(t0);
                this.generators[activeIndex].gain.setValueAtTime(0, t0);

                //Attack : gain.value increases linearly until assigned time (t1)
                this.generators[activeIndex].gain.linearRampToValueAtTime(1, t1);

                //Decay -> Sustain : gain.value gradually decreases to value of sustain during of Decay time (t2) from assigned time (t1)
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

            //Sustain -> Release
            var t3 = s;
            var t4 = this.release;

            for (var i = 0, len = this.activeIndexes.length; i < len; i++) {
                var activeIndex = this.activeIndexes[i];

                if (activeIndex === undefined) {
                    continue;
                }

                //in the case of mouseup on the way of Decay
                this.generators[activeIndex].gain.cancelScheduledValues(t3);
                this.generators[activeIndex].gain.setValueAtTime(this.generators[activeIndex].gain.value, t3);

                //Release : gain.value gradually decreases to 0 during of Release time (t4) from assigned time (t3)
                this.generators[activeIndex].gain.setTargetAtTime(0, t3, t4);
            }

            return this;
        };

        /** 
         * This method clears variables for managing the instance of GainNode.
         * @return {EnvelopeGenerator} This is returned for method chain.
         */
        EnvelopeGenerator.prototype.clear = function() {
            this.activeIndexes = [];
            this.activeCounter = 0;

            return this;
        };

        /** @override */
        EnvelopeGenerator.prototype.toString = function() {
            return '[OscillatorModule EnvelopeGenerator]';
        };

        //Create the instances of private class

        this.listener = new Listener(context);
        this.analyser = new Analyser(context);
        this.recorder = new Recorder(context, this.BUFFER_SIZE, this.NUM_INPUT, this.NUM_OUTPUT);
        this.session  = new Session(context, this.BUFFER_SIZE, this.NUM_INPUT, this.NUM_OUTPUT, this.analyser);

        //for OscillatorModule, OneshotModule
        this.eg = new EnvelopeGenerator(context);

        //Create the instances of Effector's subclass
        this.compressor    = new Compressor(context, this.BUFFER_SIZE);
        this.distortion    = new Distortion(context, this.BUFFER_SIZE);
        this.wah           = new Wah(context, this.BUFFER_SIZE);
        this.equalizer     = new Equalizer(context, this.BUFFER_SIZE);
        this.filter        = new Filter(context, this.BUFFER_SIZE);
        this.tremolo       = new Tremolo(context, this.BUFFER_SIZE);
        this.ringmodulator = new Ringmodulator(context, this.BUFFER_SIZE);
        this.autopanner    = new Autopanner(context, this.BUFFER_SIZE);
        this.phaser        = new Phaser(context, this.BUFFER_SIZE);
        this.flanger       = new Flanger(context, this.BUFFER_SIZE);
        this.chorus        = new Chorus(context, this.BUFFER_SIZE);
        this.delay         = new Delay(context, this.BUFFER_SIZE);
        this.reverb        = new Reverb(context, this.BUFFER_SIZE);
        this.panner        = new Panner(context, this.BUFFER_SIZE);

        //The default order for connection
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

    /** @abstract */
    SoundModule.prototype.setup = function() {
    };

    /** 
     * This method is getter or setter for parameters
     * @param {string} key This argument is property name.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     */
    SoundModule.prototype.param = function(key, value) {
        var k = String(key).replace(/-/g, '').toLowerCase();

        switch (k) {
            case 'mastervolume' :
                if (value === undefined) {
                    return this.masterVolume.gain.value;  //Getter
                } else {
                    var v   = parseFloat(value);
                    var min = this.masterVolume.gain.minValue || 0;
                    var max = this.masterVolume.gain.maxValue || 1;

                    if ((v >= min) && (v <= max)) {
                        this.masterVolume.gain.value = v;  //Setter
                    }
                }

                break;
            default :
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
     * This method changes buffer size for ScriptProcessorNode and executes constructor again.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     *     This value is one of 256, 512, 1024, 2048, 4096, 8192, 16384.
     * @return {SoundModule} This is returned for method chain.
     */
    SoundModule.prototype.resize = function(bufferSize) {
        SoundModule.call(this, audiocontext, bufferSize);
        return this;
    };

    /** 
     * This method connects nodes that are defined by this library and Web Audio API.
     * @param {AudioNode} source This argument is AudioNode for input of sound.
     * @param {Array.<Effector>} connects This argument is array for changing the default connection.
     * @return {SoundModule} This is returned for method chain.
     */
    SoundModule.prototype.connect = function(source, connects) {
        //Customize connection ?
        if (Array.isArray(connects)) {
            this.modules = connects;
        }

        //Start connection
        //source -> node -> ... -> node -> GainNode (masterVolume) -> AnalyserNode (analyser) -> AudioDestinationNode (output)
        source.disconnect(0);  //Clear connection

        if (this.modules.length > 0) {
            source.connect(this.modules[0].input);
        } else {
            source.connect(this.masterVolume);
        }

        for (var i = 0, len = this.modules.length; i < len; i++) {
            //Clear connection
            this.modules[i].output.disconnect(0);

            if (i < (this.modules.length - 1)) {
                //Connect to next node
                this.modules[i].output.connect(this.modules[i + 1].input);
            } else {
                this.modules[i].output.connect(this.masterVolume);
            }
        }

        this.masterVolume.connect(this.analyser.input);
        this.analyser.output.connect(this.context.destination);

        //for recording
        this.masterVolume.connect(this.recorder.processor);
        this.recorder.processor.connect(this.context.destination);

        //for session
        this.masterVolume.connect(this.session.sender);
        this.session.sender.connect(this.context.destination);

        return this;
    };

    /** 
     * This method gets the instance of module that is defined by this library. This method enables to access the instance of module by unified call.
     * @param {string} module This argument is module's name.
     * @return {Listener|Analyser|Recorder|Session|Effector|EnvelopeGenerator|Glide|VocalCanceler} This value is the instance of module.
     */
    SoundModule.prototype.module = function(module) {
        var m = String(module).replace(/-/g, '').toLowerCase();

        switch (m) {
            case 'listener'      :
            case 'analyser'      :
            case 'recorder'      :
            case 'session'       :
            case 'compressor'    :
            case 'distortion'    :
            case 'wah'           :
            case 'equalizer'     :
            case 'filter'        :
            case 'tremolo'       :
            case 'ringmodulator' :
            case 'autopanner'    :
            case 'phaser'        :
            case 'flanger'       :
            case 'chorus'        :
            case 'delay'         :
            case 'reverb'        :
            case 'panner'        :
                return this[m];
            case 'eg' :
                if (m in this) {
                    return this[m];  //OscillatorModule, OneshotModule
                }

                //No break;
            case 'glide' :
                if (m in this) {
                    return this[m];  //OscillatorModule
                }

                //No break;
            case 'vocalcanceler' :
                if (m in this) {
                    return this[m];  //AudioModule, MediaModule
                }

                //No break;
            default :
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
        //this.filter.stop(s);

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
            CustomizedEffector.prototype = new this.Effector(audiocontext, this.BUFFER_SIZE);
            this.plugins.push({name : String(effector).toLowerCase(), plugin : new CustomizedEffector(audiocontext)});
        }

        return this;
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
        //Call superclass constructor
        SoundModule.call(this, context);

        /** @type {Array.<Oscillator>} */
        this.sources = [];

        //for scheduling
        this.times = {
            start : 0,
            stop  : 0
        };

        //This flag determines whether drawing sound wave is executing
        this.isAnalyser = false;

        //Create the instances of private class
        this.glide = new Glide(context);

        /** 
         * This private class defines properties for Glide.
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @constructor
         */
        function Glide(context) {
            this.context = context;

            this.frequencies = {
                start : -1,  //Abnormal value for the 1st sound
                end   : 0
            };

            this.rate = 0;
            this.time = 0;         //Glide time
            this.type = 'linear';  //'linear' or 'exponential'
        };

        /** 
         * This method is getter or setter for parameters
         * @param {string|object} key This argument is property name in the case of string type.
         *     This argument is pair of property and value in the case of associative array.
         * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
         * @return {number|Glide} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
         */
        Glide.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'time' :
                        if (value === undefined) {
                            return this.time;  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (v >= 0) {
                                this.time = v;  //Setter
                            }
                        }

                        break;
                    case 'type' :
                        if (value === undefined) {
                            return this.type;  //Getter
                        } else {
                            var v = String(value).toLowerCase();

                            if ((v === 'linear') || (v === 'exponential')) {
                                this.type = v;  //Setter
                            }
                        }

                        break;
                    default :
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
                //The 1st sound or Glide OFF or The same sound
                this.frequencies.start = this.frequencies.end;
            } else {
                //Since the 2nd sound
                this.rate = diff / this.time;
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

            //Start Glide
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
            //Stop Glide or on the way of Glide
            this.frequencies.start = this.frequencies.end;
            return this;
        };

        /** @override */
        Glide.prototype.toString = function() {
            return '[OscillatorModule Glide]';
        };
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
        /** @implements {Statable} */
        Oscillator.prototype = Object.create(Statable.prototype);
        Oscillator.prototype.constructor = Oscillator;

        /** 
         * This private class defines properties for the instance of OscillatorNode.
         * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
         * @param {boolean} state This argument is initial state.
         * @constructor
         * @implements {Statable}
         */
        function Oscillator(context, state) {
            //Call interface constructor
            Statable.call(this);

            this.isActive = state;

            //for creating instance of OscillatorNode again
            this.context = context;

            //Create the instance of OscillatorNode
            this.source = context.createOscillator();

            //for legacy browsers
            this.source.setPeriodicWave = this.source.setPeriodicWave || this.source.setWaveTable;
            this.source.start           = this.source.start           || this.source.noteOn;
            this.source.stop            = this.source.stop            || this.source.noteOff;

            this.volume = context.createGain();

            //in order to not call in duplicate "start" or "stop"  method in the instance of OscillatorNode
            this.isStop = true;

            this.octave  = 0;
            this.fine    = 0;
            this.customs = {
                real : new Float32Array([0, 1]),
                imag : new Float32Array([0, 1])
            };
        };

        /** 
         * This method is getter or setter for parameters
         * @param {string|object} key This argument is property name in the case of string type.
         *     This argument is pair of property and value in the case of associative array.
         * @param {number|string} value This argument is the value of designated property. If this argument is omitted, This method is getter.
         * @return {number|Oscillator} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
         */
        Oscillator.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                var OCTAVE = 1200;  //1 Octave = 1200 cent

                switch (k) {
                    case 'type' :
                        if (value === undefined) {
                            return this.source.type;  //Getter
                        } else {
                            if (Object.prototype.toString.call(value) !== '[object Object]') {
                                var v = String(value).toLowerCase();

                                this.source.SINE     = this.source.SINE     || 0;
                                this.source.SQUARE   = this.source.SQUARE   || 1;
                                this.source.SAWTOOTH = this.source.SAWTOOTH || 2;
                                this.source.TRIANGLE = this.source.TRIANGLE || 3;

                                //for legacy browsers
                                var WAVE_TYPE = {
                                    sine     : this.source.SINE,
                                    square   : this.source.SQUARE,
                                    sawtooth : this.source.SAWTOOTH,
                                    triangle : this.source.TRIANGLE
                                };

                                if (v in WAVE_TYPE) {
                                    this.source.type = (Object.prototype.toString.call(this.source.type) === '[object String]') ? v : WAVE_TYPE[v];  //Setter
                                }
                            } else {
                                //Custom wave
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
                                        var MAX_SIZE = 4096;  //This size is defined by specification
                    
                                        if (reals.length > MAX_SIZE) {reals = reals.subarray(0, MAX_SIZE);}
                                        if (imags.length > MAX_SIZE) {imags = imags.subarray(0, MAX_SIZE);}

                                        //The 1st value is fixed by 0 (This is is defined by specification)
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
                    case 'octave' :
                        if (value === undefined) {
                            return this.octave;  //Getter
                        } else {
                            var v   = this.octave = parseFloat(value);
                            var min = (this.source.detune.minValue || -4800) / OCTAVE;
                            var max = (this.source.detune.maxValue ||  4800) / OCTAVE;

                            if ((v >= min) && (v <= max)) {
                                this.source.detune.value = this.fine + (v * OCTAVE);  //Setter
                            }
                        }

                        break;
                    case 'fine' :
                        if (value === undefined) {
                            return this.fine;
                        } else {
                            var v   = this.fine = parseFloat(value);
                            var min = -OCTAVE;
                            var max =  OCTAVE;

                            if ((v >= min) && (v <= max)) {
                                this.source.detune.value = v + (this.octave * OCTAVE);  //Setter
                            }
                        }

                        break;
                    case 'volume' :
                    case 'gain'   :
                        if (value === undefined) {
                            return this.volume.gain.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.volume.gain.minValue || 0;
                            var max = this.volume.gain.maxValue || 1;

                            if ((v >= min) && (v <= max)) {
                                this.volume.gain.value = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }

            return this;
        };

        /** 
         * This method starts sound.
         * @param {AudioNode} output This argument is the instance of AudioNode as output.
         * @param {number} startTime This argument is the start time.
         * @return {Oscillator} This is returned for method chain.
         */
        Oscillator.prototype.start = function(output, startTime) {
            if (this.isActive) {
                //for keeping value
                var params = {
                    type      : this.source.type,
                    frequency : this.source.frequency.value,
                    detune    : this.source.detune.value
                };

                if (!this.isStop) {
                    this.source.stop(this.context.currentTime);
                    this.source.disconnect(0);
                }

                this.source = this.context.createOscillator();

                //for legacy browsers
                this.source.setPeriodicWave = this.source.setPeriodicWave || this.source.setWaveTable;
                this.source.start           = this.source.start           || this.source.noteOn;
                this.source.stop            = this.source.stop            || this.source.noteOff;

                if (params.type === 'custom') {
                    //Custom wave
                    var reals        = this.customs.real;
                    var imags        = this.customs.imag;
                    var periodicWave = this.context.createPeriodicWave(reals, imags);

                    this.source.setPeriodicWave(periodicWave);
                } else {
                    this.source.type = params.type;
                }

                this.source.frequency.value = params.frequency;
                this.source.detune.value    = params.detune;

                //OscillatorNode (input) -> EnvelopeGenerator -> GainNode (volume)
                //    -> ScriptProcessorNode (composite oscillators) (-> ... -> AudioDestinationNode (output))
                this.volume.connect(output);

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
        Oscillator.prototype.state = function(value) {
            if (value === undefined) {
                return this.isActive;  //Getter
            } else if (String(value).toLowerCase() === 'toggle') {
                this.isActive = !this.isActive;  //Setter
            } else {
                this.isActive = Boolean(value);  //Setter
            }

            //In the case of setter
            return this;
        };

        /** @override */
        Oscillator.prototype.toString = function() {
            return '[OscillatorModule Oscillator]';
        };

        if (!Array.isArray(states)) {
            states = [states];
        }

        //Create the instances of private class and the instances of GainNode for Envelope Generator
        for (var i = 0, len = states.length ; i < len; i++) {
            this.sources[i]       = new Oscillator(this.context, Boolean(states[i]));
            this.eg.generators[i] = this.context.createGain();

            //for legacy browsers
            this.eg.generators[i].gain.setTargetAtTime = this.eg.generators[i].gain.setTargetAtTime || this.eg.generators[i].gain.setTargetValueAtTime;
        }

        return this;
    };

    /** 
     * This method is getter or setter for parameters
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|OscillatorModule} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     * @override
     */
    OscillatorModule.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            //Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            //Call superclass method
            var r = SoundModule.prototype.param.call(this, k, value);
        }

        return (r === undefined) ? this : r;
    };

    /** 
     * This method schedules the start and stop time.
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

        return this;
    };

    /** 
     * This method starts some sounds that are active at the same.
     * @param {Array.<number>}|number} frequencies This argument each oscillator frequency. The default value is 0 Hz.
     * @param {Array.<Effector>} connects This argument is array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {OscillatorModule} This is returned for method chain.
     * @override
     */
    OscillatorModule.prototype.start = function(frequencies, connects, processCallback) {
        var startTime = this.context.currentTime + this.times.start;

        //Validate the 1st argument
        if (!Array.isArray(frequencies)) {
            frequencies = [frequencies];
        }

        for (var i = 0, len = frequencies.length; i < len; i++) {
            var f = parseFloat(frequencies[i]);
            frequencies[i] = (f >= 0) ? f : 0;
        }

        //Clear previous
        this.eg.clear();
        this.processor.disconnect(0);
        this.processor.onaudioprocess = null;  //for Firefox

        //(... ->) ScriptProcessorNode (composite oscillators) -> ... -> AudioDestinationNode (output)
        this.connect(this.processor, connects);

        for (var i = 0, len = frequencies.length; i < len; i++) {
            if (i >= this.sources.length) {
                break;
            }

            var oscillator = this.sources[i];
            var frequency  = frequencies[i];

            //Start sound
            oscillator.start(this.processor, startTime);

            //OscillatorNode (input) -> EnvelopeGenerator -> GainNode (volume) (-> ...)
            this.eg.ready(i, oscillator.source, oscillator.volume);

            //Ready Glide -> Start Glide
            this.glide.ready(frequency).start(oscillator.source, startTime);
        }

        //Attack -> Decay -> Sustain
        this.eg.start(startTime);

        //Start Effectors
        this.on(startTime);

        //Draw sound wave
        if (!this.isAnalyser) {
            this.analyser.start('time');
            this.analyser.start('fft');
            this.isAnalyser = true;
        }

        //In the case of scheduling stop time
        var duration = this.times.stop - this.times.start;

        if (duration > 0) {
            var self = this;

            global.setTimeout(function() {
                self.stop(processCallback);
            }, (duration * 1000));
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

        //Attack or Decay or Sustain -> Release
        this.eg.stop(stopTime);

        //Stop Effectors
        this.glide.stop();
        this.filter.stop(stopTime);

        for (var i = 0, len = this.plugins.length; i < len; i++) {
            this.plugins[i].plugin.stop(stopTime, this.eg.release);
        }

        var self = this;

        if (!((FULL_MODE === undefined) || FULL_MODE)) {
            global.setTimeout(function() {
                var stopTime = self.context.currentTime;

                for (var i = 0, len = self.sources.length; i < len; i++) {
                    self.sources[i].stop(stopTime);
                }

                //Stop Effectors
                self.off(stopTime);

                //Stop drawing sound wave
                self.analyser.stop('time');
                self.analyser.stop('fft');
                self.isAnalyser = false;

                //Stop onaudioprocess event
                self.processor.disconnect(0);
                self.processor.onaudioprocess = null;  //for Firefox
            }, ((this.times.stop + this.eg.release) * 1000));
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

                //Stop ?
                if (self.eg.isStop()) {
                    //Stop
                    var stopTime = self.context.currentTime;

                    for (var i = 0, len = self.sources.length; i < len; i++) {
                        self.sources[i].stop(stopTime);
                    }

                    //Stop Effectors
                    self.off(stopTime);

                    //Stop drawing sound wave
                    self.analyser.stop('time');
                    self.analyser.stop('fft');
                    self.isAnalyser = false;

                    //Stop onaudioprocess event
                    this.disconnect(0);
                    this.onaudioprocess = null;  //for Firefox
                } else {
                    //Release
                }
            };
        }

        return this;
    };

    /** 
     * This method gets the instance of OscillatorNode that is used in OscillatorModule.
     * @param {number} index This argument is required in the case of designating OscillatorNode.
     * @return {Array.<OscillatorNode>|OscillatorNode}
     * @override
     */
    OscillatorModule.prototype.get = function(index) {
        var i = parseInt(index);

        if ((i >= 0) && (i < this.sources.length)) {
            return this.sources[i].source;
        } else {
            var oscillators = new Array(this.sources.length);

            for (var j = 0, len = this.sources.length; j < len; j++) {
                oscillators[j] = this.sources[j].source;
            }

            return oscillators;
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
        //Call superclass constructor
        SoundModule.call(this, context);

        this.sources   = [];  //{@type Array.<AudioBufferSourceNode>}
        this.resources = [];  //{@type Array.<string>}
        this.buffers   = [];  //{@type Array.<AudioBuffer>}
        this.volumes   = [];  //{@type Array.<GainNode>}
        this.isStops   = [];  //{@type Array.<boolean>}  in order to not call in duplicate "start" or "stop"  method in the instance of AudioBufferSourceNode

        //for audio sources
        this.settings = [];  //{@type Array.<object>}

        //for scheduling
        this.times = {
            start : 0,
            stop  : 0
        };

        this.transpose = 1.0;

        this.isStop = true;

        //This flag determines whether drawing sound wave is executing
        this.isAnalyser = false;
    }

    /** @extends {SoundModule} */
    OneshotModule.prototype = Object.create(SoundModule.prototype);
    OneshotModule.prototype.constructor = OneshotModule;

    /** 
     * This method creates the instances of AudioBuffer by Ajax.
     * @param {Array.<string>|Array.<AudioBuffer>} resources This argument is either URLs or the instances of AudioBuffer for audio resources.
     * @param {Array.<object>} settings This argument is the properties of each audio sources.
     * @param {number} timeout This argument is timeout of Ajax. The default value is 60000 msec (1 minutes).
     * @param {function} successCallback This argument is executed as next process when reading file is successful.
     * @param {function} errorCallback This argument is executed when error occurred.
     * @param {function} progressCallback This argument is executed during receiving audio data.
     * @return {OneshotModule} This is returned for method chain.
     * @override
     */
    OneshotModule.prototype.setup = function(resources, settings, timeout, successCallback, errorCallback, progressCallback) {
        //The argument is associative array ?
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
                var buf = parseInt(settings[i].buffer);

                if ((buf >= 0) && (buf < this.buffers.length)) {
                    settings[i].buffer = buf;
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

            for (var i = 0, len = settings.length; i < len; i++) {
                this.isStops[i]       = true;
                this.volumes[i]       = this.context.createGain();
                this.eg.generators[i] = this.context.createGain();

                //for legacy browsers
                this.eg.generators[i].gain.setTargetAtTime = this.eg.generators[i].gain.setTargetAtTime || this.eg.generators[i].gain.setTargetValueAtTime;
            }

            this.settings = settings;
        }

        //for errorCallback
        var ERROR_AJAX         = 'error';
        var ERROR_AJAX_TIMEOUT = 'timeout';
        var ERROR_DECODE       = 'decode';

        //If the error is at least 1, this method aborts the all of connections.
        //Therefore, this flag are shared with the all instances of XMLHttpRequest.
        var isError = false;

        var t = parseInt(timeout);

        var self = this;

        //Get ArrayBuffer by Ajax -> Create the instances of AudioBuffer
        var load = function(url, index) {
            var xhr = new XMLHttpRequest();

            if ((FULL_MODE === undefined) || FULL_MODE) {
                //XMLHttpRequest Level 2
                xhr.responseType = 'arraybuffer';
            } else {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }

            //Timeout
            xhr.timeout = (t > 0) ? t : 60000;

            xhr.ontimeout = function(error) {
                if (!isError && (Object.prototype.toString.call(errorCallback) === '[object Function]')) {
                    errorCallback(error, ERROR_AJAX_TIMEOUT);
                }

                isError = true;
            };

            //Progress
            xhr.onprogress = function(event) {
                if (isError) {
                    xhr.abort();
                } else if (Object.prototype.toString.call(progressCallback) === '[object Function]') {
                    progressCallback(event);
                }
            };

            //Error
            xhr.onerror = function(event) {
                if (!isError && (Object.prototype.toString.call(errorCallback) === '[object Function]')) {
                    errorCallback(event, ERROR_AJAX);
                }

                isError = true;
            };

            //Success
            xhr.onload = function(event) {
                if (xhr.status === 200) {
                    var arrayBuffer = null;

                    var decodeArrayBuffer = function(arrayBuffer) {
                        if (!(arrayBuffer instanceof ArrayBuffer)) {
                            return;
                        }

                        var decodeSuccessCallback = function(audioBuffer) {
                            self.buffers[index] = audioBuffer;  //Save instance of AudioBuffer

                            //The creating the instances of AudioBuffer has completed ?
                            for (var i = 0, len = self.buffers.length; i < len; i++) {
                                if (self.buffers[i] === undefined) {
                                    return;
                                }
                            }

                            if (Object.prototype.toString.call(successCallback) === '[object Function]') {
                                successCallback.call(self, event, self.buffers);
                            }
                        };

                        var decodeErrorCallback = function() {
                            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                                errorCallback(null, ERROR_DECODE);
                            }
                        };

                        //Create the instance of AudioBuffer (Asynchronously)
                        self.context.decodeAudioData(arrayBuffer, decodeSuccessCallback, decodeErrorCallback);
                    };

                    if ((FULL_MODE === undefined) || FULL_MODE) {
                        arrayBuffer = xhr.response;
                        decodeArrayBuffer.call(self, arrayBuffer);
                    } else {
                        var binary = xhr.responseText;
                        var buffer = [];

                        for (var i = 0, len = binary.length; i < len; i++) {
                            buffer.push(binary.charCodeAt(i) & 0xFF);
                        }

                        var ext    = url.slice(-3);
                        var mime   = 'audio/' + ext;
                        var blob   = new Blob([new Uint8Array(buffer)], {type : mime});
                        var reader = new FileReader();

                        reader.readAsArrayBuffer(blob);

                        reader.onerror = function(event) {
                            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                                var error = '';

                                switch (reader.error.code) {
                                    case reader.error.NOT_FOUND_ERR    : error = 'NOT_FOUND_ERR';    break;
                                    case reader.error.SECURITY_ERR     : error = 'SECURITY_ERR';     break;
                                    case reader.error.ABORT_ERR        : error = 'ABORT_ERR';        break;
                                    case reader.error.NOT_READABLE_ERR : error = 'NOT_READABLE_ERR'; break;
                                    case reader.error.ENCODING_ERR     : error = 'ENCODING_ERR' ;    break;
                                    default                            : error = 'ERR';              break;
                                }

                                errorCallback(event, error);
                            }
                        };

                        reader.onload = function() {
                            arrayBuffer = reader.result;
                            decodeArrayBuffer.call(self, arrayBuffer);
                        };
                    }
                }
            };

            xhr.open('GET', url, true);
            xhr.send(null);
        };

        for (var i = 0, len = this.resources.length; i < len; i++) {
            if (Object.prototype.toString.call(this.resources[i]) === '[object String]') {
                //Get the instances of AudioBuffer from the designated URLs.
                load.call(this, this.resources[i], i);
            } else if (this.resources[i] instanceof AudioBuffer) {
                //Get the instances of AudioBuffer directly
                this.buffers[i] = this.resources[i];
            }
        }

        return this;
    };

    /** 
     * This method is getter or setter for parameters
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|OneshotModule} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     * @override
     */
    OneshotModule.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            //Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            //Call superclass method
            var r = SoundModule.prototype.param.call(this, k, value);

            if (r !== undefined) {
                return r;  //Getter
            } else {
                switch (k) {
                    case 'transpose' :
                        if (value === undefined) {
                            return this.transpose;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = 0;

                            if (v > min) {
                                this.transpose = v;  //Setter
                            }
                        }

                        break;
                    default :
                        break;
                }
            }
        }

        return this;
    };

    /** 
     * This method schedules the start and stop time.
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

        return this;
    };

    /** 
     * This method starts one-shot audio with the designated playback rate value and volume.
     * @param {number} index This argument is in order to select the instance of AudioBufferSourceNode.
     * @param {Array.<Effector>} connects This argument is array for changing the default connection.
     * @param {function} processCallback This argument is "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {OneshotModule} This is returned for method chain.
     * @override
     */
    OneshotModule.prototype.start = function(index, connects, processCallback) {
        if ((index >= 0) && (index < this.settings.length)) {
            var activeIndex = parseInt(index);
        } else {
            return;
        }

        var bufferIndex  = this.settings[activeIndex].buffer;
        var playbackRate = this.settings[activeIndex].rate;
        var loop         = this.settings[activeIndex].loop;
        var loopStart    = this.settings[activeIndex].start;
        var loopEnd      = this.settings[activeIndex].end;
        var volume       = this.settings[activeIndex].volume;

        if (this.buffers[bufferIndex] === undefined) {
            return;  //"setup" method has not been executed
        }

        //the instance of AudioBufferSourceNode already exists ?
        if (this.sources[activeIndex] !== undefined) {
            this.sources[activeIndex].stop(this.context.currentTime);
            this.sources[activeIndex].disconnect(0);
            delete this.sources[activeIndex];
        }

        //Create the instance of AudioBufferSourceNode
        var source = this.context.createBufferSource();

        //for legacy browsers
        source.start = source.start || source.noteGrainOn;
        source.stop  = source.stop  || source.noteOff;

        //Set the instance of AudioBuffer
        source.buffer = this.buffers[bufferIndex];

        //Set properties
        source.playbackRate.value = playbackRate * this.transpose;
        source.loop               = loop;
        source.loopStart          = loopStart;
        source.loopEnd            = loopEnd;

        this.volumes[activeIndex].gain.value = volume;

        //AudioBufferSourceNode (input) -> EnvelopeGenerator -> GainNode -> ScriptProcessorNode -> ... -> AudioDestinationNode (output)
        this.eg.ready(activeIndex, source, this.volumes[activeIndex]);
        this.volumes[activeIndex].connect(this.processor);
        this.connect(this.processor, connects);

        var startTime = this.context.currentTime + this.times.start;

        source.start(startTime);

        this.sources[activeIndex] = source;

        //Attack -> Decay -> Sustain
        this.eg.start(startTime);

        //Start Effectors
        this.on(startTime);

        //Draw sound wave
        if (!this.isAnalyser) {
            this.analyser.start('time');
            this.analyser.start('fft');
            this.isAnalyser = true;
        }

        this.isStops[activeIndex] = false;

        var self = this;

        //In the case of scheduling stop time
        var duration = this.times.stop - this.times.start;

        if (duration > 0) {
            global.setTimeout(function() {
                self.stop(activeIndex);
            }, (duration * 1000));
        }

        //Call on stopping audio
        source.onended = function() {
            self.isStops[activeIndex] = true;
        };

        if (Object.prototype.toString.call(processCallback) === '[object Function]') {
            this.processor.onaudioprocess = processCallback;
        } else {
            this.processor.onaudioprocess = function(event) {
                self.isStop = self.isStops.every(function(element, index, array) {
                    return element;
                });

                if (self.isStop) {
                    //Stop

                    //Stop Effectors
                    self.on(self.context.currentTime);

                    self.eg.clear();

                    //Stop drawing sound wave
                    self.analyser.stop('time');
                    self.analyser.stop('fft');
                    self.isAnalyser = false;

                    //Stop onaudioprocess event
                    this.disconnect(0);
                    this.onaudioprocess = null;  //for Firefox
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
        if ((index >= 0) && (index < this.settings.length)) {
            var activeIndex = parseInt(index);
            var bufferIndex= this.settings[activeIndex].buffer;
        } else {
            return;
        }

        if ((this.buffers[bufferIndex] === undefined) || (this.sources[activeIndex] === undefined)) {
            return;
        }

        var stopTime = this.context.currentTime + this.times.stop;

        //Attack or Decay or Sustain -> Release
        this.eg.stop(stopTime);

        //Stop Effectors
        this.filter.stop(stopTime);

        for (var i = 0, len = this.plugins.length; i < len; i++) {
            this.plugins[i].plugin.stop(stopTime, this.eg.release);
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
    OneshotModule.prototype.toString = function() {
        return '[OneshotModule]';
    };

    /** 
     * This class is subclass that extends SoundModule.
     * This class defines properties for playing the single audio.
     * Namely, this class creates audio player that has higher functions than HTML5 audio.
     * But, this class is disadvantage to play the many one shot audios.
     * In the case of that, developer should use OneshotModule.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {SoundModule}
     */
    function AudioModule(context) {
        //Call superclass constructor
        SoundModule.call(this, context);

        this.source = context.createBufferSource();  //for the instance of AudioBufferSourceNode
        this.buffer = null;                          //for the instance of AudioBuffer

        this.currentTime = 0;
        this.paused = true;

        this.callbacks = {
            decode : function() {},
            ready  : function() {},
            start  : function() {},
            stop   : function() {},
            update : function() {},
            ended  : function() {},
            error  : function() {}
        };

        //Create the instance of private class
        this.vocalcanceler = new VocalCanceler();

        /** 
         * Private class
         * @constructor
         */
        function VocalCanceler() {
            this.depth = 0;
        };

        /** 
         * This method is getter or setter for parameters
         * @param {string|object} key This argument is property name in the case of string type.
         *     This argument is pair of property and value in the case of associative array.
         * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
         * @return {number|VocalCanceler} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
         */
        VocalCanceler.prototype.param = function(key, value) {
            if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
                //Associative array
                for (var k in arguments[0]) {
                    this.param(k, arguments[0][k]);
                }
            } else {
                var k = String(key).replace(/-/g, '').toLowerCase();

                switch (k) {
                    case 'depth' :
                        if (value === undefined) {
                            return this.depth;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = 0;
                            var max = 1;

                            if ((v >= min) && (v <= max)) {
                                this.depth = v;  //Setter
                            }
                        }

                        break;
                    default :
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
            //Associative array
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
     * This method is getter or setter for parameters
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number|boolean} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|AudioModuler} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     * @override
     */
    AudioModule.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            //Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            //Call superclass method
            var r = SoundModule.prototype.param.call(this, k, value);

            if (r !== undefined) {
                return r;  //Getter
            } else {
                switch (k) {
                    case 'playbackrate' :
                        if (value === undefined) {
                            return this.source.playbackRate.value;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = this.source.playbackRate.minValue || 0;
                            var max = this.source.playbackRate.maxValue || 1024;

                            if ((v >= min) && (v <= max)) {
                                this.source.playbackRate.value = v;  //Setter
                            }
                        }

                        break;
                    case 'loop'    :
                    case 'looping' :
                        if (value === undefined) {
                            return this.source.loop;  //Getter
                        } else {
                            this.source.loop = Boolean(value);  //Setter
                        }

                        break;
                    case 'currenttime' :
                        if (value === undefined) {
                            return this.currentTime;  //Getter
                        } else {
                            //Setter
                            var v = parseFloat(value);

                            if (this.buffer instanceof AudioBuffer) {
                                var max = this.buffer.duration;
                                var min = 0;
                            } else {
                                this.currentTime = 0;
                                break;
                            }

                            if ((v >= min) && (v <= max)) {
                                if (this.paused) {
                                    this.stop();
                                    this.currentTime = v;  //Setter
                                } else {
                                    this.stop();
                                    this.start(v);  //Setter
                                }
                            }
                        }

                        break;
                    case 'duration' :
                        return (this.buffer instanceof AudioBuffer) ? this.buffer.duration : 0;  //Getter only
                    case 'samplerate' :
                        return (this.buffer instanceof AudioBuffer) ? this.buffer.sampleRate : this.SAMPLE_RATE;  //Getter only
                    case 'channels' :
                        return (this.buffer instanceof AudioBuffer) ? this.buffer.numberOfChannels : 0;  //Getter only
                    default :
                        break;
                }
            }
        }

        return this;
    };

    /** 
     * This method creates the instance of AudioBuffer from ArrayBuffer.
     * @param {ArrayBuffer} arrayBuffer This argument is ArrayBuffer for audio.
     * @return {AudioModule} This is returned for method chain.
     * @override
     */
    AudioModule.prototype.ready = function(arrayBuffer) {
        if (arrayBuffer instanceof ArrayBuffer) {
            var successCallback = function(buffer) {
                this.buffer = buffer;  //Get the instance of AudioBuffer

                this.analyser.start('time-all-L', buffer);  //Draw audio wave (entire of time domain)
                this.analyser.start('time-all-R', buffer);  //Draw audio wave (entire of time domain)

                this.callbacks.ready(buffer);
            };

            //Create the instance of AudioBuffer (Asynchronously)
            this.context.decodeAudioData(arrayBuffer, successCallback.bind(this), this.callbacks.error.bind(this));

            this.callbacks.decode(arrayBuffer);
        }

        return this;
    };

    /** 
     * This method starts audio from the designated time.
     * @param {number} position This argument is the time that audio is started at. The default value is 0.
     * @param {Array.<Effector>} connects This argument is array for changing the default connection.
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

            //Create the instance of AudioBufferSourceNode
            this.source = this.context.createBufferSource();

            //for legacy browsers
            this.source.start = this.source.start || this.source.noteGrainOn;
            this.source.stop  = this.source.stop  || this.source.noteOff;

            this.source.buffer             = this.buffer;  //Set the instance of AudioBuffer
            this.source.playbackRate.value = playbackRate;
            this.source.loop               = loop;

            if ((FULL_MODE === undefined) || FULL_MODE) {
                //AudioBufferSourceNode (input) -> ScriptProcessorNode -> ... -> AudioDestinationNode (output)
                this.source.connect(this.processor);
                this.connect(this.processor, connects);
            } else {
                //AudioBufferSourceNode (input) -> ... -> AudioDestinationNode (output)
                this.connect(this.source, connects);
            }

            this.source.start(startTime, pos, (this.buffer.duration - pos));

            //Draw sound wave
            this.analyser.start('time');
            this.analyser.start('fft');

            this.paused = false;

            //Start Effectors
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

                            //Execute callback every 100 msec
                            if ((index % n100msec) === 0) {
                                self.callbacks.update(self.source, self.currentTime);
                            }
                        }

                        self.analyser.timeAllL.update(self.currentTime);
                        self.analyser.timeAllR.update(self.currentTime);
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

            //Stop Effectors
            this.off(stopTime, true);

            //Stop drawing sound wave
            this.analyser.stop('time');
            this.analyser.stop('fft');

            //Clear

            //Stop onaudioprocess event
            this.processor.disconnect(0);
            this.processor.onaudioprocess = null;  //for Firefox
            this.paused = true;
            this.callbacks.stop(this.source, this.currentTime);
        }

        return this;
    };

    /** 
     * This method gets the instance of AudioBufferSourceNode that is used in AudioModule.
     * @return {AudioBufferSourceNode}
     * @override
     */
    AudioModule.prototype.get = function() {
        return this.source;
    };

    /** 
     * This method starts or stops audio according to audio state.
     * @param {number} position This argument is the time that audio is started at. The default value is 0.
     * @param {Array.<Effector>} connects This argument is array for changing the default connection.
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
        return (this.buffer instanceof AudioBuffer) ? true : false;
    };

    /** 
     * This method determines whether the instance of AudioBufferSourceNode exists.
     * @return {boolean} If the instance of AudioBufferSourceNode already exists, this value is true. Otherwise, this value is false.
     */
    AudioModule.prototype.isSource = function() {
        return ((this.source instanceof AudioBufferSourceNode) && (this.source.buffer instanceof AudioBuffer)) ? true : false;
    };

    /** 
     * This method determines whether the audio is paused.
     * @return {boolean} If the audio is paused, this value is true. Otherwise, this value is false.
     */
    AudioModule.prototype.isPaused = function() {
        return this.paused;
    };

    /** @override */
    AudioModule.prototype.toString = function() {
        return '[AudioModule]';
    };

    /** 
     * This class is subclass that extends AudioModule.
     * This class defines properties for playing the single audio that is attached various effects from HTMLMediaElement .
     * Namely, this class creates audio player that has higher functions from HTMLMediaElement.
     * But, this class is disadvantage to play the many one shot audios.
     * In the case of that, developer should use OneshotModule.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {AudioModule}
     */
    function MediaModule(context) {
        //Call superclass constructor
        AudioModule.call(this, context);

        this.source = null;  //for the instance of MediaElementAudioSourceNode
        this.media  = null;  //for HTMLMediaElement
        this.ext    = '';    //'wav', 'ogg', 'mp3, 'webm', 'ogv', 'mp4' ...etc

        this.duration     = 0;
        this.playbackRate = 1.0;
        this.controls     = false;
        this.loop         = false;
        this.muted        = false;

        //The keys are the event interfaces that are defined by HTMLMediaElement.
        //For example, "loadstart", "loadedmetadata", "loadeddata", "canplay", "canplaythrough", "timeupdate", "ended" ...etc
        this.callbacks = {
            loadstart : function() {}  //for creating the instance of MediaElementAudioSourceNode
        };
    }

    /** @extends {AudioModule} */
    MediaModule.prototype = Object.create(AudioModule.prototype);
    MediaModule.prototype.constructor = MediaModule;

    /** 
     * This method gets HTMLMediaElement and selects media format. In addition, this method sets event handlers that are defined by HTMLMediaElement.
     * @param {string} id This argument is id attribute of HTMLMediaElement.
     *     If new HTMLMediaElement is created, either null or empty string must be designated to this method.
     * @param {string} type This argument is either 'audio' or 'video'. The default value is 'audio'.
     * @param {Array.<string>|string} formats This argument is usable media format. For example, 'wav', 'ogg', 'webm', 'mp4' ...etc.
     * @param {object} callbacks This argument is event handlers that are defined by HTMLMediaElement.
     * @return {MediaModule} This is returned for method chain.
     * @override
     */
    MediaModule.prototype.setup = function(id, type, formats, callbacks) {
        //The argument is associative array ?
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            var properties = arguments[0];

            if ('id'        in properties) {id        = properties.id;}
            if ('type'      in properties) {type      = properties.type;}
            if ('formats'   in properties) {formats   = properties.formats;}
            if ('callbacks' in properties) {callbacks = properties.callbacks;}
        }

        var elementId = String(id);
        var mediaType = (String(type).toLowerCase() !== 'video') ? 'audio' : 'video';

        this.media = ((id !== null) && (elementId !== '')) ? document.getElementById(elementId) : document.createElement(mediaType);

        if (!(this.media instanceof HTMLMediaElement)) {
            this.media = null;
            return;
        }

        if (!Array.isArray(formats)) {
            formats = [formats];
        }

        for (var i = 0, len = formats.length; i < len; i++) {
            var format = mediaType + '/' + String(formats[i]).toLowerCase();

            if (/^(?:maybe|probably)/.test(this.media.canPlayType(format))) {
                this.ext = formats[i];
                break;
            }
        }

        if (this.ext === '') {
            throw new Error('Media format that can be played does not exist !!');
        }

        if (Object.prototype.toString.call(callbacks) === '[object Object]') {
            for (var k in callbacks) {
                this.callbacks[k.toLowerCase()] = (Object.prototype.toString.call(callbacks[k]) === '[object Function]') ? callbacks[k] : function() {};
            }
        }

        var self = this;

        for (var k in this.callbacks) {
            switch (k) {
                case 'loadstart' :
                    this.media.addEventListener('loadstart', function(event) {
                        //To create the instance of MediaElementAudioSourceNode again causes error to occur.
                        if (!(self.source instanceof MediaElementAudioSourceNode)) {
                            self.source = self.context.createMediaElementSource(this);
                        }

                        self.callbacks.loadstart(event, this);
                    }, false);

                    break;
                case 'loadedmetadata' :
                    this.media.addEventListener('loadedmetadata', function(event) {
                        self.duration = this.duration;
                        self.callbacks.loadedmetadata(event, this);
                    }, false);

                    break;
                case 'ended' :
                    this.media.addEventListener('ended', function(event) {
                        this.pause();

                        //Stop Effectors
                        self.off(self.context.currentTime);

                        //Stop drawing sound wave
                        self.analyser.stop('time');
                        self.analyser.stop('fft');

                        //Stop onaudioprocess event
                        self.processor.disconnect(0);
                        self.processor.onaudioprocess = null;  //for Firefox
                        self.callbacks.ended(event, this);
                    }, false);

                    break;
                default :
                    this.media.addEventListener(k, function(event) {
                        self.callbacks[(event.type).toLowerCase()](event, this);
                    }, false);

                    break;
            }
        }

        return this;
    };

    /** 
     * This method is getter or setter for parameters
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number|boolean} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|boolean|MediaModule} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     * @override
     */
    MediaModule.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            //Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            //Call superclass method
            var r = SoundModule.prototype.param.call(this, k, value);

            //Getter ?
            if (r !== undefined) {
                return r;
            } else {
                switch (k) {
                    case 'playbackrate' :
                        if (value === undefined) {
                            return (this.media instanceof HTMLMediaElement) ? this.media.playbackRate : this.playbackRate;  //Getter
                        } else {
                            var v   = parseFloat(value);
                            var min = 0.5;  //for Chrome

                            if (v >= min) {
                                //Setter
                                if (this.media instanceof HTMLMediaElement) {
                                    this.media.playbackRate = v;
                                }

                                this.playbackRate = v;
                            }
                        }

                        break;
                    case 'currenttime' :
                        if (value === undefined) {
                            return (this.media instanceof HTMLMediaElement) ? this.media.currentTime : 0;  //Getter
                        } else {
                            var v = parseFloat(value);

                            if (this.media instanceof HTMLMediaElement) {
                                var min = 0;
                                var max = this.duration;
                            } else {
                                return;
                            }

                            if ((v >= min) && (v <= max)) {
                                //Setter
                                this.media.currentTime = v;
                            }
                        }

                        break;
                    case 'loop'     :
                    case 'muted'    :
                    case 'controls' :
                        if (value === undefined) {
                            return (this.media instanceof HTMLMediaElement) ? this.media[k] : this[k];  //Getter
                        } else {
                            //Setter
                            if (this.media instanceof HTMLMediaElement) {
                                this.media[k] = Boolean(value);
                            }

                            this[k] = Boolean(value);
                        }

                        break;
                    case 'width'  :
                    case 'height' :
                        if (value === undefined) {
                            return (this.media instanceof HTMLVideoElement) ? this.media[k] : 0;  //Getter
                        } else {
                            var v   = parseInt(value);
                            var min = 0;

                            if (v >= min) {
                                //Setter
                                if (this.media instanceof HTMLVideoElement) {
                                    this.media[k] = v;
                                }
                            }
                        }

                        break;
                    case 'duration' :
                        return this.duration;  //Getter only
                    case 'channels' :
                        return (this.source instanceof MediaElementAudioSourceNode) ? this.source.channelCount : 0;  //Getter only
                    default :
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
            //Data URL or Object URL ?
            if ((src.indexOf('data:') !== -1) || (src.indexOf('blob:') !== -1)) {
                this.media.src = src;  //Data URL or Object URL
            } else {
                this.media.src = src + '.' + this.ext;  //Path
            }
        } catch (error) {
            throw new Error('The designated resource cannot be loaded !!');
        }

        return this;
    };

    /** 
     * This method starts media from the designated time.
     * @param {number} position This argument is the time that media is started at. The default value is 0.
     * @param {Array.<Effector>} connects This argument is array for changing the default connection.
     * @param {function} processCallback This argument is "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {MediaModule} This is returned for method chain.
     * @override
     */
    MediaModule.prototype.start = function(position, connects, processCallback) {
        if ((this.source instanceof MediaElementAudioSourceNode) && this.media.paused) {
            //MediaElementAudioSourceNode (input) -> ScriptProcessorNode -> ... -> AudioDestinationNode (output)
            this.source.connect(this.processor);
            this.connect(this.processor, connects);

            this.media.play();

            var pos = parseFloat(position);

            this.media.currentTime  = ((pos >= 0) && (pos <= this.duration)) ? pos : 0;
            this.media.playbackRate = this.playbackRate;
            this.media.controls     = this.controls;
            this.media.loop         = this.loop;
            this.media.muted        = this.muted;

            //Start Effectors
            this.on(this.context.currentTime);

            //Draw sound wave
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
     * This method stops media. In addition, this method stops the all of effectors.
     * @return {MediaModule} This is returned for method chain.
     * @override
     */
    MediaModule.prototype.stop = function() {
        if ((this.source instanceof MediaElementAudioSourceNode) && !this.media.paused) {
            this.media.pause();

            //Stop Effectors
            this.off(this.context.currentTime, true);

            //Stop drawing sound wave
            this.analyser.stop('time');
            this.analyser.stop('fft');

            //Stop onaudioprocess event
            this.processor.disconnect(0);
            this.processor.onaudioprocess = null;  //for Firefox
        }

        return this;
    };

    /** 
     * This method gets the HTMLMediaElement that is used in MediaModule.
     * @return {HTMLMediaElement}
     * @override
     */
    MediaModule.prototype.get = function() {
        return this.media;
    };

    /** 
     * This method starts or stops media according to media state.
     * @param {number} position This argument is time that media is started at.
     * @param {Array.<Effector>} connects This argument is array for changing the default connection.
     * @param {function} processCallback This argument is "onaudioprocess" event handler in the instance of ScriptProcessorNode.
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
     * This method determines whether the HTMLMediaElement exists.
     * @return {boolean} If the HTMLMediaElement already exists, this value is true. Otherwise, this value is false.
     */
    MediaModule.prototype.isMedia = function() {
        return (this.media instanceof HTMLMediaElement) ? true : false;
    };

    /** 
     * This method determines whether the instance of MediaElementAudioSourceNode exists.
     * @return {boolean} If the instance of MediaElementAudioSourceNode already exists, this value is true. Otherwise, this value is false.
     * @override
     */
    MediaModule.prototype.isSource = function() {
        return (this.source instanceof MediaElementAudioSourceNode) ? true : false;
    };

    /** 
     * This method determines whether the media is paused.
     * @return {boolean} If the media is paused, this value is true. Otherwise, this value is false.
     * @override
     */
    MediaModule.prototype.isPaused = function() {
        return (this.media instanceof HTMLMediaElement) ? this.media.paused : true;
    };

    /** 
     * This method shows video in full screen.
     * @return {MediaModule} This is returned for method chain.
     */
    MediaModule.prototype.fullscreen = function() {
        if (this.media instanceof HTMLVideoElement) {
            if (this.media.webkitRequestFullscreen) {
                //Chrome Safari
                this.media.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (this.media.mozRequestFullScreen) {
                //Firefox
                this.media.mozRequestFullScreen();
            } else if (this.media.requestFullscreen) {
                //Opera
                this.media.requestFullscreen();
            } else {
                throw new Error('Cannot change to full screen !!');
            }
        }

        return this;
    };

    /** 
     * This method shows video in original size from full screen.
     * @return {MediaModule} This is returned for method chain.
     */
    MediaModule.prototype.exitFullscreeen = function() {
        if (document.webkitExitFullscreen) {
            //Chrome Safari
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullscreen) {
            //Firefox
            document.mozCancelFullscreen();
        } else if (document.exitFullscreen) {
            //Opera
            document.exitFullscreen();
        } else {
            throw new Error('Cannot exit from full screen !!');
        }

        return this;
    };

    /** @override */
    MediaModule.prototype.toString = function() {
        return '[MediaModule]';
    };

    /**
     * This class is subclass that extends SoundModule.
     * This class defines properties that use sound from WebRTC in Web Audio API.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {SoundModule}
     */
    function StreamModule(context) {
        //Call superclass constructor
        SoundModule.call(this, context);

        //for the instance of MediaStreamAudioSourceNode
        this.source = null;

        //for getUserMedia()
        this.medias = {
            audio : true,
            video : false
        };

        this.callbacks = {
            stream : function() {},
            error  : function() {}
        };

        this.isStop  = true;
    }

    /** @extends {SoundModule} */
    StreamModule.prototype = Object.create(SoundModule.prototype);
    StreamModule.prototype.constructor = StreamModule;

    /**
     * This method sets up for using WebRTC.
     * @param {boolean} isVideo If this argument is true, WebRTC streams video.
     * @param {function} streamCallback This argument is executed on streaming.
     * @param {function} errorCallback This argument is executed when error occurs on streaming.
     * @return {StreamModule} This is returned for method chain.
     * @override
     */
    StreamModule.prototype.setup = function(isVideo, streamCallback, errorCallback) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

        if (Boolean(isVideo)) {
            this.medias.video = true;
        }

        if (Object.prototype.toString.call(streamCallback) === '[object Function]') {this.callbacks.stream = streamCallback;}
        if (Object.prototype.toString.call(errorCallback)  === '[object Function]') {this.callbacks.error  = errorCallback;}

        return this;
    };

    /** 
     * This method is getter or setter for parameters
     * @param {string|object} key This argument is property name in the case of string type.
     *     This argument is pair of property and value in the case of associative array.
     * @param {number} value This argument is the value of designated property. If this argument is omitted, This method is getter.
     * @return {number|StreamModule} This is returned as the value of designated property in the case of getter. Otherwise, this is returned for method chain.
     * @override
     */
    StreamModule.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            //Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            //Call superclass method
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
     * @param {Array.<Effector>} connects This argument is array for changing the default connection.
     * @param {function} processCallback This argument is "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {StreamModule} This is returned for method chain.
     * @override
     */
    StreamModule.prototype.start = function(connects, processCallback) {
        if (navigator.getUserMedia === undefined) {
            throw new Error('Cannot use WebRTC !!');
        }

        var isAnalyser = false;

        var self = this;

        var start = function(stream, connects, processCallback) {
            this.source = this.context.createMediaStreamSource(stream);

            //MediaStreamAudioSourceNode (input) -> ScriptProcessorNode -> ... -> AudioDestinationNode (output)
            this.source.connect(this.processor);
            this.connect(this.processor, connects);

            //Start Effectors
            this.on(this.context.currentTime);

            //Draw sound wave
            if (!isAnalyser) {
                this.analyser.start('time');
                this.analyser.start('fft');
                isAnalyser = true;
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
        };

        this.isStop = false;

        navigator.getUserMedia(this.medias, function(stream) {
            if (self.isStop) {
                return;
            }

            start.call(self, stream, connects, processCallback);
            self.callbacks.stream(stream);
        }, function(error) {
            self.callbacks.error(error);
        });

        return this;
    };

    /**
     * This method stops streaming by changing flag.
     * In addition, this method stops effectors, visualizer, and processor.
     * @return {StreamModule} This is returned for method chain.
     * @override
     */
    StreamModule.prototype.stop = function() {
        this.source = null;

        //Stop Effectors
        this.off(this.context.currentTime, true);

        //Stop drawing sound wave
        this.analyser.stop('time');
        this.analyser.stop('fft');

        //Stop onaudioprocess event
        this.processor.disconnect(0);
        this.processor.onaudioprocess = null;  //for Firefox

        this.isStop = true;

        return this;
    };

    /**
     * This method gets the instance of MediaStreamAudioSourceNode
     * @return {MediaStreamAudioSourceNode} This value is the instance of MediaStreamAudioSourceNode.
     * @override
     */
    StreamModule.prototype.get = function() {
        return this.source;
    };

    /** 
     * This method starts or stops streaming according to current state.
     * @param {Array.<Effector>} connects This argument is array for changing the default connection.
     * @param {function} processCallback This argument is "onaudioprocess" event handler in the instance of ScriptProcessorNode.
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
        return this.isStop ? false : true;
    };

    /** @override */
    StreamModule.prototype.toString = function() {
        return '[StreamModule]';
    };

    /**
     * This class is subclass that extends SoundModule.
     * This class defines properties for mixing sound sources of module that is defined in this library .
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     * @extends {SoundModule}
     */
    function MixerModule(context) {
        //Call superclass constructor
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
     * @param {Array.<OscillatorModule>|Array.<OneshotModule>|Array.<AudioModule>|Array.<MediaModule>|Array.<StreamModule>} sources This argument is array of sound source module that is defined by this library.
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

            //Stop Effectors of each source
            this.off(stopTime, false);

            //Stop Analyser, Recorder, Session
            source.analyser.stop('time');
            source.analyser.stop('fft');
            source.isAnalyser = false;

            source.recorder.stop();
            source.session.close();

            //ScriptProcessorNode (each source) -> ScriptProcessorNode (MixerModule)
            source.processor.disconnect(0);
            source.processor.connect(this.processor);
        }

        //(... ->) ScriptProcessorNode (mix sources) -> ... -> AudioDestinationNode (output)
        this.connect(this.processor);

        var startTime = this.context.currentTime;

        //Start Effectors
        this.on(startTime);

        //Draw sound wave
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

            //Stop ?
            var isStop = false;

            for (var i = 0, len = self.sources.length; i < 10; i++) {
                var source = sources[i];

                if ((source instanceof OscillatorModule) && source.eg.isStop()) {
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

                //Stop Effectors
                self.stop(stopTime, true);

                //Stop drawing sound wave
                self.analyser.stop('time');
                self.analyser.stop('fft');
                self.isAnalyser = false;

                //Stop onaudioprocess event
                this.disconnect(0);
                this.onaudioprocess = null;  //for Firefox
            } else {
                outputLs.set(inputLs);
                outputRs.set(inputRs);
            }
        };

        return this;
    };

    /** 
     * This method gets the instance of sound source that is used in this class.
     * @param {number} index This argument is required in the case of designating sound source.
     * @return {Array.<OscillatorModule>|Array.<OneshotModule>|Array.<AudioModule>|Array.<MediaModule>|OscillatorModule|OneshotModule>|AudioModule|MediaModule}
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
     * This class defines properties for play the MML (Music Macro Language).
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @constructor
     */
    function MML(context) {
        this.context = context;

        //for array of OscillatorNode or the instance of OscillatorModule or OneshotModule
        this.source = null;

        this.sequences = [];  //{@type Array.<Array.<object>>}
        this.timerids  = [];  //{@type Array.<number>}
        this.prev      = [];  //{@type Array.<object>}

        this.callbacks = {
            start : function() {},
            stop  : function() {},
            ended : function() {},
            error : function() {}
        };
    }

    /** 
     * This method sets callback functions.
     * @param {string|object} key This argument is property name.
     *     This argument is pair of property and value in the case of associative array.
     * @param {function} value This argument is callback function.
     * @return {MML} This is returned for method chain.
     */
    MML.prototype.setup = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            //Associative array
            for (var k in arguments[0]) {
                this.setup(k, arguments[0][k]);
            }
        } else {
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
     * This method parses MML (Music Macro Language) string.
     * @param {Array.<OscillatorNode>|OscillatorModule|OneshotModule} source This argument is in order to select sound source.
     * @param {Array.<string>} mmls This argument is MML strings.
     * @return {Array.<Array.<object>>} This is returned as array that has object for playing the MML.
     */
    MML.prototype.ready = function(source, mmls) {
        if (this.source !== null) {
            this.stop();  //Stop the previous MML
        }

        this.sequences = [];
        this.timerids  = [];
        this.prev      = [];

        if (Array.isArray(source)) {
            for (var i = 0, len = source.length; i < len; i++) {
                if (!(source[i] instanceof OscillatorNode)) {
                    return;
                }
            }

            this.source = source;
        } else if (source instanceof OscillatorNode) {
            this.source = [source];
        } else if ((source instanceof OscillatorModule) || (source instanceof OneshotModule)) {
            this.source = source;
        } else {
            return;
        }

        if (!Array.isArray(mmls)) {
            mmls = [mmls];
        }

        while (mmls.length > 0) {
            var mml = String(mmls.shift());

            var ONE_MINUTES       = 60;  //sec
            var EQUAL_TEMPERAMENT = 12;
            var QUARTER_NOTE      = 4;
            var MML_REGEXP        = /\s*(?:T\d+)\s*|\s*(?:O\d+)\s*|\s*(?:(?:[CDEFGABR][#+-]?)+(?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)\.?)(?:&(?:[CDEFGABR][#+-]?)+(?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)\.?)*\s*/gi;
            var ERROR_MML_STRING  = 'MML';
            var ERROR_MML_TEMPO   = 'TEMPO';
            var ERROR_MML_OCTAVE  = 'OCTAVE';
            var ERROR_MML_NOTE    = 'NOTE';

            //{@type Array.<object>}
            var sequences = [];

            var notes = mml.match(MML_REGEXP);

            if (notes === null) {
                this.callbacks.error(ERROR_MML_STRING, '');
                return;
            }

            var currentTime = 0;

            var computeIndex = function(octave, frequency) {
                var index = 0;

                switch (frequency) {
                    case 'C' : index =  3; break;
                    case 'D' : index =  5; break;
                    case 'E' : index =  7; break;
                    case 'F' : index =  8; break;
                    case 'G' : index = 10; break;
                    case 'A' : index = 12; break;
                    case 'B' : index = 14; break;
                    case 'R' : return 'R';
                    default  : break;
                }

                var computedIndex = (EQUAL_TEMPERAMENT * (octave - 1)) + index;

                if (computedIndex >= 0) {
                    return computedIndex;
                } else {
                    return -1;
                }
            };

            var computeFrequency = function(index) {
                //The 12 equal temperament
                //
                //Min -> 27.5 Hz (A), Max -> 4186 Hz (C)
                //
                //A * 1.059463 -> A# (half up)

                var FREQUENCY_RATIO = Math.pow(2, (1 / 12));  //about 1.059463
                var MIN_A           = 27.5;

                if (index >= 0) {
                    return MIN_A * Math.pow(FREQUENCY_RATIO, index);
                } else {
                    return -1;
                }
            };

            while (notes.length > 0) {
                var note = notes.shift().trim();

                if (/T\d+/i.test(note)) {
                    var bpm = parseInt(note.slice(1));

                    if (bpm > 0) {
                        var timeOf4note = ONE_MINUTES / bpm;
                    } else {
                        this.callbacks.error(ERROR_MML_TEMPO, note);
                        return;
                    }
                } else if (/O\d+/i.test(note)) {
                    var octave = parseInt(note.slice(1));

                    if (octave < 0) {
                        this.callbacks.error(ERROR_MML_OCTAVE, note);
                        return;
                    }
                } else if (/(?:(?:[CDEFGABR][#+-]?)+)(?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)(?:&(?:[CDEFGABR][#+-]?)+(?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)\.?)*/i.test(note)) {
                    if (timeOf4note === undefined) {
                        this.callbacks.error(ERROR_MML_TEMPO, note);
                        return;
                    }

                    if (octave === undefined) {
                        this.callbacks.error(ERROR_MML_OCTAVE, note);
                        return;
                    }

                    var chord = note.match(/((?:[CDEFGABR][#+-]?)+)(?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)\.?.*/i)[1];

                    var indexes = [];

                    for (var i = 0, len = chord.length; i < len; i++) {
                        var name  = chord.charAt(i);
                        var index = computeIndex.call(this, octave, name.toUpperCase());

                        //Half up or Half down (Sharp or Flat) ?
                        switch (chord.charAt(i + 1)) {
                            case '#' :
                            case '+' :
                                //Half up (Sharp)
                                index++;
                                i++;
                                break;
                            case '-' :
                                //Half down (Flat)
                                index--;
                                i++;
                                break;
                            default :
                                //Normal (Natural)
                                break;
                        }

                        //in the case of chord
                        if (index >= indexes[0]) {
                            index -= EQUAL_TEMPERAMENT;
                        }

                        //Validation
                        if (index < 0) {
                            this.callbacks.error(ERROR_MML_NOTE, note);
                            return;
                        }

                        indexes.push(index);
                    }

                    var frequencies = [];

                    for (var i = 0, len = indexes.length; i < len; i++) {
                        var frequency = (indexes[i] !== 'R') ? computeFrequency.call(this, indexes[i], note) : 0;

                        //Validation
                        if (frequency === -1) {
                            this.callbacks.error(ERROR_MML_NOTE, note);
                            return;
                        }

                        frequencies.push(frequency);
                    }

                    var durations = note.split('&');  //Tie
                    var duration  = 0;

                    while (durations.length > 0) {
                        var d = durations.shift().match(/(?:[CDEFGABR][#+-]?)+((?:256|192|144|128|96|72|64|48|36|32|24|18|16|12|8|6|4|2|1)\.?.*)/i)[1];

                        switch (parseInt(d)) {
                            case   1 :
                            case   2 :
                            case   4 :
                            case   8 :
                            case  16 :
                            case  32 :
                            case  64 :
                            case 128 :
                            case 256 :
                                var numOf4note = QUARTER_NOTE / parseInt(d);

                                //a dotted note ?
                                duration += (d.indexOf('.') !== -1) ? ((1.5 * numOf4note) * timeOf4note) : (numOf4note * timeOf4note);
                                break;
                            case   6 :
                                //Triplet of half note
                                duration += (2 * timeOf4note) / 3;
                                break;
                            case  12 :
                                //Triplet of quarter note
                                duration += timeOf4note / 3;
                                break;
                            case  18 :
                                //Nonuplet of half note
                                duration += (2 * timeOf4note) / 9;
                                break;
                            case  24 :
                                //Triplet of 8th note
                                duration += (0.5 * timeOf4note) / 3;
                                break;
                            case  36 :
                                //Nonuplet of quarter note
                                duration += timeOf4note / 9;
                                break;
                            case  48 :
                                //Triplet of 16th note
                                duration += (0.25 * timeOf4note) / 3;
                                break;
                            case  72 :
                                //Nonuplet of 8th note
                                duration += (0.5 * timeOf4note) / 9;
                                break;
                            case  96 :
                                //Triplet of 32th note
                                duration += (0.125 * timeOf4note) / 3;
                                break;
                            case 144 :
                                //Nonuplet of 16th note
                                duration += (0.25 * timeOf4note) / 9;
                                break;
                            case 192 :
                                //Triplet of 64th note
                                duration += (0.0625 * timeOf4note) / 3;
                                break;
                            default :
                                this.callbacks.error(ERROR_MML_NOTE, note);
                                break;
                        }
                    }

                    var start = currentTime;
                    var stop  = start + duration;

                    currentTime += duration;

                    sequences.push({
                        indexes     : indexes,
                        frequencies : frequencies,
                        start       : start,
                        duration    : duration,
                        stop        : stop
                    });
                }
            };

            if (sequences.length > 0) {
                //"start" method gets element by "pop" for performance
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
     * @param {Array.<Effector>|Array.<AudioNode>} connects This argument is array for changing the default connection.
     * @param {function} processCallback This argument is in order to change "onaudioprocess" event handler in the instance of ScriptProcessorNode.
     * @return {MML} This is returned for method chain.
     */
    MML.prototype.start = function(part, connects, processCallback) {
        var p = parseInt(part);

        if ((p >= 0) && (p < this.sequences.length)) {
            if (!Array.isArray(this.sequences[p])) {
                return this;
            }

            //End ?
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

                    //for legacy browsers
                    source.start = source.start || source.noteOn;
                    source.stop  = source.stop  || source.noteOff;

                    source.type            = type;
                    source.frequency.value = sequence.frequencies[i];
                    source.detune.value    = detune;

                    if (Array.isArray(connects)) {
                        //OscillatorNode (input) -> AudioNode -> ... -> AudioNode -> AudioDestinationNode (output)
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
                        //OscillatorNode (input) -> AudioDestinationNode (output)
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

                //for "stop" method
                self.prev = sequence;

                //Start next sound by recursive call
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
     * This method gets the array that has object for playing the MML.
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
     * @param {Array.<Effector>} connects This argument is array for changing the default connection.
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
        return Array.isArray(this.sequences[0]) ? true : false;
    };

    /** 
     * This method determines whether the MML is paused.
     * @return {boolean} If the MML is paused, this value is true. Otherwise, this value is false.
     */
    MML.prototype.isPaused = function() {
        for (var i = 0, len = this.timerids.length; i < len; i++) {
            var timerid = this.timerids[i];

            if ((timerid === null) || (timerid === undefined)) {
                //Next timer
            } else {
                //Playing the MML
                return false;
            }
        }

        return true;
    };

    /** 
     * This method creates text file for MML.
     * @param {string} mml This argument is MML string.
     * @return {string} This is returned as text file that writes MML.
     */
    MML.prototype.download = function(mml) {
        var toAscii = function(string) {
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

        var base64  = global.btoa(toAscii(String(mml)));
        var dataURL = 'data:text/plain;base64,' + base64;

        return dataURL;
    };

    /** @override */
    MML.prototype.toString = function() {
        return '[MML]';
    };

////////////////////////////////////////////////////////////////////////////////

    //Create instances
    var sound      = new SoundModule(audiocontext);
    var oscillator = new OscillatorModule(audiocontext);
    var oneshot    = new OneshotModule(audiocontext);
    var audio      = new AudioModule(audiocontext);
    var media      = new MediaModule(audiocontext);
    var fallback   = new MediaFallbackModule();
    var stream     = new StreamModule(audiocontext);
    var mixer      = new MixerModule(audiocontext);
    var mml        = new MML(audiocontext);

    /** 
     * This function is global object for getting the instance of OscillatorModule or OneshotModule or AudioModule or MediaModule or MediaFallbackModule or StreamModule or MixerModule or MML.
     * @param {string} source This argument is one of 'oscillator', 'oneshot', 'audio', 'media', 'fallback', 'stream', 'mixer' , 'mml'.
     * @param {number} index This argument is in order to select one of some oscillators.
     * @return {OscillatorModule|Oscillator|OneshotModule|AudioModule|MediaModule|MediaFallbackModule|StreamModule|MixerModule|MML}
     */
    XSound = function(source, index) {
        var s = String(source).replace(/-/g, '').toLowerCase();

        switch (s) {
            case 'oscillator' :
                if (index === undefined) {
                    return oscillator;
                } else {
                    var i = parseInt(index);

                    if ((i >= 0) && (i < oscillator.sources.length)) {
                        return oscillator.sources[i];
                    }
                }

                break;
            case 'oneshot' :
                return oneshot;
            case 'audio' :
                return audio;
            case 'media' :
                return media;
            case 'fallback' :
                return fallback;
            case 'stream' :
                 return stream;
            case 'mixer' :
                return mixer;
            case 'mml' :
                return mml;
            default :
                break;
        }
    };

    //Static properties
    XSound.IS_XSOUND   = IS_XSOUND;
    XSound.FULL_MODE   = FULL_MODE;
    XSound.SAMPLE_RATE = sound.SAMPLE_RATE;
    XSound.BUFFER_SIZE = sound.BUFFER_SIZE;
    XSound.NUM_INPUT   = sound.NUM_INPUT;
    XSound.NUM_OUTPUT  = sound.NUM_OUTPUT;

    //Static methods
    XSound.read          = read;
    XSound.file          = file;
    XSound.ajax          = ajax;
    XSound.decode        = decode;
    XSound.toFrequencies = toFrequencies;
    XSound.convertTime   = convertTime;
    XSound.noConflict    = noConflict;

    /** 
     * This static method returns function as closure for getter of cloned module.
     * @return {function} This is returned as closure for getter of cloned module.
     */
    XSound.clone = function() {
        var clones = {
            oscillator : new OscillatorModule(audiocontext),
            oneshot    : new OneshotModule(audiocontext),
            audio      : new AudioModule(audiocontext),
            media      : new MediaModule(audiocontext),
            fallback   : new MediaFallbackModule(),
            stream     : new StreamModule(audiocontext),
            mixer      : new MixerModule(audiocontext),
            mml        : new MML(audiocontext)
        };

        //Closure
        return function(source, index) {
            var s = String(source).replace(/-/g, '').toLowerCase();

            switch (s) {
                case 'oscillator' :
                    if (index === undefined) {
                        return clones.oscillator;
                    } else {
                        var i = parseInt(index);

                        if ((i >= 0) && (i < clones.oscillator.sources.length)) {
                            return clones.oscillator.sources[i];
                        }
                    }

                    break;
                case 'oneshot' :
                    return clones.oneshot;
                case 'audio' :
                    return clones.audio;
                case 'media' :
                    return clones.media;
                case 'fallback' :
                    return clones.fallback;
                case 'stream' :
                    return clones.stream;
                case 'mixer' :
                    return clones.mixer;
                case 'mml' :
                    return clones.mml;
                default :
                    break;
            };
        };
    };

    /** 
     * This static method releases memory of unnecessary instances.
     * @param {Array.<SoundModule|MML|MediaFallbackModule>} sources This argument is array that has the instances of SoundModule or MML or MediaFallbackModule.
     */
    XSound.free = function(sources) {
        if (!Array.isArray(sources)) {
            sources = [sources];
        }

        for (var i = 0, len = sources.length; i < len; i++) {
            var source = sources[i];

            if ((source instanceof SoundModule) || (source instanceof MML) || (source instanceof MediaFallbackModule)) {
                source = null;
            }
        }
    };

    /** 
     * This static method gets the instance of AudioContext.
     * @return {AudioContext} This value is the instance of AudioContext.
     */
    XSound.get = function() {
        return audiocontext;
    };

    /** 
     * This static method gets "currentTime" property in the instance of AudioContext.
     * @return {number}
     */
    XSound.getCurrentTime = function() {
        return audiocontext.currentTime;
    };

    /** @override */
    XSound.toString = function() {
        return '[XSound]';
    };

    //Set 2 objects as property of window object
    global.XSound = XSound;
    global.X      = XSound;  //Alias of XSound

})(window);
