describe('Equalizer TEST', function() {

    describe('Equalizer.prototype.params', function() {

        it('should return associative array', function() {
            expect(equalizer.params()).toEqual({
                'state'   : true,
                'bass'    : 0,
                'middle'  : 0,
                'treble'  : 0,
                'presence': 0
            });
        });

    });

});
