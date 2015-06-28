(function(global) {
    'use strict';

    global.AudioContext = global.AudioContext || global.webkitAudioContext;

    var audiocontext = new AudioContext();

    // Mocks

    function OscillatorModule(context) {
        this.sources = [new Oscillator(), new Oscillator(), new Oscillator()];
    }

    function Oscillator() {
    }

    OscillatorModule.Oscillator = Oscillator;

    function OneshotModule(context) {
    }

    function AudioModule(context) {
    }

    function MediaModule(context) {
    }

    function MediaFallbackModule() {
    }

    function StreamModule(context) {
    }

    function MixerModule(context) {
    }

    function MML(context) {
    }

    var sources = {
        oscillator : new OscillatorModule(audiocontext),
        oneshot    : new OneshotModule(audiocontext),
        audio      : new AudioModule(audiocontext),
        media      : new MediaModule(audiocontext),
        fallback   : new MediaFallbackModule(),
        stream     : new StreamModule(audiocontext),
        mixer      : new MixerModule(audiocontext),
        mml        : new MML(audiocontext)
    };

    // Cloned instances
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

    /** 
     * This function is global object for getting the instance of OscillatorModule or OneshotModule or AudioModule or MediaModule or MediaFallbackModule or StreamModule or MixerModule or MML.
     * @param {string} source This argument is one of 'oscillator', 'oneshot', 'audio', 'media', 'fallback', 'stream', 'mixer' , 'mml'.
     * @param {number} index This argument is in order to select one of some oscillators.
     * @return {OscillatorModule|Oscillator|OneshotModule|AudioModule|MediaModule|MediaFallbackModule|StreamModule|MixerModule|MML}
     */
    var XSound = function(source, index) {
        var s = String(source).replace(/-/g, '').toLowerCase();

        switch (s) {
            case 'oscillator' :
                if (index === undefined) {
                    return sources.oscillator;
                } else {
                    var i = parseInt(index);

                    if ((i >= 0) && (i < sources.oscillator.sources.length)) {
                        return sources.oscillator.sources[i];
                    }
                }

                break;
            case 'oneshot'  :
            case 'audio'    :
            case 'media'    :
            case 'fallback' :
            case 'stream'   :
            case 'mixer'    :
            case 'mml'      :
                return sources[s];
            default :
                break;
        }
    };

    // for output of error
    var ERROR_MODES = {
        NONE      : 0,
        ALERT     : 1,
        CONSOLE   : 2,
        EXCEPTION : 3
    };

    XSound.ERROR_MODE = ERROR_MODES.CONSOLE;

    // These functions are class (static) methods for XSound

    /** 
     * This static method sets error mode for developers that use this library.
     * @param {string|type} mode This argument is one of 0, 1, 2, 'NONE, 'CONSOLE', 'EXCEPTION'.
     */
    XSound.error = function(mode) {
        switch (String(mode).toUpperCase()) {
            case 'NONE' :
            case '0'    :
                XSound.ERROR_MODE = ERROR_MODES.NONE;
                break;
            case 'ALERT' :
            case '1'     :
                XSound.ERROR_MODE = ERROR_MODES.ALERT;
                break;
            case 'CONSOLE' :
            case '2'       :
                XSound.ERROR_MODE = ERROR_MODES.CONSOLE;
                break;
            case 'EXCEPTION' :
            case '3'         :
                XSound.ERROR_MODE = ERROR_MODES.EXCEPTION;
                break;
            default :
                break;
        }
    };

    /** 
     * This static method reads file of audio or text.
     * @param {Blob} file This argument is the instance of Blob. This is entity of file.
     * @param {string} type This argument is one of 'ArrayBuffer', 'DataURL', 'Text'.
     * @param {function} successCallback This argument is executed as next process when reading file is successful.
     * @param {function} errorCallback This argument is executed when reading file failed.
     * @param {function} progressCallback This argument is executed as "onprogress" event handler in the instance of FileReader.
     */
    XSound.read = function(file, type, successCallback, errorCallback, progressCallback) {
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
            var FILE_IS_NOT_BLOB = 'FILE_IS_NOT_BLOB';

            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(null, FILE_IS_NOT_BLOB);
            }

            return;
        }

        // Create the instance of FileReader
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
     * This static method gets the instance of File (extends Blob).
     * @param {Event} event This argument is the instance of Event by Drag & Drop or "<input type="file">".
     * @param {string} type This argument is one of 'ArrayBuffer', 'DataURL', 'Text'.
     * @param {function} successCallback This argument is executed as next process when reading file is successful.
     * @param {function} errorCallback This argument is executed when reading file failed.
     * @param {function} progressCallback This argument is executed as "onprogress" event handler in the instance of FileReader.
     * @return {File} This is returned as the instance of File (extends Blob).
     */
    XSound.file = function(event, type, successCallback, errorCallback, progressCallback) {
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
            event.stopImmediatePropagation();
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
            // Asynchronously
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
    XSound.ajax = function(url, timeout, successCallback, errorCallback, progressCallback) {
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

        // Create the instance of XMLHttpRequest
        var xhr = new XMLHttpRequest();

        var t = parseInt(timeout);

        // Timeout
        xhr.timeout = (t > 0) ? t : 60000;

        xhr.ontimeout = function(event) {
            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(event, ERROR_AJAX_TIMEOUT);
            }
        };

        // Progress
        xhr.onprogress = function(event) {
            if (Object.prototype.toString.call(progressCallback) === '[object Function]') {
                progressCallback(event);
            }
        };

        // Error
        xhr.onerror = function(event) {
            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(event, ERROR_AJAX);
            }
        };

        // Success
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
     * This static method creates the instance of AudioBuffer from ArrayBuffer.
     * @param {AudioContext} context This argument is the instance of AudioContext for "decodeAudioData" method.
     * @param {ArrayBuffer} arrayBuffer This argument is converted to the instance of AudioBuffer
     * @param {function} successCallback This argument is executed when "decodeAudioData" method is successful.
           The 1st argument in this callback function is the instance of AudioBuffer;
     * @param {function} errorCallback This argument is executed when "decodeAudioData" method failed.
     */
    XSound.decode = function(context, arrayBuffer, successCallback, errorCallback) {
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
    XSound.toFrequencies = function(indexes) {
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
     * This static method calculates minutes and seconds from the designated time in seconds.
     * @param {number} time This argument is the time in seconds.
     * @return {object} This is returned as associative array that has "minutes", "seconds" and "milliseconds" keys.
     */
    XSound.convertTime = function(time) {
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
    XSound.noConflict = function(deep) {
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
     * This static method returns function as closure for getter of cloned module.
     * @return {function} This is returned as closure for getter of cloned module.
     */
    XSound.clone = function() {
        // Closure
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
                case 'oneshot'  :
                case 'audio'    :
                case 'media'    :
                case 'fallback' :
                case 'stream'   :
                case 'mixer'    :
                case 'mml'      :
                    return clones[s];
                default :
                    break;
            };
        };
    };

    /** 
     * This static method releases memory of unnecessary instances.
     * @param {Array.<SoundModule|MML|MediaFallbackModule>} sourceLists This argument is array that has the instances of SoundModule or MML or MediaFallbackModule.
     */
    XSound.free = function(sourceLists) {
        if (!Array.isArray(sourceLists)) {
            sourceLists = [sourceLists];
        }

        for (var i = 0, len = sourceLists.length; i < len; i++) {
            var sourceList = sourceLists[i];

            // Already deleted ?
            if (sourceList === null) {
                continue;
            }

            for (var source in sources) {
                if (sourceList === sources[source]) {
                    sources[source] = null;
                }
            }

            for (var source in clones) {
                if (sourceList === clones[source]) {
                    clones[source] = null;
                }
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

    // Set 2 objects as property of window object
    global.XSound = XSound;
    global.X      = XSound;  // Alias of XSound

    // Export mocks
    global.Mocks                     = {};
    global.Mocks.OscillatorModule    = OscillatorModule;
    global.Mocks.OneshotModule       = OneshotModule;
    global.Mocks.AudioModule         = AudioModule;
    global.Mocks.MediaModule         = MediaModule;
    global.Mocks.MediaFallbackModule = MediaFallbackModule;
    global.Mocks.StreamModule        = StreamModule;
    global.Mocks.MixerModule         = MixerModule;
    global.Mocks.MML                 = MML;

})(window);
