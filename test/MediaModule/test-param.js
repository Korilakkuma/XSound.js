describe('MediaModule TEST', function() {

    describe('MediaModule.prototype.param', function() {

        describe('mastervolume', function() {

            afterEach(function() {
                mediaModule.param('mastervolume', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(mediaModule.param('mastervolume')).toEqual(1);
            });

            // Negative

            it('should return the instance of MediaModule', function() {
                expect(mediaModule.param('')).toEqual(jasmine.any(MediaModule));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                mediaModule.param('mastervolume', 0.5);
                expect(mediaModule.param('mastervolume')).toEqual(0.5);
            });

            it('should return 1', function() {
                mediaModule.param('mastervolume', 1);
                expect(mediaModule.param('mastervolume')).toEqual(1);
            });

            it('should return 0', function() {
                mediaModule.param('mastervolume', 0);
                expect(mediaModule.param('mastervolume')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                mediaModule.param('mastervolume', 1.1);
                expect(mediaModule.param('mastervolume')).toEqual(1);
            });

            it('should return 1', function() {
                mediaModule.param('mastervolume', -0.1);
                expect(mediaModule.param('mastervolume')).toEqual(1);
            });

        });

        describe('playbackRate', function() {

            afterEach(function() {
                mediaModule.param('playbackRate', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(mediaModule.param('playbackRate')).toEqual(1);
            });

            // Negative

            it('should return the instance of MediaModule', function() {
                expect(mediaModule.param('')).toEqual(jasmine.any(MediaModule));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                mediaModule.param('playbackRate', 0.5);
                expect(mediaModule.param('playbackRate')).toEqual(0.5);
            });

            // Negative

            it('should return 1', function() {
                mediaModule.param('playbackRate', 0.4999999);
                expect(mediaModule.param('playbackRate')).toEqual(1);
            });

        });

        describe('loop', function() {

            afterEach(function() {
                mediaModule.param('loop', false);
            });

            // Getter
            // Positive

            it('should return false', function() {
                expect(mediaModule.param('loop')).toBeFalsy();
            });

            // Negative

            it('should return the instance of MediaModule', function() {
                expect(mediaModule.param('')).toEqual(jasmine.any(MediaModule));
            });

            // Setter

            it('should return true', function() {
                mediaModule.param('loop', true);
                expect(mediaModule.param('loop')).toBeTruthy();
            });

            it('should return false', function() {
                mediaModule.param('loop', false);
                expect(mediaModule.param('loop')).toBeFalsy();
            });

        });

        describe('muted', function() {

            afterEach(function() {
                mediaModule.param('muted', false);
            });

            // Getter
            // Positive

            it('should return false', function() {
                expect(mediaModule.param('muted')).toBeFalsy();
            });

            // Negative

            it('should return the instance of MediaModule', function() {
                expect(mediaModule.param('')).toEqual(jasmine.any(MediaModule));
            });

            // Setter

            it('should return true', function() {
                mediaModule.param('muted', true);
                expect(mediaModule.param('muted')).toBeTruthy();
            });

            it('should return false', function() {
                mediaModule.param('muted', false);
                expect(mediaModule.param('muted')).toBeFalsy();
            });

        });

        describe('controls', function() {

            afterEach(function() {
                mediaModule.param('controls', false);
            });

            // Getter
            // Positive

            it('should return false', function() {
                expect(mediaModule.param('controls')).toBeFalsy();
            });

            // Negative

            it('should return the instance of MediaModule', function() {
                expect(mediaModule.param('')).toEqual(jasmine.any(MediaModule));
            });

            // Setter

            it('should return true', function() {
                mediaModule.param('controls', true);
                expect(mediaModule.param('controls')).toBeTruthy();
            });

            it('should return false', function() {
                mediaModule.param('controls', false);
                expect(mediaModule.param('controls')).toBeFalsy();
            });

        });

    });

});
