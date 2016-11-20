describe('Autopanner TEST', function() {

    describe('Autopanner.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(autopanner.toJSON()).toEqual('{"state":true,"depth":0,"rate":0}');
        });

    });

});
