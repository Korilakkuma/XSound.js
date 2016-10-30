(function(global) {
    'use strict';

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
        this.context    = context;
        this.sampleRate = context.sampleRate;

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

        this.plugins  = [];

        this.analyser = new Mocks.SoundModule.Analyser(context);
        this.recorder = new Mocks.SoundModule.Recorder(context, this.bufferSize, SoundModule.NUMBER_OF_INPUTS, SoundModule.NUMBER_OF_OUTPUTS);
        this.session  = new Mocks.SoundModule.Session(context, this.bufferSize, SoundModule.NUMBER_OF_INPUTS, SoundModule.NUMBER_OF_OUTPUTS, this.analyser);

        // for OscillatorModule, OneshotModule
        this.envelopegenerator = new Mocks.SoundModule.EnvelopeGenerator(context);

        this.compressor    = new Mocks.SoundModule.Compressor(context, this.bufferSize);
        this.distortion    = new Mocks.SoundModule.Distortion(context, this.bufferSize);
        this.wah           = new Mocks.SoundModule.Wah(context, this.bufferSize);
        this.equalizer     = new Mocks.SoundModule.Equalizer(context, this.bufferSize);
        this.filter        = new Mocks.SoundModule.Filter(context, this.bufferSize);
        this.tremolo       = new Mocks.SoundModule.Tremolo(context, this.bufferSize);
        this.ringmodulator = new Mocks.SoundModule.Ringmodulator(context, this.bufferSize);
        this.autopanner    = new Mocks.SoundModule.Autopanner(context, this.bufferSize);
        this.phaser        = new Mocks.SoundModule.Phaser(context, this.bufferSize);
        this.flanger       = new Mocks.SoundModule.Flanger(context, this.bufferSize);
        this.chorus        = new Mocks.SoundModule.Chorus(context, this.bufferSize);
        this.delay         = new Mocks.SoundModule.Delay(context, this.bufferSize);
        this.reverb        = new Mocks.SoundModule.Reverb(context, this.bufferSize);
        this.panner        = new Mocks.SoundModule.Panner(context, this.bufferSize);
        this.listener      = new Mocks.SoundModule.Listener(context);

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
                    return this.mastervolume.gain.value;
                } else {
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

    // Export
    global.SoundModule = SoundModule;
    global.soundModule = new SoundModule(audiocontext);

})(window);
