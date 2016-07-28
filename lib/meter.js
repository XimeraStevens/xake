var Progress = require('progress');
require('colors');

module.exports.run = function (count, verbing, callback) {
    var green = '#'.green,
        red = '.'.red;

    var bar = new Progress(verbing + ' ' + '['.gray + ':bar' + ']'.gray + ' :percent (:etas remaining) ' + ':file'.magenta + '\n', {
        total: count,
        complete: green,
        width: 20,
        incomplete: red
    });

    var currentLabel = '';

    var label = function (text) {
        currentLabel = text;
        bar.tick(0, { file: text });
    };

    var tick = function () {
        bar.tick(1, { file: currentLabel });
    };

    callback(label, tick);
};
