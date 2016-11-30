describe('OscillatorModule TEST', function() {

    describe('OscillatorModule.prototype.params', function() {

        it('should return associative array', function() {
            oscillatorModule.setup(true);

            expect(oscillatorModule.params()).toEqual({
                'oscillator': {
                    'oscillator0': {
                        'state' : true,
                        'type'  : 'sine',
                        'gain'  : 1,
                        'octave': 0,
                        'fine'  : 0
                    },
                    'glide': {
                        'type': 'linear',
                        'time': 0
                    }
                }
            });
        });

    });

});
