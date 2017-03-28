describe('Listener TEST', function() {

    describe('Listener.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(listener.toJSON()).toEqual('{"positions":{"x":0,"y":0,"z":0},"fronts":{"x":0,"y":0,"z":-1},"ups":{"x":0,"y":1,"z":0}}');
        });

    });

});
