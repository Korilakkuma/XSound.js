describe('Class (Static) Method TEST', function() {

    it('XSound.convertTime()', function() {
        // Negative
        expect(convertTime()).toEqual('Error');
        expect(convertTime(-1)).toEqual('Error');

        // Positive
        var times1 = convertTime(0);

        expect(times1.minutes).toEqual(0);
        expect(times1.seconds).toEqual(0);
        expect(times1.milliseconds).toEqual(0);

        var times2 = convertTime(61.1);

        expect(times2.minutes).toEqual(1);
        expect(times2.seconds).toEqual(1);
        expect((Math.floor(times2.milliseconds * 10) / 10)).toEqual(0.1);
    });

});
