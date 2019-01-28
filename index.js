'use strict';
const {URL} = require('url');
const got = require('got');
const registryUrl = require('registry-url');
const registryAuthToken = require('registry-auth-token');
const semver = require('semver');

class PackageNotFoundError extends Error {
	constructor(packageName) {
		super(`Package \`${packageName}\` could not be found`);
		this.name = 'PackageNotFoundError';
	}
}

class VersionNotFoundError extends Error {
	constructor(packageName, version) {
		super(`Version \`${version}\` for package \`${packageName}\` could not be found`);
		this.name = 'VersionNotFoundError';
	}
}

module.exports = async (name, options) => {
	options = {
		version: 'latest',
		...options
	};

	const scope = name.split('/')[0];
	const regUrl = registryUrl(scope);
	const pkgUrl = new URL(encodeURIComponent(name).replace(/^%40/, '@'), regUrl);
	const authInfo = registryAuthToken(regUrl.toString(), {recursive: true});

	const headers = {
		accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*'
	};

	if (options.fullMetadata) {
		delete headers.accept;
	}

	if (authInfo) {
		headers.authorization = `${authInfo.type} ${authInfo.token}`;
	}

	let response;
	try {
		response = await got(pkgUrl, {json: true, headers});
	} catch (error) {
		if (error.statusCode === 404) {
			throw new PackageNotFoundError(name);
		}

		throw error;
	}

	let data = response.body;

	if (options.allVersions) {
		return data;
	}

	let {version} = options;
	const versionError = new VersionNotFoundError(name, version);

	if (data['dist-tags'][version]) {
		data = data.versions[data['dist-tags'][version]];
	} else if (version) {
		if (!data.versions[version]) {
			const versions = Object.keys(data.versions);
			version = semver.maxSatisfying(versions, version);

			if (!version) {
				throw versionError;
			}
		}

		data = data.versions[version];

		if (!data) {
			throw versionError;
		}
	}

	return data;
};

module.exports.PackageNotFoundError = PackageNotFoundError;

module.exports.VersionNotFoundError = VersionNotFoundError;
