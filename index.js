'use strict';
var got = require('got');
var registryUrl = require('registry-url');
var rc = require('rc');

module.exports = function (name, version) {
	var isScoped = name.indexOf('/') > -1;
	var scope = name.split('/')[0];
	var url = registryUrl(scope) +
		encodeURIComponent(name).replace(/^%40/, '@') +
		(!isScoped && version ? '/' + version : '');
	var npmrc = rc('npm');
	var token = npmrc[scope + ':_authToken'] || npmrc['//registry.npmjs.org/:_authToken'];
	var headers = {};

	if (token) {
		if (process.env.NPM_TOKEN) {
			token = token.replace('${NPM_TOKEN}', process.env.NPM_TOKEN);
		}

		headers.authorization = 'Bearer ' + token;
	}

	return got(url, {
		json: true,
		headers: headers
	})
		.then(function (res) {
			var data = res.body;

			if (isScoped && version === 'latest') {
				data = data.versions[data['dist-tags'].latest];
			} else if (isScoped && version) {
				data = data.versions[version];

				if (!data) {
					throw new Error('Version doesn\'t exist');
				}
			}

			return data;
		})
		.catch(function (err) {
			if (err.statusCode === 404) {
				throw new Error('Package doesn\'t exist');
			}

			throw err;
		});
};
