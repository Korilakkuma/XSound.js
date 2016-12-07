describe('StreamModule TEST', function() {

    describe('StreamModule.prototype.param', function() {

        describe('mastervolume', function() {

            afterEach(function() {
                streamModule.param('mastervolume', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(streamModule.param('mastervolume')).toEqual(1);
            });

            // Negative

            it('should return the instance of StreamModule', function() {
                expect(streamModule.param('')).toEqual(jasmine.any(StreamModule));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                streamModule.param('mastervolume', 0.5);
                expect(streamModule.param('mastervolume')).toEqual(0.5);
            });

            it('should return 1', function() {
                streamModule.param('mastervolume', 1);
                expect(streamModule.param('mastervolume')).toEqual(1);
            });

            it('should return 0', function() {
                streamModule.param('mastervolume', 0);
                expect(streamModule.param('mastervolume')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                streamModule.param('mastervolume', 1.1);
                expect(streamModule.param('mastervolume')).toEqual(1);
            });

            it('should return 1', function() {
                streamModule.param('mastervolume', -0.1);
                expect(streamModule.param('mastervolume')).toEqual(1);
            });

        });

    });

});
