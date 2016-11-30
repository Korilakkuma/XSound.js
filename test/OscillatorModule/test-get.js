describe('OscillatorModule TEST', function() {

    describe('OscillatorModule.prototype.get', function() {

        beforeEach(function() {
            oscillatorModule.setup([true, false]);
        });

        afterEach(function() {
            oscillatorModule.setup();
        });

        // Positive

        it('should return the instance of Oscillator', function() {
            expect(oscillatorModule.get(0)).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
        });

        it('should return the instance of Oscillator', function() {
            expect(oscillatorModule.get(1)).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
        });

        it('should return array that contains the instances of Oscillator', function() {
            var oscillators = oscillatorModule.get();

            expect(oscillators[0]).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
            expect(oscillators[1]).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
        });

        // Negative

        it('should return array that contains the instances of Oscillator', function() {
            var oscillators = oscillatorModule.get(-1);

            expect(oscillators[0]).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
            expect(oscillators[1]).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
        });

        it('should return array that contains the instances of Oscillator', function() {
            var oscillators = oscillatorModule.get(3);

            expect(oscillators[0]).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
            expect(oscillators[1]).toEqual(jasmine.any(Mocks.OscillatorModule.Oscillator));
        });

    });

});
