import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import {
	is_instanceof,
} from '@satisfactory-dev/custom-assert';

import {
	isStringLiteral,
} from '@signpostmarv/ts-assert';

import {
	factory as ts_factory,
} from 'typescript';

import {
	SchemaParser,
	String,
} from '../../../index.ts';

import {
	StringStartsWith,
} from '../../../src/Ajv/index.ts';

import {
	coerce_factory,
} from '../../../src/typescript/coercions.ts';

void describe('StringStartsWith', () => {
	void it('comes out of SchemaParser', () => {
		const factory = coerce_factory(ts_factory);
		const ajv = new Ajv({strict: true});
		const schema_parser = new SchemaParser({ajv, factory});
		schema_parser.types = [
			new StringStartsWith('foo', {ajv, factory}),
			new StringStartsWith('baz', {ajv, factory}),
			...schema_parser.types,
		];

		const a = schema_parser.parse_by_type('foobar');
		const b = schema_parser.parse_by_type('barfoo');
		const c = schema_parser.parse_by_type('bazfoo');

		is_instanceof(a, StringStartsWith);
		is_instanceof(b, String);
		is_instanceof(c, StringStartsWith);
	});

	void describe('::generate_typescript_data()', () => {
		const factory = coerce_factory(ts_factory);
		const ajv = new Ajv({strict: true});
		const instance = new StringStartsWith('foo', {ajv, factory});

		const a = instance.generate_typescript_data('foo');
		const b = instance.generate_typescript_data('foobar');

		isStringLiteral(a);
		isStringLiteral(b);

		assert.equal(a.text, 'foo');

		assert.equal(b.text, 'foobar');

		assert.throws(() => instance.generate_typescript_data('bar' as 'foo'));
	});
});
