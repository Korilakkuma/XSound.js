describe('Listener TEST', function() {

    describe('Listener.prototype.param', function() {

        describe('dopplerFactor', function() {

            afterEach(function() {
                listener.param('dopplerFactor', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(listener.param('dopplerFactor')).toEqual(1);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 100.5', function() {
                listener.param('dopplerFactor', 100.5);
                expect(listener.param('dopplerFactor')).toEqual(100.5);
            });

            it('should return 0', function() {
                listener.param('dopplerFactor', 0);
                expect(listener.param('dopplerFactor')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                listener.param('dopplerFactor', -0.1);
                expect(listener.param('dopplerFactor')).toEqual(1);
            });

        });

        describe('speedOfSound', function() {

            afterEach(function() {
                listener.param('speedOfSound', 343.3);
            });

            // Getter
            // Positive

            it('should return 343.29998779296875', function() {
                expect(listener.param('speedOfSound')).toEqual(343.29998779296875);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('speedOfSound', 1000.5);
                expect(listener.param('speedOfSound')).toEqual(1000.5);
            });

            it('should return 0', function() {
                listener.param('speedOfSound', 0);
                expect(listener.param('speedOfSound')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                listener.param('speedOfSound', -0.1);
                expect(listener.param('speedOfSound')).toEqual(343.29998779296875);
            });

        });

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

        describe('vx', function() {

            afterEach(function() {
                listener.param('vx', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(listener.param('vx')).toEqual(0);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('vx', 1000.5);
                expect(listener.param('vx')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('vx', -1000.5);
                expect(listener.param('vx')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                listener.param('vx', '');
                expect(listener.param('vx')).toEqual(0);
            });

        });

        describe('vy', function() {

            afterEach(function() {
                listener.param('vy', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(listener.param('vy')).toEqual(0);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('vy', 1000.5);
                expect(listener.param('vy')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('vy', -1000.5);
                expect(listener.param('vy')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                listener.param('vy', '');
                expect(listener.param('vy')).toEqual(0);
            });

        });

        describe('vz', function() {

            afterEach(function() {
                listener.param('vz', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(listener.param('vz')).toEqual(0);
            });

            // Negative

            it('should return the instance of Listener', function() {
                expect(listener.param('')).toEqual(jasmine.any(Listener));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                listener.param('vz', 1000.5);
                expect(listener.param('vz')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                listener.param('vz', -1000.5);
                expect(listener.param('vz')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                listener.param('vz', '');
                expect(listener.param('vz')).toEqual(0);
            });

        });

    });

});
