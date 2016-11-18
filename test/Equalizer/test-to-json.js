describe('Equalizer TEST', function() {

    describe('Equalizer.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(equalizer.toJSON()).toEqual('{"state":true,"bass":0,"middle":0,"treble":0,"presence":0}');
        });

    });

});
