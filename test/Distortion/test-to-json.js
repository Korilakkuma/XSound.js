describe('Distortion TEST', function() {

    describe('Distortion.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(distortion.toJSON()).toEqual('{"state":true,"curve":"clean","samples":4096,"drive":1,"color":350,"tone":350}');
        });

    });

});
