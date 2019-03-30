import {expectType} from 'tsd';
import packageJson = require('.');
import {
	FullMetadata,
	FullVersion,
	AbbreviatedMetadata,
	AbbreviatedVersion,
	PackageNotFoundError,
	VersionNotFoundError
} from '.';

expectType<Promise<AbbreviatedMetadata>>(packageJson('package-json'));
expectType<Promise<AbbreviatedMetadata>>(
	packageJson('package-json', {version: '1.2.3'})
);
expectType<Promise<AbbreviatedMetadata>>(
	packageJson('package-json', {allVersions: true})
);
expectType<Promise<FullMetadata>>(
	packageJson('package-json', {fullMetadata: true})
);

const abbreviatedMetadata = await packageJson('package-json');
expectType<AbbreviatedVersion>(abbreviatedMetadata.versions['1.2.3']);
const fullMetadata = await packageJson('package-json', {fullMetadata: true});
expectType<FullVersion>(fullMetadata.versions['1.2.3']);

expectType<typeof PackageNotFoundError>(PackageNotFoundError);
expectType<typeof VersionNotFoundError>(VersionNotFoundError);

const packageNotFoundError = new PackageNotFoundError('foo');
packageNotFoundError instanceof PackageNotFoundError;
expectType<PackageNotFoundError>(packageNotFoundError);

const versionNotFoundError = new VersionNotFoundError('foo', 'bar');
versionNotFoundError instanceof VersionNotFoundError;
expectType<VersionNotFoundError>(versionNotFoundError);
