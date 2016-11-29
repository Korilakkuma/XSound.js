describe('EnvelopeGenerator TEST', function() {

    describe('EnvelopeGenerator.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(envelopegenerator.toJSON()).toEqual('{"attack":0.01,"decay":0.3,"sustain":0.5,"release":1}');
        });

    });

});
