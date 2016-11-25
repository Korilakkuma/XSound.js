describe('Chorus TEST', function() {

    describe('Chorus.prototype.param', function() {

        describe('time', function() {

            afterEach(function() {
                chorus.param('time', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(chorus.param('time')).toEqual(0);
            });

            // Negative

            it('should return the instance of Chorus', function() {
                expect(chorus.param('')).toEqual(jasmine.any(Chorus));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                chorus.param('time', 0.5);
                expect(chorus.param('time')).toEqual(0.5);
            });

            it('should return 1', function() {
                chorus.param('time', 1);
                expect(chorus.param('time')).toEqual(1);
            });

            it('should return 0', function() {
                chorus.param('time', 0);
                expect(chorus.param('time')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                chorus.param('time', 1.1);
                expect(chorus.param('time')).toEqual(0);
            });

            it('should return 0', function() {
                chorus.param('time', -0.1);
                expect(chorus.param('time')).toEqual(0);
            });

        });

        describe('depth', function() {

            afterEach(function() {
                chorus.param('depth', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(chorus.param('depth')).toEqual(0);
            });

            // Negative

            it('should return the instance of Chorus', function() {
                expect(chorus.param('')).toEqual(jasmine.any(Chorus));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                chorus.param('depth', 0.5);
                expect(chorus.param('depth')).toEqual(0.5);
            });

            it('should return 1', function() {
                chorus.param('depth', 1);
                expect(chorus.param('depth')).toEqual(1);
            });

            it('should return 0', function() {
                chorus.param('depth', 0);
                expect(chorus.param('depth')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                chorus.param('depth', 1.1);
                expect(chorus.param('depth')).toEqual(0);
            });

            it('should return 0', function() {
                chorus.param('depth', -0.1);
                expect(chorus.param('depth')).toEqual(0);
            });

        });

        describe('rate', function() {

            afterEach(function() {
                chorus.param('rate', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(chorus.param('rate')).toEqual(0);
            });

            // Negative

            it('should return the instance of Chorus', function() {
                expect(chorus.param('')).toEqual(jasmine.any(Chorus));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                chorus.param('rate', 0.5);
                expect(chorus.param('rate')).toEqual(0.5);
            });

            it('should return 100000', function() {
                chorus.param('rate', 100000);
                expect(chorus.param('rate')).toEqual(100000);
            });

            it('should return 0', function() {
                chorus.param('rate', 0);
                expect(chorus.param('rate')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                chorus.param('rate', 100000.1);
                expect(chorus.param('rate')).toEqual(0);
            });

            it('should return 0', function() {
                chorus.param('rate', -0.1);
                expect(chorus.param('rate')).toEqual(0);
            });

        });

        describe('mix', function() {

            afterEach(function() {
                chorus.param('mix', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(chorus.param('mix')).toEqual(0);
            });

            // Negative

            it('should return the instance of Chorus', function() {
                expect(chorus.param('')).toEqual(jasmine.any(Chorus));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                chorus.param('mix', 0.5);
                expect(chorus.param('mix')).toEqual(0.5);
            });

            it('should return 1', function() {
                chorus.param('mix', 1);
                expect(chorus.param('mix')).toEqual(1);
            });

            it('should return 0', function() {
                chorus.param('mix', 0);
                expect(chorus.param('mix')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                chorus.param('mix', 1.1);
                expect(chorus.param('mix')).toEqual(0);
            });

            it('should return 0', function() {
                chorus.param('mix', -0.1);
                expect(chorus.param('mix')).toEqual(0);
            });

        });

        describe('tone', function() {

            afterEach(function() {
                chorus.param('tone', 350);
            });

            // Getter
            // Positive

            it('should return 350', function() {
                expect(chorus.param('tone')).toEqual(350);
            });

            // Negative

            it('should return the instance of Chorus', function() {
                expect(chorus.param('')).toEqual(jasmine.any(Chorus));
            });

            // Setter
            // Positive

            it('should return 350.5', function() {
                chorus.param('tone', 350.5);
                expect(chorus.param('tone')).toEqual(350.5);
            });

            it('should return the Nyquist tone (half the sample-rate)', function() {
                chorus.param('tone', (audiocontext.sampleRate / 2));
                expect(chorus.param('tone')).toEqual(audiocontext.sampleRate / 2);
            });

            it('should return 10', function() {
                chorus.param('tone', 10);
                expect(chorus.param('tone')).toEqual(10);
            });

            // Negative

            it('should return 350', function() {
                chorus.param('tone', ((audiocontext.sampleRate / 2) + 0.1));
                expect(chorus.param('tone')).toEqual(350);
            });

            it('should return 350', function() {
                chorus.param('tone', 9.9);
                expect(chorus.param('tone')).toEqual(350);
            });

        });

    });

});
