describe('OscillatorModule TEST', function() {

    describe('OscillatorModule.prototype.length', function() {

        afterEach(function() {
            oscillatorModule.setup();
        });

        it('should return 0', function() {
            oscillatorModule.setup();
            expect(oscillatorModule.length()).toEqual(1);
        });

        it('should return 1', function() {
            oscillatorModule.setup(true);
            expect(oscillatorModule.length()).toEqual(1);
        });

        it('should return 2', function() {
            oscillatorModule.setup([true, false]);
            expect(oscillatorModule.length()).toEqual(2);
        });

    });

});
