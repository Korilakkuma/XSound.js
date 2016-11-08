describe('Visualizer TEST', function() {

    describe('Visualizer.prototype.createSVGLinearGradient', function() {

        it('should return the instance of SVGDefsElement', function() {
            var defs           = visualizer.createSVGLinearGradient();
            var linearGradient = defs.firstElementChild;

            expect(defs).toEqual(jasmine.any(SVGDefsElement));
            expect(linearGradient).toEqual(jasmine.any(SVGLinearGradientElement));
        });

    });

});
