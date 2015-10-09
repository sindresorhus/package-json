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
