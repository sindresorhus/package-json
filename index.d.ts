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
}

export interface PackageJson {
	readonly [k: string]: unknown;
	readonly name?: string;
	readonly version?: string;
	readonly files?: ReadonlyArray<string>;
	readonly bin?: {[k: string]: string};
	readonly man?: ReadonlyArray<string>;
	readonly keywords?: ReadonlyArray<string>;
	readonly author?: Person;
	readonly maintainers?: ReadonlyArray<Person>;
	readonly contributors?: ReadonlyArray<Person>;
	readonly bundleDependencies?: {[name: string]: string};
	readonly dependencies?: {[name: string]: string};
	readonly devDependencies?: {[name: string]: string};
	readonly optionalDependencies?: {[name: string]: string};
	readonly description?: string;
	readonly engines?: {[type: string]: string};
	readonly license?: string;
	readonly repository?: {type: string; url: string};
	readonly bugs?: {url: string; email?: string} | {url?: string; email: string};
	readonly homepage?: string;
	readonly scripts?: {[k: string]: string};
	readonly readme?: string;
}

export interface Person {
	readonly name?: string;
	readonly email?: string;
	readonly url?: string;
}

/**
 * Get metadata of a package from the npm registry.
 *
 * @param name - Name of the package.
 */
export default function packageJson(
	name: string,
	options?: Options
): Promise<PackageJson>;

/**
 * The error thrown when the given package name cannot be found.
 */
export class PackageNotFoundError extends Error {}

/**
 * The error thrown when the given package version cannot be found.
 */
export class VersionNotFoundError extends Error {}
