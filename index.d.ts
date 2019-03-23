import {Agent as HttpAgent} from 'http';
import {Agent as HttpsAgent} from 'https';

export interface Agents {
	http?: HttpAgent;
	https?: HttpsAgent;
}

export interface Options {
	/**
	 * Package version such as `1.0.0` or a [dist tag](https://docs.npmjs.com/cli/dist-tag) such as `latest`.
	 *
	 * The version can also be in any format supported by the [semver](https://github.com/npm/node-semver) module. For example:
	 * - `1` - Get the latest `1.x.x`
	 * - `1.2` - Get the latest `1.2.x`
	 * - `^1.2.3` - Get the latest `1.x.x` but at least `1.2.3`
	 * - `~1.2.3` - Get the latest `1.2.x` but at least `1.2.3`
	 *
	 * @default 'latest'
	 */
	readonly version?: string;

	/**
	 * By default, only an abbreviated metadata object is returned for performance reasons. [Read more.](https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
	 *
	 * @default false
	 */
	readonly fullMetadata?: boolean;

	/**
	 * Return the [main entry](https://registry.npmjs.org/ava) containing all versions.
	 *
	 * @default false
	 */
	readonly allVersions?: boolean;

	/**
	 * The registry URL is by default inferred from the npm defaults and `.npmrc`. This is beneficial as `package-json` and any project using it will work just like npm. This option is **only** intended for internal tools. You should **not** use this option in reusable packages. Prefer just using `.npmrc` whenever possible.
	 */
	readonly registryUrl?: string;

	/**
	 * Overwrite the `agent` option that is passed down to [`got`](https://github.com/sindresorhus/got#agent). This might be useful to add [proxy support](https://github.com/sindresorhus/got#proxies).
	 */
	readonly agent?: HttpAgent | HttpsAgent | Agents | false;
}

export interface FullMetadataOptions extends Options {
	/**
	 * By default, only an abbreviated metadata object is returned for performance reasons. [Read more.](https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
	 *
	 * @default false
	 */
	readonly fullMetadata: true;
}

export interface DistTags {
	readonly latest: string;
	readonly [tagName: string]: string;
}

export interface AbbreviatedMetadata {
	readonly 'dist-tags': DistTags;
	readonly modified: string;
	readonly name: string;
	readonly versions: {readonly [version: string]: AbbreviatedVersion};
	readonly [key: string]: unknown;
}

export interface AbbreviatedVersion {
	readonly name: string;
	readonly version: string;
	readonly dist: {
		readonly shasum: string;
		readonly tarball: string;
		readonly integrity?: string;
	};
	readonly deprecated?: string;
	readonly dependencies?: {readonly [name: string]: string};
	readonly optionalDependencies?: {readonly [name: string]: string};
	readonly devDependencies?: {readonly [name: string]: string};
	readonly bundleDependencies?: {readonly [name: string]: string};
	readonly peerDependencies?: {readonly [name: string]: string};
	readonly bin?: {readonly [key: string]: string};
	readonly directories?: ReadonlyArray<string>;
	readonly engines?: {readonly [type: string]: string};
	readonly _hasShrinkwrap?: boolean;
	readonly [key: string]: unknown;
}

export interface Person {
	readonly name?: string;
	readonly email?: string;
	readonly url?: string;
}

export interface HoistedData {
	readonly author?: Person;
	readonly bugs?:
		| {readonly url: string; readonly email?: string}
		| {readonly url?: string; readonly email: string};
	readonly contributors?: ReadonlyArray<Person>;
	readonly description?: string;
	readonly homepage?: string;
	readonly keywords?: ReadonlyArray<string>;
	readonly license?: string;
	readonly maintainers?: ReadonlyArray<Person>;
	readonly readme?: string;
	readonly readmeFilename?: string;
	readonly repository?: {readonly type: string; readonly url: string};
}

export interface FullMetadata extends AbbreviatedMetadata, HoistedData {
	readonly _id: string;
	readonly _rev: string;
	readonly time: {
		readonly created: string;
		readonly modified: string;
		readonly [version: string]: string;
	};
	readonly users?: {readonly [user: string]: boolean};
	readonly versions: {readonly [version: string]: FullVersion};
	readonly [key: string]: unknown;
}

export interface FullVersion extends AbbreviatedVersion, HoistedData {
	readonly _id: string;
	readonly _nodeVersion: string;
	readonly _npmUser: string;
	readonly _npmVersion: string;
	readonly main?: string;
	readonly files?: ReadonlyArray<string>;
	readonly man?: ReadonlyArray<string>;
	readonly scripts?: {readonly [scriptName: string]: string};
	readonly gitHead?: string;
	readonly types?: string;
	readonly typings?: string;
	readonly [key: string]: unknown;
}

/**
 * Get metadata of a package from the npm registry.
 */
export default function packageJson(
	packageName: string,
	options: FullMetadataOptions
): Promise<FullMetadata>;
export default function packageJson(
	packageName: string,
	options?: Options
): Promise<AbbreviatedMetadata>;

/**
 * The error thrown when the given package name cannot be found.
 */
export class PackageNotFoundError extends Error {
	readonly name: 'PackageNotFoundError'
}

/**
 * The error thrown when the given package version cannot be found.
 */
export class VersionNotFoundError extends Error {
	readonly name: 'VersionNotFoundError'
}
