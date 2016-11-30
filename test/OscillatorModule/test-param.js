describe('OscillatorModule TEST', function() {

    describe('OscillatorModule.prototype.param', function() {

        describe('mastervolume', function() {

            afterEach(function() {
                oscillatorModule.param('mastervolume', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(oscillatorModule.param('mastervolume')).toEqual(1);
            });

            // Negative

            it('should return the instance of OscillatorModule', function() {
                expect(oscillatorModule.param('')).toEqual(jasmine.any(OscillatorModule));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                oscillatorModule.param('mastervolume', 0.5);
                expect(oscillatorModule.param('mastervolume')).toEqual(0.5);
            });

            it('should return 1', function() {
                oscillatorModule.param('mastervolume', 1);
                expect(oscillatorModule.param('mastervolume')).toEqual(1);
            });

            it('should return 0', function() {
                oscillatorModule.param('mastervolume', 0);
                expect(oscillatorModule.param('mastervolume')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                oscillatorModule.param('mastervolume', 1.1);
                expect(oscillatorModule.param('mastervolume')).toEqual(1);
            });

            it('should return 1', function() {
                oscillatorModule.param('mastervolume', -0.1);
                expect(oscillatorModule.param('mastervolume')).toEqual(1);
            });

        });

    });

});
