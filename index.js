'use strict';
var got = require('got');
var registryUrl = require('registry-url');

module.exports = function (name, version) {
	var url = registryUrl(name.split('/')[0]) +
		encodeURIComponent(name).replace(/^%40/, '@');

	return got(url, {json: true})
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
