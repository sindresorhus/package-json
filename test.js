import {promisify} from 'node:util';
import http from 'node:http';
import test from 'ava';
import privateRegistry from 'private-registry-mock';
import packageJson, {
	PackageNotFoundError,
	VersionNotFoundError,
	DeprecatedPackageError,
	DeprecatedVersionError,
} from './index.js';

test('latest version', async t => {
	const json = await packageJson('ava');

	t.like(json, {
		name: 'ava',
		versions: undefined,
	});
});

test('full metadata', async t => {
	const json = await packageJson('pageres', {
		fullMetadata: true,
		version: '4.4.0',
	});

	t.like(json, {
		name: 'pageres',
		_id: 'pageres@4.4.0',
		time: {
			created: '2014-02-07T18:17:46.737Z',
		},
	});
});

test('all version', async t => {
	const json = await packageJson('pageres', {allVersions: true});

	t.like(json, {
		name: 'pageres',
		versions: {
			'0.1.0': {name: 'pageres'},
		},
	});
});

test('specific version', async t => {
	const json = await packageJson('pageres', {version: '0.1.0'});

	t.like(json, {
		version: '0.1.0',
	});
});

test('incomplete version x', async t => {
	const json = await packageJson('pageres', {version: '0'});
	t.is(json.version.slice(0, 2), '0.');
});

test('custom registry url', async t => {
	const json = await packageJson('ava', {registryUrl: 'https://registry.yarnpkg.com'});

	t.like(json, {
		name: 'ava',
		versions: undefined,
	});
});

test('scoped - latest version', async t => {
	const json = await packageJson('@sindresorhus/df');

	t.like(json, {
		name: '@sindresorhus/df',
	});
});

test('scoped - full metadata', async t => {
	const json = await packageJson('@sindresorhus/df', {
		fullMetadata: true,
		version: '1.0.1',
	});

	t.like(json, {
		name: '@sindresorhus/df',
		_id: '@sindresorhus/df@1.0.1',
		time: {
			created: '2015-05-04T18:10:02.416Z',
			modified: '2022-06-12T23:49:38.166Z',
		},
	});
});

test('scoped - all version', async t => {
	const json = await packageJson('@sindresorhus/df', {allVersions: true});

	t.like(json, {
		name: '@sindresorhus/df',
		versions: {
			'1.0.1': {name: '@sindresorhus/df'},
		},
	});
});

test('scoped - specific version', async t => {
	const json = await packageJson('@sindresorhus/df', {version: '1.0.1'});

	t.like(json, {
		version: '1.0.1',
	});
});

test('scoped - dist tag', async t => {
	const json = await packageJson('@rexxars/npmtest', {version: 'next'});

	t.like(json, {
		version: '2.0.0',
	});
});

test('reject when package doesn\'t exist', async t => {
	await t.throwsAsync(packageJson('nnnope'), {
		instanceOf: PackageNotFoundError,
		message: 'Package `nnnope` could not be found',
	});
});

test('reject when version doesn\'t exist', async t => {
	await t.throwsAsync(packageJson('meow', {version: '6.6.6'}), {
		instanceOf: VersionNotFoundError,
		message: 'Version `6.6.6` for package `meow` could not be found',
	});
});

test('does not send any auth token for unconfigured registries', async t => {
	const server = http.createServer((request, response) => {
		const mock = {headers: request.headers, 'dist-tags': {}, versions: {'1.0.0': {}}};
		response.end(JSON.stringify(mock));
	});

	await promisify(server.listen.bind(server))(63_144, '127.0.0.1');
	const json = await packageJson('@mockscope3/foobar', {allVersions: true});

	t.like(json.headers, {
		host: 'localhost:63144',
		authorization: undefined,
	});

	await promisify(server.close.bind(server))();
});

test('private registry (bearer token)', async t => {
	const server = await privateRegistry({port: 63_142});
	const json = await packageJson('@mockscope/foobar');

	t.like(json, {
		name: '@mockscope/foobar',
	});

	await server.close();
});

test('private registry (basic token)', async t => {
	const server = await privateRegistry({
		port: 63_143,
		package: {
			name: '@mockscope2/foobar',
		},
		token: {
			type: 'basic',
			value: 'QWxhZGRpbjpPcGVuU2VzYW1l', // Aladdin:OpenSesame
		},
	});
	const json = await packageJson('@mockscope2/foobar');

	t.like(json, {
		name: '@mockscope2/foobar',
	});

	await server.close();
});

test('omits deprecated versions by default', async t => {
	const json = await packageJson('ng-packagr', {version: '14'});

	t.like(json, {
		name: 'ng-packagr',
		version: '14.2.2',
		deprecated: undefined,
	});
});

test('does not include deprecated versions in all versions by default', async t => {
	const json = await packageJson('ng-packagr', {allVersions: true});
	const versions = Object.values(json.versions);

	t.true(versions.every(version => version.deprecated === undefined));
});

test('optionally includes deprecated versions', async t => {
	const json = await packageJson('ng-packagr', {version: '14', omitDeprecated: false});

	t.like(json, {
		name: 'ng-packagr',
		version: '14.3.0',
		deprecated: 'this package version has been deprecated as it was released by mistake',
	});
});

test('optionally includes deprecated versions - all versions', async t => {
	const json = await packageJson('ng-packagr', {allVersions: true, omitDeprecated: false});
	const versions = Object.values(json.versions);

	t.false(versions.every(version => version.deprecated === undefined));
});

test('errors if all versions are deprecated', async t => {
	await t.throwsAsync(packageJson('querystring'), {
		instanceOf: DeprecatedPackageError,
		message: 'Package `querystring` is deprecated',
	});
});

test('optionally does not throw if all versions are deprecated', async t => {
	const json = await packageJson('querystring', {omitDeprecated: false});

	t.like(json, {
		name: 'querystring',
		version: '0.2.1',
	});
});

test('errors if specific dist tag is deprecated', async t => {
	await t.throwsAsync(packageJson('vue', {version: 'legacy'}), {
		instanceOf: DeprecatedVersionError,
		message: 'Version or range `legacy` for package `vue` is deprecated',
	});
});

test('errors if specific range is deprecated', async t => {
	await t.throwsAsync(packageJson('tsparticles', {version: '2.x'}), {
		instanceOf: DeprecatedVersionError,
		message: 'Version or range `2.x` for package `tsparticles` is deprecated',
	});
});

test('errors if specific version is deprecated', async t => {
	await t.throwsAsync(packageJson('polka-bearer-token', {version: '0.2.0'}), {
		instanceOf: DeprecatedVersionError,
		message: 'Version or range `0.2.0` for package `polka-bearer-token` is deprecated',
	});
});

test('handles defaults', async t => {
	await t.throwsAsync(packageJson('querystring', {version: undefined, omitDeprecated: undefined}));

	const allVersions = await packageJson('ava', {allVersions: true});
	const json = await packageJson('ava', {version: undefined});

	t.is(json.version, allVersions['dist-tags'].latest);
});
