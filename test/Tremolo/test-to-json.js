describe('Tremolo TEST', function() {

    describe('Tremolo.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(tremolo.toJSON()).toEqual('{"state":true,"depth":0,"rate":0,"wave":"sine"}');
        });

    });

});
