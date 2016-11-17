describe('Wah TEST', function() {

    describe('Wah.prototype.param', function() {

        describe('cutoff', function() {

            afterEach(function() {
                wah.param('cutoff', 350);
            });

            // Getter
            // Positive

            it('should return 350', function() {
                expect(wah.param('cutoff')).toEqual(350);
            });

            // Negative

            it('should return the instance of Wah', function() {
                expect(wah.param('')).toEqual(jasmine.any(Wah));
            });

            // Setter
            // Positive

            it('should return 350.5', function() {
                wah.param('cutoff', 350.5);
                expect(wah.param('cutoff')).toEqual(350.5);
            });

            it('should return the Nyquist frequency (half the sample-rate)', function() {
                wah.param('cutoff', (audiocontext.sampleRate / 2));
                expect(wah.param('cutoff')).toEqual(audiocontext.sampleRate / 2);
            });

            it('should return 10', function() {
                wah.param('cutoff', 10);
                expect(wah.param('cutoff')).toEqual(10);
            });

            // Negative

            it('should return 350', function() {
                wah.param('cutoff', ((audiocontext.sampleRate / 2) + 0.1));
                expect(wah.param('cutoff')).toEqual(350);
            });

            it('should return 350', function() {
                wah.param('cutoff', 9.9);
                expect(wah.param('cutoff')).toEqual(350);
            });

        });

        describe('depth', function() {

            afterEach(function() {
                wah.param('depth', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(wah.param('depth')).toEqual(0);
            });

            // Negative

            it('should return the instance of Wah', function() {
                expect(wah.param('')).toEqual(jasmine.any(Wah));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                wah.param('depth', 0.5);
                expect(wah.param('depth')).toEqual(0.5);
            });

            it('should return 1', function() {
                wah.param('depth', 1);
                expect(wah.param('depth')).toEqual(1);
            });

            it('should return 0', function() {
                wah.param('depth', 0);
                expect(wah.param('depth')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                wah.param('depth', 1.1);
                expect(wah.param('depth')).toEqual(0);
            });

            it('should return 0', function() {
                wah.param('depth', -0.1);
                expect(wah.param('depth')).toEqual(0);
            });

        });

        describe('rate', function() {

            afterEach(function() {
                wah.param('rate', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(wah.param('rate')).toEqual(0);
            });

            // Negative

            it('should return the instance of Wah', function() {
                expect(wah.param('')).toEqual(jasmine.any(Wah));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                wah.param('rate', 0.5);
                expect(wah.param('rate')).toEqual(0.5);
            });

            it('should return 100000', function() {
                wah.param('rate', 100000);
                expect(wah.param('rate')).toEqual(100000);
            });

            it('should return 0', function() {
                wah.param('rate', 0);
                expect(wah.param('rate')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                wah.param('rate', 100000.1);
                expect(wah.param('rate')).toEqual(0);
            });

            it('should return 0', function() {
                wah.param('rate', -0.1);
                expect(wah.param('rate')).toEqual(0);
            });

        });

        describe('resonance', function() {

            afterEach(function() {
                wah.param('resonance', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(wah.param('resonance')).toEqual(1);
            });

            // Negative

            it('should return the instance of Wah', function() {
                expect(wah.param('')).toEqual(jasmine.any(Wah));
            });

            // Setter
            // Positive

            it('should return 1000', function() {
                wah.param('resonance', 1000);
                expect(wah.param('resonance')).toEqual(1000);
            });

            it('should return 0.00009999999747378752', function() {
                wah.param('resonance', 0.0001);
                expect(wah.param('resonance')).toEqual(0.00009999999747378752);
            });

            // Negative

            it('should return 1', function() {
                wah.param('resonance', 1000.1);
                expect(wah.param('resonance')).toEqual(1);
            });

            it('should return 1', function() {
                wah.param('resonance', 0.00009999);
                expect(wah.param('resonance')).toEqual(1);
            });

        });

    });

});
