describe('Analyser TEST', function() {

    describe('Analyser.prototype.param', function() {

        describe('fftSize', function() {

            afterEach(function() {
                analyser.param('fftSize', 2048);
            });

            // Getter
            // Positive

            it('should return 2048', function() {
                expect(analyser.param('fftSize')).toEqual(2048);
            });

            // Negative

            it('should return the instance of Analyser', function() {
                expect(analyser.param('')).toEqual(jasmine.any(Analyser));
            });

            // Setter
            // Positive

            it('should return 32', function() {
                analyser.param('fftSize', 32);
                expect(analyser.param('fftSize')).toEqual(32);
            });

            it('should return 64', function() {
                analyser.param('fftSize', 64);
                expect(analyser.param('fftSize')).toEqual(64);
            });

            it('should return 128', function() {
                analyser.param('fftSize', 128);
                expect(analyser.param('fftSize')).toEqual(128);
            });

            it('should return 256', function() {
                analyser.param('fftSize', 256);
                expect(analyser.param('fftSize')).toEqual(256);
            });

            it('should return 512', function() {
                analyser.param('fftSize', 512);
                expect(analyser.param('fftSize')).toEqual(512);
            });

            it('should return 1024', function() {
                analyser.param('fftSize', 1024);
                expect(analyser.param('fftSize')).toEqual(1024);
            });

            it('should return 2048', function() {
                analyser.param('fftSize', 2048);
                expect(analyser.param('fftSize')).toEqual(2048);
            });

            // Negative

            it('should return 2048', function() {
                analyser.param('fftSize', 4096);
                expect(analyser.param('fftSize')).toEqual(2048);
            });

        });

        describe('frequencyBinCount', function() {

            it('should return 1024', function() {
                expect(analyser.param('frequencyBinCount')).toEqual(1024);
            });

        });

        describe('minDecibels', function() {

            afterEach(function() {
                analyser.param('minDecibels', -100);
            });

            // Getter
            // Positive

            it('should return -100', function() {
                expect(analyser.param('minDecibels')).toEqual(-100);
            });

            // Negative

            it('should return the instance of Analyser', function() {
                expect(analyser.param('')).toEqual(jasmine.any(Analyser));
            });

            // Setter
            // Positive

            it('should return -30.5', function() {
                analyser.param('minDecibels', -30.5);
                expect(analyser.param('minDecibels')).toEqual(-30.5);
            });

            // Negative

            it('should return -100', function() {
                analyser.param('minDecibels', -30);
                expect(analyser.param('minDecibels')).toEqual(-100);
            });

        });

        describe('maxDecibels', function() {

            afterEach(function() {
                analyser.param('maxDecibels', -30);
            });

            // Getter
            // Positive

            it('should return -30', function() {
                expect(analyser.param('maxDecibels')).toEqual(-30);
            });

            // Negative

            it('should return the instance of Analyser', function() {
                expect(analyser.param('')).toEqual(jasmine.any(Analyser));
            });

            // Setter
            // Positive

            it('should return -99.5', function() {
                analyser.param('maxDecibels', -99.5);
                expect(analyser.param('maxDecibels')).toEqual(-99.5);
            });

            // Negative

            it('should return -30', function() {
                analyser.param('maxDecibels', -100);
                expect(analyser.param('maxDecibels')).toEqual(-30);
            });

        });

        describe('smoothingTimeConstant', function() {

            afterEach(function() {
                analyser.param('smoothingTimeConstant', 0.8);
            });

            // Getter
            // Positive

            it('should return 0.8', function() {
                expect(analyser.param('smoothingTimeConstant')).toEqual(0.8);
            });

            // Negative

            it('should return the instance of Analyser', function() {
                expect(analyser.param('')).toEqual(jasmine.any(Analyser));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                analyser.param('smoothingTimeConstant', 0.5);
                expect(analyser.param('smoothingTimeConstant')).toEqual(0.5);
            });

            it('should return 1', function() {
                analyser.param('smoothingTimeConstant', 1);
                expect(analyser.param('smoothingTimeConstant')).toEqual(1);
            });

            it('should return 0', function() {
                analyser.param('smoothingTimeConstant', 0);
                expect(analyser.param('smoothingTimeConstant')).toEqual(0);
            });

            // Negative

            it('should return 0.8', function() {
                analyser.param('smoothingTimeConstant', 1.1);
                expect(analyser.param('smoothingTimeConstant')).toEqual(0.8);
            });

            it('should return 0.8', function() {
                analyser.param('smoothingTimeConstant', -0.1);
                expect(analyser.param('smoothingTimeConstant')).toEqual(0.8);
            });

        });

    });

});
