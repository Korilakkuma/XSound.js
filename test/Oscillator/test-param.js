describe('Oscillator TEST', function() {

    describe('Oscillator.prototype.param', function() {

        describe('type', function() {

            afterEach(function() {
                oscillator.param('type', 'sine');
            });

            // Getter
            // Positive

            it('should return "sine"', function() {
                expect(oscillator.param('type')).toEqual('sine');
            });

            // Negative

            it('should return the instance of Oscillator', function() {
                expect(oscillator.param('')).toEqual(jasmine.any(Oscillator));
            });

            // Setter
            // Positive

            it('should return "sine"', function() {
                oscillator.param('type', 'sine');
                expect(oscillator.param('type')).toEqual('sine');
            });

            it('should return "square"', function() {
                oscillator.param('type', 'square');
                expect(oscillator.param('type')).toEqual('square');
            });

            it('should return "sawtooth"', function() {
                oscillator.param('type', 'sawtooth');
                expect(oscillator.param('type')).toEqual('sawtooth');
            });

            it('should return "triangle"', function() {
                oscillator.param('type', 'triangle');
                expect(oscillator.param('type')).toEqual('triangle');
            });

            it('should return "custom"', function() {
                var value = {
                    'real': new Float32Array([0, 1, 1.5, 2]),
                    'imag': new Float32Array([0, 1, 1.5, 2])
                };

                oscillator.param('type', value);
                expect(oscillator.param('type')).toEqual('custom');
            });

            it('should return "custom"', function() {
                var value = {
                    'real': [0, 1, 1.5, 2],
                    'imag': [0, 1, 1.5, 2]
                };

                oscillator.param('type', value);
                expect(oscillator.param('type')).toEqual('custom');
            });

            // Negative
            it('should return "sine"', function() {
                oscillator.param('type', '');
                expect(oscillator.param('type')).toEqual('sine');
            });

            it('should return "sine"', function() {
                var value = {
                    'r': [0, 1, 1.5, 2],
                    'i': [0, 1, 1.5, 2]
                };

                oscillator.param('type', value);
                expect(oscillator.param('type')).toEqual('sine');
            });

        });

        describe('gain', function() {

            afterEach(function() {
                oscillator.param('gain', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(oscillator.param('gain')).toEqual(1);
            });

            // Negative

            it('should return the instance of Oscillator', function() {
                expect(oscillator.param('')).toEqual(jasmine.any(Oscillator));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                oscillator.param('gain', 0.5);
                expect(oscillator.param('gain')).toEqual(0.5);
            });

            it('should return 1', function() {
                oscillator.param('gain', 1);
                expect(oscillator.param('gain')).toEqual(1);
            });

            it('should return 0', function() {
                oscillator.param('gain', 0);
                expect(oscillator.param('gain')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                oscillator.param('gain', 1.1);
                expect(oscillator.param('gain')).toEqual(1);
            });

            it('should return 1', function() {
                oscillator.param('gain', -0.1);
                expect(oscillator.param('gain')).toEqual(1);
            });

        });

        describe('octave', function() {

            afterEach(function() {
                oscillator.param('octave', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(oscillator.param('octave')).toEqual(0);
            });

            // Negative

            it('should return the instance of Oscillator', function() {
                expect(oscillator.param('')).toEqual(jasmine.any(Oscillator));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                oscillator.param('octave', 0.5);
                expect(oscillator.param('octave')).toEqual(0.5);
            });

            it('should return 4', function() {
                oscillator.param('octave', 4);
                expect(oscillator.param('octave')).toEqual(4);
            });

            it('should return -4', function() {
                oscillator.param('octave', -4);
                expect(oscillator.param('octave')).toEqual(-4);
            });

            // Negative

            it('should return 0', function() {
                oscillator.param('octave', 4.1);
                expect(oscillator.param('octave')).toEqual(0);
            });

            it('should return 0', function() {
                oscillator.param('octave', -4.1);
                expect(oscillator.param('octave')).toEqual(0);
            });

        });

        describe('fine', function() {

            afterEach(function() {
                oscillator.param('fine', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(oscillator.param('fine')).toEqual(0);
            });

            // Negative

            it('should return the instance of Oscillator', function() {
                expect(oscillator.param('')).toEqual(jasmine.any(Oscillator));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                oscillator.param('fine', 0.5);
                expect(oscillator.param('fine')).toEqual(0.5);
            });

            it('should return 1200', function() {
                oscillator.param('fine', 1200);
                expect(oscillator.param('fine')).toEqual(1200);
            });

            it('should return -1200', function() {
                oscillator.param('fine', -1200);
                expect(oscillator.param('fine')).toEqual(-1200);
            });

            // Negative

            it('should return 0', function() {
                oscillator.param('fine', 1200.1);
                expect(oscillator.param('fine')).toEqual(0);
            });

            it('should return 0', function() {
                oscillator.param('fine', -1200.1);
                expect(oscillator.param('fine')).toEqual(0);
            });

        });

    });

});
