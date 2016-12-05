describe('VocalCanceler TEST', function() {

    describe('VocalCanceler.prototype.param', function() {

        describe('depth', function() {

            afterEach(function() {
                vocalcanceler.param('depth', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(vocalcanceler.param('depth')).toEqual(0);
            });

            // Negative

            it('should return the instance of VocalCanceler', function() {
                expect(vocalcanceler.param('')).toEqual(jasmine.any(VocalCanceler));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                vocalcanceler.param('depth', 0.5);
                expect(vocalcanceler.param('depth')).toEqual(0.5);
            });

            it('should return 1', function() {
                vocalcanceler.param('depth', 1);
                expect(vocalcanceler.param('depth')).toEqual(1);
            });

            it('should return 0', function() {
                vocalcanceler.param('depth', 0);
                expect(vocalcanceler.param('depth')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                vocalcanceler.param('depth', 1.1);
                expect(vocalcanceler.param('depth')).toEqual(0);
            });

            it('should return 0', function() {
                vocalcanceler.param('depth', -0.1);
                expect(vocalcanceler.param('depth')).toEqual(0);
            });

        });

    });

});
