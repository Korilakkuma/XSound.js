describe('EnvelopeGenerator TEST', function() {

    describe('EnvelopeGenerator.prototype.params', function() {

        it('should return associative array', function() {
            expect(envelopegenerator.params()).toEqual({
                'attack' : 0.01,
                'decay'  : 0.3,
                'sustain': 0.5,
                'release': 1
            });
        });

    });

});
