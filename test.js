'use strict';
var assert = require('chai').assert;
var packageJson = require('./');

function runTests(cfg){

	it('should get the package.json', function (cb) {
		packageJson(cfg.name, function (err, json) {
			assert(!err, err);
			assert.strictEqual(json.name, cfg.name);
			cb();
		});
	});

	it('should get the package.json for a specific version', function (cb) {
		packageJson(cfg.name, cfg.version, function (err, json) {
			assert(!err, err);
			assert.strictEqual(json.version, cfg.version);
			cb();
		});
	});

	it('should get the package.json main entry when no version is specified', function (cb) {
		packageJson(cfg.name, function (err, json) {
			assert(!err, err);
			assert(json._id);
			cb();
		});
	});

	it('get a single field', function (cb) {
		packageJson.field(cfg.name, 'description', function (err, res) {
			assert(!err, err);
			assert(typeof res === 'string');
			assert(cfg.descriptionRe.test(res));
			cb();
		});
	});
}

// test spec
var spec = {
	'public packages': {
		name: 'pageres',
		version: '0.1.0',
		descriptionRe: /screenshots/
	},
	'scoped packages': {
		name: '@sindresorhus/df',
		version: '1.0.0',
		descriptionRe: /Get free disk space info from/
	}
};

// test runner
var keys = Object.keys(spec);
for (var i = 0; i < keys.length; i++) {
	describe(keys[i], runTests.bind(undefined, spec[keys[i]]));
}
