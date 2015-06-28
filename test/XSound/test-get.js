describe('Class (Static) Method TEST', function() {

    describe('XSound.get()', function() {

        it('should return the instance of AudioContext', function() {
            expect(X.get() instanceof AudioContext).toBeTruthy();
        });

    });

});
