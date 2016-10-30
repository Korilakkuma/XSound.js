describe('SoundModule TEST', function() {

    describe('SoundModule.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(soundModule.toJSON()).toEqual('{"mastervolume":1}');
        });

    });

});
