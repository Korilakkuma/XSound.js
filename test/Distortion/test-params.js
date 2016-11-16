describe('Distortion TEST', function() {

    describe('Distortion.prototype.params', function() {

        it('should return associative array', function() {
            expect(distortion.params()).toEqual({
                'state'  : true,
                'curve'  :'clean',
                'samples': 4096,
                'drive'  : 1,
                'color'  : 350,
                'tone'   : 350
            });
        });

    });

});
