describe('Panner TEST', function() {

    describe('Panner.prototype.param', function() {

        describe('x', function() {

            afterEach(function() {
                panner.param('x', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(panner.param('x')).toEqual(0);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('x', 1000.5);
                expect(panner.param('x')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('x', -1000.5);
                expect(panner.param('x')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                panner.param('x', '');
                expect(panner.param('x')).toEqual(0);
            });

        });

        describe('y', function() {

            afterEach(function() {
                panner.param('y', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(panner.param('y')).toEqual(0);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('y', 1000.5);
                expect(panner.param('y')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('y', -1000.5);
                expect(panner.param('y')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                panner.param('y', '');
                expect(panner.param('y')).toEqual(0);
            });

        });

        describe('z', function() {

            afterEach(function() {
                panner.param('z', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(panner.param('z')).toEqual(0);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('z', 1000.5);
                expect(panner.param('z')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('z', -1000.5);
                expect(panner.param('z')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                panner.param('z', '');
                expect(panner.param('z')).toEqual(0);
            });

        });

        describe('ox', function() {

            afterEach(function() {
                panner.param('ox', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(panner.param('ox')).toEqual(1);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('ox', 1000.5);
                expect(panner.param('ox')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('ox', -1000.5);
                expect(panner.param('ox')).toEqual(-1000.5);
            });

            // Negative

            it('should return 1', function() {
                panner.param('ox', '');
                expect(panner.param('ox')).toEqual(1);
            });

        });

        describe('oy', function() {

            afterEach(function() {
                panner.param('oy', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(panner.param('oy')).toEqual(0);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('oy', 1000.5);
                expect(panner.param('oy')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('oy', -1000.5);
                expect(panner.param('oy')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                panner.param('oy', '');
                expect(panner.param('oy')).toEqual(0);
            });

        });

        describe('oz', function() {

            afterEach(function() {
                panner.param('oz', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(panner.param('oz')).toEqual(0);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('oz', 1000.5);
                expect(panner.param('oz')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('oz', -1000.5);
                expect(panner.param('oz')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                panner.param('oz', '');
                expect(panner.param('oz')).toEqual(0);
            });

        });

        describe('vx', function() {

            afterEach(function() {
                panner.param('vx', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(panner.param('vx')).toEqual(0);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('vx', 1000.5);
                expect(panner.param('vx')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('vx', -1000.5);
                expect(panner.param('vx')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                panner.param('vx', '');
                expect(panner.param('vx')).toEqual(0);
            });

        });

        describe('vy', function() {

            afterEach(function() {
                panner.param('vy', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(panner.param('vy')).toEqual(0);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('vy', 1000.5);
                expect(panner.param('vy')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('vy', -1000.5);
                expect(panner.param('vy')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                panner.param('vy', '');
                expect(panner.param('vy')).toEqual(0);
            });

        });

        describe('vz', function() {

            afterEach(function() {
                panner.param('vz', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(panner.param('vz')).toEqual(0);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('vz', 1000.5);
                expect(panner.param('vz')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('vz', -1000.5);
                expect(panner.param('vz')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                panner.param('vz', '');
                expect(panner.param('vz')).toEqual(0);
            });

        });

        describe('refdistance', function() {

            afterEach(function() {
                panner.param('refdistance', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(panner.param('refdistance')).toEqual(1);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('refdistance', 1000.5);
                expect(panner.param('refdistance')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('refdistance', -1000.5);
                expect(panner.param('refdistance')).toEqual(-1000.5);
            });

            // Negative

            it('should return 1', function() {
                panner.param('refdistance', '');
                expect(panner.param('refdistance')).toEqual(1);
            });

        });

        describe('maxDistance', function() {

            afterEach(function() {
                panner.param('maxDistance', 10000);
            });

            // Getter
            // Positive

            it('should return 10000', function() {
                expect(panner.param('maxDistance')).toEqual(10000);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('maxDistance', 1000.5);
                expect(panner.param('maxDistance')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('maxDistance', -1000.5);
                expect(panner.param('maxDistance')).toEqual(-1000.5);
            });

            // Negative

            it('should return 10000', function() {
                panner.param('maxDistance', '');
                expect(panner.param('maxDistance')).toEqual(10000);
            });

        });

        describe('rolloffFactor', function() {

            afterEach(function() {
                panner.param('rolloffFactor', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(panner.param('rolloffFactor')).toEqual(1);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('rolloffFactor', 1000.5);
                expect(panner.param('rolloffFactor')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('rolloffFactor', -1000.5);
                expect(panner.param('rolloffFactor')).toEqual(-1000.5);
            });

            // Negative

            it('should return 1', function() {
                panner.param('rolloffFactor', '');
                expect(panner.param('rolloffFactor')).toEqual(1);
            });

        });

        describe('coneInnerAngle', function() {

            afterEach(function() {
                panner.param('coneInnerAngle', 360);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(panner.param('coneInnerAngle')).toEqual(360);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 360.5', function() {
                panner.param('coneInnerAngle', 360.5);
                expect(panner.param('coneInnerAngle')).toEqual(360.5);
            });

            it('should return -1000.5', function() {
                panner.param('coneInnerAngle', -360.5);
                expect(panner.param('coneInnerAngle')).toEqual(-360.5);
            });

            // Negative

            it('should return 360', function() {
                panner.param('coneInnerAngle', '');
                expect(panner.param('coneInnerAngle')).toEqual(360);
            });

        });

            describe('coneOuterAngle', function() {

            afterEach(function() {
                panner.param('coneOuterAngle', 360);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(panner.param('coneOuterAngle')).toEqual(360);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 360.5', function() {
                panner.param('coneOuterAngle', 360.5);
                expect(panner.param('coneOuterAngle')).toEqual(360.5);
            });

            it('should return -1000.5', function() {
                panner.param('coneOuterAngle', -360.5);
                expect(panner.param('coneOuterAngle')).toEqual(-360.5);
            });

            // Negative

            it('should return 360', function() {
                panner.param('coneOuterAngle', '');
                expect(panner.param('coneOuterAngle')).toEqual(360);
            });

        });

        describe('coneOuterGain', function() {

            afterEach(function() {
                panner.param('coneOuterGain', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(panner.param('coneOuterGain')).toEqual(0);
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return 1000.5', function() {
                panner.param('coneOuterGain', 1000.5);
                expect(panner.param('coneOuterGain')).toEqual(1000.5);
            });

            it('should return -1000.5', function() {
                panner.param('coneOuterGain', -1000.5);
                expect(panner.param('coneOuterGain')).toEqual(-1000.5);
            });

            // Negative

            it('should return 0', function() {
                panner.param('coneOuterGain', '');
                expect(panner.param('coneOuterGain')).toEqual(0);
            });

        });

        describe('panningModel', function() {

            afterEach(function() {
                panner.param('panningModel', 'HRTF');
            });

            // Getter
            // Positive

            it('should return "HRTF"', function() {
                expect(panner.param('panningModel')).toEqual('HRTF');
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return "HRTF"', function() {
                panner.param('panningModel', 'HRTF');
                expect(panner.param('panningModel')).toEqual('HRTF');
            });

            it('should return "equalpower"', function() {
                panner.param('panningModel', 'equalpower');
                expect(panner.param('panningModel')).toEqual('equalpower');
            });

            // Negative

            it('should return "HRTF"', function() {
                panner.param('panningModel', '');
                expect(panner.param('panningModel')).toEqual('HRTF');
            });

        });

        describe('distanceModel', function() {

            afterEach(function() {
                panner.param('distanceModel', 'inverse');
            });

            // Getter
            // Positive

            it('should return "inverse"', function() {
                expect(panner.param('distanceModel')).toEqual('inverse');
            });

            // Negative

            it('should return the instance of Panner', function() {
                expect(panner.param('')).toEqual(jasmine.any(Panner));
            });

            // Setter
            // Positive

            it('should return "linear"', function() {
                panner.param('distanceModel', 'linear');
                expect(panner.param('distanceModel')).toEqual('linear');
            });

            it('should return "inverse"', function() {
                panner.param('distanceModel', 'inverse');
                expect(panner.param('distanceModel')).toEqual('inverse');
            });

            it('should return "exponential"', function() {
                panner.param('distanceModel', 'exponential');
                expect(panner.param('distanceModel')).toEqual('exponential');
            });

            // Negative

            it('should return "inverse"', function() {
                panner.param('distanceModel', '');
                expect(panner.param('distanceModel')).toEqual('inverse');
            });

        });

    });

});
