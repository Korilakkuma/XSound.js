describe('Glide TEST', function() {

    describe('Glide.prototype.param', function() {

        describe('time', function() {

            afterEach(function() {
                glide.param('time', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(glide.param('time')).toEqual(0);
            });

            // Negative

            it('should return the instance of Glide', function() {
                expect(glide.param('')).toEqual(jasmine.any(Glide));
            });

            // Setter
            // Positive

            it('should return 10.5', function() {
                glide.param('time', 10.5);
                expect(glide.param('time')).toEqual(10.5);
            });

            it('should return 0', function() {
                glide.param('time', 0);
                expect(glide.param('time')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                glide.param('time', -0.1);
                expect(glide.param('time')).toEqual(0);
            });

        });

        describe('type', function() {

            afterEach(function() {
                glide.param('type', Glide.TYPES.LINEAR);
            });

            // Getter
            // Positive

            it('should return "linear"', function() {
                expect(glide.param('type')).toEqual('linear');
            });

            // Negative

            it('should return the instance of Glide', function() {
                expect(glide.param('')).toEqual(jasmine.any(Glide));
            });

            // Setter
            // Positive

            it('should return "linear"', function() {
                glide.param('type', Glide.TYPES.LINEAR);
                expect(glide.param('type')).toEqual('linear');
            });

            it('should return "exponential"', function() {
                glide.param('type', Glide.TYPES.EXPONENTIAL);
                expect(glide.param('type')).toEqual('exponential');
            });

            // Negative

            it('should return "linear"', function() {
                glide.param('type', '');
                expect(glide.param('type')).toEqual('linear');
            });

        });

    });

});
