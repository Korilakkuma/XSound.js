describe('Visualizer TEST', function() {

    describe('Visualizer.prototype.param', function() {

        describe('interval', function() {

            afterEach(function() {
                visualizer.param('interval', 1000);
            });

            // Getter
            // Positive

            it('should return 1000', function() {
                expect(visualizer.param('interval')).toEqual(1000);
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter
            // Positive

            it('should return 500.5', function() {
                visualizer.param('interval', 500.5);
                expect(visualizer.param('interval')).toEqual(500.5);
            });

            it('should return 0', function() {
                visualizer.param('interval', 0);
                expect(visualizer.param('interval')).toEqual(0);
            });

            it('should return "auto"', function() {
                visualizer.param('interval', 'auto');
                expect(visualizer.param('interval')).toEqual('auto');
            });

            // Negative

            it('should return 1000', function() {
                visualizer.param('interval', -0.5);
                expect(visualizer.param('interval')).toEqual(1000);
            });

        });

        describe('shape', function() {

            afterEach(function() {
                visualizer.param('wave', 'rgba(0, 0, 255, 1.0)');
                visualizer.param('shape', 'line');
            });

            // Getter
            // Positive

            it('should return "line"', function() {
                expect(visualizer.param('shape')).toEqual('line');
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter
            // Positive

            it('should return "line"', function() {
                visualizer.param('shape', 'line');
                expect(visualizer.param('shape')).toEqual('line');
            });

            it('should return "rect"', function() {
                visualizer.param('shape', 'rect');
                expect(visualizer.param('shape')).toEqual('rect');
            });

            it('should return "rect"', function() {
                visualizer.param('wave', 'gradient');
                visualizer.param('shape', 'line');
                expect(visualizer.param('shape')).toEqual('rect');
            });

            // Negative

            it('should return "line"', function() {
                visualizer.param('shape', 'circle');
                expect(visualizer.param('shape')).toEqual('line');
            });

        });

        describe('grad', function() {

            afterEach(function() {
                visualizer.param('grad', [
                    {'offset': 0, 'color': 'rgba(0, 128, 255, 1.0)'},
                    {'offset': 1, 'color': 'rgba(0,   0, 255, 1.0)'}
                ]);
            });

            // Getter
            // Positive

            it('should return array that contains associative array for gradient', function() {
                expect(visualizer.param('grad')).toEqual([
                    {'offset': 0, 'color': 'rgba(0, 128, 255, 1.0)'},
                    {'offset': 1, 'color': 'rgba(0,   0, 255, 1.0)'}
                ]);
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter
            // Positive

            it('should return array that contains associative array for gradient', function() {
                visualizer.param('grad', [
                    {'offset': 0,   'color': 'rgba(0, 128, 255, 1.0)'},
                    {'offset': 0.5, 'color': 'rgba(0,  64, 255, 1.0)'},
                    {'offset': 1,   'color': 'rgba(0,   0, 255, 1.0)'}
                ]);

                expect(visualizer.param('grad')).toEqual([
                    {'offset': 0,   'color': 'rgba(0, 128, 255, 1.0)'},
                    {'offset': 0.5, 'color': 'rgba(0,  64, 255, 1.0)'},
                    {'offset': 1,   'color': 'rgba(0,   0, 255, 1.0)'}
                ]);
            });

            // Negative

            it('should return array that contains associative array for gradient', function() {
                visualizer.param('grad', [
                    {'offset': 0},
                    {'offset': 0.5},
                    {'offset': 1}
                ]);

                expect(visualizer.param('grad')).toEqual([
                    {'offset': 0, 'color': 'rgba(0, 128, 255, 1.0)'},
                    {'offset': 1, 'color': 'rgba(0,   0, 255, 1.0)'}
                ]);
            });

            it('should return array that contains associative array for gradient', function() {
                visualizer.param('grad', [
                    {'color': 'rgba(255, 128, 0, 1.0)'},
                    {'color': 'rgba(255,   0, 0, 1.0)'}
                ]);

                expect(visualizer.param('grad')).toEqual([
                    {'offset': 0, 'color': 'rgba(0, 128, 255, 1.0)'},
                    {'offset': 1, 'color': 'rgba(0,   0, 255, 1.0)'}
                ]);
            });

        });

        describe('font', function() {

            afterEach(function() {
                visualizer.param('font', {
                    'family': 'Arial',
                    'size'  : '13px',
                    'style' : 'normal',
                    'weight': 'normal'
                });
            });

            // Getter
            // Positive

            it('should return associative array for font', function() {
                expect(visualizer.param('font')).toEqual({
                    'family': 'Arial',
                    'size'  : '13px',
                    'style' : 'normal',
                    'weight': 'normal'
                });
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter
            // Positive

            it('should return associative array for font', function() {
                visualizer.param('font', {
                    'family': 'Helvetica',
                    'size'  : '16px',
                    'style' : 'italic',
                    'weight': 'lighter'
                });

                expect(visualizer.param('font')).toEqual({
                    'family': 'Helvetica',
                    'size'  : '16px',
                    'style' : 'italic',
                    'weight': 'lighter'
                });
            });

            it('should return associative array for font', function() {
                visualizer.param('font', {'family': 'Helvetica'});
                expect(visualizer.param('font')).toEqual({
                    'family': 'Helvetica',
                    'size'  : '13px',
                    'style' : 'normal',
                    'weight': 'normal'
                });
            });

            // Negative

            it('should return associative array for font', function() {
                visualizer.param('font', {
                    'a': 'Helvetica',
                    'b': '16px',
                    'c': 'italic',
                    'd': 'lighter'
                });

                expect(visualizer.param('font')).toEqual({
                    'family': 'Arial',
                    'size'  : '13px',
                    'style' : 'normal',
                    'weight': 'normal'
                });
            });

        });

        describe('wave', function() {

            afterEach(function() {
                visualizer.param('wave', 'rgba(0, 0, 255, 1.0)');
            });

            // Getter
            // Positive

            it('should return "rgba(0, 0, 255, 1.0)"', function() {
                expect(visualizer.param('wave')).toEqual('rgba(0, 0, 255, 1.0)');
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter

            it('should return "#dd11ff"', function() {
                visualizer.param('wave', '#dd11ff');
                expect(visualizer.param('wave')).toEqual('#dd11ff');
            });

            it('should return "gradient"', function() {
                visualizer.param('wave', 'gradient');
                expect(visualizer.param('wave')).toEqual('gradient');
                expect(visualizer.param('shape')).toEqual('rect');
            });

        });

        describe('grid', function() {

            afterEach(function() {
                visualizer.param('grid', 'rgba(255, 0, 0, 1.0)');
            });

            // Getter
            // Positive

            it('should return "rgba(255, 0, 0, 1.0)"', function() {
                expect(visualizer.param('grid')).toEqual('rgba(255, 0, 0, 1.0)');
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter

            it('should return "#cc0000"', function() {
                visualizer.param('grid', '#cc0000');
                expect(visualizer.param('grid')).toEqual('#cc0000');
            });

        });

        describe('text', function() {

            afterEach(function() {
                visualizer.param('text', 'rgba(255, 255, 255, 1.0)');
            });

            // Getter
            // Positive

            it('should return "rgba(255, 255, 255, 1.0)"', function() {
                expect(visualizer.param('text')).toEqual('rgba(255, 255, 255, 1.0)');
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter

            it('should return "#fafafa"', function() {
                visualizer.param('text', '#fafafa');
                expect(visualizer.param('text')).toEqual('#fafafa');
            });

        });

        describe('cap', function() {

            afterEach(function() {
                visualizer.param('cap', 'round');
            });

            // Getter
            // Positive

            it('should return "round"', function() {
                expect(visualizer.param('cap')).toEqual('round');
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter

            it('should return "butt"', function() {
                visualizer.param('cap', 'butt');
                expect(visualizer.param('cap')).toEqual('butt');
            });

        });

        describe('join', function() {

            afterEach(function() {
                visualizer.param('join', 'miter');
            });

            // Getter
            // Positive

            it('should return "miter"', function() {
                expect(visualizer.param('join')).toEqual('miter');
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter

            it('should return "round"', function() {
                visualizer.param('join', 'round');
                expect(visualizer.param('join')).toEqual('round');
            });

        });

        describe('width', function() {

            afterEach(function() {
                visualizer.param('width', 1.5);
            });

            // Getter
            // Positive

            it('should return 1.5', function() {
                expect(visualizer.param('width')).toEqual(1.5);
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter
            // Positive

            it('should return 10.5', function() {
                visualizer.param('width', 10.5);
                expect(visualizer.param('width')).toEqual(10.5);
            });

            it('should return 0', function() {
                visualizer.param('width', 0);
                expect(visualizer.param('width')).toEqual(0);
            });

            // Negative

            it('should return 1.5', function() {
                visualizer.param('width', -0.5);
                expect(visualizer.param('width')).toEqual(1.5);
            });

        });

        describe('top', function() {

            afterEach(function() {
                visualizer.param('top', 15);
            });

            // Getter
            // Positive

            it('should return 15', function() {
                expect(visualizer.param('top')).toEqual(15);
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter
            // Positive

            it('should return 10', function() {
                visualizer.param('top', 10);
                expect(visualizer.param('top')).toEqual(10);
            });

            it('should return 0', function() {
                visualizer.param('top', 0);
                expect(visualizer.param('top')).toEqual(0);
            });

            // Negative

            it('should return 15', function() {
                visualizer.param('top', -1.1);
                expect(visualizer.param('top')).toEqual(15);
            });

        });

        describe('right', function() {

            afterEach(function() {
                visualizer.param('right', 30);
            });

            // Getter
            // Positive

            it('should return 30', function() {
                expect(visualizer.param('right')).toEqual(30);
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter
            // Positive

            it('should return 10', function() {
                visualizer.param('right', 10);
                expect(visualizer.param('right')).toEqual(10);
            });

            it('should return 0', function() {
                visualizer.param('right', 0);
                expect(visualizer.param('right')).toEqual(0);
            });

            // Negative

            it('should return 30', function() {
                visualizer.param('right', -1.1);
                expect(visualizer.param('right')).toEqual(30);
            });

        });

        describe('bottom', function() {

            afterEach(function() {
                visualizer.param('bottom', 15);
            });

            // Getter
            // Positive

            it('should return 15', function() {
                expect(visualizer.param('bottom')).toEqual(15);
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter
            // Positive

            it('should return 10', function() {
                visualizer.param('bottom', 10);
                expect(visualizer.param('bottom')).toEqual(10);
            });

            it('should return 0', function() {
                visualizer.param('bottom', 0);
                expect(visualizer.param('bottom')).toEqual(0);
            });

            // Negative

            it('should return 15', function() {
                visualizer.param('bottom', -1.1);
                expect(visualizer.param('bottom')).toEqual(15);
            });

        });

        describe('left', function() {

            afterEach(function() {
                visualizer.param('left', 30);
            });

            // Getter
            // Positive

            it('should return 30', function() {
                expect(visualizer.param('left')).toEqual(30);
            });

            // Negative

            it('should return undefined', function() {
                expect(visualizer.param('')).toBeUndefined();
            });

            // Setter
            // Positive

            it('should return 10', function() {
                visualizer.param('left', 10);
                expect(visualizer.param('left')).toEqual(10);
            });

            it('should return 0', function() {
                visualizer.param('left', 0);
                expect(visualizer.param('left')).toEqual(0);
            });

            // Negative

            it('should return 30', function() {
                visualizer.param('left', -1.1);
                expect(visualizer.param('left')).toEqual(30);
            });

        });

    });

});
