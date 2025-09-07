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

void describe('identify Const String types as expected', () => {
	const const_expectations: [
		{type: 'string', const: string},
		Omit< // Ajv Options
			Options,
			(
				| 'strict'
			)
		>,
		string|undefined, // const literal type
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
			'foo',
			'foo',
			'foo',
		],
	];

	const_expectations.forEach(([
		schema,
		ajv_options,
		literal,
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
					const parser = new SchemaParser();
					const instance = from_parser_default
						? parser.parse(schema, true)
						: new ConstString(literal, {ajv: new Ajv({
							...ajv_options,
							strict: true,
						})});

					const typed = instance.generate_type(schema, parser);
					ts_assert.isLiteralTypeNode(typed);

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
