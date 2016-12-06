describe('MediaModule TEST', function() {

    describe('MediaModule.prototype.get', function() {

        it('should return the instance of HTMLAudioElement', function() {
            mediaModule.setup({
                'media'    : document.createElement('audio'),
                'formats'  : ['wav', 'ogg', 'mp3'],
                'callbacks': {}
            });

            expect(mediaModule.get()).toEqual(jasmine.any(HTMLAudioElement));
        });

    });

});
