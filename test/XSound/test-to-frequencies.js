describe('XSound TEST', function() {

    describe('XSound.toFrequencies', function() {

        // Negative

        it('should return 0 or empty array', function() {
            expect(X.toFrequencies()[0]).toEqual(0);
            expect(X.toFrequencies(-1)[0]).toEqual(0);
            expect(X.toFrequencies([-1])[0]).toEqual(0);
            expect(X.toFrequencies([])).toEqual([]);
        });

        // Positive

        it('should return number', function() {
            expect(X.toFrequencies(0)[0]).toEqual(27.5);
            expect(Math.floor(X.toFrequencies(48)[0])).toEqual(440);
            expect(Math.floor(X.toFrequencies(87)[0])).toEqual(4186);
        });

        it('should return array that contains numbers', function() {
            var frequencies = X.toFrequencies([0, 48, 87]);

            frequencies.forEach(function(element, index) {
                if (index !== 0) {
                    frequencies[index] = Math.floor(element);
                }
            });

            expect(frequencies).toEqual([27.5, 440, 4186]);
        });

    });

});
