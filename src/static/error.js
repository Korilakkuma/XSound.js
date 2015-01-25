// for output of error
var ERROR_MODES = {
    NONE      : 0,
    ALERT     : 1,
    CONSOLE   : 2,
    EXCEPTION : 3
};

var ERROR_MODE = ERROR_MODES.CONSOLE;

/** 
 * This static method sets error mode for developers that use this library.
 * @param {string|type} mode This argument is one of 0, 1, 2, 'NONE, 'CONSOLE', 'EXCEPTION'.
 */
var error = function(mode) {
    switch (String(mode).toUpperCase()) {
        case 'NONE' :
        case '0'    :
            ERROR_MODE = ERROR_MODES.NONE;
            break;
        case 'ALERT' :
        case '1'     :
            ERROR_MODE = ERROR_MODES.ALERT;
            break;
        case 'CONSOLE' :
        case '2'       :
            ERROR_MODE = ERROR_MODES.CONSOLE;
            break;
        case 'EXCEPTION' :
        case '3'         :
            ERROR_MODE = ERROR_MODES.EXCEPTION;
            break;
        default :
            break;
    }
};
