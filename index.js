'use strict';
var got = require('got');
var endpoint = 'https://registry.npmjs.org/';

module.exports = function (name, version, cb) {
	if (typeof version !== 'string') {
		cb = version;
		version = '';
	}

	got(endpoint + encodeURIComponent(name) + '/' + version, function (err, data) {
		if (err === 404) {
			return cb(new Error('Package or version doesn\'t exist'));
		}

		if (err) {
			return cb(err);
		}

		cb(null, JSON.parse(data));
	});
};
