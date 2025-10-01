import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	TypeNode,
} from 'typescript';
import {
	SyntaxKind,
} from 'typescript';

import ts_assert from '@signpostmarv/ts-assert';

import type {
	one_of_mode,
	one_of_schema_options,
	one_of_type_options,
	schema_choices,
	type_choices,
} from '../../../src/JSONSchema/OneOf.ts';
import {
	OneOf,
} from '../../../src/JSONSchema/OneOf.ts';

import type {
	$ref_mode,
} from '../../../src/JSONSchema/Ref.ts';
import {
	$ref,
} from '../../../src/JSONSchema/Ref.ts';

import type {
	ConversionlessType,
} from '../../../src/JSONSchema/Type.ts';

import {
	ConstString,
	PatternString,
} from '../../../src/JSONSchema/String.ts';

import type {
	PositiveInteger,
} from '../../../src/guarded.ts';

import type {
	ts_asserter,
} from '../../types.ts';

import {
	SchemaParser,
} from '../../../src/SchemaParser.ts';

import type {
	ObjectOfSchemas,
} from '../../../src/types.ts';

void describe('OneOf', () => {
	type DataSet<
		Mode extends one_of_mode = one_of_mode,
		TypeChoices extends type_choices = type_choices,
		SchemaChoices extends schema_choices = schema_choices,
		Defs extends ObjectOfSchemas = ObjectOfSchemas,
	> = [
		one_of_type_options<Mode, TypeChoices, Defs>,
		one_of_schema_options<Mode, SchemaChoices>,
		[
			unknown,
			ts_asserter<Expression>|false,
			ts_asserter<TypeNode>,
		][],
		[
			(ajv: Ajv) => ConversionlessType<unknown>,
			boolean,
		][],
	];

	function sanity_check<
		Mode extends one_of_mode = one_of_mode,
		TypeChoices extends type_choices = type_choices,
		SchemaChoices extends schema_choices = schema_choices,
	>(
		entry: DataSet<Mode, TypeChoices, SchemaChoices>,
	): DataSet<Mode, TypeChoices, SchemaChoices> {
		return entry;
	}

	const data_sets: [DataSet, ...DataSet[]] = [
		sanity_check<'unspecified'>([
			{
				mode: 'unspecified',
			},
			{
				mode: 'unspecified',
			},
			[
				[
					'foo',
					ts_assert.isStringLiteral,
					(maybe) => ts_assert.isTokenWithExpectedKind(
						maybe,
						SyntaxKind.StringKeyword,
					),
				],
			],
			[
				[
					(ajv) => new $ref({$ref_mode: 'either'}, {ajv}),
					false,
				],
			],
		]),
		sanity_check<'specified'>([
			{
				mode: 'specified',
				choices: [
					{type: 'string', const: 'foo'},
					{type: 'string', pattern: '^(?!foo)'},
				],
			},
			{
				mode: 'specified',
				choices: [
					ConstString.generate_schema_definition<
						'const',
						never[],
						undefined,
						ReturnType<typeof PositiveInteger<1>>,
						'foo'
					>({
						string_mode: 'const',
						const: 'foo',
					}),
					PatternString.generate_schema_definition<
						'pattern',
						never[],
						'^(?!foo)',
						ReturnType<typeof PositiveInteger<1>>,
						undefined
					>({
						string_mode: 'pattern',
						pattern: '^(?!foo)',
					}),
				],
			},
			[
				[
					'foo',
					ts_assert.isStringLiteral,
					ts_assert.isUnionTypeNode,
				],
			],
			[],
		]),
		sanity_check<'specified'>([
			{
				mode: 'specified',
				choices: [
					{$ref: '#/$defs/foo'},
					{$ref: '#/$defs/bar'},
				],
				$defs: {
					foo: {type: 'string', const: 'foo'},
					bar: {type: 'string', pattern: '^(?!foo)'},
				},
			},
			{
				mode: 'specified',
				choices: [
					ConstString.generate_schema_definition<
						'const',
						never[],
						undefined,
						ReturnType<typeof PositiveInteger<1>>,
						'foo'
					>({
						string_mode: 'const',
						const: 'foo',
					}),
					PatternString.generate_schema_definition<
						'pattern',
						never[],
						'^(?!foo)',
						ReturnType<typeof PositiveInteger<1>>,
						undefined
					>({
						string_mode: 'pattern',
						pattern: '^(?!foo)',
					}),
				],
			},
			[
				[
					'foo',
					ts_assert.isStringLiteral,
					ts_assert.isUnionTypeNode,
				],
			],
			[],
		]),
	];

	void describe('::generate_typescript_data()', () => {
		data_sets.forEach(([
			type_definition,
			schema_definition,
			generate_type_checks,
		], i) => {
			generate_type_checks.map((subset, j) => [
				...subset,
				j,
			]).filter((maybe): maybe is [
				unknown,
				ts_asserter<Expression>,
				ts_asserter<TypeNode>,
				number,
			] => false !== maybe[1]).forEach(([
				data,
				asserter,
				,
				j,
			]) => {
				void it(`behaves with data_sets[${i}][2][${j}]`, () => {
					const ajv = new Ajv({strict: true});

					const instance = new OneOf({
						ajv,
						type_definition,
						schema_definition,
					});

					const result = instance.generate_typescript_data(
						data,
						new SchemaParser({ajv}),
						OneOf.generate_type_definition(
							type_definition,
						),
					);

					const foo: ts_asserter<Expression> = asserter;

					foo(result);

					if (undefined !== data) {
						assert.throws(() => instance.generate_typescript_data(
							undefined,
							new SchemaParser({ajv}),
							OneOf.generate_type_definition(
								type_definition,
							),
						));
					}
				});
			});
		});
	});

	void describe('::generate_typescript_type()', () => {
		data_sets.forEach(([
			type_definition,
			schema_definition,
			generate_type_checks,
		], i) => {
			generate_type_checks.forEach(([
				data,
				,
				asserter,
			], j) => {
				void it(`behaves with data_sets[${i}][2][${j}]`, async () => {
					const ajv = new Ajv({strict: true});

					const instance = new OneOf({
						ajv,
						type_definition,
						schema_definition,
					});

					const promise = instance.generate_typescript_type({
						data,
						schema: OneOf.generate_type_definition(
							type_definition,
						),
						schema_parser: new SchemaParser({ajv}),
					});

					await assert.doesNotReject(() => promise);

					const foo: ts_asserter<TypeNode> = asserter;

					foo(await promise);
				});
			});
		});
	});

	void describe('::is_a()', () => {
		data_sets.forEach(([
			type_definition,
			schema_definition,
			,
			additional_checks,
		], i) => {
			void it(`behaves with data_sets[${i}]`, () => {
				const ajv = new Ajv({strict: true});

				const instance = new OneOf({
					ajv,
					type_definition,
					schema_definition,
				});

				assert.ok(OneOf.is_a(instance));
				assert.ok(OneOf.is_a<$ref<$ref_mode>>(
					new OneOf<unknown, 'unspecified'>({
						ajv,
						type_definition: {
							mode: 'unspecified',
						},
						schema_definition: {
							mode: 'unspecified',
						},
					}),
				));
				assert.ok(!OneOf.is_a<OneOf<unknown>>(
					new $ref({$ref_mode: 'either'}, {ajv}),
				));
			});

			additional_checks.forEach(([
				generator,
				passes,
			], j) => {
				void it(`behaves with data_sets[${i}][3][${j}]`, () => {
					const ajv = new Ajv({strict: true});

					assert.equal(
						OneOf.is_a(generator(ajv)),
						passes,
					);
				});
			});
		});
	});
});
