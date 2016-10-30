describe('SoundModule TEST', function() {

    describe('SoundModule.prototype.resize', function() {

        afterEach(function() {
            soundModule.resize(1024);
        });

        // Initial
        // it('should return 1024', function() {
        //     expect(soundModule.BUFFER_SIZE).toEqual(1024);
        // });

        // Positive

        it('should return 256', function() {
            soundModule.resize(256);
            expect(soundModule.bufferSize).toEqual(256);
        });

        it('should return 512', function() {
            soundModule.resize(512);
            expect(soundModule.bufferSize).toEqual(512);
        });

        it('should return 1024', function() {
            soundModule.resize(1024);
            expect(soundModule.bufferSize).toEqual(1024);
        });

        it('should return 2048', function() {
            soundModule.resize(2048);
            expect(soundModule.bufferSize).toEqual(2048);
        });

        it('should return 4096', function() {
            soundModule.resize(4096);
            expect(soundModule.bufferSize).toEqual(4096);
        });

        it('should return 8192', function() {
            soundModule.resize(8192);
            expect(soundModule.bufferSize).toEqual(8192);
        });

        it('should return 16384', function() {
            soundModule.resize(16384);
            expect(soundModule.bufferSize).toEqual(16384);
        });

        // Negative

        it('should return 16384', function() {
            soundModule.resize(0);
            expect(soundModule.bufferSize).toEqual(1024);
        });

    });

});
