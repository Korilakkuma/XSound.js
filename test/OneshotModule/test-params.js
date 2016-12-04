describe('OneshotModule TEST', function() {

    describe('OneshotModule.prototype.params', function() {

        it('should return associative array', function() {
            expect(oneshotModule.params()).toEqual({
                'oneshot': {
                    'transpose': 1
                }
            });
        });

    });

});
