describe('Flanger TEST', function() {

    describe('Flanger.prototype.param', function() {

        describe('time', function() {

            afterEach(function() {
                flanger.param('time', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(flanger.param('time')).toEqual(0);
            });

            // Negative

            it('should return the instance of Flanger', function() {
                expect(flanger.param('')).toEqual(jasmine.any(Flanger));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                flanger.param('time', 0.5);
                expect(flanger.param('time')).toEqual(0.5);
            });

            it('should return 1', function() {
                flanger.param('time', 1);
                expect(flanger.param('time')).toEqual(1);
            });

            it('should return 0', function() {
                flanger.param('time', 0);
                expect(flanger.param('time')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                flanger.param('time', 1.1);
                expect(flanger.param('time')).toEqual(0);
            });

            it('should return 0', function() {
                flanger.param('time', -0.1);
                expect(flanger.param('time')).toEqual(0);
            });

        });

        describe('depth', function() {

            afterEach(function() {
                flanger.param('depth', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(flanger.param('depth')).toEqual(0);
            });

            // Negative

            it('should return the instance of Flanger', function() {
                expect(flanger.param('')).toEqual(jasmine.any(Flanger));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                flanger.param('depth', 0.5);
                expect(flanger.param('depth')).toEqual(0.5);
            });

            it('should return 1', function() {
                flanger.param('depth', 1);
                expect(flanger.param('depth')).toEqual(1);
            });

            it('should return 0', function() {
                flanger.param('depth', 0);
                expect(flanger.param('depth')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                flanger.param('depth', 1.1);
                expect(flanger.param('depth')).toEqual(0);
            });

            it('should return 0', function() {
                flanger.param('depth', -0.1);
                expect(flanger.param('depth')).toEqual(0);
            });

        });

        describe('rate', function() {

            afterEach(function() {
                flanger.param('rate', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(flanger.param('rate')).toEqual(0);
            });

            // Negative

            it('should return the instance of Flanger', function() {
                expect(flanger.param('')).toEqual(jasmine.any(Flanger));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                flanger.param('rate', 0.5);
                expect(flanger.param('rate')).toEqual(0.5);
            });

            it('should return 100000', function() {
                flanger.param('rate', 100000);
                expect(flanger.param('rate')).toEqual(100000);
            });

            it('should return 0', function() {
                flanger.param('rate', 0);
                expect(flanger.param('rate')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                flanger.param('rate', 100000.1);
                expect(flanger.param('rate')).toEqual(0);
            });

            it('should return 0', function() {
                flanger.param('rate', -0.1);
                expect(flanger.param('rate')).toEqual(0);
            });

        });

        describe('mix', function() {

            afterEach(function() {
                flanger.param('mix', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(flanger.param('mix')).toEqual(0);
            });

            // Negative

            it('should return the instance of Flanger', function() {
                expect(flanger.param('')).toEqual(jasmine.any(Flanger));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                flanger.param('mix', 0.5);
                expect(flanger.param('mix')).toEqual(0.5);
            });

            it('should return 1', function() {
                flanger.param('mix', 1);
                expect(flanger.param('mix')).toEqual(1);
            });

            it('should return 0', function() {
                flanger.param('mix', 0);
                expect(flanger.param('mix')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                flanger.param('mix', 1.1);
                expect(flanger.param('mix')).toEqual(0);
            });

            it('should return 0', function() {
                flanger.param('mix', -0.1);
                expect(flanger.param('mix')).toEqual(0);
            });

        });

        describe('tone', function() {

            afterEach(function() {
                flanger.param('tone', 350);
            });

            // Getter
            // Positive

            it('should return 350', function() {
                expect(flanger.param('tone')).toEqual(350);
            });

            // Negative

            it('should return the instance of Flanger', function() {
                expect(flanger.param('')).toEqual(jasmine.any(Flanger));
            });

            // Setter
            // Positive

            it('should return 350.5', function() {
                flanger.param('tone', 350.5);
                expect(flanger.param('tone')).toEqual(350.5);
            });

            it('should return the Nyquist tone (half the sample-rate)', function() {
                flanger.param('tone', (audiocontext.sampleRate / 2));
                expect(flanger.param('tone')).toEqual(audiocontext.sampleRate / 2);
            });

            it('should return 10', function() {
                flanger.param('tone', 10);
                expect(flanger.param('tone')).toEqual(10);
            });

            // Negative

            it('should return 350', function() {
                flanger.param('tone', ((audiocontext.sampleRate / 2) + 0.1));
                expect(flanger.param('tone')).toEqual(350);
            });

            it('should return 350', function() {
                flanger.param('tone', 9.9);
                expect(flanger.param('tone')).toEqual(350);
            });

        });

        describe('feedback', function() {

            afterEach(function() {
                flanger.param('feedback', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(flanger.param('feedback')).toEqual(0);
            });

            // Negative

            it('should return the instance of Flanger', function() {
                expect(flanger.param('')).toEqual(jasmine.any(Flanger));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                flanger.param('feedback', 0.5);
                expect(flanger.param('feedback')).toEqual(0.5);
            });

            it('should return 1', function() {
                flanger.param('feedback', 1);
                expect(flanger.param('feedback')).toEqual(1);
            });

            it('should return 0', function() {
                flanger.param('feedback', 0);
                expect(flanger.param('feedback')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                flanger.param('feedback', 1.1);
                expect(flanger.param('feedback')).toEqual(0);
            });

            it('should return 0', function() {
                flanger.param('feedback', -0.1);
                expect(flanger.param('feedback')).toEqual(0);
            });

        });

    });

});
