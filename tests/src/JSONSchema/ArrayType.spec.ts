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
	array_mode,
	array_type,
	MinItemsType_mode,
	specified_mode,
	unique_items_mode,
} from '../../../src/JSONSchema/Array.ts';
import {
	ArrayType,
} from '../../../src/JSONSchema/Array.ts';

import type {
	ts_asserter,
} from '../../types.ts';

import type {
	ArrayLiteralExpression,
	ArrayTypeNode,
	TupleTypeNode,
} from '../../../index.ts';
import {
	PositiveIntegerGuard,
	SchemaParser,
} from '../../../index.ts';

void describe('ArrayType', () => {
	type DataSubSetSubset<
		ArrayMode extends array_mode = array_mode,
		MinItems_mode extends MinItemsType_mode = MinItemsType_mode,
		T2 extends TypeNode = TypeNode,
		T3 extends [T2, ...T2[]] = [T2, ...T2[]],
		T4 extends Expression = Expression,
	> = [
		array_type<
			ArrayMode,
			specified_mode,
			unique_items_mode,
			MinItems_mode
		>,
		ts_asserter<ArrayLiteralExpression<
			T4,
			{
				items: {
					with: [T4, ...T4[]],
					optional: T4[],
				}[MinItems_mode],
				prefixItems: [T4, ...T4[]],
			}[ArrayMode],
			true
		>>,
		ts_asserter<{
			items: {
				with: TupleTypeNode<T2, T3>,
				optional: ArrayTypeNode<T2>,
			}[MinItems_mode],
			prefixItems: TupleTypeNode<T2, T3>,
		}[ArrayMode]>,
	];
	type DataSubSet<
		ArrayMode extends array_mode = array_mode,
		MinItems_mode extends MinItemsType_mode = MinItemsType_mode,
		T2 extends TypeNode = TypeNode,
		T3 extends [T2, ...T2[]] = [T2, ...T2[]],
		T4 extends Expression = Expression,
	> = [
		{
			items: unknown[],
			prefixItems: [unknown, ...unknown[]],
		}[ArrayMode],
		[
			DataSubSetSubset<
				ArrayMode,
				MinItems_mode,
				T2,
				T3,
				T4
			>,
			...DataSubSetSubset<
				ArrayMode,
				MinItems_mode,
				T2,
				T3,
				T4
			>[],
		],
	];

	type DataSet<
		ArrayMode extends array_mode = array_mode,
		MinItems_mode extends MinItemsType_mode = MinItemsType_mode,
	> = [
		ConstructorParameters<typeof ArrayType<
			ArrayMode,
			specified_mode,
			unique_items_mode,
			MinItems_mode
		>>[1],
		[
			DataSubSet<ArrayMode, MinItems_mode>,
			...DataSubSet<ArrayMode, MinItems_mode>[],
		],
	];

	const data_sets: [DataSet, ...DataSet[]] = [
		[
			{
				array_options: {
					array_mode: 'items',
					specified_mode: 'unspecified',
					unique_items_mode: 'no',
					min_items_mode: 'optional',
				},
			},
			[
				[
					['foo', 'bar', 'baz'],
					[
						[
							{
								type: 'array',
								items: {},
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isArrayTypeNode(maybe);
								ts_assert.isTokenWithExpectedKind(
									maybe.elementType,
									SyntaxKind.UnknownKeyword,
								);
							},
						],
						[
							{
								type: 'array',
								items: {type: 'string'},
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isArrayTypeNode(maybe);
								ts_assert.isTokenWithExpectedKind(
									maybe.elementType,
									SyntaxKind.StringKeyword,
								);
							},
						],
						[
							{
								type: 'array',
								items: {type: 'string'},
								minItems: PositiveIntegerGuard(1),
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isTupleTypeNode(maybe);

								assert.equal(maybe.elements.length, 2);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[0],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isRestTypeNode(maybe.elements[1]);
								ts_assert.isArrayTypeNode(
									maybe.elements[1].type,
								);
								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1].type.elementType,
									SyntaxKind.StringKeyword,
								);
							},
						],
					],
				],
			],
		],
		[
			{
				array_options: {
					array_mode: 'items',
					specified_mode: 'unspecified',
					unique_items_mode: 'no',
					min_items_mode: 'optional',
					minItems: PositiveIntegerGuard(2),
					maxItems: PositiveIntegerGuard(5),
				},
			},
			[
				[
					['foo', 'bar', 'baz'],
					[
						[
							{
								type: 'array',
								items: {},
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isArrayTypeNode(maybe);
								ts_assert.isTokenWithExpectedKind(
									maybe.elementType,
									SyntaxKind.UnknownKeyword,
								);
							},
						],
						[
							{
								type: 'array',
								items: {type: 'string'},
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isArrayTypeNode(maybe);
								ts_assert.isTokenWithExpectedKind(
									maybe.elementType,
									SyntaxKind.StringKeyword,
								);
							},
						],
						[
							{
								type: 'array',
								items: {type: 'string'},
								minItems: PositiveIntegerGuard(1),
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isTupleTypeNode(maybe);

								assert.equal(maybe.elements.length, 2);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[0],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isRestTypeNode(maybe.elements[1]);
								ts_assert.isArrayTypeNode(
									maybe.elements[1].type,
								);
								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1].type.elementType,
									SyntaxKind.StringKeyword,
								);
							},
						],
					],
				],
			],
		],
		[
			{
				array_options: {
					array_mode: 'items',
					specified_mode: 'specified',
					unique_items_mode: 'no',
					min_items_mode: 'optional',
					items: {
						type: 'string',
					},
				},
			},
			[
				[
					['foo', 'bar', 'baz'],
					[
						[
							{
								type: 'array',
								items: {
									type: 'string',
								},
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isArrayTypeNode(maybe);
								ts_assert.isTokenWithExpectedKind(
									maybe.elementType,
									SyntaxKind.StringKeyword,
								);
							},
						],
						[
							{
								type: 'array',
								items: {type: 'string'},
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isArrayTypeNode(maybe);
								ts_assert.isTokenWithExpectedKind(
									maybe.elementType,
									SyntaxKind.StringKeyword,
								);
							},
						],
						[
							{
								type: 'array',
								items: {type: 'string'},
								minItems: PositiveIntegerGuard(1),
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isTupleTypeNode(maybe);

								assert.equal(maybe.elements.length, 2);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[0],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isRestTypeNode(maybe.elements[1]);
								ts_assert.isArrayTypeNode(
									maybe.elements[1].type,
								);
								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1].type.elementType,
									SyntaxKind.StringKeyword,
								);
							},
						],
					],
				],
			],
		],
		[
			{
				array_options: {
					array_mode: 'items',
					specified_mode: 'specified',
					unique_items_mode: 'no',
					min_items_mode: 'optional',
					$defs: {
						foo: {
							type: 'string',
						},
					},
					items: {
						$ref: '#/$defs/foo',
					},
				},
			},
			[
				[
					['foo', 'bar', 'baz'],
					[
						[
							{
								type: 'array',
								items: {
									type: 'string',
								},
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isArrayTypeNode(maybe);
								ts_assert.isTokenWithExpectedKind(
									maybe.elementType,
									SyntaxKind.StringKeyword,
								);
							},
						],
						[
							{
								type: 'array',
								$defs: {
									foo: {
										type: 'string',
									},
								},
								items: {
									$ref: '#/$defs/foo',
								},
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isArrayTypeNode(maybe);
								ts_assert.isTypeReferenceNode(
									maybe.elementType,
								);
							},
						],
					],
				],
			],
		],
		[
			{
				array_options: {
					array_mode: 'items',
					specified_mode: 'specified',
					unique_items_mode: 'no',
					min_items_mode: 'optional',
					items: {
						type: 'string',
					},
					minItems: PositiveIntegerGuard(2),
					maxItems: PositiveIntegerGuard(5),
				},
			},
			[
				[
					['foo', 'bar', 'baz'],
					[
						[
							{
								type: 'array',
								items: {},
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isArrayTypeNode(maybe);
								ts_assert.isTokenWithExpectedKind(
									maybe.elementType,
									SyntaxKind.UnknownKeyword,
								);
							},
						],
						[
							{
								type: 'array',
								items: {type: 'string'},
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isArrayTypeNode(maybe);
								ts_assert.isTokenWithExpectedKind(
									maybe.elementType,
									SyntaxKind.StringKeyword,
								);
							},
						],
						[
							{
								type: 'array',
								items: {type: 'string'},
								minItems: PositiveIntegerGuard(1),
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isTupleTypeNode(maybe);

								assert.equal(maybe.elements.length, 2);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[0],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isRestTypeNode(maybe.elements[1]);
								ts_assert.isArrayTypeNode(
									maybe.elements[1].type,
								);
								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1].type.elementType,
									SyntaxKind.StringKeyword,
								);
							},
						],
					],
				],
			],
		],
		[
			{
				array_options: {
					array_mode: 'prefixItems',
					specified_mode: 'unspecified',
					unique_items_mode: 'no',
					min_items_mode: 'optional',
				},
			},
			[
				[
					['foo', 'bar', 'baz'],
					[
						[
							{
								type: 'array',
								prefixItems: [
									{type: 'string'},
									{type: 'string'},
									{type: 'string'},
								],
								items: false,
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isTupleTypeNode(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[0],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1],
									SyntaxKind.StringKeyword,
								);
							},
						],
					],
				],
			],
		],
		[
			{
				array_options: {
					array_mode: 'prefixItems',
					specified_mode: 'unspecified',
					unique_items_mode: 'no',
					min_items_mode: 'optional',
					minItems: PositiveIntegerGuard(2),
					maxItems: PositiveIntegerGuard(5),
				},
			},
			[
				[
					['foo', 'bar', 'baz'],
					[
						[
							{
								type: 'array',
								prefixItems: [
									{type: 'string'},
									{type: 'string'},
									{type: 'string'},
								],
								items: false,
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isTupleTypeNode(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[0],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1],
									SyntaxKind.StringKeyword,
								);
							},
						],
					],
				],
			],
		],
		[
			{
				array_options: {
					array_mode: 'prefixItems',
					specified_mode: 'specified',
					unique_items_mode: 'no',
					min_items_mode: 'optional',
					prefixItems: [
						{type: 'string'},
						{type: 'string'},
						{type: 'string'},
					],
				},
			},
			[
				[
					['foo', 'bar', 'baz'],
					[
						[
							{
								type: 'array',
								prefixItems: [
									{type: 'string'},
									{type: 'string'},
									{type: 'string'},
								],
								items: false,
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isTupleTypeNode(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[0],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1],
									SyntaxKind.StringKeyword,
								);
							},
						],
					],
				],
			],
		],
		[
			{
				array_options: {
					array_mode: 'prefixItems',
					specified_mode: 'specified',
					unique_items_mode: 'yes',
					min_items_mode: 'optional',
					prefixItems: [
						{type: 'string'},
						{type: 'string'},
						{type: 'string'},
					],
				},
			},
			[
				[
					['foo', 'bar', 'baz'],
					[
						[
							{
								type: 'array',
								prefixItems: [
									{type: 'string'},
									{type: 'string'},
									{type: 'string'},
								],
								items: false,
								uniqueItems: false,
							},
							(maybe) => {
								ts_assert.isArrayLiteralExpression(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isStringLiteral(maybe.elements[0]);
								ts_assert.isStringLiteral(maybe.elements[1]);
								ts_assert.isStringLiteral(maybe.elements[2]);

								assert.equal('foo', maybe.elements[0].text);
								assert.equal('bar', maybe.elements[1].text);
								assert.equal('baz', maybe.elements[2].text);
							},
							(maybe) => {
								ts_assert.isTupleTypeNode(maybe);

								assert.equal(maybe.elements.length, 3);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[0],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1],
									SyntaxKind.StringKeyword,
								);

								ts_assert.isTokenWithExpectedKind(
									maybe.elements[1],
									SyntaxKind.StringKeyword,
								);
							},
						],
					],
				],
			],
		],
	];

	data_sets.forEach(([
		specific_options,
		expectation_sets,
	], i) => {
		expectation_sets.forEach(([
			data,
			variants,
		], j) => {
			variants.forEach(([
				schema,
				data_asserter,
				type_asserter,
			], k) => {
				void describe('::generate_typescript_data()', () => {
					void it(`behaves with data_sets[${i}][${j}][${k}]`, () => {
						const ajv = new Ajv({strict: true});
						const schema_parser = new SchemaParser({ajv});
						const instance = new ArrayType(
							{
								ajv,
							},
							specific_options,
						);

						const actual = instance.generate_typescript_data(
							data,
							schema_parser,
							schema,
						);

						const foo: ts_asserter = data_asserter;

						foo(actual);
					});
				});

				void describe('::generate_typescript_type()', () => {
					void it(
						`behaves with data_sets[${i}][${j}][${k}]`,
						async () => {
							const ajv = new Ajv({strict: true});
							const schema_parser = new SchemaParser({ajv});
							const instance = new ArrayType(
								{
									ajv,
								},
								specific_options,
							);

							const promise = instance.generate_typescript_type({
								data,
								schema_parser,
								schema,
							});

							await assert.doesNotReject(() => promise);

							const actual = await promise;

							const foo: ts_asserter = type_asserter;

							foo(actual);
						},
					);
				});
			});
		});
	});
});
