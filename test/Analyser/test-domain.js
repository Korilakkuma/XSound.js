describe('Analyser TEST', function() {

    describe('Analyser.prototype.domain', function() {

        // Negative

        it('should return undefined', function() {
            expect(analyser.domain()).toBeUndefined();
            expect(analyser.domain('')).toBeUndefined();
        });

        // Positive

        it('should return one of TimeOverview, Time, FFT', function() {
            expect(analyser.domain('timeOverviewL')).toEqual(jasmine.any(Mocks.SoundModule.Analyser.TimeOverview));
            expect(analyser.domain('timeOverviewR')).toEqual(jasmine.any(Mocks.SoundModule.Analyser.TimeOverview));
            expect(analyser.domain('time')).toEqual(jasmine.any(Mocks.SoundModule.Analyser.Time));
            expect(analyser.domain('fft')).toEqual(jasmine.any(Mocks.SoundModule.Analyser.FFT));
        });

    });

});
