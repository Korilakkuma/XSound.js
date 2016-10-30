describe('SoundModule TEST', function() {

    describe('SoundModule.prototype.params', function() {

        it('should return associative array', function() {
            expect(soundModule.params()).toEqual({'mastervolume': 1.0});
        });

    });

});
