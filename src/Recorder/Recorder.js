(function(global) {
    'use strict';

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

            for (var i = 0; i < n; i++) {this.trackLs[i] = [];}  // n x array
            for (var i = 0; i < n; i++) {this.trackRs[i] = [];}  // n x array
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
                        return this['gain' + k.slice(-1).toUpperCase()];
                    } else {
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

            var blob      = new Blob([new Uint8Array(waves)], {'type': 'audio/wav'});
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

    // Export
    global.Recorder = Recorder;
    global.recorder = new Recorder(audiocontext, 2048, 2, 2);

})(window);
