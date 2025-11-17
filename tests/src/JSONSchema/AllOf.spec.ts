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
	Node,
	TypeNode,
} from 'typescript';
import {
	SyntaxKind,
} from 'typescript';

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import type {
	ts_asserter,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../index.ts';

import type {
	all_of_schema_options,
	all_of_type_options,
	ObjectOfSchemas,
	PositiveIntegerGuard,
	schema_choices,
	SchemaObject,
	something_of_mode,
	Type,
	type_choices,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';
import {
	$ref,
	AllOf,
	ConstString,
	PatternString,
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';

void describe('AllOf', () => {
	type DataSet<
		Mode extends something_of_mode = something_of_mode,
		TypeChoices extends type_choices = type_choices,
		SchemaChoices extends schema_choices = schema_choices,
		Defs extends ObjectOfSchemas = ObjectOfSchemas,
	> = [
		all_of_type_options<Mode, TypeChoices, Defs>,
		all_of_schema_options<Mode, SchemaChoices>,
		[
			unknown,
			ts_asserter<Expression>|false,
			ts_asserter<TypeNode>,
		][],
		[
			(ajv: Ajv) => Type<unknown>,
			boolean,
		][],
	];

	function sanity_check<
		Mode extends something_of_mode = something_of_mode,
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
				kind: 'allOf',
				mode: 'unspecified',
			},
			{
				kind: 'allOf',
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
					(ajv) => new $ref({}, {ajv}),
					false,
				],
			],
		]),
		sanity_check<'specified'>([
			{
				kind: 'allOf',
				mode: 'specified',
				choices: [
					{type: 'string', const: 'foo'},
					{type: 'string', pattern: '^foo'},
				],
			},
			{
				kind: 'allOf',
				mode: 'specified',
				choices: [
					ConstString.generate_schema_definition<
						'const',
						never[],
						undefined,
						ReturnType<typeof PositiveIntegerGuard<1>>,
						'foo'
					>({
						string_mode: 'const',
						const: 'foo',
					}),
					PatternString.generate_schema_definition<
						'pattern',
						never[],
						'^foo',
						ReturnType<typeof PositiveIntegerGuard<1>>,
						undefined
					>({
						string_mode: 'pattern',
						pattern: '^foo',
					}),
				],
			},
			[
				[
					'foo',
					ts_assert.isStringLiteral,
					ts_assert.isIntersectionTypeNode,
				],
			],
			[],
		]),
		sanity_check<'specified'>([
			{
				kind: 'allOf',
				mode: 'specified',
				choices: [
					{$ref: '#/$defs/foo'},
					{$ref: '#/$defs/bar'},
				],
				$defs: {
					foo: {type: 'string', const: 'foo'},
					bar: {type: 'string', pattern: '^foo'},
				},
			},
			{
				kind: 'allOf',
				mode: 'specified',
				choices: [
					ConstString.generate_schema_definition<
						'const',
						never[],
						undefined,
						ReturnType<typeof PositiveIntegerGuard<1>>,
						'foo'
					>({
						string_mode: 'const',
						const: 'foo',
					}),
					PatternString.generate_schema_definition<
						'pattern',
						never[],
						'^foo',
						ReturnType<typeof PositiveIntegerGuard<1>>,
						undefined
					>({
						string_mode: 'pattern',
						pattern: '^foo',
					}),
				],
			},
			[
				[
					'foo',
					ts_assert.isStringLiteral,
					ts_assert.isIntersectionTypeNode,
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

					const instance = new AllOf({
						ajv,
						type_definition,
						schema_definition,
					});

					const result = instance.generate_typescript_data(
						data,
						new SchemaParser({ajv}),
						AllOf.generate_type_definition<'allOf'>(
							type_definition,
						),
					);

					const foo: ts_asserter<Expression> = asserter;

					foo(result);

					if (undefined !== data) {
						const generated_type_definition = AllOf
							.generate_type_definition<'allOf'>(
								type_definition,
							);

						const parser = new SchemaParser({ajv});

						assert.throws(() => instance.generate_typescript_data(
							undefined,
							parser,
							generated_type_definition,
						));
					}
				});
			});
		});
	});
	void describe(`::generate_typescript_data()${
		' from '
	} from SchemaParser::parse()`, () => {
		type DataSet = [
			(
				& SchemaObject
				& {
					allOf: [SchemaObject, SchemaObject, ...SchemaObject[]],
				}
			),
			unknown,
			(
				| undefined
				| ((maybe: Node) => asserts maybe is Expression)
			),
			( // for manipulating schema parser before running
				| undefined
				// eslint-disable-next-line @stylistic/comma-dangle
				| ((schema_parser: SchemaParser) => void)
			),
		];

		const data_sets: [DataSet, ...DataSet[]] = [
			[
				{
					allOf: [
						{
							type: 'object',
							required: ['foo'],
							properties: {
								foo: {
									type: 'string',
									const: 'foo',
								},
							},
						},
						{
							type: 'object',
							required: ['bar'],
							properties: {
								bar: {
									type: 'string',
									const: 'bar',
								},
							},
						},
					],
				},
				{
					foo: 'foo',
					bar: 'bar',
				},
				(maybe) => {
					ts_assert.isObjectLiteralExpression(maybe);

					assert.equal(
						maybe.properties.length,
						2,
					);

					ts_assert.isPropertyAssignment(maybe.properties[0]);
					ts_assert.isPropertyAssignment(maybe.properties[1]);
				},
				undefined,
			],
			[
				{
					$defs: {
						foo: {
							type: 'object',
							required: ['foo'],
							properties: {
								foo: {
									type: 'string',
									const: 'foo',
								},
							},
						},
						bar: {
							type: 'object',
							required: ['bar'],
							properties: {
								bar: {
									type: 'string',
									const: 'bar',
								},
							},
						},
					},
					allOf: [
						{$ref: '#/$defs/foo'},
						{$ref: '#/$defs/bar'},
					],
				},
				{
					foo: 'foo',
					bar: 'bar',
				},
				(maybe) => {
					ts_assert.isObjectLiteralExpression(maybe);

					assert.equal(
						maybe.properties.length,
						2,
					);

					ts_assert.isPropertyAssignment(maybe.properties[0]);
					ts_assert.isPropertyAssignment(maybe.properties[1]);
				},
				undefined,
			],
			[
				{
					$defs: {
						foo: {
							type: 'object',
							required: ['foo'],
							properties: {
								foo: {
									type: 'string',
									const: 'foo',
								},
							},
						},
						bar: {
							type: 'object',
							required: ['bar'],
							properties: {
								bar: {
									type: 'string',
									const: 'bar',
								},
							},
						},
					},
					allOf: [
						{$ref: '#/$defs/foo'},
						{$ref: '#/$defs/bar'},
					],
				},
				{
					foo: 'foo',
					bar: 'bar',
				},
				undefined,
				(schema_parser) => {
					schema_parser.types = schema_parser.types.filter(
						(maybe) => !(maybe instanceof $ref),
					) as SchemaParser['types'];
				},
			],
			[
				{
					allOf: [
						{$ref: '#/$defs/foo'},
						{$ref: '#/$defs/bar'},
					],
				},
				{
					foo: 'foo',
					bar: 'bar',
				},
				undefined,
				undefined,
			],
			[
				{
					$defs: {
						foo: {
							type: 'object',
							required: ['foo'],
							patternProperties: {
								'^foo': {
									type: 'string',
									const: 'foo',
								},
							},
						},
						bar: {
							type: 'object',
							required: ['bar'],
							properties: {
								bar: {
									type: 'string',
									const: 'bar',
								},
							},
						},
					},
					allOf: [
						{$ref: '#/$defs/foo'},
						{$ref: '#/$defs/bar'},
					],
				},
				{
					foobar: 'foo',
					bar: 'bar',
				},
				undefined,
				undefined,
			],
			[
				{
					allOf: [
						{
							type: 'object',
							required: ['foo'],
							properties: {
								foo: {
									type: 'string',
									const: 'foo',
								},
							},
						},
						{
							type: 'object',
							required: ['bar'],
							properties: {
								bar: {
									type: 'string',
									const: 'bar',
								},
							},
						},
					],
				},
				[
					'foo',
					'bar',
				],
				undefined,
				undefined,
			],
			[
				{
					allOf: [
						{
							type: 'array',
							minItems: 1,
							items: {},
						},
						{
							type: 'array',
							minItems: 2,
							items: {},
						},
					],
				},
				{
					foo: 'foo',
					bar: 'bar',
				},
				undefined,
				undefined,
			],
			[
				{
					$defs: {
						foo: {
							type: 'object',
							required: ['foo'],
							properties: {
								foo: {
									type: 'string',
									const: 'foo',
								},
								bar: {
									type: 'string',
									const: 'bar',
								},
							},
						},
						bar: {
							type: 'object',
							required: ['bar'],
							properties: {
								bar: {
									type: 'string',
									const: 'bar',
								},
							},
						},
					},
					allOf: [
						{$ref: '#/$defs/foo'},
						{$ref: '#/$defs/bar'},
					],
				},
				{
					foo: 'foo',
					bar: 'bar',
				},
				undefined,
				undefined,
			],
			[
				{
					$defs: {
						foo: {
							type: 'object',
							required: ['foo'],
							properties: {
								foo: {
									type: 'string',
									const: 'foo',
								},
							},
						},
						bar: {
							type: 'object',
							required: ['bar'],
							properties: {
								bar: {
									type: 'string',
									const: 'bar',
								},
							},
						},
					},
					allOf: [
						{$ref: '#/$defs/foo'},
						{$ref: '#/$defs/bar'},
					],
				},
				{
					foo: 'foo',
				},
				undefined,
				undefined,
			],
			[
				{
					$defs: {
						foo: {
							type: 'object',
							$ref: '#/$defs/foo_foo',
						},
						foo_foo: {
							type: 'object',
							required: ['foo'],
							properties: {
								foo: {
									type: 'string',
									const: 'foo',
								},
							},
						},
						bar: {
							type: 'object',
							$ref: '#/$defs/foo_foo',
							required: ['bar'],
							properties: {
								bar: {
									type: 'string',
									const: 'bar',
								},
							},
						},
					},
					allOf: [
						{$ref: '#/$defs/bar'},
						{$ref: '#/$defs/bar'},
					],
				},
				{
					foo: 'foo',
					bar: 'foo',
				},
				undefined,
				undefined,
			],
			[
				{
					allOf: [
						{
							type: 'object',
							required: ['foo'],
							properties: {
								foo: {
									type: 'string',
									const: 'foo',
								},
								bar: {
									type: 'string',
									const: 'bar',
								},
							},
						},
						{
							type: 'object',
							required: ['bar'],
						},
					],
				},
				{
					foo: 'foo',
					bar: 'bar',
				},
				undefined,
				undefined,
			],
		];

		data_sets.forEach((
			[
				schema,
				data,
				asserter,
				modifier,
			],
			i,
		) => {
			void it(`behaves with data_sets[${i}]`, () => {
				const schema_parser = new SchemaParser();

				if (modifier) {
					modifier(schema_parser);
				}

				const instance = schema_parser.parse(schema);

				const result = () => instance.generate_typescript_data(
					data,
					schema_parser,
					schema,
				);

				if (undefined === asserter) {
					assert.throws(result);

					return;
				}

				const foo: (
					maybe: Node,
				) => asserts maybe is Expression = asserter;

				foo(result());
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

					const instance = new AllOf({
						ajv,
						type_definition,
						schema_definition,
					});

					const promise = instance.generate_typescript_type({
						data,
						schema: AllOf.generate_type_definition<
							'allOf'
						>(
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

				const instance = new AllOf({
					ajv,
					type_definition,
					schema_definition,
				});

				assert.ok(AllOf.is_a(instance));
				assert.ok(AllOf.is_a<$ref>(
					new AllOf<unknown, 'unspecified'>({
						ajv,
						type_definition: {
							kind: 'allOf',
							mode: 'unspecified',
						},
						schema_definition: {
							kind: 'allOf',
							mode: 'unspecified',
						},
					}),
				));
				assert.ok(!AllOf.is_a<AllOf<unknown>>(
					new $ref({}, {ajv}),
				));
			});

			additional_checks.forEach(([
				generator,
				passes,
			], j) => {
				void it(`behaves with data_sets[${i}][3][${j}]`, () => {
					const ajv = new Ajv({strict: true});

					assert.equal(
						AllOf.is_a(generator(ajv)),
						passes,
					);
				});
			});
		});
	});
});
