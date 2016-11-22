describe('Ringmodulator TEST', function() {

    describe('Ringmodulator.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(ringmodulator.toJSON()).toEqual('{"state":true,"depth":1,"rate":0}');
        });

    });

});
