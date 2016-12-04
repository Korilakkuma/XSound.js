describe('AudioModule TEST', function() {

    describe('AudioModule.prototype.params', function() {

        it('should return associative array', function() {
            expect(audioModule.params()).toEqual({
                'audio': {
                    'playbackrate' : 1,
                    'vocalcanceler': {
                        'depth': 0
                    }
                }
            });
        });

    });

});
