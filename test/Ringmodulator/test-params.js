describe('Ringmodulator TEST', function() {

    describe('Ringmodulator.prototype.params', function() {

        it('should return associative array', function() {
            expect(ringmodulator.params()).toEqual({
                'state': true,
                'depth': 1,
                'rate' : 0
            });
        });

    });

});
