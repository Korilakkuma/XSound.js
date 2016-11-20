describe('Autopanner TEST', function() {

    describe('Autopanner.prototype.param', function() {

        describe('depth', function() {

            afterEach(function() {
                autopanner.param('depth', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(autopanner.param('depth')).toEqual(0);
            });

            // Negative

            it('should return the instance of Autopanner', function() {
                expect(autopanner.param('')).toEqual(jasmine.any(Autopanner));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                autopanner.param('depth', 0.5);
                expect(autopanner.param('depth')).toEqual(0.5);
            });

            it('should return 1', function() {
                autopanner.param('depth', 1);
                expect(autopanner.param('depth')).toEqual(1);
            });

            it('should return 0', function() {
                autopanner.param('depth', 0);
                expect(autopanner.param('depth')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                autopanner.param('depth', 1.1);
                expect(autopanner.param('depth')).toEqual(0);
            });

            it('should return 0', function() {
                autopanner.param('depth', -0.1);
                expect(autopanner.param('depth')).toEqual(0);
            });

        });

        describe('rate', function() {

            afterEach(function() {
                autopanner.param('rate', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(autopanner.param('rate')).toEqual(0);
            });

            // Negative

            it('should return the instance of Autopanner', function() {
                expect(autopanner.param('')).toEqual(jasmine.any(Autopanner));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                autopanner.param('rate', 0.5);
                expect(autopanner.param('rate')).toEqual(0.5);
            });

            it('should return 100000', function() {
                autopanner.param('rate', 100000);
                expect(autopanner.param('rate')).toEqual(100000);
            });

            it('should return 0', function() {
                autopanner.param('rate', 0);
                expect(autopanner.param('rate')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                autopanner.param('rate', 100000.1);
                expect(autopanner.param('rate')).toEqual(0);
            });

            it('should return 0', function() {
                autopanner.param('rate', -0.1);
                expect(autopanner.param('rate')).toEqual(0);
            });

        });

    });

});
