describe('AudioModule TEST', function() {

    describe('AudioModule.prototype.param', function() {

        describe('mastervolume', function() {

            afterEach(function() {
                audioModule.param('mastervolume', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(audioModule.param('mastervolume')).toEqual(1);
            });

            // Negative

            it('should return the instance of AudioModule', function() {
                expect(audioModule.param('')).toEqual(jasmine.any(AudioModule));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                audioModule.param('mastervolume', 0.5);
                expect(audioModule.param('mastervolume')).toEqual(0.5);
            });

            it('should return 1', function() {
                audioModule.param('mastervolume', 1);
                expect(audioModule.param('mastervolume')).toEqual(1);
            });

            it('should return 0', function() {
                audioModule.param('mastervolume', 0);
                expect(audioModule.param('mastervolume')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                audioModule.param('mastervolume', 1.1);
                expect(audioModule.param('mastervolume')).toEqual(1);
            });

            it('should return 1', function() {
                audioModule.param('mastervolume', -0.1);
                expect(audioModule.param('mastervolume')).toEqual(1);
            });

        });

        describe('playbackRate', function() {

            afterEach(function() {
                audioModule.param('playbackRate', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(audioModule.param('playbackRate')).toEqual(1);
            });

            // Negative

            it('should return the instance of AudioModule', function() {
                expect(audioModule.param('')).toEqual(jasmine.any(AudioModule));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                audioModule.param('playbackRate', 0.5);
                expect(audioModule.param('playbackRate')).toEqual(0.5);
            });

            it('should return 1024', function() {
                audioModule.param('playbackRate', 1);
                expect(audioModule.param('playbackRate')).toEqual(1);
            });

            it('should return 0', function() {
                audioModule.param('playbackRate', 0);
                expect(audioModule.param('playbackRate')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                audioModule.param('playbackRate', 1024.1);
                expect(audioModule.param('playbackRate')).toEqual(1);
            });

            it('should return 1', function() {
                audioModule.param('playbackRate', -0.1);
                expect(audioModule.param('playbackRate')).toEqual(1);
            });

        });

        describe('loop', function() {

            afterEach(function() {
                audioModule.param('loop', false);
            });

            // Getter
            // Positive

            it('should return false', function() {
                expect(audioModule.param('loop')).toBeFalsy();
            });

            // Negative

            it('should return the instance of AudioModule', function() {
                expect(audioModule.param('')).toEqual(jasmine.any(AudioModule));
            });

            // Setter

            it('should return true', function() {
                audioModule.param('loop', true);
                expect(audioModule.param('loop')).toBeTruthy();
            });

            it('should return false', function() {
                audioModule.param('loop', false);
                expect(audioModule.param('loop')).toBeFalsy();
            });

        });

    });

});
