describe('Chorus TEST', function() {

    describe('Chorus.prototype.params', function() {

        it('should return associative array', function() {
            expect(chorus.params()).toEqual({
                'state'   : true,
                'time'    : 0,
                'depth'   : 0,
                'rate'    : 0,
                'mix'     : 0,
                'tone'    : 350,
                'feedback': 0
            });
        });

    });

});
