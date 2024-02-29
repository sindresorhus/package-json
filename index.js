import ky from 'ky';
import registryUrl from 'registry-url';
import registryAuthToken from 'registry-auth-token';
import semver from 'semver';

export class PackageNotFoundError extends Error {
	constructor(packageName) {
		super(`Package \`${packageName}\` could not be found`);
		this.name = 'PackageNotFoundError';
	}
}

export class VersionNotFoundError extends Error {
	constructor(packageName, version) {
		super(`Version \`${version}\` for package \`${packageName}\` could not be found`);
		this.name = 'VersionNotFoundError';
	}
}

// TODO: should this include the deprecation message?

export class DeprecatedPackageError extends Error {
	constructor(packageName) {
		super(`Package \`${packageName}\` is deprecated`);
		this.name = 'DeprecatedPackageError';
	}
}

export class DeprecatedVersionError extends Error {
	constructor(packageName, version) {
		super(`Version or range \`${version}\` for package \`${packageName}\` is deprecated`);
		this.name = 'DeprecatedVersionError';
	}
}

export default async function packageJson(packageName, {version = 'latest', omitDeprecated = true, ...options} = {}) { // eslint-disable-line complexity
	const scope = packageName.split('/')[0];
	const registryUrl_ = options.registryUrl ?? registryUrl(scope);
	const packageUrl = new URL(encodeURIComponent(packageName).replace(/^%40/, '@'), registryUrl_);
	const authInfo = registryAuthToken(registryUrl_.toString(), {recursive: true});

	const headers = {
		accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*',
	};

	if (options.fullMetadata) {
		delete headers.accept;
	}

	if (authInfo) {
		headers.authorization = `${authInfo.type} ${authInfo.token}`;
	}

	let data;
	try {
		data = await ky(packageUrl, {headers, keepalive: true}).json();
	} catch (error) {
		if (error?.response?.status === 404) {
			throw new PackageNotFoundError(packageName);
		}

		throw error;
	}

	const isPackageDeprecated = Object.values(data.versions).every(metadataVersion => metadataVersion.deprecated);

	if (isPackageDeprecated && omitDeprecated) {
		throw new DeprecatedPackageError(packageName);
	}

	if (options.allVersions) {
		if (omitDeprecated) {
			for (const [metadataVersion, metadata] of Object.entries(data.versions)) {
				if (metadata.deprecated) {
					delete data.versions[metadataVersion];
				}
			}
		}

		return data;
	}

	const originalVersion = version;

	if (data['dist-tags'][version]) {
		const {time} = data;
		data = data.versions[data['dist-tags'][version]];
		data.time = time;
	} else if (version) {
		if (!data.versions[version]) {
			const originalVersions = Object.keys(data.versions);
			let versions = originalVersions;

			if (omitDeprecated) {
				versions = versions.filter(v => !data.versions[v].deprecated);
			}

			const originalVersionExists = Boolean(semver.maxSatisfying(originalVersions, version));
			version = semver.maxSatisfying(versions, version);

			if (!version) {
				if (omitDeprecated && originalVersionExists) {
					throw new DeprecatedVersionError(packageName, originalVersion);
				}

				throw new VersionNotFoundError(packageName, originalVersion);
			}
		}

		const {time} = data;
		data = data.versions[version];
		data.time = time;

		if (!data) {
			throw new VersionNotFoundError(packageName, originalVersion);
		}
	}

	if (omitDeprecated && data.deprecated) {
		throw new DeprecatedVersionError(packageName, originalVersion);
	}

	return data;
}
