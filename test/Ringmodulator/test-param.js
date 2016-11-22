describe('Ringmodulator TEST', function() {

    describe('Ringmodulator.prototype.param', function() {

        describe('depth', function() {

            afterEach(function() {
                ringmodulator.param('depth', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(ringmodulator.param('depth')).toEqual(1);
            });

            // Negative

            it('should return the instance of Ringmodulator', function() {
                expect(ringmodulator.param('')).toEqual(jasmine.any(Ringmodulator));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                ringmodulator.param('depth', 0.5);
                expect(ringmodulator.param('depth')).toEqual(0.5);
            });

            it('should return 1', function() {
                ringmodulator.param('depth', 1);
                expect(ringmodulator.param('depth')).toEqual(1);
            });

            it('should return 0', function() {
                ringmodulator.param('depth', 0);
                expect(ringmodulator.param('depth')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                ringmodulator.param('depth', 1.1);
                expect(ringmodulator.param('depth')).toEqual(1);
            });

            it('should return 1', function() {
                ringmodulator.param('depth', -0.1);
                expect(ringmodulator.param('depth')).toEqual(1);
            });

        });

        describe('rate', function() {

            afterEach(function() {
                ringmodulator.param('rate', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(ringmodulator.param('rate')).toEqual(0);
            });

            // Negative

            it('should return the instance of Ringmodulator', function() {
                expect(ringmodulator.param('')).toEqual(jasmine.any(Ringmodulator));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                ringmodulator.param('rate', 0.5);
                expect(ringmodulator.param('rate')).toEqual(0.5);
            });

            it('should return 100000', function() {
                ringmodulator.param('rate', 100000);
                expect(ringmodulator.param('rate')).toEqual(100000);
            });

            it('should return 0', function() {
                ringmodulator.param('rate', 0);
                expect(ringmodulator.param('rate')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                ringmodulator.param('rate', 100000.1);
                expect(ringmodulator.param('rate')).toEqual(0);
            });

            it('should return 0', function() {
                ringmodulator.param('rate', -0.1);
                expect(ringmodulator.param('rate')).toEqual(0);
            });

        });

    });

});
