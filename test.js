import http from 'http';
import test from 'ava';
import privateRegistry from 'mock-private-registry/promise';
import fn from './';

test('full', async t => {
	const json = await fn('pageres');
	t.is(json.name, 'pageres');
	t.is(json._id, 'pageres');
});

test('latest version', async t => {
	const json = await fn('pageres', 'latest');
	t.is(json.name, 'pageres');
});

test('specific version', async t => {
	const json = await fn('pageres', '0.1.0');
	t.is(json.version, '0.1.0');
});

test('incomplete version x', async t => {
	const json = await fn('pageres', '0');
	t.is(json.version.substr(0, 2), '0.');
});

test('scoped - full', async t => {
	const json = await fn('@sindresorhus/df');
	t.is(json.name, '@sindresorhus/df');
	t.is(json._id, '@sindresorhus/df');
});

test('scoped - latest version', async t => {
	const json = await fn('@sindresorhus/df', 'latest');
	t.is(json.name, '@sindresorhus/df');
});

test('scoped - specific version', async t => {
	const json = await fn('@sindresorhus/df', '1.0.1');
	t.is(json.version, '1.0.1');
});

test('reject when version doesn\'t exist', async t => {
	t.throws(fn('hapi', '6.6.6'), 'Version doesn\'t exist');
});

test('reject when package doesn\'t exist', async t => {
	t.throws(fn('nnnope'), 'Package `nnnope` doesn\'t exist');
});

test.cb('does not send any auth token for unconfigured registries', t => {
	const server = http.createServer((req, res) => {
		res.end(JSON.stringify({headers: req.headers}));
	});
	server.listen(63144, '127.0.0.1', () => {
		fn('@mockscope3/foobar').then(json => {
			t.is(json.headers.host, 'localhost:63144');
			t.is(json.headers.authorization, undefined);
			server.close(t.end);
		});
	});
});

test('private registry (bearer token)', async t => {
	const server = await privateRegistry();
	const json = await fn('@mockscope/foobar', 'latest');
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
	const json = await fn('@mockscope2/foobar', 'latest');
	t.is(json.name, '@mockscope2/foobar');
	server.close();
});
