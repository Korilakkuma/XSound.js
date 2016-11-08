describe('Visualizer TEST', function() {

    describe('Visualizer.prototype.createFontString', function() {

        it('should return "13px normal normal "Arial""', function() {
            expect(visualizer.createFontString()).toEqual('13px normal normal "Arial"');
        });

    });

});
