describe('Panner TEST', function() {

    describe('Panner.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(panner.toJSON()).toEqual('{"state":true,"positions":{"x":0,"y":0,"z":0},"orientations":{"x":1,"y":0,"z":0},"velocities":{"x":0,"y":0,"z":0},"refDistance":1,"maxDistance":10000,"rolloffFactor":1,"coneInnerAngle":360,"coneOuterAngle":360,"coneOuterGain":0,"panningModel":"HRTF","distanceModel":"inverse"}');
        });

    });

});
