describe('VocalCanceler TEST', function() {

    describe('VocalCanceler.prototype.start', function() {

        it('should return 1', function() {
            expect(vocalcanceler.start(1, 1)).toEqual(1);
        });

        it('should return 0', function() {
            vocalcanceler.param('depth', 1);
            expect(vocalcanceler.start(1, 1)).toEqual(0);
        });

        it('should return 0.5', function() {
            vocalcanceler.param('depth', 0.5);
            expect(vocalcanceler.start(1, 1)).toEqual(0.5);
        });

    });

});
