describe('Class (Static) Method TEST', function() {

    describe('XSound.clone()', function() {

        var C = X.clone();

        // Negative
        it('should return undefined', function() {
            expect(C()).toBeUndefined();
            expect(C('')).toBeUndefined();

            expect(C('oscillator', -1)).toBeUndefined();
            expect(C('oscillator', 3)).toBeUndefined();
        });

        // Positive
        it('should return one of SoundModule, MediaFallbackModule, Oscillator, MML', function() {
            expect(C('oscillator') instanceof Mocks.OscillatorModule).toBeTruthy();
            expect(C('oneshot')    instanceof Mocks.OneshotModule).toBeTruthy();
            expect(C('audio')      instanceof Mocks.AudioModule).toBeTruthy();
            expect(C('media')      instanceof Mocks.MediaModule).toBeTruthy();
            expect(C('fallback')   instanceof Mocks.MediaFallbackModule).toBeTruthy();
            expect(C('stream')     instanceof Mocks.StreamModule).toBeTruthy();
            expect(C('mixer')      instanceof Mocks.MixerModule).toBeTruthy();
            expect(C('mml')        instanceof Mocks.MML).toBeTruthy();

            expect(C('oscillator', 0) instanceof Mocks.OscillatorModule.Oscillator).toBeTruthy();
            expect(C('oscillator', 2) instanceof Mocks.OscillatorModule.Oscillator).toBeTruthy();
        });

    });

});
