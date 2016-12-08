describe('NoiseGate TEST', function() {

    describe('NoiseGate.prototype.start', function() {

        it('should return 1', function() {
            noisegate.param('level', 0);
            expect(noisegate.start(1)).toEqual(1);
        });

        it('should return 0', function() {
            noisegate.param('level', 1);
            expect(noisegate.start(1)).toEqual(0);
        });

        it('should return 0.55', function() {
            noisegate.param('level', 0.5);
            expect(noisegate.start(0.55)).toEqual(0.55);
        });

        it('should return 0', function() {
            noisegate.param('level', 0.5);
            expect(noisegate.start(0.5)).toEqual(0);
        });

    });

});
