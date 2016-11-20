describe('Autopanner TEST', function() {

    describe('Autopanner.prototype.params', function() {

        it('should return associative array', function() {
            expect(autopanner.params()).toEqual({
                'state': true,
                'depth': 0,
                'rate' : 0
            });
        });

    });

});
