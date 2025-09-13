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
} from '@satisfactory-dev/custom-assert';

import ts_assert from '@signpostmarv/ts-assert';

import {
	SchemaParser,
} from '../../../../src/SchemaParser.ts';

import {
	ConstString,
} from '../../../../src/JSONSchema/String.ts';
import {
	throws_Error,
} from '../../../assertions.ts';
import {
	ObjectWith$defs,
} from '../../../../src/JSONSchema/Object.ts';

void describe('identify Const String types as expected', () => {
	const const_expectations: [
		{type: 'string', const?: string},
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
		[
			{
				type: 'string',
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
		const from_parser_defaults:boolean[] = [false];

		if ('const' in schema) {
			from_parser_defaults.push(true);
		}

		for (const from_parser_default of from_parser_defaults) {
			void it(
				`identified const strings ${
					from_parser_default
						? 'from parser'
						: 'directly'
				} with dataset item ${i}`,
				async () => {
					const parser = new SchemaParser();
					const instance = from_parser_default
						? parser.parse(schema, true)
						: new ConstString(literal, {ajv: new Ajv({
							...ajv_options,
							strict: true,
						})});

					is_instanceof(instance, ConstString);

					const typed = await instance.generate_typescript_type({
						schema,
					});

					if ('const' in schema) {
					ts_assert.isLiteralTypeNode(typed);
					} else {
						ts_assert.isTokenWithExpectedKind(
							typed,
							SyntaxKind.StringKeyword,
						);
					}

					const get_converted = () => (
						instance as ConstString
					).generate_typescript_data(
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
				types: [new ObjectWith$defs({properties_mode: 'both'}, {ajv})],
			});

			throws_Error(
				() => instance.parse(schema),
				TypeError,
			);
		})
	});
})
