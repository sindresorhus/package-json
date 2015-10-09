import test from 'ava';
import fn from './';

test('get package.json', async t => {
	const json = await fn('pageres');

	t.is(json.name, 'pageres');
	t.is(json._id, 'pageres');
});

test('get package.json for the latest version', async t => {
	const json = await fn('pageres', 'latest');

	t.is(json.name, 'pageres');
});

test('get package.json for a specific version', async t => {
	const json = await fn('pageres', '0.1.0');

	t.is(json.version, '0.1.0');
});
