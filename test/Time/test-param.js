describe('Time TEST', function() {

    describe('Time.prototype.param', function() {

        describe('type', function() {

            afterEach(function() {
                time.param('type', Time.TYPES.UINT);
            });

            // Getter
            // Positive

            it('should return "uint"', function() {
                expect(time.param('type')).toEqual('uint');
            });

            // Negative

            it('should return the instance of Time', function() {
                expect(time.param('')).toEqual(jasmine.any(Time));
            });

            // Setter
            // Positive

            it('should return "uint"', function() {
                time.param('type', Time.TYPES.UINT);
                expect(time.param('type')).toEqual('uint');
            });

            it('should return "float"', function() {
                time.param('type', Time.TYPES.FLOAT);
                expect(time.param('type')).toEqual('float');
            });

            // Negative

            it('should return "uint"', function() {
                time.param('type', 'double');
                expect(time.param('type')).toEqual('uint');
            });

        });

        describe('textInterval', function() {

            afterEach(function() {
                time.param('textInterval', 0.005);
            });

            // Getter
            // Positive

            it('should return 0.005', function() {
                expect(time.param('textInterval')).toEqual(0.005);
            });

            // Negative

            it('should return the instance of Time', function() {
                expect(time.param('')).toEqual(jasmine.any(Time));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                time.param('textInterval', 0.5);
                expect(time.param('textInterval')).toEqual(0.5);
            });

            // Negative

            it('should return 0.005', function() {
                time.param('textInterval', 0);
                expect(time.param('textInterval')).toEqual(0.005);
            });

        });

    });

});
