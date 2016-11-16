describe('Distortion TEST', function() {

    describe('Distortion.prototype.param', function() {

        describe('curve', function() {

            afterEach(function() {
                distortion.param('curve', 'clean');
            });

            // Getter
            // Positive

            it('should return null', function() {
                expect(distortion.param('curve')).toBeNull();
            });

            // Negative

            it('should return the instance of Distortion', function() {
                expect(distortion.param('')).toEqual(jasmine.any(Distortion));
            });

            // Setter

            it('should return null', function() {
                distortion.param('curve', Distortion.CURVES.CLEAN);
                expect(distortion.param('curve')).toBeNull();
            });

            it('should return the instance of Float32Array', function() {
                distortion.param('curve', Distortion.CURVES.CRUNCH);
                expect(distortion.param('curve')).toEqual(jasmine.any(Float32Array));
            });

            it('should return the instance of Float32Array', function() {
                distortion.param('curve', Distortion.CURVES.OVERDRIVE);
                expect(distortion.param('curve')).toEqual(jasmine.any(Float32Array));
            });

            it('should return the instance of Float32Array', function() {
                distortion.param('curve', Distortion.CURVES.DISTORTION);
                expect(distortion.param('curve')).toEqual(jasmine.any(Float32Array));
            });

            it('should return the instance of Float32Array', function() {
                distortion.param('curve', Distortion.CURVES.FUZZ);
                expect(distortion.param('curve')).toEqual(jasmine.any(Float32Array));
            });

            it('should return the instance of Float32Array', function() {
                distortion.param('curve', new Float32Array([1, 1.5, 2]));
                expect(distortion.param('curve')).toEqual(jasmine.any(Float32Array));
            });

        });

        describe('samples', function() {

            afterEach(function() {
                distortion.param('samples', 4096);
            });

            // Getter
            // Positive

            it('should return 4096', function() {
                expect(distortion.param('samples')).toEqual(4096);
            });

            // Negative

            it('should return the instance of Distortion', function() {
                expect(distortion.param('')).toEqual(jasmine.any(Distortion));
            });

            // Setter
            // Positive

            it('should return 16384', function() {
                distortion.param('samples', 16384);
                expect(distortion.param('samples')).toEqual(16384);
            });

            it('should return 0', function() {
                distortion.param('samples', 0);
                expect(distortion.param('samples')).toEqual(0);
            });

            // Negative

            it('should return 4096', function() {
                distortion.param('samples', -1);
                expect(distortion.param('samples')).toEqual(4096);
            });

        });

        describe('drive', function() {

            afterEach(function() {
                distortion.param('drive', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(distortion.param('drive')).toEqual(1);
            });

            // Negative

            it('should return the instance of Distortion', function() {
                expect(distortion.param('')).toEqual(jasmine.any(Distortion));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                distortion.param('drive', 0.5);
                expect(distortion.param('drive')).toEqual(0.5);
            });

            it('should return 1', function() {
                distortion.param('drive', 1);
                expect(distortion.param('drive')).toEqual(1);
            });

            it('should return 0', function() {
                distortion.param('drive', 0);
                expect(distortion.param('drive')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                distortion.param('drive', 1.1);
                expect(distortion.param('drive')).toEqual(1);
            });

            it('should return 1', function() {
                distortion.param('drive', -0.1);
                expect(distortion.param('drive')).toEqual(1);
            });

        });

        describe('color', function() {

            afterEach(function() {
                distortion.param('color', 350);
            });

            // Getter
            // Positive

            it('should return 350', function() {
                expect(distortion.param('color')).toEqual(350);
            });

            // Negative

            it('should return the instance of Distortion', function() {
                expect(distortion.param('')).toEqual(jasmine.any(Distortion));
            });

            // Setter
            // Positive

            it('should return 350.5', function() {
                distortion.param('color', 350.5);
                expect(distortion.param('color')).toEqual(350.5);
            });

            it('should return the Nyquist frequency (half the sample-rate)', function() {
                distortion.param('color', (audiocontext.sampleRate / 2));
                expect(distortion.param('color')).toEqual(audiocontext.sampleRate / 2);
            });

            it('should return 10', function() {
                distortion.param('color', 10);
                expect(distortion.param('color')).toEqual(10);
            });

            // Negative

            it('should return 350', function() {
                distortion.param('color', ((audiocontext.sampleRate / 2) + 0.1));
                expect(distortion.param('color')).toEqual(350);
            });

            it('should return 350', function() {
                distortion.param('color', 9.9);
                expect(distortion.param('color')).toEqual(350);
            });

        });

        describe('tone', function() {

            afterEach(function() {
                distortion.param('tone', 350);
            });

            // Getter
            // Positive

            it('should return 350', function() {
                expect(distortion.param('tone')).toEqual(350);
            });

            // Negative

            it('should return the instance of Distortion', function() {
                expect(distortion.param('')).toEqual(jasmine.any(Distortion));
            });

            // Setter
            // Positive

            it('should return 350.5', function() {
                distortion.param('tone', 350.5);
                expect(distortion.param('tone')).toEqual(350.5);
            });

            it('should return the Nyquist frequency (half the sample-rate)', function() {
                distortion.param('tone', (audiocontext.sampleRate / 2));
                expect(distortion.param('tone')).toEqual(audiocontext.sampleRate / 2);
            });

            it('should return 10', function() {
                distortion.param('tone', 10);
                expect(distortion.param('tone')).toEqual(10);
            });

            // Negative

            it('should return 350', function() {
                distortion.param('tone', ((audiocontext.sampleRate / 2) + 0.1));
                expect(distortion.param('tone')).toEqual(350);
            });

            it('should return 350', function() {
                distortion.param('tone', 9.9);
                expect(distortion.param('tone')).toEqual(350);
            });

        });

    });

});
