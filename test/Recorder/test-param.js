describe('Recorder TEST', function() {

    describe('Recorder.prototype.param', function() {

        describe('gainL', function() {

            afterEach(function() {
                recorder.param('gainL', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(recorder.param('gainL')).toEqual(1);
            });

            // Negative

            it('should return the instance of Recorder', function() {
                expect(recorder.param('')).toEqual(jasmine.any(Recorder));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                recorder.param('gainL', 0.5);
                expect(recorder.param('gainL')).toEqual(0.5);
            });

            it('should return 1', function() {
                recorder.param('gainL', 1);
                expect(recorder.param('gainL')).toEqual(1);
            });

            it('should return 0', function() {
                recorder.param('gainL', 0);
                expect(recorder.param('gainL')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                recorder.param('gainL', 1.1);
                expect(recorder.param('gainL')).toEqual(1);
            });

            it('should return 1', function() {
                recorder.param('gainL', -0.1);
                expect(recorder.param('gainL')).toEqual(1);
            });

        });

        describe('gainR', function() {

            afterEach(function() {
                recorder.param('gainR', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(recorder.param('gainR')).toEqual(1);
            });

            // Negative

            it('should return the instance of Recorder', function() {
                expect(recorder.param('')).toEqual(jasmine.any(Recorder));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                recorder.param('gainR', 0.5);
                expect(recorder.param('gainR')).toEqual(0.5);
            });

            it('should return 1', function() {
                recorder.param('gainR', 1);
                expect(recorder.param('gainR')).toEqual(1);
            });

            it('should return 0', function() {
                recorder.param('gainR', 0);
                expect(recorder.param('gainR')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                recorder.param('gainR', 1.1);
                expect(recorder.param('gainR')).toEqual(1);
            });

            it('should return 1', function() {
                recorder.param('gainR', -0.1);
                expect(recorder.param('gainR')).toEqual(1);
            });

        });

    });

});
