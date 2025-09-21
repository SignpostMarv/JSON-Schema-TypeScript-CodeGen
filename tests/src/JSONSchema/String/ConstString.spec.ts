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
	ObjectUnspecified,
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
				types: [new ObjectUnspecified(
					{properties_mode: 'neither'},
					{ajv},
				)],
			});

			throws_Error(
				() => instance.parse(schema),
				TypeError,
			);
		})
	});

	void it('ConstString::check_type() behaves', () => {
		const ajv = new Ajv();
		const datasets: [string|undefined, unknown, boolean][] = [
			[undefined, 1, false],
			['foo', 1, false],
			['', 1, false],
			[undefined, '', true],
			[undefined, 'foo', true],
			['foo', 'foo', true],
			['foo', '', false],
		];

		datasets.forEach(([
			specific,
			test_value,
			expectation,
		], i) => {
			const instance = new ConstString(specific, {ajv});
			assert.equal(
				instance.check_type(test_value),
				expectation,
				`ConstString::check_type(test_value) failed to behave with datasets[${i}]`,
			);
		});
	});
})
