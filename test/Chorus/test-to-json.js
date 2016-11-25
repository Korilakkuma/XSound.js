describe('Chorus TEST', function() {

    describe('Chorus.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(chorus.toJSON()).toEqual('{"state":true,"time":0,"depth":0,"rate":0,"mix":0,"tone":350,"feedback":0}');
        });

    });

});
