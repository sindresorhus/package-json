'use strict';
var got = require('got');
var registryUrl = require('registry-url');

function get(url) {
	return got(url, {json: true})
		.then(function (res) {
			return res.body;
		})
		.catch(function (err) {
			if (err.statusCode === 404) {
				throw new Error('Package or version doesn\'t exist');
			}

			throw err;
		});
}

module.exports = function (name, version) {
	var url = registryUrl(name.split('/')[0]) + name + '/';

	return get(url + (version || ''));
};

module.exports.field = function (name, field) {
	var url = registryUrl(name.split('/')[0]) + name + '/latest';

	return get(url)
		.then(function (res) {
			if (res[field] === undefined) {
				throw Error('Field `' + field + '` doesn\'t exist');
			}

			return res[field];
		});
};
