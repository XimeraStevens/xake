var winston = require('winston');
var credentials = require('./credentials');
var http = require('https');
var crypto = require('crypto');
var git = require('nodegit');
var path = require('path');
var async = require('async');
var fs = require('fs');

HOSTNAME = '5304979f.ngrok.com';
ALGORITHM = 'sha256';

function restful( method, path, content, callback ) {
    credentials.load( function(err, keyAndSecret) {
	if (err)
	    callback(err);
	else {
	    var key = keyAndSecret.key;
	    var secret = keyAndSecret.secret;

	    var sha = crypto.createHash(ALGORITHM);
	    sha.setEncoding('base64');

	    sha.write( content );
	    sha.end(content, function () {
		var sha256 = sha.read();
	    
		var hmac = crypto.createHmac(ALGORITHM, secret);
		hmac.setEncoding('hex');

		hmac.write( method + " " + path + "\n" );
		hmac.end(content, function () {
		    var hash = hmac.read();

		    var options = {
			hostname: HOSTNAME,
			port: 443,
			path: path,
			method: method,
			headers: {
			    // Unfortunate, since this is actually authentication
			    'Authorization': 'Ximera ' + key + ':' + hash,
			    'Content-SHA256': sha256,
			    'Content-Type': 'text/plain',
			    'Content-Length': content.length
			}
		    };
		
		    var req = http.request(options, function(res) {
			res.setEncoding('utf8');
			
			var contentChunks = [];
			res.on('data', function (chunk) {
			    contentChunks.push( chunk );
			});
			
			res.on('end', function() {
			    try {
				res.body = JSON.parse(contentChunks.join());
			    } catch (e) {
				res.body = contentChunks.join();
			    }
			    callback(null, res);
			})
		    });
		
		    req.on('error', function(e) {
			//console.log('problem with request: ' + e.message);
			callback(e);		    
		    });
		    
		    req.write(content);
		    req.end();
		});
	    });
	}
    });
}

module.exports.user = function( callback ) {
    restful( 'GET', '/users/', '',
	     function(err, res) {
		 if (err)
		     callback( err, undefined );
		 else
		     callback( null, res.body );
	     });
};

function headCommitSha( repositoryPath, callback ) {
    git.Repository.open(repositoryPath).then(function(repo) {
	return repo.getHeadCommit();
    }, function(err) { callback(err); })
	.then(function(commit) {
	    callback( null, commit.sha() );
	}, function(err) { callback(err); });	    
}

module.exports.publish = function( repositoryPath, filename, callback ) {
    headCommitSha( repositoryPath, function(err, sha) {
	if (err)
	    callback(err);
	else {
	    var url = '/activity/' + sha + '/' + path.relative( repositoryPath, filename );
	    
	    // HTML files should be are extensionless
	    url = url.replace( /\.html$/, '' );
	    
	    fs.readFile( filename, function(err, data) {
		if (err)
		    callback(err);
		else {
		    restful( 'PUT', url, data, callback );
		}
	    });
	}
    });
};