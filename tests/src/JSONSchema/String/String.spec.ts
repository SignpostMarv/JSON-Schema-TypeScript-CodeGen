import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import type {
	Options,
	SchemaObject,
} from 'ajv';

import {
	Ajv,
} from 'ajv';

import {
	SyntaxKind,
} from 'typescript';

import ts_assert from '@signpostmarv/ts-assert';

import {
	SchemaParser,
} from '../../../../src/SchemaParser.ts';

import {
	ConstString,
	String,
} from '../../../../src/JSONSchema/String.ts';
import {
	throws_Error,
} from '../../../assertions.ts';

void describe('identify simple String types as expected', () => {
	const string_expectations: [
		SchemaObject, // input for SchemaParser
		Omit< // Ajv Options
			Options,
			(
				| 'strict'
			)
		>,
		string, // conversion value
		string, // expected value of converted text
	][] = [
		[
			{
				type: 'string',
			},
			{
			},
			'foo',
			'foo',
		],
	];

	string_expectations.forEach(([
		schema,
		ajv_options,
		conversion_value,
		converted_expectation_value,
	], i) => {
		for (const from_parser_default of [true, false]) {
			void it(
				`identified simple strings ${
					from_parser_default
						? 'from parser'
						: 'directly'
				} with dataset item ${i}`,
				() => {
					const instance = from_parser_default
						? (new SchemaParser()).parse(schema)
						: new String(
							{
								ajv: new Ajv({
									...ajv_options,
									strict: true,
								}),
							},
						);

					const typed = instance.generate_type(
						String.schema_definition(),
					);
					ts_assert.isTokenWithExpectedKind(
						typed,
						SyntaxKind.StringKeyword,
					);

					const get_converted = () => instance.convert(
						conversion_value,
					);

					assert.doesNotThrow(get_converted);

					const converted = get_converted();

					ts_assert.isStringLiteral(converted);

					assert.equal(
						converted.text,
						converted_expectation_value,
					);
				},
			);

			void it(`fails as expected with dataset item ${i}`, () => {
				const ajv = new Ajv();
				const instance = new SchemaParser({
					ajv,
					types: [new ConstString(undefined, {ajv})],
				});

				throws_Error(
					() => instance.parse(schema),
					TypeError,
				);
			})
		}
	});

	void it('fails if given a non-matching schema', () => {
		assert.throws(
			() => (new String({ajv: new Ajv({strict: true})}).must_match({
				type: 'string',
				const: 'foo',
			})),
		);
	})
})
