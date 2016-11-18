describe('Equalizer TEST', function() {

    describe('Equalizer.prototype.param', function() {

        describe('bass', function() {

            afterEach(function() {
                equalizer.param('bass', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(equalizer.param('bass')).toEqual(0);
            });

            // Negative

            it('should return the instance of Equalizer', function() {
                expect(equalizer.param('')).toEqual(jasmine.any(Equalizer));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                equalizer.param('bass', 0.5);
                expect(equalizer.param('bass')).toEqual(0.5);
            });

            it('should return 40', function() {
                equalizer.param('bass', 40);
                expect(equalizer.param('bass')).toEqual(40);
            });

            it('should return -40', function() {
                equalizer.param('bass', -40);
                expect(equalizer.param('bass')).toEqual(-40);
            });

            // Negative

            it('should return 0', function() {
                equalizer.param('bass', 40.1);
                expect(equalizer.param('bass')).toEqual(0);
            });

            it('should return 0', function() {
                equalizer.param('bass', -40.1);
                expect(equalizer.param('bass')).toEqual(0);
            });

        });

        describe('middle', function() {

            afterEach(function() {
                equalizer.param('middle', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(equalizer.param('middle')).toEqual(0);
            });

            // Negative

            it('should return the instance of Equalizer', function() {
                expect(equalizer.param('')).toEqual(jasmine.any(Equalizer));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                equalizer.param('middle', 0.5);
                expect(equalizer.param('middle')).toEqual(0.5);
            });

            it('should return 40', function() {
                equalizer.param('middle', 40);
                expect(equalizer.param('middle')).toEqual(40);
            });

            it('should return -40', function() {
                equalizer.param('middle', -40);
                expect(equalizer.param('middle')).toEqual(-40);
            });

            // Negative

            it('should return 0', function() {
                equalizer.param('middle', 40.1);
                expect(equalizer.param('middle')).toEqual(0);
            });

            it('should return 0', function() {
                equalizer.param('middle', -40.1);
                expect(equalizer.param('middle')).toEqual(0);
            });

        });

        describe('treble', function() {

            afterEach(function() {
                equalizer.param('treble', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(equalizer.param('treble')).toEqual(0);
            });

            // Negative

            it('should return the instance of Equalizer', function() {
                expect(equalizer.param('')).toEqual(jasmine.any(Equalizer));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                equalizer.param('treble', 0.5);
                expect(equalizer.param('treble')).toEqual(0.5);
            });

            it('should return 40', function() {
                equalizer.param('treble', 40);
                expect(equalizer.param('treble')).toEqual(40);
            });

            it('should return -40', function() {
                equalizer.param('treble', -40);
                expect(equalizer.param('treble')).toEqual(-40);
            });

            // Negative

            it('should return 0', function() {
                equalizer.param('treble', 40.1);
                expect(equalizer.param('treble')).toEqual(0);
            });

            it('should return 0', function() {
                equalizer.param('treble', -40.1);
                expect(equalizer.param('treble')).toEqual(0);
            });

        });

        describe('presence', function() {

            afterEach(function() {
                equalizer.param('presence', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(equalizer.param('presence')).toEqual(0);
            });

            // Negative

            it('should return the instance of Equalizer', function() {
                expect(equalizer.param('')).toEqual(jasmine.any(Equalizer));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                equalizer.param('presence', 0.5);
                expect(equalizer.param('presence')).toEqual(0.5);
            });

            it('should return 40', function() {
                equalizer.param('presence', 40);
                expect(equalizer.param('presence')).toEqual(40);
            });

            it('should return -40', function() {
                equalizer.param('presence', -40);
                expect(equalizer.param('presence')).toEqual(-40);
            });

            // Negative

            it('should return 0', function() {
                equalizer.param('presence', 40.1);
                expect(equalizer.param('presence')).toEqual(0);
            });

            it('should return 0', function() {
                equalizer.param('presence', -40.1);
                expect(equalizer.param('presence')).toEqual(0);
            });

        });

    });

});
