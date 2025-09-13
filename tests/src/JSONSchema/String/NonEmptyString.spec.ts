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
	SyntaxKind,
} from 'typescript';

import {
	array_has_size,
	is_instanceof,
	not_undefined,
} from '@satisfactory-dev/custom-assert';

import ts_assert from '@signpostmarv/ts-assert';

import {
	SchemaParser,
} from '../../../../src/SchemaParser.ts';

import {
	ConstString,
	NonEmptyString,
} from '../../../../src/JSONSchema/String.ts';
import {
	throws_Error,
} from '../../../assertions.ts';
import type {
	PositiveInteger,
} from '../../../../src/types.ts';

void describe('identify non-empty String types as expected', () => {
	const string_expectations: [
		SchemaObject, // input for SchemaParser
		Omit< // Ajv Options
			Options,
			(
				| 'strict'
			)
		>,
		undefined|PositiveInteger, // minLength
		string, // conversion value
		string, // expected value of converted text
	][] = [
		[
			{
				type: 'string',
				minLength: 1,
			},
			{
			},
			1,
			'foo',
			'foo',
		],
		[
			{
				type: 'string',
				minLength: 1,
			},
			{
			},
			undefined,
			'foo',
			'foo',
		],
	];

	string_expectations.forEach(([
		schema,
		ajv_options,
		minLength,
		conversion_value,
		converted_expectation_value,
	], i) => {
		for (const from_parser_default of [true, false]) {
			void it(
				`identified non-empty strings ${
					from_parser_default
						? 'from parser'
						: 'directly'
				} with dataset item ${i}`,
				async () => {
					const parser = new SchemaParser();
					const instance = from_parser_default
						? parser.parse(schema, true)
						: new NonEmptyString(
							minLength,
							{
								ajv: new Ajv({
									...ajv_options,
									strict: true,
								}),
							},
						);

					is_instanceof(instance, NonEmptyString);

					const typed = await (
						instance as NonEmptyString
					).generate_typescript_type();
					ts_assert.isTypeReferenceNode(typed);
					ts_assert.isIdentifier(
						typed.typeName,
					);
					assert.equal(
						typed.typeName.text,
						'Exclude',
					);
					not_undefined(typed.typeArguments);

					array_has_size(typed.typeArguments, 2);

					ts_assert.isTokenWithExpectedKind(
						typed.typeArguments[0],
						SyntaxKind.StringKeyword,
					);
					ts_assert.isLiteralTypeNode(typed.typeArguments[1]);
					ts_assert.isStringLiteral(
						typed.typeArguments[1].literal,
					);
					assert.equal(
						typed.typeArguments[1].literal.text,
						'',
					);

					const get_converted = () => (
						instance as NonEmptyString
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
})
