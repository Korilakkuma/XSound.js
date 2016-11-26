describe('Delay TEST', function() {

    describe('Delay.prototype.params', function() {

        it('should return associative array', function() {
            expect(delay.params()).toEqual({
                'state'   : true,
                'time'    : 0,
                'dry'     : 1,
                'wet'     : 0,
                'tone'    : 350,
                'feedback': 0
            });
        });

    });

});
