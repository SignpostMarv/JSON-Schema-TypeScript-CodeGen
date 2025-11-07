import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import type {
	Options,
} from 'ajv/dist/2020.js';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import {
	SyntaxKind,
} from 'typescript';

import {
	is_instanceof,
// eslint-disable-next-line imports/no-unresolved
} from '@satisfactory-dev/custom-assert';

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import type {
	basic_string_type,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../../index.ts';
import {
	ObjectUnspecified,
	SchemaParser,
	String,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../../index.ts';

import {
	throws_Error,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';

void describe('identify simple String types as expected', () => {
	const string_expectations: [
		basic_string_type, // input for SchemaParser
		// Ajv Options
		Omit<
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
				async () => {
					const parser = new SchemaParser();
					const instance = from_parser_default
						? parser.parse(schema)
						: new String(
							{
								ajv: new Ajv({
									...ajv_options,
									strict: true,
								}),
							},
						);

					is_instanceof<String>(instance, String);

					const typed = await instance.generate_typescript_type({
						schema,
						schema_parser: parser,
					});
					ts_assert.isTokenWithExpectedKind(
						typed,
						SyntaxKind.StringKeyword,
					);

					const get_converted = () => (
						instance as String<string>
					).generate_typescript_data(
						conversion_value,
						parser,
						schema,
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
					types: [
						new ObjectUnspecified(
							{properties_mode: 'both'},
							{ajv},
						),
					],
				});

				throws_Error(
					() => instance.parse(schema),
					TypeError,
				);
			});
		}
	});

	void it('fails if given a non-matching schema', () => {
		assert.throws(
			() => (new String({
				ajv: new Ajv({strict: true}),
			}).can_handle_schema(
				{
					type: 'string',
					const: 'foo',
				},
				'verbose',
			)),
		);
		assert.throws(
			() => (new String({
				ajv: new Ajv({strict: true}),
			}).can_handle_schema(
				{
					type: 'string',
					const: 'foo',
				},
				true,
			)),
		);
	});
});
