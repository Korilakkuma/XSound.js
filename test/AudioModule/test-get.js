describe('AudioModule TEST', function() {

    describe('AudioModule.prototype.get', function() {

        it('should return the instance of AudioBufferSourceNode', function() {
            expect(audioModule.get()).toEqual(jasmine.any(AudioBufferSourceNode));
        });

    });

});
