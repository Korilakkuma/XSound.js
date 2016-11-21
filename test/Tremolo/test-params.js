describe('Tremolo TEST', function() {

    describe('Tremolo.prototype.params', function() {

        it('should return associative array', function() {
            expect(tremolo.params()).toEqual({
                'state': true,
                'depth': 0,
                'rate' : 0,
                'wave' : 'sine'
            });
        });

    });

});
