/** 
 * This static method calculates frequency from the index that corresponds to the 12 equal temperament.
 * @param {Array.<number>} indexes This argument is array of index that corresponds to the 12 equal temperament.
 *     For example, This value is between 0 and 88 in the case of piano.
 * @return {Array.<number>} This is returned as array of frequencies.
 */
var toFrequencies = function(indexes) {
    // The 12 equal temperament
    //
    // Min -> 27.5 Hz (A), Max -> 4186 Hz (C)
    //
    // A * 1.059463 -> A# (half up)

    var FREQUENCY_RATIO = Math.pow(2, (1 / 12));  // about 1.059463
    var MIN_A           = 27.5;

    if (!Array.isArray(indexes)) {
        indexes = [indexes];
    }

    var frequencies = new Array(indexes.length);

    for (var i = 0, len = indexes.length; i < len; i ++) {
        var index = parseInt(indexes[i]);

        frequencies[i] = (index >= 0) ? (MIN_A * Math.pow(FREQUENCY_RATIO, index)) : 0;
    }

    return frequencies;
};
