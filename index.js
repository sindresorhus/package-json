import axios from "axios";
import registryUrl from 'registry-url';
import semver from 'semver';

// These agent options are chosen to match the npm client defaults and help with performance
// See: `npm config get maxsockets` and #50
const agentOptions = {
	keepAlive: true,
	maxSockets: 50,
};

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

export default async function packageJson(packageName, options) {
	options = {
		version: 'latest',
		...options,
	};

	const scope = packageName.split('/')[0];
	const registryUrl_ = options.registryUrl || registryUrl(scope);
	const packageUrl = new URL(encodeURIComponent(packageName).replace(/^%40/, '@'), registryUrl_);

	const headers = {
		accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*',
	};

	const agents = {};

	if (options.fullMetadata) {
		delete headers.accept;
	}

	if (typeof process === 'object' && typeof window === 'undefined') {
		const registryAuthToken = await import('registry-auth-token');
		const authInfo = registryAuthToken(registryUrl_.toString(), {recursive: true});
		if (authInfo) {
			headers.authorization = `${authInfo.type} ${authInfo.token}`;
		}

		const {Agent: HttpAgent} = await import('node:http');
		const {Agent: HttpsAgent} = await import('node:https');

		agents.httpAgent = options.agent?.httpAgent ?? new HttpAgent(agentOptions);
		agents.httpsAgent = options.agent?.httpsAgent ??  new HttpsAgent(agentOptions);
	}

	const requestOptions = {
		headers,
		...agents,
	};

	let data;
	try {
		data = await axios.get(packageUrl, requestOptions).then(({data}) => data)// got(packageUrl, gotOptions).json();
	} catch (error) {
		if (error?.response?.status === 404) {
			throw new PackageNotFoundError(packageName);
		}

		throw error;
	}

	if (options.allVersions) {
		return data;
	}

	let {version} = options;
	const versionError = new VersionNotFoundError(packageName, version);

	if (data['dist-tags'][version]) {
		const time = data.time;
		data = data.versions[data['dist-tags'][version]];
		data.time = time;
	} else if (version) {
		if (!data.versions[version]) {
			const versions = Object.keys(data.versions);
			version = semver.maxSatisfying(versions, version);

			if (!version) {
				throw versionError;
			}
		}

		const time = data.time;
		data = data.versions[version];
		data.time = time;

		if (!data) {
			throw versionError;
		}
	}

	return data;
}
