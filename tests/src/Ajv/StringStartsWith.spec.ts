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

import ts_assert from '@signpostmarv/ts-assert';

import {
	SchemaParser,
} from '../../../src/SchemaParser.ts';

import {
	StringStartsWith,
} from '../../../src/Ajv/StringStartsWith.ts';

import {
	String,
} from '../../../src/JSONSchema/String.ts';

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

		const data = instance.generate_typescript_data('foo');

		assert.equal(data.templateSpans.length, 2);

		ts_assert.isTemplateMiddle(
			data.templateSpans[0].literal,
		);

		ts_assert.isTemplateTail(
			data.templateSpans[1].literal,
		);

		ts_assert.isStringLiteral(data.templateSpans[0].expression);
		assert.equal(data.templateSpans[0].expression.text, 'foo');

		ts_assert.isIdentifier(data.templateSpans[1].expression);
		assert.equal(data.templateSpans[1].expression.text, 'string');
	});
});
