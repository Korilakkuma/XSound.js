describe('Compressor TEST', function() {

    describe('Compressor.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(compressor.toJSON()).toEqual('{"state":true,"threshold":-24,"knee":30,"ratio":12,"attack":0.003000000026077032,"release":0.25}');
        });

    });

});
