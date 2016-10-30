describe('SoundModule TEST', function() {

    describe('SoundModule.prototype.module', function() {

        // Negative

        it('should return undefined', function() {
            expect(soundModule.module()).toBeUndefined();
        });

        // Positive

        it('should return the instance of Analyser', function() {
            expect(soundModule.module('analyser')).toEqual(jasmine.any(Mocks.SoundModule.Analyser));
        });

        it('should return the instance of Recorder', function() {
            expect(soundModule.module('recorder')).toEqual(jasmine.any(Mocks.SoundModule.Recorder));
        });

        it('should return the instance of Session', function() {
            expect(soundModule.module('session')).toEqual(jasmine.any(Mocks.SoundModule.Session));
        });

        it('should return the instance of Compressor', function() {
            expect(soundModule.module('compressor')).toEqual(jasmine.any(Mocks.SoundModule.Compressor));
        });

        it('should return the instance of Distortion', function() {
            expect(soundModule.module('distortion')).toEqual(jasmine.any(Mocks.SoundModule.Distortion));
        });

        it('should return the instance of Wah', function() {
            expect(soundModule.module('wah')).toEqual(jasmine.any(Mocks.SoundModule.Wah));
        });

        it('should return the instance of Equalizer', function() {
            expect(soundModule.module('equalizer')).toEqual(jasmine.any(Mocks.SoundModule.Equalizer));
        });

        it('should return the instance of Filter', function() {
            expect(soundModule.module('filter')).toEqual(jasmine.any(Mocks.SoundModule.Filter));
        });

        it('should return the instance of Tremolo', function() {
            expect(soundModule.module('tremolo')).toEqual(jasmine.any(Mocks.SoundModule.Tremolo));
        });

        it('should return the instance of Ringmodulator', function() {
            expect(soundModule.module('ringmodulator')).toEqual(jasmine.any(Mocks.SoundModule.Ringmodulator));
        });

        it('should return the instance of Autopanner', function() {
            expect(soundModule.module('autopanner')).toEqual(jasmine.any(Mocks.SoundModule.Autopanner));
        });

        it('should return the instance of Phaser', function() {
            expect(soundModule.module('phaser')).toEqual(jasmine.any(Mocks.SoundModule.Phaser));
        });

        it('should return the instance of Flanger', function() {
            expect(soundModule.module('flanger')).toEqual(jasmine.any(Mocks.SoundModule.Flanger));
        });

        it('should return the instance of Chorus', function() {
            expect(soundModule.module('chorus')).toEqual(jasmine.any(Mocks.SoundModule.Chorus));
        });

        it('should return the instance of Delay', function() {
            expect(soundModule.module('delay')).toEqual(jasmine.any(Mocks.SoundModule.Delay));
        });

        it('should return the instance of Reverb', function() {
            expect(soundModule.module('reverb')).toEqual(jasmine.any(Mocks.SoundModule.Reverb));
        });

        it('should return the instance of Panner', function() {
            expect(soundModule.module('panner')).toEqual(jasmine.any(Mocks.SoundModule.Panner));
        });

        it('should return the instance of Listener', function() {
            expect(soundModule.module('listener')).toEqual(jasmine.any(Mocks.SoundModule.Listener));
        });

    });

});
