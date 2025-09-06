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

import {
	is_instanceof,
} from '@satisfactory-dev/custom-assert';

import ts_assert from '@signpostmarv/ts-assert';

import {
	SchemaParser,
} from '../../../../src/SchemaParser.ts';

import {
	SpecifiedConstString,
	String,
	UnspecifiedConstString,
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
					const instance = from_parser_default
						? (new SchemaParser()).parse(schema)
						: (
							'string' === typeof literal
								? new SpecifiedConstString(literal, {
									ajv: new Ajv({
										...ajv_options,
										strict: true,
									}),
								})
								: new UnspecifiedConstString({
									ajv: new Ajv({
										...ajv_options,
										strict: true,
									}),
								})
						);

					if (
						'string' === typeof literal
						&& false === from_parser_default
					) {
						is_instanceof(instance, SpecifiedConstString);
						const typed = instance.generate_type(
							SpecifiedConstString.schema_definition({
								literal,
							}),
						);
						ts_assert.isLiteralTypeNode(typed);
					} else {
						is_instanceof(instance, UnspecifiedConstString);
						const typed = (
							instance as UnspecifiedConstString
						).generate_type();
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
