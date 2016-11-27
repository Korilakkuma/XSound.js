describe('Reverb TEST', function() {

    describe('Reverb.prototype.param', function() {

        describe('dry', function() {

            afterEach(function() {
                reverb.param('dry', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(reverb.param('dry')).toEqual(1);
            });

            // Negative

            it('should return the instance of Reverb', function() {
                expect(reverb.param('')).toEqual(jasmine.any(Reverb));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                reverb.param('dry', 0.5);
                expect(reverb.param('dry')).toEqual(0.5);
            });

            it('should return 1', function() {
                reverb.param('dry', 1);
                expect(reverb.param('dry')).toEqual(1);
            });

            it('should return 0', function() {
                reverb.param('dry', 0);
                expect(reverb.param('dry')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                reverb.param('dry', 1.1);
                expect(reverb.param('dry')).toEqual(1);
            });

            it('should return 1', function() {
                reverb.param('dry', -0.1);
                expect(reverb.param('dry')).toEqual(1);
            });

        });

        describe('wet', function() {

            afterEach(function() {
                reverb.param('wet', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(reverb.param('wet')).toEqual(0);
            });

            // Negative

            it('should return the instance of Reverb', function() {
                expect(reverb.param('')).toEqual(jasmine.any(Reverb));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                reverb.param('wet', 0.5);
                expect(reverb.param('wet')).toEqual(0.5);
            });

            it('should return 1', function() {
                reverb.param('wet', 1);
                expect(reverb.param('wet')).toEqual(1);
            });

            it('should return 0', function() {
                reverb.param('wet', 0);
                expect(reverb.param('wet')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                reverb.param('wet', 1.1);
                expect(reverb.param('wet')).toEqual(0);
            });

            it('should return 0', function() {
                reverb.param('wet', -0.1);
                expect(reverb.param('wet')).toEqual(0);
            });

        });

        describe('tone', function() {

            afterEach(function() {
                reverb.param('tone', 350);
            });

            // Getter
            // Positive

            it('should return 350', function() {
                expect(reverb.param('tone')).toEqual(350);
            });

            // Negative

            it('should return the instance of Reverb', function() {
                expect(reverb.param('')).toEqual(jasmine.any(Reverb));
            });

            // Setter
            // Positive

            it('should return 350.5', function() {
                reverb.param('tone', 350.5);
                expect(reverb.param('tone')).toEqual(350.5);
            });

            it('should return the Nyquist tone (half the sample-rate)', function() {
                reverb.param('tone', (audiocontext.sampleRate / 2));
                expect(reverb.param('tone')).toEqual(audiocontext.sampleRate / 2);
            });

            it('should return 10', function() {
                reverb.param('tone', 10);
                expect(reverb.param('tone')).toEqual(10);
            });

            // Negative

            it('should return 350', function() {
                reverb.param('tone', ((audiocontext.sampleRate / 2) + 0.1));
                expect(reverb.param('tone')).toEqual(350);
            });

            it('should return 350', function() {
                reverb.param('tone', 9.9);
                expect(reverb.param('tone')).toEqual(350);
            });

        });

    });

});
