import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import type {
	Options,
	SchemaObject,
} from 'ajv/dist/2020.js';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import ts_assert from '@signpostmarv/ts-assert';

import {
	SchemaParser,
} from '../../../../src/SchemaParser.ts';

import {
	ConstString,
	String,
} from '../../../../src/JSONSchema/String.ts';
import {
	SyntaxKind,
} from 'typescript';
import {
	throws_Error,
} from '../../../assertions.ts';

void describe('identify Const String types as expected', () => {
	const const_expectations: [
		SchemaObject, // input for SchemaParser
		Omit< // Ajv Options
			Options,
			(
				| 'strict'
			)
		>,
		string|undefined, // const literal type
		( // whether type is expected to be StringKeyword or LiteralString
			| 'keyword'
			| 'literal'
		),
		string, // conversion value
		string, // expected value of converted text
	][] = [
		[
			{
				type: 'string',
				const: 'foo',
			},
			{
			},
			undefined,
			'keyword',
			'foo',
			'foo',
		],
		[
			{
				type: 'string',
				const: 'foo',
			},
			{
			},
			'foo',
			'literal',
			'foo',
			'foo',
		],
	];

	const_expectations.forEach(([
		schema,
		ajv_options,
		literal,
		expected_type_choice,
		conversion_value,
		converted_expectation_value,
	], i) => {
		for (const from_parser_default of [true, false]) {
			void it(
				`identified const strings ${
					from_parser_default
						? 'from parser'
						: 'directly'
				} with dataset item ${i}`,
				() => {
					const instance = from_parser_default
						? (new SchemaParser()).parse(schema)
						: new ConstString<typeof literal>(
							{
								ajv: new Ajv({
									...ajv_options,
									strict: true,
								}),
							},
							literal,
						);

					const typed = instance.generate_type(
						(undefined === literal)
							? ConstString.schema_definition<undefined>(
								{literal: undefined},
							)
							: ConstString.schema_definition<string>({literal}),
					);

					if ('literal' === expected_type_choice) {
						ts_assert.isLiteralTypeNode(typed);
					} else {
						ts_assert.isTokenWithExpectedKind(
							typed,
							SyntaxKind.StringKeyword,
						);
					}

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
		}

		void it(`fails as expected with dataset item ${i}`, () => {
			const ajv = new Ajv();
			const instance = new SchemaParser({
				ajv,
				types: [new String({ajv})],
			});

			throws_Error(
				() => instance.parse(schema),
				TypeError,
			);
		})
	});
})
