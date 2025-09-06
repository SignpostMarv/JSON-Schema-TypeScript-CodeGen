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

import type {
	Identifier,
	LiteralTypeNode,
	StringLiteral,
	TypeReferenceNode,
} from 'typescript';
import {
	SyntaxKind,
} from 'typescript';

import {
	array_has_size,
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
		PositiveInteger, // minLength
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
				() => {
					const instance = from_parser_default
						? (new SchemaParser()).parse(schema)
						: new NonEmptyString(
							minLength,
							{
								ajv: new Ajv({
									...ajv_options,
									strict: true,
								}),
							},
						);

					const typed = instance.generate_type(
						NonEmptyString.schema_definition({minLength}),
					);
					ts_assert.isTypeReferenceNode(typed);
					ts_assert.isIdentifier(
						(typed as TypeReferenceNode).typeName,
					);
					assert.equal(
						(typed.typeName as Identifier).text,
						'Exclude',
					);
					not_undefined(typed.typeArguments);

					const type_arguments = typed.typeArguments as Exclude<
						TypeReferenceNode['typeArguments'],
						undefined
					>;

					array_has_size(type_arguments, 2);

					ts_assert.isTokenWithExpectedKind(
						type_arguments[0],
						SyntaxKind.StringKeyword,
					);
					ts_assert.isLiteralTypeNode(type_arguments[1]);
					ts_assert.isStringLiteral(
						(type_arguments[1] as LiteralTypeNode).literal,
					);
					assert.equal(
						(
							(
								type_arguments[1] as LiteralTypeNode
							).literal as StringLiteral
						).text,
						'',
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
					types: [new ConstString({ajv})],
				});

				throws_Error(
					() => instance.parse(schema),
					TypeError,
				);
			})
		}
	});
})
