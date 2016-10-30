describe('XSound TEST', function() {

    describe('XSound.clone', function() {

        var C = X.clone();

        // Negative

        it('should return undefined', function() {
            expect(C()).toBeUndefined();
            expect(C('')).toBeUndefined();

            expect(C('oscillator', -1)).toBeUndefined();
            expect(C('oscillator', 3)).toBeUndefined();
        });

        // Positive

        it('should return one of SoundModule, MediaFallbackModule, Oscillator, MML, MIDI', function() {
            expect(C('oscillator')).toEqual(jasmine.any(Mocks.OscillatorModule));
            expect(C('oneshot')).toEqual(jasmine.any(Mocks.OneshotModule));
            expect(C('audio')).toEqual(jasmine.any(Mocks.AudioModule));
            expect(C('media')).toEqual(jasmine.any(Mocks.MediaModule));
            expect(C('fallback')).toEqual(jasmine.any(Mocks.MediaFallbackModule));
            expect(C('stream')).toEqual(jasmine.any(Mocks.StreamModule));
            expect(C('mixer')).toEqual(jasmine.any(Mocks.MixerModule));
            expect(C('midi')).toEqual(jasmine.any(Mocks.MIDI));
            expect(C('mml')).toEqual(jasmine.any(Mocks.MML));

            expect(C('oscillator', 0)).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
            expect(C('oscillator', 2)).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
        });

    });

});
