import test from 'ava';
import fn from './';

test('get package.json', async t => {
	const json = await fn('pageres');

	t.is(json.name, 'pageres');
});

test('get package.json for a specific version', async t => {
	const json = await fn('pageres', '0.1.0');

	t.is(json.version, '0.1.0');
});

test('get package.json main entry when no version is specified', async t => {
	const json = await fn('pageres');

	t.is(json._id, 'pageres');
});

// test('get a single field', async t => {
// 	const res = await fn.field('pageres', 'description');

// 	t.true(res === 'string');
// 	t.regexTest(/screenshots/, res);
// });
