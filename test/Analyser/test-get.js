describe('Analyser TEST', function() {

    describe('Analyser.prototype.get', function() {

        it('should return the instance of AnalyserNode', function() {
            expect(analyser.get()).toEqual(jasmine.any(AnalyserNode));
        });

    });

});
