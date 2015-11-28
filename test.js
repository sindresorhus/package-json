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

test('data the same as in main entry with all versions for got', async t => {
	t.plan(1);
	const full = fn('got');
	const single = fn('got', '3.3.1');
	Promise.all([full, single]).then(function (m) {
		t.same(m[0].versions['3.3.1'], m[1]);
	});
});

test('data the same as in main entry with all versions for express', async t => {
	t.plan(1);
	const full = fn('express');
	const single = fn('express', '4.10.2');
	Promise.all([full, single]).then(function (m) {
		t.same(m[0].versions['4.10.2'], m[1]);
	});
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

test('scoped - incomplete version x', async t => {
	const json = await fn('@sindresorhus/df', '1');
	t.is(json.version.substr(0,2), '1.');
});

test('scoped - incomplete version x.y', async t => {
	const json = await fn('@sindresorhus/df', '1.0');
	t.is(json.version.substr(0,4), '1.0.');
});

test('scoped - caret version', async t => {
	const json = await fn('@sindresorhus/df', '^1.0.0');
	t.is(json.version.substr(0,2), '1.');
});

test('scoped - tilde version', async t => {
	const json = await fn('@sindresorhus/df', '~1.0.0');
	t.is(json.version.substr(0,4), '1.0.');
});

test('scoped - wildcard version *', async t => {
	const json = await fn('@sindresorhus/df', '*');
	t.is(json.version.split('.')[0] > 0, true);
});

test('scoped - wildcard version x.*', async t => {
	const json = await fn('@sindresorhus/df', '1.*');
	t.is(json.version.substr(0,2), '1.');
});

test('scoped - wildcard version x.y.*', async t => {
	const json = await fn('@sindresorhus/df', '1.0.*');
	t.is(json.version.substr(0,4), '1.0.');
});

test('reject when version doesn\'t exist', async t => {
	t.throws(fn('hapi', '6.6.6'), 'Version doesn\'t exist');
});
