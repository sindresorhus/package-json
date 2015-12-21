import test from 'ava';
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
