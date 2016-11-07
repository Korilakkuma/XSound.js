(function(global) {
    'use strict';

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

        // Set default value
        this.analyser.fftSize               = 2048;
        this.analyser.minDecibels           = -100;
        this.analyser.maxDecibels           = -30;
        this.analyser.smoothingTimeConstant = 0.8;

        this.timeOverviewL = new Mocks.SoundModule.Analyser.TimeOverview(context.sampleRate);
        this.timeOverviewR = new Mocks.SoundModule.Analyser.TimeOverview(context.sampleRate);
        this.time          = new Mocks.SoundModule.Analyser.Time(context.sampleRate);
        this.fft           = new Mocks.SoundModule.Analyser.FFT(context.sampleRate);
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
                        return this.analyser.fftSize;
                    } else {
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
                        return this.analyser.minDecibels;
                    } else {
                        var v   = parseFloat(value);
                        var max = -30;

                        if (v < max) {
                            this.analyser.minDecibels = v;
                        }
                    }

                    break;
                case 'maxdecibels':
                    if (value === undefined) {
                        return this.analyser.maxDecibels;
                    } else {
                        var v   = parseFloat(value);
                        var min = -100;

                        if (v > min) {
                            this.analyser.maxDecibels = v;
                        }
                    }

                    break;
                case 'smoothingtimeconstant':
                    if (value === undefined) {
                        return this.analyser.smoothingTimeConstant;
                    } else {
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
                    this.time.start(data);
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
     * @param {string} domain This argument is one of 'timeOverviewL', 'timeOverviewR', 'time', 'fft'.
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

    // Export
    global.Analyser = Analyser;
    global.analyser = new Analyser(audiocontext);

})(window);
