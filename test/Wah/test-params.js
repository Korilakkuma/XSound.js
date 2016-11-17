describe('Wah TEST', function() {

    describe('Wah.prototype.params', function() {

        it('should return associative array', function() {
            expect(wah.params()).toEqual({
                'state'    : true,
                'cutoff'   : 350,
                'depth'    : 0,
                'rate'     : 0,
                'resonance': 1
            });
        });

    });

});
