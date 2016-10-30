describe('XSound TEST', function() {

    describe('XSound', function() {

        // Negative

        it('should return undefined', function() {
            expect(X()).toBeUndefined();
            expect(X('')).toBeUndefined();

            expect(X('oscillator', -1)).toBeUndefined();
            expect(X('oscillator', 3)).toBeUndefined();
        });

        // Positive

        it('should return one of SoundModule, MediaFallbackModule, Oscillator, MML, MIDI', function() {
            expect(X('oscillator')).toEqual(jasmine.any(Mocks.OscillatorModule));
            expect(X('oneshot')).toEqual(jasmine.any(Mocks.OneshotModule));
            expect(X('audio')).toEqual(jasmine.any(Mocks.AudioModule));
            expect(X('media')).toEqual(jasmine.any(Mocks.MediaModule));
            expect(X('fallback')).toEqual(jasmine.any(Mocks.MediaFallbackModule));
            expect(X('stream')).toEqual(jasmine.any(Mocks.StreamModule));
            expect(X('mixer')).toEqual(jasmine.any(Mocks.MixerModule));
            expect(X('midi')).toEqual(jasmine.any(Mocks.MIDI));
            expect(X('mml')).toEqual(jasmine.any(Mocks.MML));

            expect(X('oscillator', 0)).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
            expect(X('oscillator', 2)).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
        });

    });

});
