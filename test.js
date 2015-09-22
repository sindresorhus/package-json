'use strict';
var assert = require('assert');
var packageJson = require('./');

it('should get the package.json', function (cb) {
	packageJson('pageres', function (err, json) {
		assert(!err, err);
		assert.strictEqual(json.name, 'pageres');
		cb();
	});
});

it('should get the package.json for a specific version', function (cb) {
	packageJson('pageres', '0.1.0', function (err, json) {
		assert(!err, err);
		assert.strictEqual(json.version, '0.1.0');
		cb();
	});
});

it('should get the package.json main entry when no version is specified', function (cb) {
	packageJson('pageres', function (err, json) {
		assert(!err, err);
		assert(json._id);
		cb();
	});
});
