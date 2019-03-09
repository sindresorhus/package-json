import {expectType} from 'tsd-check';
import packageJson, {
	PackageJson,
	PackageNotFoundError,
	VersionNotFoundError
} from '.';

expectType<Promise<PackageJson>>(packageJson('package-json'));
expectType<Promise<PackageJson>>(
	packageJson('package-json', {version: '1.2.3'})
);
expectType<Promise<PackageJson>>(
	packageJson('package-json', {fullMetadata: true})
);
expectType<Promise<PackageJson>>(
	packageJson('package-json', {allVersions: true})
);

expectType<typeof PackageNotFoundError>(PackageNotFoundError);
expectType<typeof VersionNotFoundError>(VersionNotFoundError);
