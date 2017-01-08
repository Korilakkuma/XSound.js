(function(global) {
    'use strict';

    /**
     * This private class defines properties for drawing sound wave in frequency domain (spectrum).
     * @param {number} sampleRate This argument is sample rate.
     * @constructor
     * @extends {Visualizer}
     */
    function FFT(sampleRate) {
        Mocks.SoundModule.Analyser.Visualizer.call(this, sampleRate);

        this.type         = FFT.TYPES.UINT;  // unsigned int 8 bit (Uint8Array) or float 32 bit (Float32Array)
        this.size         = 256;             // Range for drawing
        this.textInterval = 1000;            // Draw text at intervals of this value [Hz]
    }

    /** @extends {Visualizer} */
    FFT.prototype = Object.create(Mocks.SoundModule.Analyser.Visualizer.prototype);
    FFT.prototype.constructor = FFT;

    /**
     * Class (Static) properties
     */
    FFT.TYPES       = {};
    FFT.TYPES.UINT  = 'uint';
    FFT.TYPES.FLOAT = 'float';

    /** @override */
    FFT.prototype.param = function(key, value) {
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
                            return this.type;
                        } else {
                            var v = String(value).toLowerCase();

                            if ((v === FFT.TYPES.UINT) || (v === FFT.TYPES.FLOAT)) {
                                this.type = v;
                            }
                        }

                        break;
                    case 'size':
                        if (value === undefined) {
                            return this.size;
                        } else {
                            var v   = parseInt(value);
                            var min = 0;
                            var max = 1024;  // AnalyserNode#fftSize max 2048 -> half 1024

                            if ((v > 0) && (v <= max)) {
                                this.size = v;
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
     * This method draws sound wave in frequency domain (spectrum) to Canvas.
     * @param {Uint8Array|Float32Array} data This argument is data for drawing.
     * @param {number} minDecibels This argument is in order to determine the range of drawing. The default value is -100 dB.
     * @param {number} maxDecibels This argument is in order to determine the range of drawing. The default value is -30 dB.
     * @return {FFT} This is returned for method chain.
     * @override
     */
    FFT.prototype.drawToCanvas = function(data, minDecibels, maxDecibels) {
        if (!((this.canvas instanceof HTMLCanvasElement) && this.isActive)) {
            return this;
        }

        var mindB = parseFloat(minDecibels);
        var maxdB = parseFloat(maxDecibels);

        var range = maxdB - mindB;

        var context = this.context;

        var width       = this.canvas.width;
        var height      = this.canvas.height;
        var innerWidth  = width  - (this.styles.left + this.styles.right);
        var innerHeight = height - (this.styles.top  + this.styles.bottom);

        var x = 0;
        var y = 0;
        var t = '';

        var drawnSize = (this.size > data.length) ? data.length : this.size;

        // Frequency resolution (Sampling rate / FFT size)
        var fsDivN = this.sampleRate / (2 * data.length);

        // Draw text at intervals of "this.textInterval"
        var nTextInterval = Math.floor(this.textInterval / fsDivN);

        // Erase previous wave
        context.clearRect(0, 0, width, height);

        // Begin drawing
        switch (this.type) {
            case FFT.TYPES.FLOAT:
                // Set style
                context.strokeStyle = (this.styles.wave !== 'gradient') ? this.styles.wave : 'rgba(0, 0, 255, 1.0)';  // line only
                context.lineWidth   = this.styles.width;
                context.lineCap     = this.styles.cap;
                context.lineJoin    = this.styles.join;

                // Draw wave
                context.beginPath();

                for (var i = 0; i < drawnSize; i++) {
                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                    y = (Math.abs(data[i] - maxdB) * (innerHeight / range)) + this.styles.top;  // [dB] * [px / dB] = [px]

                    if (i === 0) {
                        context.moveTo((x + (this.styles.width / 2)), y);
                    } else {
                        context.lineTo(x, y);
                    }
                }

                context.stroke();

                break;
            case FFT.TYPES.UINT:
            default:
                switch (this.styles.shape) {
                    case 'line':
                        // Set style
                        context.strokeStyle = this.styles.wave;
                        context.lineWidth   = this.styles.width;
                        context.lineCap     = this.styles.cap;
                        context.lineJoin    = this.styles.join;

                        context.beginPath();

                        // Draw wave
                        for (var i = 0; i < drawnSize; i++) {
                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
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
                        for (var i = 0; i < drawnSize; i++) {
                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                            y = -1 * Math.floor((data[i] / 255) * innerHeight);

                           // Set style
                           if (this.styles.wave === 'gradient') {
                                var upside   = innerHeight + this.styles.top;
                                var gradient = context.createLinearGradient(0 , upside, 0, (upside + y));

                                for (var j = 0, num = this.styles.grad.length; j < num; j++) {
                                    var gradients = this.styles.grad[j];

                                    gradient.addColorStop(gradients.offset, gradients.color);
                                }

                                context.fillStyle = gradient;
                            }

                            context.fillRect(x, (innerHeight + this.styles.top), this.styles.width, y);
                        }

                        break;
                    default:
                        break;
                }

                break;
        }

        if ((this.styles.grid !== 'none') || (this.styles.text !== 'none')) {
            // Draw grid and text (X axis)
            var f = 0;

            for (var i = 0; i < drawnSize; i++) {
                if ((i % nTextInterval) === 0) {
                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;

                    f = Math.floor(this.textInterval * (i / nTextInterval));
                    t = (f < 1000) ? (f + ' Hz') : (String(f / 1000).slice(0, 3) + ' kHz');

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
            switch (this.type) {
                case FFT.TYPES.FLOAT:
                    for (var i = mindB; i <= maxdB; i += 10) {
                        t = i + ' dB';
                        x = Math.floor(this.styles.left - context.measureText(t).width);
                        y = Math.floor(((-1 * (i - maxdB)) / range) * innerHeight) + this.styles.top;

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

                    break;
                case FFT.TYPES.UINT:
                default:
                    var texts = ['0.00', '0.25', '0.50', '0.75', '1.00'];

                    for (var i = 0, len = texts.length; i < len; i++) {
                        t = texts[i];
                        x = Math.floor(this.styles.left - context.measureText(t).width);
                        y = ((1 - parseFloat(t)) * innerHeight) + this.styles.top;

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

                    break;
            }
        }

        return this;
    };

    /**
     * This method draws sound wave in frequency domain (spectrum) to SVG.
     * @param {Uint8Array|Float32Array} data This argument is data for drawing.
     * @param {number} minDecibels This argument is in order to determine the range of drawing. The default value is -100 dB.
     * @param {number} maxDecibels This argument is in order to determine the range of drawing. The default value is -30 dB.
     * @return {FFT} This is returned for method chain.
     * @override
     */
    FFT.prototype.drawToSVG = function(data, minDecibels, maxDecibels) {
        if (!((this.svg instanceof SVGElement) && this.isActive)) {
            return this;
        }

        var mindB = parseFloat(minDecibels);
        var maxdB = parseFloat(maxDecibels);

        var range = maxdB - mindB;

        var svg = this.svg;

        var width       = svg.getAttribute('width');
        var height      = svg.getAttribute('height');
        var innerWidth  = width  - (this.styles.left + this.styles.right);
        var innerHeight = height - (this.styles.top  + this.styles.bottom);

        var x = 0;
        var y = 0;
        var t = '';

        var drawnSize = (this.size > data.length) ? data.length : this.size;

        // Frequency resolution (sample rate / FFT size)
        var fsDivN = this.sampleRate / (2 * data.length);

        // Draw text at intervals of "this.textInterval"
        var nTextInterval = Math.floor(this.textInterval / fsDivN);

        // Erase previous wave
        svg.innerHTML = '';

        // Begin drawing
        switch (this.type) {
            case FFT.TYPES.FLOAT:
                // Draw wave
                var path = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'path');

                var d = '';

                for (var i = 0; i < drawnSize; i++) {
                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                    y = Math.floor(-1 * (data[i] - maxdB) * (innerHeight / range)) + this.styles.top;

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
            case FFT.TYPES.UINT:
            default:
                switch (this.styles.shape) {
                    case 'line':
                        // Draw wave
                        var path = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'path');

                        var d = '';

                        for (var i = 0; i < drawnSize; i++) {
                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
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
                        // Draw wave
                        var defs = null;

                        if (this.styles.wave === 'gradient') {
                            defs = this.createSVGLinearGradient(Mocks.SoundModule.Analyser.Visualizer.SVG_LINEAR_GRADIENT_IDS.FFT);
                        }

                        // Draw wave
                        var g = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'g');

                        if (defs !== null) {
                            g.appendChild(defs);
                        }

                        for (var i = 0; i < drawnSize; i++) {
                            var rect = document.createElementNS(Mocks.SoundModule.Analyser.Visualizer.XMLNS, 'rect');

                            x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;
                            y = Math.floor((data[i] / 255) * innerHeight);

                            rect.setAttribute('x',     x);
                            rect.setAttribute('y',     (this.styles.top + innerHeight));
                            rect.setAttribute('width', this.styles.width);

                            if (y < 0) {
                                rect.setAttribute('height', -y);
                            } else {
                                rect.setAttribute('height',    y);
                                rect.setAttribute('transform', 'rotate(180 ' + (x + this.styles.width / 2) + ' ' + (this.styles.top + innerHeight) + ')');
                            }

                            rect.setAttribute('stroke', 'none');
                            rect.setAttribute('fill',   (defs === null) ? this.styles.wave : ('url(#' + Mocks.SoundModule.Analyser.Visualizer.SVG_LINEAR_GRADIENT_IDS.FFT + ')'));

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
            var f = 0;

            for (var i = 0; i < drawnSize; i++) {
                if ((i % nTextInterval) === 0) {
                    x = Math.floor((i / drawnSize) * innerWidth) + this.styles.left;

                    f = Math.floor(this.textInterval * (i / nTextInterval));
                    t = (f < 1000) ? (f + ' Hz') : (String(f / 1000).slice(0, 3) + ' kHz');

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
            switch (this.type) {
                case FFT.TYPES.FLOAT:
                    for (var i = mindB; i <= maxdB; i += 10) {
                        t = i + 'dB';
                        x = this.styles.left;
                        y = Math.floor(((-1 * (i - maxdB)) / range) * innerHeight) + this.styles.top;

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

                    break;
                case FFT.TYPES.UINT:
                default:
                    var texts = ['0.00', '0.25', '0.50', '0.75', '1.00'];

                    for (var i = 0, len = texts.length; i < len; i++) {
                        t = texts[i];
                        x = this.styles.left;
                        y = ((1 - parseFloat(t)) * innerHeight) + this.styles.top;

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

                    break;
            }
        }

        return this;
    };

    /** @override */
    FFT.prototype.toString = function() {
        return '[SoundModule Analyser FFT]';
    };

    // Export
    global.FFT = FFT;
    global.fft = new FFT(audiocontext.sampleRate);

})(window);
