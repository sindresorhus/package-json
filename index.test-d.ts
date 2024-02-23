import {expectType, expectAssignable, expectError} from 'tsd';
import packageJson, {
	type FullMetadata,
	type FullVersion,
	type AbbreviatedMetadata,
	type AbbreviatedVersion,
	PackageNotFoundError,
	VersionNotFoundError,
} from './index.js';

expectAssignable<Promise<AbbreviatedVersion>>(packageJson('package-json'));
expectAssignable<Promise<AbbreviatedVersion>>(
	packageJson('package-json', {version: '1.2.3'}),
);
expectAssignable<Promise<AbbreviatedMetadata>>(
	packageJson('package-json', {allVersions: true}),
);
expectAssignable<Promise<FullVersion>>(
	packageJson('package-json', {fullMetadata: true}),
);
expectAssignable<Promise<FullMetadata>>(
	packageJson('package-json', {fullMetadata: true, allVersions: true}),
);

const abbreviatedMetadata = await packageJson('package-json');
expectType<string>(abbreviatedMetadata.version);
expectError(abbreviatedMetadata.versions);

const fullMetadata = await packageJson('package-json', {fullMetadata: true});
expectType<string>(fullMetadata.version);
expectError(fullMetadata.versions);

const abbreviatedVersions = await packageJson('package-json', {allVersions: true});
expectAssignable<AbbreviatedVersion | undefined>(abbreviatedVersions.versions['1.2.3']);
expectError(abbreviatedVersions.version);

const fullVersions = await packageJson('package-json', {fullMetadata: true, allVersions: true});
expectAssignable<FullVersion | undefined>(fullVersions.versions['1.2.3']);
expectError(fullVersions.version);

expectType<typeof PackageNotFoundError>(PackageNotFoundError);
expectType<typeof VersionNotFoundError>(VersionNotFoundError);

const packageNotFoundError = new PackageNotFoundError('foo');
packageNotFoundError instanceof PackageNotFoundError; // eslint-disable-line @typescript-eslint/no-unused-expressions
expectType<PackageNotFoundError>(packageNotFoundError);

const versionNotFoundError = new VersionNotFoundError('foo', 'bar');
versionNotFoundError instanceof VersionNotFoundError; // eslint-disable-line @typescript-eslint/no-unused-expressions
expectType<VersionNotFoundError>(versionNotFoundError);
