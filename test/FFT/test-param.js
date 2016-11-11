describe('FFT TEST', function() {

    describe('FFT.prototype.param', function() {

        describe('type', function() {

            afterEach(function() {
                fft.param('type', FFT.TYPES.UINT);
            });

            // Getter
            // Positive

            it('should return "uint"', function() {
                expect(fft.param('type')).toEqual('uint');
            });

            // Negative

            it('should return the instance of FFT', function() {
                expect(fft.param('')).toEqual(jasmine.any(FFT));
            });

            // Setter
            // Positive

            it('should return "uint"', function() {
                fft.param('type', FFT.TYPES.UINT);
                expect(fft.param('type')).toEqual('uint');
            });

            it('should return "float"', function() {
                fft.param('type', FFT.TYPES.FLOAT);
                expect(fft.param('type')).toEqual('float');
            });

            // Negative

            it('should return "uint"', function() {
                fft.param('type', 'double');
                expect(fft.param('type')).toEqual('uint');
            });

        });

        describe('size', function() {

            afterEach(function() {
                fft.param('size', 256);
            });

            // Getter
            // Positive

            it('should return 256', function() {
                expect(fft.param('size')).toEqual(256);
            });

            // Negative

            it('should return the instance of FFT', function() {
                expect(fft.param('')).toEqual(jasmine.any(FFT));
            });

            // Setter
            // Positive

            it('should return 1024', function() {
                fft.param('size', 1024);
                expect(fft.param('size')).toEqual(1024);
            });

            // Negative

            it('should return 256', function() {
                fft.param('size', 1025);
                expect(fft.param('size')).toEqual(256);
            });

            it('should return 256', function() {
                fft.param('size', 0);
                expect(fft.param('size')).toEqual(256);
            });

        });

        describe('textInterval', function() {

            afterEach(function() {
                fft.param('textInterval', 1000);
            });

            // Getter
            // Positive

            it('should return 0.005', function() {
                expect(fft.param('textInterval')).toEqual(1000);
            });

            // Negative

            it('should return the instance of FFT', function() {
                expect(fft.param('')).toEqual(jasmine.any(FFT));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                fft.param('textInterval', 0.5);
                expect(fft.param('textInterval')).toEqual(0.5);
            });

            // Negative

            it('should return 1000', function() {
                fft.param('textInterval', 0);
                expect(fft.param('textInterval')).toEqual(1000);
            });

        });

    });

});
