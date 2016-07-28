var Progress = require('progress');

module.exports.run = function (count, verbing, callback) {
    var green = '#'.green;
    var red = '.'.red;

    var bar = new Progress(verbing + ' ' + '['.gray + ':bar' + ']'.gray + ' :percent (:etas remaining) ' + ':file'.magenta,
        {
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
