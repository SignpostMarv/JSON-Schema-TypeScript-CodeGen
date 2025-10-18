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
// eslint-disable-next-line imports/no-unresolved
} from '@satisfactory-dev/custom-assert';

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import {
	SchemaParser,
	String,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';

import {
	StringStartsWith,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../src/Ajv/index.ts';

void describe('StringStartsWith', () => {
	void it('comes out of SchemaParser', () => {
		const ajv = new Ajv({strict: true});
		const schema_parser = new SchemaParser({ajv});
		schema_parser.types = [
			new StringStartsWith('foo', {ajv}),
			new StringStartsWith('baz', {ajv}),
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
		const ajv = new Ajv({strict: true});
		const instance = new StringStartsWith('foo', {ajv});

		const a = instance.generate_typescript_data('foo');
		const b = instance.generate_typescript_data('foobar');

		ts_assert.isStringLiteral(a);
		ts_assert.isStringLiteral(b);

		assert.equal(a.text, 'foo');

		assert.equal(b.text, 'foobar');

		assert.throws(() => instance.generate_typescript_data('bar' as 'foo'));
	});
});
