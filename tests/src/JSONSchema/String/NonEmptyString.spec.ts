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
	array_has_size,
	is_instanceof,
	not_undefined,
// eslint-disable-next-line imports/no-unresolved
} from '@satisfactory-dev/custom-assert';

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import {
	throws_Error,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';

import type {
	non_empty_string_type,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../../index.ts';
import {
	ConstString,
	NonEmptyString,
	PositiveIntegerGuard,
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../../index.ts';

void describe('identify non-empty String types as expected', () => {
	const string_expectations: [
		non_empty_string_type, // input for SchemaParser

		// Ajv Options
		Omit<
			Options,
			(
				| 'strict'
			)
		>,
		( // minLength
			| undefined
			| ReturnType<typeof PositiveIntegerGuard<number>>
		),
		string, // conversion value
		string, // expected value of converted text
	][] = [
		[
			{
				type: 'string',
				minLength: PositiveIntegerGuard(1),
			},
			{
			},
			PositiveIntegerGuard(1),
			'foo',
			'foo',
		],
		[
			{
				type: 'string',
				minLength: PositiveIntegerGuard(1),
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
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
						? parser.parse(schema)
						: new NonEmptyString(
							{
								ajv: new Ajv({
									...ajv_options,
									strict: true,
								}),
							},
						);

					is_instanceof<NonEmptyString>(instance, NonEmptyString);

					const typed = await instance.generate_typescript_type({
						schema: {
							...schema,
							minLength: PositiveIntegerGuard(1),
						},
						schema_parser: parser,
					});
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

					const get_converted = () => instance
						.generate_typescript_data(
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
					types: [new ConstString(undefined, {ajv})],
				});

				throws_Error(
					() => instance.parse(schema),
					TypeError,
				);
			});
		}
	});
});
