describe('Flanger TEST', function() {

    describe('Flanger.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(flanger.toJSON()).toEqual('{"state":true,"time":0,"depth":0,"rate":0,"mix":0,"tone":350,"feedback":0}');
        });

    });

});
