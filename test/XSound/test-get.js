describe('XSound TEST', function() {

    describe('XSound.get', function() {

        it('should return the instance of AudioContext', function() {
            expect(X.get()).toEqual(jasmine.any(AudioContext));
        });

    });

});
