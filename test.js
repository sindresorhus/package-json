import http from 'http';
import test from 'ava';
import privateRegistry from 'mock-private-registry/promise';
import m from '.';

test('latest version', async t => {
	const json = await m('ava');
	t.is(json.name, 'ava');
	t.falsy(json.versions);
});

test('full metadata', async t => {
	const json = await m('pageres', {
		fullMetadata: true,
		version: '4.4.0'
	});
	t.is(json.name, 'pageres');
	t.is(json._id, 'pageres@4.4.0');
});

test('all version', async t => {
	const json = await m('pageres', {allVersions: true});
	t.is(json.name, 'pageres');
	t.is(json.versions['0.1.0'].name, 'pageres');
});

test('specific version', async t => {
	const json = await m('pageres', {version: '0.1.0'});
	t.is(json.version, '0.1.0');
});

test('incomplete version x', async t => {
	const json = await m('pageres', {version: '0'});
	t.is(json.version.substr(0, 2), '0.');
});

test('scoped - latest version', async t => {
	const json = await m('@sindresorhus/df');
	t.is(json.name, '@sindresorhus/df');
});

test('scoped - full metadata', async t => {
	const json = await m('@sindresorhus/df', {
		fullMetadata: true,
		version: '1.0.1'
	});
	t.is(json.name, '@sindresorhus/df');
	t.is(json._id, '@sindresorhus/df@1.0.1');
});

test('scoped - all version', async t => {
	const json = await m('@sindresorhus/df', {allVersions: true});
	t.is(json.name, '@sindresorhus/df');
	t.is(json.versions['1.0.1'].name, '@sindresorhus/df');
});

test('scoped - specific version', async t => {
	const json = await m('@sindresorhus/df', {version: '1.0.1'});
	t.is(json.version, '1.0.1');
});

test('scoped - dist tag', async t => {
	const json = await m('@rexxars/npmtest', {version: 'next'});
	t.is(json.version, '2.0.0');
});

test('reject when version doesn\'t exist', async t => {
	await t.throws(m('hapi', {version: '6.6.6'}), 'Version doesn\'t exist');
});

test('reject when package doesn\'t exist', async t => {
	await t.throws(m('nnnope'), 'Package `nnnope` doesn\'t exist');
});

test.cb('does not send any auth token for unconfigured registries', t => {
	const server = http.createServer((req, res) => {
		res.end(JSON.stringify({headers: req.headers, 'dist-tags': {}}));
	});

	server.listen(63144, '127.0.0.1', async () => {
		const json = await m('@mockscope3/foobar', {allVersions: true});
		t.is(json.headers.host, 'localhost:63144');
		t.is(json.headers.authorization, undefined);
		server.close(t.end);
	});
});

test('private registry (bearer token)', async t => {
	const server = await privateRegistry();
	const json = await m('@mockscope/foobar');
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
	const json = await m('@mockscope2/foobar');
	t.is(json.name, '@mockscope2/foobar');
	server.close();
});
