describe('Listener TEST', function() {

    describe('Listener.prototype.params', function() {

        it('should return associative array', function() {
            expect(listener.params()).toEqual({
                'dopplerFactor': 1,
                'speedOfSound' : 343.29998779296875,
                'positions'    : {'x': 0, 'y': 0, 'z': 0},
                'fronts'       : {'x': 0, 'y': 0, 'z': -1},
                'ups'          : {'x': 0, 'y': 1, 'z': 0},
                'velocities'   : {'x': 0, 'y': 0, 'z': 0}
            });
        });

    });

});
