describe('Delay TEST', function() {

    describe('Delay.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(delay.toJSON()).toEqual('{"state":true,"time":0,"dry":1,"wet":0,"tone":350,"feedback":0}');
        });

    });

});
