describe('StreamModule TEST', function() {

    describe('StreamModule.prototype.params', function() {

        it('should return associative array', function() {
            expect(streamModule.params()).toEqual({
                'stream': {
                    'noisegate': {
                        'level': 0
                    }
                }
            });
        });

    });

});
