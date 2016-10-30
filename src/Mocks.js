(function(global) {
    'use strict';

    // Mocks

    function Statable() {
        this.isActive = true;
    }

    Statable.prototype.state = function() {
        return this.isActive;
    };

    function SoundModule(context, bufferSize) {
        this.mastervolume = context.createGain();

        this.Listener = new Listener();
        this.analyser = new Analyser();
        this.recorder = new Recorder();
        this.session  = new Session();

        this.compressor        = new Compressor();
        this.distortion        = new Distortion();
        this.wah               = new Wah();
        this.equalizer         = new Equalizer();
        this.filter            = new Filter();
        this.autopanner        = new Autopanner();
        this.tremolo           = new Tremolo();
        this.ringmodulator     = new Ringmodulator();
        this.phaser            = new Phaser();
        this.flanger           = new Flanger();
        this.chorus            = new Chorus();
        this.delay             = new Delay();
        this.reverb            = new Reverb();
        this.panner            = new Panner();
        this.envelopegenerator = new EnvelopeGenerator();
    }

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
            default :
                break;
        }
    };

    SoundModule.prototype.params = function() {
        return {};
    };

    function Listener(context) {
    }

    function Analyser(context) {
    }

    function Visualizer(sampleRate) {
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

    Visualizer.prototype.param = function() {
    };

    function TimeOverview(sampleRate) {
    }

    function Time(sampleRate) {
    }

    function FFT(sampleRate) {
    }

    Analyser.Visualizer   = Visualizer;
    Analyser.TimeOverview = TimeOverview;
    Analyser.Time         = Time;
    Analyser.FFT          = FFT;

    function Recorder(context, bufferSize, numInput, numOutput) {
    }

    function Session(context, bufferSize, numInput, numOutput, analyser) {
    }

    function Effector(context, bufferSize) {
        Statable.call(this);

        this.context = context;

        this.input  = context.createGain();
        this.output = context.createGain();

        this.lfo       = context.createOscillator();
        this.depth     = context.createGain();
        this.rate      = this.lfo.frequency;
        this.processor = context.createScriptProcessor(bufferSize, 1, 2);

        this.lfo.start = this.lfo.start || this.lfo.noteOn;
        this.lfo.stop  = this.lfo.stop  || this.lfo.noteOff;

        this.values = {};

        this.isStop = true;
    }

    /** @implements {Statable} */
    Effector.prototype = Object.create(Statable.prototype);
    Effector.prototype.constructor = Effector;

    Effector.prototype.connect = function() {
    };

    function Compressor(context, bufferSize) {
    }

    function Distortion(context, bufferSize) {
    }

    function Wah(context, bufferSize) {
    }

    function Equalizer(context, bufferSize) {
    }

    function Filter(context, bufferSize) {
    }

    function Autopanner(context, bufferSize) {
    }

    function Tremolo(context, bufferSize) {
    }

    function Ringmodulator(context, bufferSize) {
    }

    function Phaser(context, bufferSize) {
    }

    function Flanger(context, bufferSize) {
    }

    function Chorus(context, bufferSize) {
    }

    function Delay(context, bufferSize) {
    }

    function Reverb(context, bufferSize) {
    }

    function Panner(context, bufferSize) {
    }

    function EnvelopeGenerator(context) {
    }

    EnvelopeGenerator.prototype.setGenerator = function() {
    };

    SoundModule.Listener          = Listener;
    SoundModule.Analyser          = Analyser;
    SoundModule.Recorder          = Recorder;
    SoundModule.Session           = Session;
    SoundModule.Effector          = Effector;
    SoundModule.Compressor        = Compressor;
    SoundModule.Distortion        = Distortion;
    SoundModule.Wah               = Wah;
    SoundModule.Equalizer         = Equalizer;
    SoundModule.Filter            = Filter;
    SoundModule.Autopanner        = Autopanner;
    SoundModule.Tremolo           = Tremolo;
    SoundModule.Ringmodulator     = Ringmodulator;
    SoundModule.Phaser            = Phaser;
    SoundModule.Flanger           = Flanger;
    SoundModule.Chorus            = Chorus;
    SoundModule.Delay             = Delay;
    SoundModule.Reverb            = Reverb;
    SoundModule.Panner            = Panner;
    SoundModule.EnvelopeGenerator = EnvelopeGenerator;

    function OscillatorModule(context) {
        this.sources = [new Oscillator(), new Oscillator(), new Oscillator()];
    }

    OscillatorModule.prototype.length = function() {
        return this.sources.length;
    };

    OscillatorModule.prototype.get = function() {
        return this.sources[0];
    };

    function Oscillator(context, state) {
        Statable.call(this);

        this.isActive = state;
    }

    /** @implements {Statable} */
    Oscillator.prototype = Object.create(Statable.prototype);
    Oscillator.prototype.constructor = Oscillator;

    Oscillator.prototype.param = function(key) {
        switch (key) {
            case 'type'  : return 'sine';
            case 'gain'  : return 1;
            case 'octave': return 0;
            case 'fine'  : return 0;
        }
    };

    function Glide() {
    }

    Glide.prototype.param = function(key) {
        switch (key) {
            case 'type': return 'linear';
            case 'time': return 0;
        }
    };

    OscillatorModule.Oscillator = Oscillator;
    OscillatorModule.Glide      = Glide;

    function OneshotModule(context) {
    }

    function AudioModule(context) {
        this.vocalcanceler = new VocalCanceler();
    }

    function VocalCanceler() {
    }

    VocalCanceler.prototype.param = function() {
        return 0;
    };

    AudioModule.VocalCanceler = VocalCanceler;

    function MediaModule(context) {
    }

    function MediaFallbackModule() {
    }

    function StreamModule(context) {
    }

    function NoiseGate() {
    }

    NoiseGate.prototype.param = function() {
        return 0;
    };

    StreamModule.NoiseGate = NoiseGate;

    function MixerModule(context) {
    }

    function MML(context) {
    }

    function MIDI(context) {
    }

    // Export
    global.Mocks                     = {};
    global.Mocks.SoundModule         = SoundModule;
    global.Mocks.OscillatorModule    = OscillatorModule;
    global.Mocks.OneshotModule       = OneshotModule;
    global.Mocks.AudioModule         = AudioModule;
    global.Mocks.MediaModule         = MediaModule;
    global.Mocks.MediaFallbackModule = MediaFallbackModule;
    global.Mocks.StreamModule        = StreamModule;
    global.Mocks.MixerModule         = MixerModule;
    global.Mocks.MML                 = MML;
    global.Mocks.MIDI                = MIDI;

    global.Mocks.Statable = Statable;

})(window);
