/** 
 * This static method calculates minutes and seconds from the designated time in seconds.
 * @param {number} time This argument is the time in seconds.
 * @return {object} This is returned as associative array that has "minutes", "seconds" and "milliseconds" keys.
 */
var convertTime = function(time) {
    var t = parseFloat(time);

    if (t >= 0) {
        var m  = Math.floor(t / 60);
        var s  = Math.floor(t % 60);
        var ms = t - parseInt(t);

        return {
            minutes      : m,
            seconds      : s,
            milliseconds : ms
        };
    } else {
        return 'Error';
    }
};
