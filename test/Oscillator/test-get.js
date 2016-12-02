describe('Oscillator TEST', function() {

    describe('Oscillator.prototype.get', function() {

        it('should return the instance of OscillatorNode', function() {
            expect(oscillator.get()).toEqual(jasmine.any(OscillatorNode));
        });

    });

});
