describe('Reverb TEST', function() {

    describe('Reverb.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(reverb.toJSON()).toEqual('{"state":false,"dry":1,"wet":0,"tone":350}');
        });

    });

});
