'use strict';
var got = require('got');
var registryUrl = require('registry-url');
var rc = require('rc');

module.exports = function (name, version) {
	var scope = name.split('/')[0];
	var url = registryUrl(scope) +
		encodeURIComponent(name).replace(/^%40/, '@');
	var npmrc = rc('npm');
	var token = npmrc[scope + ':_authToken'] || npmrc['//registry.npmjs.org/:_authToken'];
	var headers = {};

	if (token) {
		headers.authorization = 'Bearer ' + token;
	}

	return got(url, {
		json: true,
		headers: headers
	})
		.then(function (res) {
			var data = res.body;

			if (version === 'latest') {
				data = data.versions[data['dist-tags'].latest];
			} else if (version) {
				data = data.versions[version];
			}

			return data;
		})
		.catch(function (err) {
			if (err.statusCode === 404) {
				throw new Error('Package or version doesn\'t exist');
			}

			throw err;
		});
};
