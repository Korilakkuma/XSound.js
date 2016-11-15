describe('Compressor TEST', function() {

    describe('Compressor.prototype.params', function() {

        it('should return associative array', function() {
            expect(compressor.params()).toEqual({
                'state'    : true,
                'threshold': -24,
                'knee'     : 30,
                'ratio'    : 12,
                'attack'   : 0.003000000026077032,
                'release'  : 0.25
            });
        });

    });

});
