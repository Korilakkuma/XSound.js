describe('Class (Static) Method TEST', function() {

    it('XSound.error()', function() {
        // Initial
        expect(ERROR_MODE).toEqual(2);

        // Negative
        error('hogehode');
        expect(ERROR_MODE).toEqual(2);

        error(4);
        expect(ERROR_MODE).toEqual(2);

        error('4');
        expect(ERROR_MODE).toEqual(2);

        error(-1);
        expect(ERROR_MODE).toEqual(2);

        error('-1');
        expect(ERROR_MODE).toEqual(2);

        // Positive

        // NONE
        error('none');
        expect(ERROR_MODE).toEqual(0);

        error('NONE');
        expect(ERROR_MODE).toEqual(0);

        error(0);
        expect(ERROR_MODE).toEqual(0);

        error('0');
        expect(ERROR_MODE).toEqual(0);

        // ALERT
        error('alert');
        expect(ERROR_MODE).toEqual(1);

        error('ALERT');
        expect(ERROR_MODE).toEqual(1);

        error(1);
        expect(ERROR_MODE).toEqual(1);

        error('1');
        expect(ERROR_MODE).toEqual(1);

        // CONSOLE
        error('console');
        expect(ERROR_MODE).toEqual(2);

        error('CONSOLE');
        expect(ERROR_MODE).toEqual(2);

        error(2);
        expect(ERROR_MODE).toEqual(2);

        error('2');
        expect(ERROR_MODE).toEqual(2);

        // EXCEPTION
        error('exception');
        expect(ERROR_MODE).toEqual(3);

        error('EXCEPTION');
        expect(ERROR_MODE).toEqual(3);

        error(3);
        expect(ERROR_MODE).toEqual(3);

        error('3');
        expect(ERROR_MODE).toEqual(3);
    });

});
