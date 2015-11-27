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
	t.is(json.version.substr(0,2), '0.');
});

test('incomplete version x.y', async t => {
	const json = await fn('pageres', '0.1');
	t.is(json.version.substr(0,4), '0.1.');
});

test('caret version', async t => {
	const json = await fn('got', '^5.0.0');
	t.is(json.version.substr(0,2), '5.');
});

test('tilde version', async t => {
	const json = await fn('got', '~5.0.0');
	t.is(json.version.substr(0,4), '5.0.');
});

test('wildcard version *', async t => {
	const json = await fn('got', '*');
	t.is(json.version.split('.')[0] > 0, true);
});

test('wildcard version x.*', async t => {
	const json = await fn('got', '5.*');
	t.is(json.version.substr(0,2), '5.');
});

test('wildcard version x.y.*', async t => {
	const json = await fn('got', '5.0.*');
	t.is(json.version.substr(0,4), '5.0.');
});

test('single version data the same as in main entry with all versions', async t => {
	const full1 = await fn('got');
	const single1 = await fn('got', '3.3.1');
	t.same(full1.versions['3.3.1'], single1);
	const full2 = await fn('express');
	const single2 = await fn('express', '4.10.2');
	t.same(full2.versions['4.10.2'], single2);
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
