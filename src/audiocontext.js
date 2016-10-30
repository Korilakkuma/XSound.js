(function(global) {
    'use strict';

    global.AudioContext = global.AudioContext || global.webkitAudioContext;

    // Export
    global.audiocontext = new AudioContext();

})(window);
