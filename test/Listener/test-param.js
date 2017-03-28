describe('Listener TEST', function() {

    describe('Listener.prototype.param', function() {

        describe('x', function() {

            afterEach(function() {
                listener.param('x', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(listener.param('x')).toEqual(0);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('x', 1000.5);
                expect(listener.param('x')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('x', -1000.5);
                expect(listener.param('x')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                listener.param('x', '');
                expect(listener.param('x')).toEqual(0);
            });

        });

        describe('y', function() {

            afterEach(function() {
                listener.param('y', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(listener.param('y')).toEqual(0);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('y', 1000.5);
                expect(listener.param('y')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('y', -1000.5);
                expect(listener.param('y')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                listener.param('y', '');
                expect(listener.param('y')).toEqual(0);
            });

        });

        describe('z', function() {

            afterEach(function() {
                listener.param('z', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(listener.param('z')).toEqual(0);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('z', 1000.5);
                expect(listener.param('z')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('z', -1000.5);
                expect(listener.param('z')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                listener.param('z', '');
                expect(listener.param('z')).toEqual(0);
            });

        });

        describe('fx', function() {

            afterEach(function() {
                listener.param('fx', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(listener.param('fx')).toEqual(0);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('fx', 1000.5);
                expect(listener.param('fx')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('fx', -1000.5);
                expect(listener.param('fx')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                listener.param('fx', '');
                expect(listener.param('fx')).toEqual(0);
            });

        });

        describe('fy', function() {

            afterEach(function() {
                listener.param('fy', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(listener.param('fy')).toEqual(0);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('fy', 1000.5);
                expect(listener.param('fy')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('fy', -1000.5);
                expect(listener.param('fy')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                listener.param('fy', '');
                expect(listener.param('fy')).toEqual(0);
            });

        });

        describe('fz', function() {

            afterEach(function() {
                listener.param('fz', -1);
            });

            // Getter
            // Positive

            it('should return -1', function() {
                expect(listener.param('fz')).toEqual(-1);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('fz', 1000.5);
                expect(listener.param('fz')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('fz', -1000.5);
                expect(listener.param('fz')).toEqual(-1000.5);
            });

            // Negative

            it('should return -1', function() {
                listener.param('fz', '');
                expect(listener.param('fz')).toEqual(-1);
            });

        });

        describe('ux', function() {

            afterEach(function() {
                listener.param('ux', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(listener.param('ux')).toEqual(0);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('ux', 1000.5);
                expect(listener.param('ux')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('ux', -1000.5);
                expect(listener.param('ux')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                listener.param('ux', '');
                expect(listener.param('ux')).toEqual(0);
            });

        });

        describe('uy', function() {

            afterEach(function() {
                listener.param('uy', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(listener.param('uy')).toEqual(1);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('uy', 1000.5);
                expect(listener.param('uy')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('uy', -1000.5);
                expect(listener.param('uy')).toEqual(-1000.5);
            });

            // Negative

            it('should return 1', function() {
                listener.param('uy', '');
                expect(listener.param('uy')).toEqual(1);
            });

        });

        describe('uz', function() {

            afterEach(function() {
                listener.param('uz', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(listener.param('uz')).toEqual(0);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('uz', 1000.5);
                expect(listener.param('uz')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('uz', -1000.5);
                expect(listener.param('uz')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                listener.param('uz', '');
                expect(listener.param('uz')).toEqual(0);
            });

        });

    });

});
