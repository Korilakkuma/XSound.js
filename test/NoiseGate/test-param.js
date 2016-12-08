describe('NoiseGate TEST', function() {

    describe('NoiseGate.prototype.param', function() {

        describe('level', function() {

            afterEach(function() {
                noisegate.param('level', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(noisegate.param('level')).toEqual(0);
            });

            // Negative

            it('should return the instance of NoiseGate', function() {
                expect(noisegate.param('')).toEqual(jasmine.any(NoiseGate));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                noisegate.param('level', 0.5);
                expect(noisegate.param('level')).toEqual(0.5);
            });

            it('should return 1', function() {
                noisegate.param('level', 1);
                expect(noisegate.param('level')).toEqual(1);
            });

            it('should return 0', function() {
                noisegate.param('level', 0);
                expect(noisegate.param('level')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                noisegate.param('level', 1.1);
                expect(noisegate.param('level')).toEqual(0);
            });

            it('should return 0', function() {
                noisegate.param('level', -0.1);
                expect(noisegate.param('level')).toEqual(0);
            });

        });

    });

});
