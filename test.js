import {promisify} from 'util';
import http from 'http';
import test from 'ava';
import privateRegistry from 'mock-private-registry/promise.js';
import packageJson from './index.js';

test('latest version', async t => {
	const json = await packageJson('ava');
	t.is(json.name, 'ava');
	t.falsy(json.versions);
});

test('full metadata', async t => {
	const json = await packageJson('pageres', {
		fullMetadata: true,
		version: '4.4.0'
	});
	t.is(json.name, 'pageres');
	t.is(json._id, 'pageres@4.4.0');
});

test('all version', async t => {
	const json = await packageJson('pageres', {allVersions: true});
	t.is(json.name, 'pageres');
	t.is(json.versions['0.1.0'].name, 'pageres');
});

test('specific version', async t => {
	const json = await packageJson('pageres', {version: '0.1.0'});
	t.is(json.version, '0.1.0');
});

test('incomplete version x', async t => {
	const json = await packageJson('pageres', {version: '0'});
	t.is(json.version.slice(0, 2), '0.');
});

test('custom registry url', async t => {
	const json = await packageJson('ava', {registryUrl: 'https://npm.open-registry.dev/'});
	t.is(json.name, 'ava');
	t.falsy(json.versions);
});

test('scoped - latest version', async t => {
	const json = await packageJson('@sindresorhus/df');
	t.is(json.name, '@sindresorhus/df');
});

test('scoped - full metadata', async t => {
	const json = await packageJson('@sindresorhus/df', {
		fullMetadata: true,
		version: '1.0.1'
	});
	t.is(json.name, '@sindresorhus/df');
	t.is(json._id, '@sindresorhus/df@1.0.1');
});

test('scoped - all version', async t => {
	const json = await packageJson('@sindresorhus/df', {allVersions: true});
	t.is(json.name, '@sindresorhus/df');
	t.is(json.versions['1.0.1'].name, '@sindresorhus/df');
});

test('scoped - specific version', async t => {
	const json = await packageJson('@sindresorhus/df', {version: '1.0.1'});
	t.is(json.version, '1.0.1');
});

test('scoped - dist tag', async t => {
	const json = await packageJson('@rexxars/npmtest', {version: 'next'});
	t.is(json.version, '2.0.0');
});

test('reject when package doesn\'t exist', async t => {
	await t.throwsAsync(packageJson('nnnope'), {instanceOf: packageJson.PackageNotFoundError});
});

test('reject when version doesn\'t exist', async t => {
	await t.throwsAsync(packageJson('hapi', {version: '6.6.6'}), {instanceOf: packageJson.VersionNotFoundError});
});

test('does not send any auth token for unconfigured registries', async t => {
	const server = http.createServer((request, response) => {
		response.end(JSON.stringify({headers: request.headers, 'dist-tags': {}}));
	});

	await promisify(server.listen.bind(server))(63144, '127.0.0.1');
	const json = await packageJson('@mockscope3/foobar', {allVersions: true});
	t.is(json.headers.host, 'localhost:63144');
	t.is(json.headers.authorization, undefined);
	await promisify(server.close.bind(server))();
});

test('private registry (bearer token)', async t => {
	const server = await privateRegistry();
	const json = await packageJson('@mockscope/foobar');
	t.is(json.name, '@mockscope/foobar');
	server.close();
});

test('private registry (basic token)', async t => {
	const server = await privateRegistry({
		port: 63143,
		pkgName: '@mockscope2/foobar',
		token: 'QWxhZGRpbjpPcGVuU2VzYW1l',
		tokenType: 'Basic'
	});
	const json = await packageJson('@mockscope2/foobar');
	t.is(json.name, '@mockscope2/foobar');
	server.close();
});
