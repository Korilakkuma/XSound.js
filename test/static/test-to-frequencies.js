describe('Class (Static) Method TEST', function() {

    it('XSound.toFrequencies()', function() {
        // Negative
        expect(toFrequencies()[0]).toEqual(0);
        expect(toFrequencies(-1)[0]).toEqual(0);
        expect(toFrequencies([-1])[0]).toEqual(0);
        expect(toFrequencies([])).toEqual([]);

        // Positive
        expect(toFrequencies(0)[0]).toEqual(27.5);
        expect(parseInt(toFrequencies(48)[0])).toEqual(440);
        expect(parseInt(toFrequencies(87)[0])).toEqual(4186);

        var frequencies = toFrequencies([0, 48, 87]);

        frequencies.forEach(function(element, index) {
            if (index !== 0) {
                frequencies[index] = parseInt(element);
            }
        });

        expect(frequencies).toEqual([27.5, 440, 4186]);
    });

});
