(function(global) {
    'use strict';

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
        } else if ((source instanceof Mocks.OscillatorModule) || (source instanceof Mocks.OneshotModule)) {
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
            } else if (this.source instanceof Mocks.OscillatorModule) {
                this.source.start(sequence.frequencies, connects, processCallback);

                for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                    if (sequence.indexes[i] !== 'R') {
                        this.callbacks.start(sequence, i);
                    }
                }
            } else if (this.source instanceof Mocks.OneshotModule) {
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
                } else if (self.source instanceof Mocks.OscillatorModule) {
                    self.source.stop(sequence.frequencies, processCallback);

                    for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                        if (sequence.indexes[i] !== 'R') {
                            self.callbacks.stop(sequence, i);
                        }
                    }
                } else if (self.source instanceof Mocks.OneshotModule) {
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
        } else if (this.source instanceof Mocks.OscillatorModule) {
            this.source.stop(sequence.frequencies, processCallback);

            for (var i = 0, len = sequence.indexes.length; i < len; i++) {
                if (sequence.indexes[i] !== 'R') {
                    this.callbacks.stop(sequence, i);
                }
            }
        } else if (this.source instanceof Mocks.OneshotModule) {
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

    // Export
    global.MML = MML;
    global.mml = new MML(audiocontext);

})(window);
