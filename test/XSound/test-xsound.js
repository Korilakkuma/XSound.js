describe('XSound function TEST', function() {

    describe('XSound', function() {

        // Negative
        it('should return undefined', function() {
            expect(X()).toBeUndefined();
            expect(X('')).toBeUndefined();

            expect(X('oscillator', -1)).toBeUndefined();
            expect(X('oscillator', 3)).toBeUndefined();
        });

        // Positive
        it('should return one of SoundModule, MediaFallbackModule, Oscillator, MML', function() {
            expect(X('oscillator') instanceof Mocks.OscillatorModule).toBeTruthy();
            expect(X('oneshot')    instanceof Mocks.OneshotModule).toBeTruthy();
            expect(X('audio')      instanceof Mocks.AudioModule).toBeTruthy();
            expect(X('media')      instanceof Mocks.MediaModule).toBeTruthy();
            expect(X('fallback')   instanceof Mocks.MediaFallbackModule).toBeTruthy();
            expect(X('stream')     instanceof Mocks.StreamModule).toBeTruthy();
            expect(X('mixer')      instanceof Mocks.MixerModule).toBeTruthy();
            expect(X('mml')        instanceof Mocks.MML).toBeTruthy();

            expect(X('oscillator', 0) instanceof Mocks.OscillatorModule.Oscillator).toBeTruthy();
            expect(X('oscillator', 2) instanceof Mocks.OscillatorModule.Oscillator).toBeTruthy();
        });

    });

});
