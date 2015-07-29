'use strict';
var got = require('got');
var registryUrl = require('registry-url');

function get(url, cb) {
	got(url, {json: true}, function (err, data) {
		if (err && err.code === 404) {
			cb(new Error('Package or version doesn\'t exist'));
			return;
		}

		if (err) {
			cb(err);
			return;
		}

		cb(null, data);
	});
}

function getCleanName(name){
	// Any path components in the name need to be URI encoded, however the @
	// symbol must not be encoded.
	// Valid URL: https://registry.npmjs.org/@sindresorhus%2Fdf/
	// Invalid URL: https://registry.npmjs.org/%40sindresorhus%2Fdf
	return encodeURIComponent(name).replace(/^%40/, '@');
}

module.exports = function (name, version, cb) {
	var registry = registryUrl(name.split('/')[0]);
	var url = registry + getCleanName(name) + '/';

	if (typeof version !== 'string') {
		cb = version;
		version = '';
	}

	get(url + version, cb);
};

module.exports.field = function (name, field, cb) {
	var url = registryUrl(name.split('/')[0]) +
		'-/by-field/?key=%22' + getCleanName(name) + '%22&field=' + field;

	get(url, function (err, res) {
		if (err) {
			cb(err);
			return;
		}

		if (Object.keys(res).length === 0) {
			cb(new Error('Field `' + field + '` doesn\'t exist'));
			return;
		}

		cb(null, res[name][field]);
	});
};
