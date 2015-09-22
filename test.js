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
		if(cfg.version === 'expect-throw') {
			assert.throws(packageJson.bind(null, cfg.name, cfg.version));
			cb();
		} else {
			packageJson(cfg.name, cfg.version, function (err, json) {
				assert(!err, err);
				assert.strictEqual(json.version, cfg.version);
				cb();
			});
		}
	});

	it('should get the package.json main entry when no version is specified', function (cb) {
		packageJson(cfg.name, function (err, json) {
			assert(!err, err);
			assert(json._id);
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
		version: 'expect-throw',
		descriptionRe: /Get free disk space info from/
	}
};

// test runner
Object.keys(spec).forEach(function(key){
	describe(key, runTests.bind(null, spec[key]));
});
