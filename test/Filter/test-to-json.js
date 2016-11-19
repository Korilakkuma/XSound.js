describe('Filter TEST', function() {

    describe('Filter.prototype.toJSON', function() {

        it('should return JSON', function() {
            expect(filter.toJSON()).toEqual('{"state":false,"type":"lowpass","frequency":350,"Q":1,"gain":0,"range":0.1,"attack":0.01,"decay":0.3,"sustain":1,"release":1}');
        });

    });

});
