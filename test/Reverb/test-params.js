describe('Reverb TEST', function() {

    describe('Reverb.prototype.params', function() {

        it('should return associative array', function() {
            expect(reverb.params()).toEqual({
                'state': false,
                'dry'  : 1,
                'wet'  : 0,
                'tone' : 350
            });
        });

    });

});
