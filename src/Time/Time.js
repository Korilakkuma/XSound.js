(function(global) {
    'use strict';

    /**
     * This private class defines properties for drawing sound wave in time domain.
     * @param {number} sampleRate This argument is sample rate.
     * @constructor
     * @extends {Visualizer}
     */
    function Time(sampleRate) {
        Mocks.SoundModule.Analyser.Visualizer.call(this, sampleRate);

        this.type         = Time.TYPES.UINT;  // unsigned int 8 bit (Uint8Array) or float 32 bit (Float32Array)
        this.textInterval = 0.005;            // Draw text at intervals this value [sec]
    }

    /** @extends {Visualizer} */
    Time.prototype = Object.create(Mocks.SoundModule.Analyser.Visualizer.prototype);
    Time.prototype.constructor = Time;

    /**
     * Class (Static) properties
     */
    Time.TYPES       = {};
    Time.TYPES.UINT  = 'uint';
    Time.TYPES.FLOAT = 'float';

    /** @override */
    Time.prototype.param = function(key, value) {
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
                    case 'type':
                        if (value === undefined) {
                            // Gettre
                            return this.type;
                        } else {
                            var v = String(value).toLowerCase();

                            if ((v === Time.TYPES.UINT) || (v === Time.TYPES.FLOAT)) {
                                this.type = v;
                            }
                        }

                        break;
                    case 'textinterval':
                        if (value === undefined) {
                            return this.textInterval;
                        } else {
                            var v = parseFloat(value);

                            if (v > 0) {
                                this.textInterval = v;
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
     * This method draws sound wave in time domain to Canvas.
     * @param {Uint8Array|Float32Array} data This argument is data for drawing.
     * @return {Time} This is returned for method chain.
     * @override
     */
    Time.prototype.drawToCanvas = function(data) {
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

        // Draw text at intervals of "this.textInterval"
        var nTextinterval = Math.floor(this.textInterval * this.sampleRate);

        // Erase previous wave
        context.clearRect(0, 0, width, height);

        // Begin drawing
        switch (this.type) {
            case Time.TYPES.FLOAT:
                this.drawTimeDomainFloat32ArrayToCanvas(context, data, innerWidth, innerHeight, middle);
                break;
            case Time.TYPES.UINT:
            default:
                switch (this.styles.shape) {
                    case 'line':
                        // Set style
                        context.strokeStyle = this.styles.wave;
                        context.lineWidth   = this.styles.width;
                        context.lineCap     = this.styles.cap;
                        context.lineJoin    = this.styles.join;

                        // Draw wave
                        context.beginPath();

                        for (var i = 0, len = data.length; i < len; i++) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            y = Math.floor((1 - (data[i] / 255)) * innerHeight) + this.styles.top;

                            if (i === 0) {
                                context.moveTo((x + (this.styles.width / 2)), y);
                            } else {
                                context.lineTo(x, y);
                            }
                        }

                        context.stroke();

                        break;
                    case 'rect':
                       // Set style
                       if (this.styles.wave !== 'gradient') {
                           context.fillStyle = this.styles.wave;
                       }

                        // Draw wave
                        for (var i = 0, len = data.length; i < len; i++) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            y = Math.floor((0.5 - (data[i] / 255)) * innerHeight);

                           // Set style
                           if (this.styles.wave === 'gradient') {
                                var upside   = (innerHeight / 2) + this.styles.top;
                                var gradient = context.createLinearGradient(0 , upside, 0, (upside + y));

                                for (var j = 0, num = this.styles.grad.length; j < num; j++) {
                                    var gradients = this.styles.grad[j];

                                    gradient.addColorStop(gradients.offset, gradients.color);
                                }

                                context.fillStyle = gradient;
                            }

                            context.fillRect(x, middle, this.styles.width, y);
                        }

                        break;
                    default:
                        break;
                }

                break;
        }

        if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
            // Draw grid and text (X axis)
            for (var i = 0, len = data.length; i < len; i++) {
                if ((i % nTextinterval) === 0) {
                    x = Math.floor((i / len) * innerWidth) + this.styles.left;
                    t = Math.floor((i / this.sampleRate) * 1000) + ' ms';

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

        return this;
    };

    /**
     * This method draws sound wave in time domain to SVG.
     * @param {Uint8Array|Float32Array} data This argument is data for drawing.
     * @return {Time} This is returned for method chain.
     * @override
     */
    Time.prototype.drawToSVG = function(data) {
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

        // Draw text at intervals of "this.textInterval"
        var nTextinterval = Math.floor(this.textInterval * this.sampleRate);

        // Begin drawing
        svg.innerHTML = '';

        // Begin drawing
        switch (this.type) {
            case Time.TYPES.FLOAT:
                svg.appendChild(this.drawTimeDomainFloat32ArrayToSVG(data, innerWidth, innerHeight, middle, Mocks.SoundModule.Analyser.Visualizer.SVG_LINEAR_GRADIENT_IDS.TIME));
                break;
            case Time.TYPES.UINT:
            default:
                switch (this.styles.shape) {
                    case 'line':
                        // Draw wave
                        var path = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'path');

                        var d = '';

                        for (var i = 0, len = data.length; i < len; i++) {
                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            y = Math.floor((1 - (data[i] / 255)) * innerHeight) + this.styles.top;

                            if (i === 0) {
                                d += 'M' + (x + (this.styles.width / 2)) + ' ' + y;
                            } else {
                                d += ' ';
                                d += 'L' + x + ' ' + y;
                            }
                        }

                        path.setAttribute('d', d);

                        path.setAttribute('stroke',          this.styles.wave);
                        path.setAttribute('fill',            'none');
                        path.setAttribute('stroke-width',    this.styles.width);
                        path.setAttribute('stroke-linecap',  this.styles.cap);
                        path.setAttribute('stroke-linejoin', this.styles.join);

                        svg.appendChild(path);

                        break;
                    case 'rect':
                        var defs = null;

                        if (this.styles.wave === 'gradient') {
                            defs = this.createSVGLinearGradient(Mocks.SoundModule.Analyser.Visualizer.SVG_LINEAR_GRADIENT_IDS.TIME);
                        }

                        // Draw wave
                        var g = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'g');

                        if (defs !== null) {
                            g.appendChild(defs);
                        }

                        for (var i = 0, len = data.length; i < len; i++) {
                            var rect = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'rect');

                            x = Math.floor((i / len) * innerWidth) + this.styles.left;
                            y = Math.floor(((data[i] / 255) - 0.5) * innerHeight);

                            rect.setAttribute('x',     x);
                            rect.setAttribute('y',     middle);
                            rect.setAttribute('width', this.styles.width);

                            if (y < 0) {
                                rect.setAttribute('height', -y);
                            } else {
                                rect.setAttribute('height',    y);
                                rect.setAttribute('transform', 'rotate(180 ' + (x + (this.styles.width / 2)) + ' ' + middle + ')');
                            }

                            rect.setAttribute('stroke', 'none');
                            rect.setAttribute('fill',   (defs === null) ? this.styles.wave : ('url(#' + Mocks.SoundModule.Analyser.Visualizer.SVG_LINEAR_GRADIENT_IDS.TIME + ')'));

                            g.appendChild(rect);
                        }

                        svg.appendChild(g);

                        break;
                    default:
                        break;
                }

                break;
        }

        if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
            // Draw grid and text (X axis)
            for (var i = 0, len = data.length; i < len; i++) {
                if ((i % nTextinterval) === 0) {
                    x = Math.floor((i / len) * innerWidth) + this.styles.left;
                    t = Math.floor((i / this.sampleRate) * 1000) + ' ms';

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

        return this;
    };

    /** @override */
    Time.prototype.toString = function() {
        return '[SoundModule Analyser Time]';
    };

    // Export
    global.Time = Time;
    global.time = new Time(audiocontext.sampleRate);

})(window);
