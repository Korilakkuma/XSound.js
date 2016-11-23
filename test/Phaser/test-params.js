describe('Phaser TEST', function() {

    describe('Phaser.prototype.params', function() {

        it('should return associative array', function() {
            expect(phaser.params()).toEqual({
                'state'    : true,
                'stage'    : 12,
                'frequency': 350,
                'resonance': 1,
                'depth'    : 0,
                'rate'     : 0,
                'mix'      : 0,
                'feedback' : 0
            });
        });

    });

});
