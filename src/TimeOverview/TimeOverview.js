(function(global) {
    'use strict';

    /**
     * This private class defines properties for drawing audio wave in overview of time domain.
     * @param {number} sampleRate This argument is sample rate.
     * @constructor
     * @extends {Visualizer}
     */
    function TimeOverview(sampleRate) {
        Mocks.SoundModule.Analyser.Visualizer.call(this, sampleRate);

        // for TimeOverview.prototype.update, TimeOverview.prototype.drag
        this.savedImage = null;
        this.length     = 0;

        this.currentTime  = 'rgba(255, 255, 255, 1.0)';  // This style is used for the rectangle that displays current time of audio
        this.plotInterval = 0.0625;                      // Draw wave at intervals of this value [sec]
        this.textInterval = 60;                          // Draw text at intervals of this value [sec]
    }

    /** @extends {Visualizer} */
    TimeOverview.prototype = Object.create(Mocks.SoundModule.Analyser.Visualizer.prototype);
    TimeOverview.prototype.constructor = TimeOverview;

    /** @override */
    TimeOverview.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            var r = Mocks.SoundModule.Analyser.Visualizer.prototype.param.call(this, k, value);

            if (r !== undefined) {
                return r;
            } else {
                switch (k) {
                    case 'currenttime':
                        if (value === undefined) {
                            return this.currentTime;
                        } else {
                            this.currentTime = String(value).toLowerCase();
                        }

                        break;
                    case 'plotinterval':
                    case 'textinterval':
                        if (value === undefined) {
                            return this[k.replace('interval', 'Interval')];
                        } else {
                            var v = parseFloat(value);

                            if (v > 0) {
                                this[k.replace('interval', 'Interval')] = v;
                            }
                        }

                        break;
                    default:
                        break;
                }
            }
        }

        return this;
    };

    /**
     * This method draws audio wave in overview of time domain to Canvas.
     * @param {Float32Array} data This argument is data for drawing.
     * @return {TimeOverview} This is returned for method chain.
     * @override
     */
    TimeOverview.prototype.drawToCanvas = function(data) {
        if (!((this.canvas instanceof HTMLCanvasElement) && this.isActive)) {
            return this;
        }

        var context = this.context;

        var width       = this.canvas.width;
        var height      = this.canvas.height;
        var innerWidth  = width  - (this.styles.left + this.styles.right);
        var innerHeight = height - (this.styles.top  + this.styles.bottom);
        var middle      = Math.floor(innerHeight / 2) + this.styles.top;

        var x = 0;
        var y = 0;
        var t = '';

        // Draw wave at intervals of "this.plotInterval"
        var nPlotinterval = Math.floor(this.plotInterval * this.sampleRate);

        // Draw text at intervals of "this.textInterval"
        var nTextinterval = Math.floor(this.textInterval * this.sampleRate);

        // Erase previous wave
        context.clearRect(0, 0, width, height);

        // Begin drawing
        this.drawTimeDomainFloat32ArrayToCanvas(context, data, innerWidth, innerHeight, middle, nPlotinterval);

        if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
            // Draw grid and text (X axis)
            for (var i = 0, len = data.length; i < len; i++) {
                if ((i % nTextinterval) === 0) {
                    x = Math.floor((i / len) * innerWidth) + this.styles.left;
                    t = Math.floor((i / this.sampleRate) / 60) + ' min';

                    // Draw grid
                    if (this.styles.grid !== 'none') {
                        context.fillStyle = this.styles.grid;
                        context.fillRect(x, this.styles.top, 1, innerHeight);
                    }

                    // Draw text
                    if (this.styles.text !== 'none') {
                        context.fillStyle = this.styles.text;
                        context.font      = this.createFontString();
                        context.fillText(t, (x - (context.measureText(t).width / 2)), (this.styles.top + innerHeight + parseInt(this.styles.font.size)));
                    }
                }
            }

            // Draw grid and text (Y axis)
            var texts = ['-1.00', '-0.50', ' 0.00', ' 0.50', ' 1.00'];

            for (var i = 0, len = texts.length; i < len; i++) {
                t = texts[i];
                x = Math.floor(this.styles.left - context.measureText(t).width);
                y = Math.floor((1 - parseFloat(t.trim())) * (innerHeight / 2)) + this.styles.top;

                // Draw grid
                if (this.styles.grid !== 'none') {
                    context.fillStyle = this.styles.grid;
                    context.fillRect(this.styles.left, y, innerWidth, 1);
                }

                y -= Math.floor(parseInt(this.styles.font.size) / 4);

                // Draw text
                if (this.styles.text !== 'none') {
                    context.fillStyle = this.styles.text;
                    context.font      = this.createFontString();
                    context.fillText(t, x, y);
                }
            }
        }

        // for TimeOverview.prototype.update, TimeOverview.prototype.drag
        this.savedImage = context.getImageData(0, 0, width, height);
        this.length     = data.length;

        // This rectangle displays current time of audio
        context.fillStyle = this.currentTime;
        context.fillRect(this.styles.left, this.styles.top, 1, innerHeight);

        return this;
    };

    /**
     * This method draws audio wave in overview of time domain to SVG.
     * @param {Float32Array} data This argument is data for drawing.
     * @return {TimeOverview} This is returned for method chain.
     * @override
     */
    TimeOverview.prototype.drawToSVG = function(data) {
        if (!((this.svg instanceof SVGElement) && this.isActive)) {
            return this;
        }

        var svg = this.svg;

        var width       = parseInt(svg.getAttribute('width'));
        var height      = parseInt(svg.getAttribute('height'));
        var innerWidth  = width  - (this.styles.left + this.styles.right);
        var innerHeight = height - (this.styles.top  + this.styles.bottom);
        var middle      = Math.floor(innerHeight / 2) + this.styles.top;

        var x = 0;
        var y = 0;
        var t = '';

        // Draw wave at intervals of "this.plotInterval"
        var nPlotinterval = Math.floor(this.plotInterval * this.sampleRate);

        // Draw text at intervals of "this.textInterval"
        var nTextinterval = Math.floor(this.textInterval * this.sampleRate);

        // Erase previous wave
        svg.innerHTML = '';

        // Begin drawing
        svg.appendChild(this.drawTimeDomainFloat32ArrayToSVG(data, innerWidth, innerHeight, middle, nPlotinterval, Mocks.SoundModule.Analyser.Mocks.SoundModule.Analyser.Visualizer.SVG_LINEAR_GRADIENT_IDS.TIME_OVERVIEW));

        if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
            // Draw grid and text (X axis)
            for (var i = 0, len = data.length; i < len; i++) {
                if ((i % nTextinterval) === 0) {
                    x = Math.floor((i / len) * innerWidth) + this.styles.left;
                    t = Math.floor((i / this.sampleRate) / 60) + ' min';

                    // Draw grid
                    if (this.styles.grid !== 'none') {
                        var rect = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'rect');

                        rect.setAttribute('x',      x);
                        rect.setAttribute('y',      this.styles.top);
                        rect.setAttribute('width',  1);
                        rect.setAttribute('height', innerHeight);

                        rect.setAttribute('stroke', 'none');
                        rect.setAttribute('fill',   this.styles.grid);

                        svg.appendChild(rect);
                    }

                    // Draw text
                    if (this.styles.text !== 'none') {
                        var text = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'text');

                        text.textContent = t;

                        text.setAttribute('x', x);
                        text.setAttribute('y', (this.styles.top + innerHeight + parseInt(this.styles.font.size)));

                        text.setAttribute('text-anchor', 'middle');
                        text.setAttribute('stroke',      'none');
                        text.setAttribute('fill',        this.styles.text);
                        text.setAttribute('font-family', this.styles.font.family);
                        text.setAttribute('font-size',   this.styles.font.size);
                        text.setAttribute('font-style',  this.styles.font.style);
                        text.setAttribute('font-weight', this.styles.font.weight);

                        svg.appendChild(text);
                    }
                }
            }

            // Draw grid and text (Y axis)
            var texts = ['-1.00', '-0.50', ' 0.00', ' 0.50', ' 1.00'];

            for (var i = 0, len = texts.length; i < len; i++) {
                t = texts[i];
                x = this.styles.left;
                y = Math.floor((1 - parseFloat(t.trim())) * (innerHeight / 2)) + this.styles.top;

                // Draw grid
                if (this.styles.grid !== 'none') {
                    var rect = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'rect');

                    rect.setAttribute('x',      x);
                    rect.setAttribute('y',      y);
                    rect.setAttribute('width',  innerWidth);
                    rect.setAttribute('height', 1);

                    rect.setAttribute('stroke', 'none');
                    rect.setAttribute('fill',   this.styles.grid);

                    svg.appendChild(rect);
                }

                y -= Math.floor(parseInt(this.styles.font.size) / 4);

                // Draw text
                if (this.styles.text !== 'none') {
                    var text = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'text');

                    text.textContent = t;

                    text.setAttribute('x', x);
                    text.setAttribute('y', y);

                    text.setAttribute('text-anchor', 'end');
                    text.setAttribute('stroke',      'none');
                    text.setAttribute('fill',        this.styles.text);
                    text.setAttribute('font-family', this.styles.font.family);
                    text.setAttribute('font-size',   this.styles.font.size);
                    text.setAttribute('font-style',  this.styles.font.style);
                    text.setAttribute('font-weight', this.styles.font.weight);

                    svg.appendChild(text);
                }
            }
        }

        // This rectangle displays current time of audio
        var rect = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'rect');

        rect.setAttribute('class',  'svg-current-time');
        rect.setAttribute('x',      this.styles.left);
        rect.setAttribute('y',      this.styles.top);
        rect.setAttribute('width',  1);
        rect.setAttribute('height', innerHeight);

        rect.setAttribute('stroke', 'none');
        rect.setAttribute('fill',   this.currentTime);

        svg.appendChild(rect);

        // for TimeOverview.prototype.update, TimeOverview.prototype.drag
        this.savedImage = svg;
        this.length     = data.length;

        return this;
    };

    /**
     * This method draws current time of audio on Canvas or SVG.
     * @param {number} time This argument is current time of audio.
     * @return {TimeOverview} This is returned for method chain.
     */
    TimeOverview.prototype.update = function(time) {
        var t = parseFloat(time);

        if (isNaN(t) || (t < 0)) {
            return;
        }

        var width       = 0;
        var height      = 0;
        var innerWidth  = 0;
        var innerHeight = 0;
        var x           = 0;

        switch (this.graphics) {
            case Mocks.SoundModule.Analyser.Visualizer.GRAPHICS.CANVAS:
                if (this.savedImage instanceof ImageData) {
                    var context = this.context;

                    width       = this.canvas.width;
                    height      = this.canvas.height;
                    innerWidth  = width  - (this.styles.left + this.styles.right);
                    innerHeight = height - (this.styles.top  + this.styles.bottom);
                    x           = Math.floor(((t * this.sampleRate) / this.length) * innerWidth) + this.styles.left;

                    context.clearRect(0, 0, width, height);
                    context.putImageData(this.savedImage, 0, 0);

                    context.fillStyle = this.currentTime;
                    context.fillRect(x, this.styles.top, 1, innerHeight);
                }

                break;
            case Mocks.SoundModule.Analyser.Visualizer.GRAPHICS.SVG:
                var svg = this.svg.querySelector('.svg-current-time');

                if (svg instanceof SVGElement) {
                    width       = parseInt(this.svg.getAttribute('width'));
                    height      = parseInt(this.svg.getAttribute('height'));
                    innerWidth  = width  - (this.styles.left + this.styles.right);
                    innerHeight = height - (this.styles.top  + this.styles.bottom);
                    x           = Math.floor(((t * this.sampleRate) / this.length) * innerWidth);

                    svg.setAttribute('transform', ('translate(' + x + ' 0)'));
                }

                break;
            default:
                break;
        }

        return this;
    };

    /**
     * This method registers event listener for setting current time by drag.
     * @param {function} callback This argument is invoked when current time is changed.
     * @return {TimeOverview} This is returned for method chain.
     */
    TimeOverview.prototype.drag = function(callback) {
        var drawNode = null;
        var self     = this;

        var start = '';
        var move  = '';
        var end   = '';

        // Touch Panel ?
        if (/iPhone|iPad|iPod|Android/.test(navigator.userAgent)) {
            start = 'touchstart';
            move  = 'touchmove';
            end   = 'touchend';
        } else {
            start = 'mousedown';
            move  = 'mousemove';
            end   = 'mouseup';
        }

        switch (this.graphics) {
            case Mocks.SoundModule.Analyser.Visualizer.GRAPHICS.CANVAS:
                drawNode = this.canvas;
                break;
            case Mocks.SoundModule.Analyser.Visualizer.GRAPHICS.SVG:
                drawNode = this.svg;
                break;
            default:
                return;
        }

        var draw = function(offsetX) {
            var offsetLeft = 0;
            var width      = 0;

            switch (self.graphics) {
                case Mocks.SoundModule.Analyser.Visualizer.GRAPHICS.CANVAS:
                    offsetLeft = self.canvas.offsetLeft;
                    width      = self.canvas.width;
                    break;
                case Mocks.SoundModule.Analyser.Visualizer.GRAPHICS.SVG:
                    offsetLeft = self.svg.parentNode.offsetLeft;
                    width      = parseInt(self.svg.getAttribute('width'));
                    break;
                default:
                    break;
            }

            var x = offsetX - (offsetLeft + self.styles.left);

            width -= (self.styles.left + self.styles.right);

            // Exceed ?
            if (x < 0)     {x = 0;}
            if (x > width) {x = width;}

            var plot = (x / width) * self.length;
            var time = plot / self.sampleRate;

            self.update(time);

            if (Object.prototype.toString.call(callback) === '[object Function]') {
                callback(time);
            }
        };

        var getOffsetX = function(event) {
            if (event.pageX) {
                return event.pageX;
            } else if (event.touches[0]) {
                return event.touches[0].pageX;
            }
        };

        var isDown = false;

        drawNode.addEventListener(start, function(event) {
            draw(getOffsetX(event));
            isDown = true;
        }, true);

        drawNode.addEventListener(move, function(event) {
            if (isDown) {
                event.preventDefault();  // for Touch Panel
                draw(getOffsetX(event));
            }
        }, true);

        global.addEventListener(end, function(event) {
            if (isDown) {
                isDown = false;
            }
        }, true);

        return this;
    };

    /** @override */
    TimeOverview.prototype.toString = function() {
        return '[SoundModule Analyser TimeOverview]';
    };

    // Export
    global.TimeOverview = TimeOverview;
    global.timeOverview = new TimeOverview(audiocontext.sampleRate);

})(window);
