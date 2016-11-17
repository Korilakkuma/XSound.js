describe('Wah TEST', function() {

    describe('Wah.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(wah.toJSON()).toEqual('{"state":true,"cutoff":350,"depth":0,"rate":0,"resonance":1}');
        });

    });

});
