describe('Filter TEST', function() {

    describe('Filter.prototype.params', function() {

        it('should return associative array', function() {
            expect(filter.params()).toEqual({
                'state'    : false,
                'type'     : 'lowpass',
                'frequency': 350,
                'Q'        : 1,
                'gain'     : 0,
                'range'    : 0.1,
                'attack'   : 0.01,
                'decay'    : 0.3,
                'sustain'  : 1,
                'release'  : 1
            });
        });

    });

});
