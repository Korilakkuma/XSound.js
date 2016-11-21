describe('Tremolo TEST', function() {

    describe('Tremolo.prototype.param', function() {

        describe('depth', function() {

            afterEach(function() {
                tremolo.param('depth', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(tremolo.param('depth')).toEqual(0);
            });

            // Negative

            it('should return the instance of Tremolo', function() {
                expect(tremolo.param('')).toEqual(jasmine.any(Tremolo));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                tremolo.param('depth', 0.5);
                expect(tremolo.param('depth')).toEqual(0.5);
            });

            it('should return 1', function() {
                tremolo.param('depth', 1);
                expect(tremolo.param('depth')).toEqual(1);
            });

            it('should return 0', function() {
                tremolo.param('depth', 0);
                expect(tremolo.param('depth')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                tremolo.param('depth', 1.1);
                expect(tremolo.param('depth')).toEqual(0);
            });

            it('should return 0', function() {
                tremolo.param('depth', -0.1);
                expect(tremolo.param('depth')).toEqual(0);
            });

        });

        describe('rate', function() {

            afterEach(function() {
                tremolo.param('rate', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(tremolo.param('rate')).toEqual(0);
            });

            // Negative

            it('should return the instance of Tremolo', function() {
                expect(tremolo.param('')).toEqual(jasmine.any(Tremolo));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                tremolo.param('rate', 0.5);
                expect(tremolo.param('rate')).toEqual(0.5);
            });

            it('should return 100000', function() {
                tremolo.param('rate', 100000);
                expect(tremolo.param('rate')).toEqual(100000);
            });

            it('should return 0', function() {
                tremolo.param('rate', 0);
                expect(tremolo.param('rate')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                tremolo.param('rate', 100000.1);
                expect(tremolo.param('rate')).toEqual(0);
            });

            it('should return 0', function() {
                tremolo.param('rate', -0.1);
                expect(tremolo.param('rate')).toEqual(0);
            });

        });

        describe('wave', function() {

            afterEach(function() {
                tremolo.param('wave', 'sine');
            });

            // Getter
            // Positive

            it('should return "sine"', function() {
                expect(tremolo.param('wave')).toEqual('sine');
            });

            // Negative

            it('should return the instance of Tremolo', function() {
                expect(tremolo.param('')).toEqual(jasmine.any(Tremolo));
            });

            // Setter
            // Positive

            it('should return "sine"', function() {
                tremolo.param('wave', 'sine');
                expect(tremolo.param('wave')).toEqual('sine');
            });

            it('should return "square"', function() {
                tremolo.param('wave', 'square');
                expect(tremolo.param('wave')).toEqual('square');
            });

            it('should return "sawtooth"', function() {
                tremolo.param('wave', 'sawtooth');
                expect(tremolo.param('wave')).toEqual('sawtooth');
            });

            it('should return "triangle"', function() {
                tremolo.param('wave', 'triangle');
                expect(tremolo.param('wave')).toEqual('triangle');
            });

            // Negative

            it('should return "sine"', function() {
                tremolo.param('wave', '');
                expect(tremolo.param('wave')).toEqual('sine');
            });

        });

    });

});
