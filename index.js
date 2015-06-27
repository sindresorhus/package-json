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

function getCleanRegistryUrl(name){
	var registry = registryUrl(name.split('/')[0]);

	// Ensure trailing slash
	if(registry[registry.length-1] !== '/') {
		registry += '/';
	}

	return registry;
}

module.exports = function (name, version, cb) {
	var registry = getCleanRegistryUrl(name);

	var url = registry + encodeURIComponent(name) + '/';

	if (typeof version !== 'string') {
		cb = version;
		version = '';
	}

	get(url + version, cb);
};

module.exports.field = function (name, field, cb) {
	var url = getCleanRegistryUrl(name) +
		'-/by-field/?key=%22' +
		encodeURIComponent(name) +
		'%22&field=' +
		field;

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
