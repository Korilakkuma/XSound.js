(function(global) {
    'use strict';

    /**
     * Effector's subclass
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @constructor
     * @extends {Effector}
     */
    function Panner(context, bufferSize) {
        Mocks.SoundModule.Effector.call(this, context, bufferSize);

        this.panner = context.createPanner();

        this.positions    = {'x': 0, 'y': 0, 'z': 0};
        this.orientations = {'x': 1, 'y': 0, 'z': 0};
        this.velocities   = {'x': 0, 'y': 0, 'z': 0};

        this.panner.refDistance   = 1;
        this.panner.maxDistance   = 10000;
        this.panner.rolloffFactor = 1;

        this.panner.coneInnerAngle = 360;
        this.panner.coneOuterAngle = 360;
        this.panner.coneOuterGain  = 0;

        this.panner.panningModel  = (Object.prototype.toString.call(this.panner.panningModel)  === '[object String]') ? 'HRTF'    : (this.panner.HRTF || 1);
        this.panner.distanceModel = (Object.prototype.toString.call(this.panner.distanceModel) === '[object String]') ? 'inverse' : (this.panner.INVERSE_DISTANCE || 1);

        this.panner.setPosition(this.positions.x, this.positions.y, this.positions.z);
        this.panner.setOrientation(this.orientations.x, this.orientations.y, this.orientations.z);
        this.panner.setVelocity(this.velocities.x, this.velocities.y, this.velocities.z);

        // Panner is not connected by default
        this.state(false);
    }

    /** @extends {Effector} */
    Panner.prototype = Object.create(Mocks.SoundModule.Effector.prototype);
    Panner.prototype.constructor = Panner;

    /** @override */
    Panner.prototype.param = function(key, value) {
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            // Associative array
            for (var k in arguments[0]) {
                this.param(k, arguments[0][k]);
            }
        } else {
            var k = String(key).replace(/-/g, '').toLowerCase();

            switch (k) {
                case 'x':
                case 'y':
                case 'z':
                    if (value === undefined) {
                        return this.positions[k];
                    } else {
                        var v = parseFloat(value);

                        if (!isNaN(v)) {
                            this.positions[k] = v;
                            this.panner.setPosition(this.positions.x, this.positions.y, this.positions.z);
                        }
                    }

                    break;
                case 'ox':
                case 'oy':
                case 'oz':
                    if (value === undefined) {
                        return this.orientations[k.charAt(1)];
                    } else {
                        var v = parseFloat(value);

                        if (!isNaN(v)) {
                            this.orientations[k.charAt(1)] = v;
                            this.panner.setOrientation(this.orientations.x, this.orientations.y, this.orientations.z);
                        }
                    }

                    break;
                case 'vx':
                case 'vy':
                case 'vz':
                    if (value === undefined) {
                        return this.velocities[k.charAt(1)];
                    } else {
                        var v = parseFloat(value);

                        if (!isNaN(v)) {
                            this.velocities[k.charAt(1)] = v;
                            this.panner.setVelocity(this.velocities.x, this.velocities.y, this.velocities.z);
                        }
                    }

                    break;
                case 'refdistance':
                    if (value === undefined) {
                        return this.panner.refDistance;
                    } else {
                        var v = parseFloat(value);

                        if (!isNaN(v)) {
                            this.panner.refDistance = v;
                        }
                    }

                    break;
                case 'maxdistance':
                    if (value === undefined) {
                        return this.panner.maxDistance;
                    } else {
                        var v = parseFloat(value);

                        if (!isNaN(v)) {
                            this.panner.maxDistance = v;
                        }
                    }

                    break;
                case 'rollofffactor':
                    if (value === undefined) {
                        return this.panner.rolloffFactor;
                    } else {
                        var v = parseFloat(value);

                        if (!isNaN(v)) {
                            this.panner.rolloffFactor = v;
                        }
                    }

                    break;
                case 'coneinnerangle':
                    if (value === undefined) {
                        return this.panner.coneInnerAngle;
                    } else {
                        var v = parseFloat(value);

                        if (!isNaN(v)) {
                            this.panner.coneInnerAngle = v;
                        }
                    }

                    break;
                case 'coneouterangle':
                    if (value === undefined) {
                        return this.panner.coneOuterAngle;
                    } else {
                        var v = parseFloat(value);

                        if (!isNaN(v)) {
                            this.panner.coneOuterAngle = v;
                        }
                    }

                    break;
                case 'coneoutergain':
                    if (value === undefined) {
                        return this.panner.coneOuterGain;
                    } else {
                        var v = parseFloat(value);

                        if (!isNaN(v)) {
                            this.panner.coneOuterGain = v;
                        }
                    }

                    break;
                case 'panningmodel':
                    if (value === undefined) {
                        return this.panner.panningModel;
                    } else {
                        var v = /HRTF/i.test(value) ? String(value).toUpperCase() : String(value).toLowerCase();

                        var MODELS = {
                            'equalpower': this.panner.EQUALPOWER || 0,
                            'HRTF'      : this.panner.HRTF       || 1
                        };

                        if (v in MODELS) {
                            this.panner.panningModel = (Object.prototype.toString.call(this.panner.panningModel) === '[object String]') ? v : MODELS[v];
                        }
                    }

                    break;
                case 'distancemodel':
                    if (value === undefined) {
                        return this.panner.distanceModel;
                    } else {
                        var v = String(value).replace(/-/g, '').toLowerCase();

                        var MODELS = {
                            'linear'     : this.panner.LINEAR_DISTANCE      || 0,
                            'inverse'    : this.panner.INVERSE_DISTANCE     || 1,
                            'exponential': this.panner.EXPONENTIAL_DISTANCE || 2
                        };

                        if (v in MODELS) {
                            this.panner.distanceModel = (Object.prototype.toString.call(this.panner.distanceModel) === '[object String]') ? v : MODELS[v];
                        }
                    }

                    break;
                default:
                    break;
            }
        }

        return this;
    };

    /** @override */
    Panner.prototype.connect = function() {
        // Clear connection
        this.input.disconnect(0);
        this.panner.disconnect(0);

        if (this.isActive) {
            // Effect ON

            // GainNode (Input) -> PannerNode -> GainNode (Output)
            this.input.connect(this.panner);
            this.panner.connect(this.output);
        } else {
            // Effect OFF

            // GainNode (Input) -> GainNode (Output)
            this.input.connect(this.output);
        }
    };

    /** @override */
    Panner.prototype.params = function() {
        var params = {
            'state'         : this.isActive,
            'positions'     : this.positions,
            'orientations'  : this.orientations,
            'velocities'    : this.velocities,
            'refDistance'   : this.panner.refDistance,
            'maxDistance'   : this.panner.maxDistance,
            'rolloffFactor' : this.panner.rolloffFactor,
            'coneInnerAngle': this.panner.coneInnerAngle,
            'coneOuterAngle': this.panner.coneOuterAngle,
            'coneOuterGain' : this.panner.coneOuterGain,
            'panningModel'  : this.panner.panningModel,
            'distanceModel' : this.panner.distanceModel
        };

        return params;
    };

    /** @override */
    Panner.prototype.toJSON = function() {
        return JSON.stringify(this.params());
    };

    /** @override */
    Panner.prototype.toString = function() {
        return '[SoundModule Panner]';
    };

    // Export
    global.Panner = Panner;
    global.panner = new Panner(audiocontext, 2048);

})(window);
