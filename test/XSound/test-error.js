describe('Class (Static) Method TEST', function() {

    describe('XSound.error()', function() {

        // Initial
        it('should return 2', function() {
            expect(X.ERROR_MODE).toEqual(2);
        });

        // Negative
        it('should return 2', function() {
            X.error('hogehode');
            expect(X.ERROR_MODE).toEqual(2);

            X.error(4);
            expect(X.ERROR_MODE).toEqual(2);

            X.error('4');
            expect(X.ERROR_MODE).toEqual(2);

            X.error(-1);
            expect(X.ERROR_MODE).toEqual(2);

            X.error('-1');
            expect(X.ERROR_MODE).toEqual(2);
        });

        // Positive

        // NONE
        it('should return 0', function() {
            X.error('none');
            expect(X.ERROR_MODE).toEqual(0);

            X.error('NONE');
            expect(X.ERROR_MODE).toEqual(0);

            X.error(0);
            expect(X.ERROR_MODE).toEqual(0);

            X.error('0');
            expect(X.ERROR_MODE).toEqual(0);
        });

        // ALERT
        it('should return 1', function() {
            X.error('alert');
            expect(X.ERROR_MODE).toEqual(1);

            X.error('ALERT');
            expect(X.ERROR_MODE).toEqual(1);

            X.error(1);
            expect(X.ERROR_MODE).toEqual(1);

            X.error('1');
            expect(X.ERROR_MODE).toEqual(1);
        });

        // CONSOLE
        it('should return 2', function() {
            X.error('console');
            expect(X.ERROR_MODE).toEqual(2);

            X.error('CONSOLE');
            expect(X.ERROR_MODE).toEqual(2);

            X.error(2);
            expect(X.ERROR_MODE).toEqual(2);

            X.error('2');
            expect(X.ERROR_MODE).toEqual(2);
        });

        // EXCEPTION
        it('should return 3', function() {
            X.error('exception');
            expect(X.ERROR_MODE).toEqual(3);

            X.error('EXCEPTION');
            expect(X.ERROR_MODE).toEqual(3);

            X.error(3);
            expect(X.ERROR_MODE).toEqual(3);

            X.error('3');
            expect(X.ERROR_MODE).toEqual(3);
        });

    });

});
