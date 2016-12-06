describe('MediaModule TEST', function() {

    describe('MediaModule.prototype.params', function() {

        it('should return associative array', function() {
            expect(mediaModule.params()).toEqual({
                'media': {
                    'playbackrate' : 1,
                    'vocalcanceler': {
                        'depth': 0
                    }
                }
            });
        });

    });

});
