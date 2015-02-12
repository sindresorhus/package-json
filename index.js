'use strict';
var got = require('got');
var registryUrl = require('registry-url');

module.exports = function (name, version, cb) {
	if (typeof version !== 'string') {
		cb = version;
		version = '';
	}

	got(registryUrl + encodeURIComponent(name) + '/' + version, function (err, data) {
		if (err) {
			if (err.code === 404) {
				cb(new Error('Package or version doesn\'t exist'));
				return;
			}

			cb(err);
			return;
		}

		cb(null, JSON.parse(data));
	});
};
