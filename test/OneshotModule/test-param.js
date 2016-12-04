describe('OneshotModule TEST', function() {

    describe('OneshotModule.prototype.param', function() {

        describe('mastervolume', function() {

            afterEach(function() {
                oneshotModule.param('mastervolume', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(oneshotModule.param('mastervolume')).toEqual(1);
            });

            // Negative

            it('should return the instance of OneshotModule', function() {
                expect(oneshotModule.param('')).toEqual(jasmine.any(OneshotModule));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                oneshotModule.param('mastervolume', 0.5);
                expect(oneshotModule.param('mastervolume')).toEqual(0.5);
            });

            it('should return 1', function() {
                oneshotModule.param('mastervolume', 1);
                expect(oneshotModule.param('mastervolume')).toEqual(1);
            });

            it('should return 0', function() {
                oneshotModule.param('mastervolume', 0);
                expect(oneshotModule.param('mastervolume')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                oneshotModule.param('mastervolume', 1.1);
                expect(oneshotModule.param('mastervolume')).toEqual(1);
            });

            it('should return 1', function() {
                oneshotModule.param('mastervolume', -0.1);
                expect(oneshotModule.param('mastervolume')).toEqual(1);
            });

        });

        describe('transpose', function() {

            afterEach(function() {
                oneshotModule.param('transpose', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(oneshotModule.param('transpose')).toEqual(1);
            });

            // Negative

            it('should return the instance of OneshotModule', function() {
                expect(oneshotModule.param('')).toEqual(jasmine.any(OneshotModule));
            });

            // Setter
            // Positive

            it('should return 0.1', function() {
                oneshotModule.param('transpose', 0.1);
                expect(oneshotModule.param('transpose')).toEqual(0.1);
            });

            // Negative

            it('should return 1', function() {
                oneshotModule.param('transpose', 0);
                expect(oneshotModule.param('transpose')).toEqual(1);
            });

        });

    });

});
