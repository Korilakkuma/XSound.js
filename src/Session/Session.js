(function(global) {
    'use strict';

    /**
     * This private class defines properties for sound session on network.
     * @param {AudioContext} context This argument is in order to use the interfaces of Web Audio API.
     * @param {number} bufferSize This argument is buffer size for ScriptProcessorNode.
     * @param {number} numberOfInputs This argument is the number of inputs for ScriptProcessorNode.
     * @param {number} numberOfOutputs This argument the number of outputs for ScriptProcessorNode.
     * @param {Analyser} analyser This argument is the instance of Analyser.
     * @constructor
     * @implements {Statable}
     */
    function Session(context, bufferSize, numberOfInputs, numberOfOutputs, analyser) {
        // Call interface constructor
        Mocks.Statable.call(this);

        this.isActive = false;

        this.context  = context;
        this.analyser = analyser;  // the instance of Analyser

        this.sender   = context.createScriptProcessor(bufferSize, numberOfInputs, numberOfOutputs);
        this.receiver = context.createScriptProcessor(bufferSize, numberOfInputs, numberOfOutputs);

        this.websocket = null;  // for the instance of WebSocket
        this.paused    = true;  // for preventing from  the duplicate onaudioprocess event ("start" method)
    }

    /** @implements {Statable} */
    Session.prototype  = Object.create(Mocks.Statable.prototype);
    Session.prototype.constructor  = Session;

    /**
     * This method creates the instance of WebSocket and registers event handlers.
     * @param {boolean} tls This argument is in order to select protocol (either 'wss' or 'ws').
     * @param {string} host This argument is server's hostname.
     * @param {number} port This argument is port number for connection.
     * @param {string} path This argument is file that is executed in server side.
     * @param {function} openCallback This argument is invoked as "onopen" event handler in the instance of WebSocket.
     * @param {function} closeCallback This argument is invoked as "onclose" event handler in the instance of WebSocket.
     * @param {function} errorCallback This argument is invoked as "onerror" event handler in the instance of WebSocket.
     * @return {Session} This is returned for method chain.
     */
    Session.prototype.setup = function(tls, host, port, path, openCallback, closeCallback, errorCallback) {
        if (!navigator.onLine) {
            // Clear
            this.isActive = false;
            this.paused   = true;
            this.connect();
            this.websocket = null;

            throw new Error('Now Offline.');
        }

        // The argument is associative array ?
        if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
            var properties = arguments[0];

            if ('tls'   in properties) {tls           = properties.tls;}
            if ('host'  in properties) {host          = properties.host;}
            if ('port'  in properties) {port          = properties.port;}
            if ('path'  in properties) {path          = properties.path;}
            if ('open'  in properties) {openCallback  = properties.open;}
            if ('close' in properties) {closeCallback = properties.close;}
            if ('error' in properties) {errorCallback = properties.error;}
        }

        var scheme = tls ? 'wss://' : 'ws://';

        if (path.charAt(0) !== '/') {
            path = '/' + path;
        }

        var p = parseInt(port);

        if (isNaN(p) || (p < 0) || (p > 65535)) {
            return this;
        }

        this.websocket = new WebSocket(scheme + host + ':' + p + path);
        this.websocket.binaryType = 'arraybuffer';

        var self = this;

        this.websocket.onopen = function(event) {
            if (Object.prototype.toString.call(openCallback) === '[object Function]') {
                openCallback(event);
            }
        };

        this.websocket.onclose = function(event) {
            self.isActive = false;
            self.paused   = true;

            self.connect();

            if (Object.prototype.toString.call(closeCallback) === '[object Function]') {
                closeCallback(event);
            }
        };

        this.websocket.onerror = function(event) {
            self.isActive = false;
            self.paused   = true;

            self.connect();

            if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                errorCallback(event);
            }
        };

        this.websocket.onmessage = function(event) {
            if (!self.isActive) {
                self.analyser.stop('time');
                self.analyser.stop('fft');

                return;
            }

            if (event.data instanceof ArrayBuffer) {
                var total  = event.data.byteLength / Float32Array.BYTES_PER_ELEMENT;
                var length = Math.floor(total / 2);
                var offset = length * Float32Array.BYTES_PER_ELEMENT;

                var bufferLs = new Float32Array(event.data,      0, length);  // Get Left  channel data
                var bufferRs = new Float32Array(event.data, offset, length);  // Get Right channel data

                // Start drawing sound wave
                self.analyser.start('time');
                self.analyser.start('fft');

                self.receiver.onaudioprocess = function(event) {
                    var outputLs = event.outputBuffer.getChannelData(0);
                    var outputRs = event.outputBuffer.getChannelData(1);

                    if (bufferLs instanceof Float32Array) {outputLs.set(bufferLs);}
                    if (bufferRs instanceof Float32Array) {outputRs.set(bufferRs);}

                    bufferLs = null;
                    bufferRs = null;

                    if (!self.isActive || (self.websocket === null)) {
                        self.analyser.stop('time');
                        self.analyser.stop('fft');
                    }
                };
            }
        };

        return this;
    };

    /**
     * This method connects nodes according to state.
     * @return {Session} This is returned for method chain.
     */
    Session.prototype.connect = function() {
        // Clear connection
        this.receiver.disconnect(0);
        this.sender.disconnect(0);

        this.receiver.onaudioprocess = null;
        this.sender.onaudioprocess   = null;

        if (this.isActive) {
            // ScriptProcessorNode (Input) -> Analyser -> AudioDestinationNode (Output)
            this.receiver.connect(this.analyser.input);
            this.analyser.output.connect(this.context.destination);
        } else {
            this.paused = true;
        }

        return this;
    };

    /**
     * This method sends sound data to server.
     * @return {Session} This is returned for method chain.
     */
    Session.prototype.start = function() {
        if (this.isActive && this.isConnected() && this.paused) {
            this.paused = false;

            var self = this;

            this.sender.onaudioprocess = function(event) {
                if (self.isActive && self.isConnected()) {
                    var inputLs = event.inputBuffer.getChannelData(0);
                    var inputRs = event.inputBuffer.getChannelData(1);

                    var buffers = new Float32Array(2 * this.bufferSize);
                    var offset  = parseInt(buffers.length / 2);

                    for (var i = 0; i < this.bufferSize; i++) {
                        buffers[i]          = inputLs[i];
                        buffers[offset + i] = inputRs[i];
                    }

                    if (self.websocket.bufferedAmount === 0) {
                        self.websocket.send(buffers);
                    }
                }
            };
        }

        return this;
    };

    /**
     * This method closes connection to server and destroys the instance of WebSocket.
     * @return {Session} This is returned for method chain.
     */
    Session.prototype.close = function() {
        if (this.websocket instanceof WebSocket) {
            this.isActive = false;
            this.paused   = true;

            this.connect();
            this.websocket.close();

            this.websocket = null;
        }

        return this;
    };

    /**
     * This method determines whether there is the connection to server.
     * @return {boolean} If the connection to server exists, this value is true. Otherwise, this value is false.
     */
    Session.prototype.isConnected = function() {
        return (this.websocket instanceof WebSocket) && (this.websocket.readyState === WebSocket.OPEN);
    };

    /** @override */
    Session.prototype.state = function(state, stateCallback, waitCallback) {
        if (state === undefined) {
            return this.isActive;
        }

        if (Object.prototype.toString.call(waitCallback) === '[object Function]') {
            waitCallback();
        }

        var self = this;

        var intervalid = global.setInterval(function() {
            if ((self.websocket instanceof WebSocket) && (self.websocket.bufferedAmount !== 0)) {
                return;
            }

            if (String(state).toLowerCase() === 'toggle') {
                self.isActive = !self.isActive;
            } else {
                self.isActive = Boolean(state);
            }

            self.connect();

            if (Object.prototype.toString.call(stateCallback) === '[object Function]') {
                stateCallback();
            }

            global.clearInterval(intervalid);
        }, 10);

        return this;
    };

    /**
     * This method gets the instance of WebSocket.
     * @return {WebSocket}
     */
    Session.prototype.get = function() {
        return this.websocket;
    };

    /** @override */
    Session.prototype.toString = function() {
        return '[SoundModule Session]';
    };

    // Export
    global.Session = Session;
    global.session = new Session(audiocontext, 2048, 2, 2, new Mocks.SoundModule.Analyser);

})(window);
