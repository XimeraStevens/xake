var Command = require('ronin').Command;
var winston = require('winston');
var credentials = require('../lib/credentials');

module.exports = Command.extend({
    use: ['winston'],

    desc: 'Logout from Ximera',

    help: function () {
        return 'Remove stored credentials.';
    },

    run: function () {
        var global = this.global;
        winston = global.winston;

        credentials.remove(function (err) {
            if (err) {
                throw new Error('Could not log out.  ' + err);
            }

            winston.info('Logged out.');
        });
    }
});
