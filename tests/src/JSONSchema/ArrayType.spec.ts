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

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import type {
	ts_asserter,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../index.ts';

import type {
	ArrayLiteralExpression,
	ArrayTypeNode,
	TupleTypeNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../src/typescript/index.ts';

import type {
	array_mode,
	array_options,
	array_type,
	MinItemsType_mode,
	specified_mode,
	unique_items_mode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';
import {
	ArrayType,
	PositiveIntegerGuard,
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';

import {
	throws_Error,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../index.ts';

void describe('ArrayType', () => {
	type AllowedMutation<
		ArrayMode extends array_mode = array_mode,
		MinItems_mode extends MinItemsType_mode = MinItemsType_mode,
	> = keyof Pick<
		array_options<
			ArrayMode,
			specified_mode,
			unique_items_mode,
			MinItems_mode
		>,
		(
			| 'unique_items_mode'
			| 'min_items_mode'
		)
	>;

	function mutate_unique_items_mode<
		ArrayMode extends array_mode = array_mode,
	>(
		options: array_options<
			ArrayMode
		>,
	) {
		const {
			unique_items_mode,
		} = options;

		const mutated: array_options<
			ArrayMode
		> = {
			...options,
			unique_items_mode: 'yes' === unique_items_mode ? 'no' : 'yes',
		};

		return mutated;
	}

	function mutate_min_items_mode<
		ArrayMode extends array_mode = array_mode,
	>(
		options: array_options<
			ArrayMode
		>,
	): array_options<
		ArrayMode
	> {
		const {
			min_items_mode,
		} = options;

		const mutated: array_options<
			ArrayMode
		> = {
			...options,
			min_items_mode: 'with' === min_items_mode ? 'optional' : 'with',
		};

		return mutated;
	}

	function* mutation_sets<
		ArrayMode extends array_mode = array_mode,
	>(
		options: array_options<
			ArrayMode
		>,
		supported_mutations: AllowedMutation[],
	): Generator<[string, array_options<
		ArrayMode
	>]> {
		yield ['unmodified', options];

		const can_mutate_unique_items_mode = supported_mutations.includes(
			'unique_items_mode',
		);

		const can_mutate_min_items_mode = supported_mutations.includes(
			'min_items_mode',
		);

		if (can_mutate_unique_items_mode) {
			let mutated = mutate_unique_items_mode(options);

			yield [
				'unique_items_mode',
				mutated,
			];

			if (can_mutate_min_items_mode) {
				mutated = mutate_min_items_mode(mutated);

				yield [
					'unique_items_mode|min_items_mode',
					mutated,
				];
			}
		}

		if (can_mutate_min_items_mode) {
			yield [
				'unique_items_mode|min_items_mode',
				mutate_min_items_mode(options),
			];
		}
	}

	function* split_data_sets(
		data_sets: [DataSet, ...DataSet[]],
	): Generator<[
		DataSet[0],
		DataSubSet[0],
		DataSubSetSubset[0],
		DataSubSetSubset[1],
		DataSubSetSubset[2],
		string,
		number,
		number,
		number,
	]> {
		let i = 0;
		for (const [
			specific_options,
			supported_mutations,
			expectation_sets,
		] of data_sets) {
			let j = 0;
			for (const [
				data,
				variants,
			] of expectation_sets) {
				let k = 0;
				for (const [
					schema,
					data_asserter,
					type_asserter,
				] of variants) {
					for (
						const [
							mutation,
							modified_options,
						] of mutation_sets(
							specific_options.array_options,
							supported_mutations,
						)
					) {
						yield [
							{
								...specific_options,
								array_options: modified_options,
							},
							data,
							schema,
							data_asserter,
							type_asserter,
							mutation,
							i,
							j,
							k,
						];
					}

					++k;
				}

				++j;
			}

			++i;
		}
	}

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
		AllowedMutation[],
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
					minItems: PositiveIntegerGuard(2),
					maxItems: PositiveIntegerGuard(5),
				},
			},
			[
				'unique_items_mode',
			],
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
				'unique_items_mode',
				'min_items_mode',
			],
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
			[],
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
			[],
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
			[],
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
			[],
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
			[],
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
			[],
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
			[],
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

	for (const [
		specific_options,
		data,
		schema,
		data_asserter,
		type_asserter,
		mutation_set,
		i,
		j,
		k,
	] of split_data_sets(data_sets)) {
		void describe('::generate_typescript_data()', () => {
			void it(
				`behaves with data_sets[${
					i
				}][${
					j
				}][${
					k
				}] & ${
					mutation_set
				} mutation`,
				() => {
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
				},
			);
		});

		void describe('::generate_typescript_type()', () => {
			void it(
				`behaves with data_sets[${
					i
				}][${
					j
				}][${
					k
				}] & ${
					mutation_set
				} mutation`,
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

			void it(
				'fails as expected when checking prefixItems schema',
				async () => {
					const ajv = new Ajv({strict: true});
					const schema_parser = new SchemaParser({ajv});
					const instance = new ArrayType(
						{
							ajv,
						},
						{
							array_options: {
								array_mode: 'prefixItems',
								specified_mode: 'specified',
								unique_items_mode: 'yes',
								min_items_mode: 'optional',
								prefixItems: [
									{
										type: 'string',
									},
									{
										type: 'string',
									},
									{
										type: 'string',
									},
								],
							},
						},
					);

					const promise = instance.generate_typescript_type({
						data: ['foo'],
						schema: {
							type: 'array',
							minItems: PositiveIntegerGuard(3),
							uniqueItems: true,
							items: false,
							prefixItems: [
								{
									type: 'string',
								},
								{
									type: 'string',
								},
								{
									type: 'string',
								},
							],
						},
						schema_parser,
					});

					await assert.rejects(promise);
				},
			);
		});
	}

	void describe('::generate_typescript_data()', () => {
		type FailureSubSet = (
			| [
				array_type,
				unknown[],
			]
			| [
				array_type,
				unknown[],
				new () => Error,
				string,
			]
		);

		type FailureDataSet = [
			ConstructorParameters<typeof ArrayType>[1],
			[FailureSubSet, ...FailureSubSet[]],
		];

		const data_sets: [FailureDataSet, ...FailureDataSet[]] = [
			[
				{
					array_options: {
						array_mode: 'items',
						specified_mode: 'unspecified',
						unique_items_mode: 'yes',
						min_items_mode: 'optional',
					},
				},
				[
					[
						{
							type: 'array',
							items: {},
							uniqueItems: false,
						},
						['foo', 'bar', 'foo'],
					],
				],
			],
			[
				{
					array_options: {
						array_mode: 'items',
						specified_mode: 'unspecified',
						unique_items_mode: 'yes',
						min_items_mode: 'optional',
					},
					expression_at_index_verifier: (
						data,
						maybe,
					): maybe is Expression => false,
				},
				[
					[
						{
							type: 'array',
							items: {},
							uniqueItems: false,
						},
						['foo', 'bar', 'baz'],
					],
				],
			],
			[
				{
					array_options: {
						array_mode: 'items',
						specified_mode: 'unspecified',
						unique_items_mode: 'yes',
						min_items_mode: 'optional',
					},
				},
				[
					[
						{
							type: 'array',
							items: {
								type: 'string',
							},
							uniqueItems: false,
						},
						['foo', 1],
					],
				],
			],
			[
				{
					array_options: {
						array_mode: 'prefixItems',
						specified_mode: 'unspecified',
						unique_items_mode: 'yes',
						min_items_mode: 'optional',
					},
					expression_at_index_verifier: (
						data,
						maybe,
					): maybe is Expression => false,
				},
				[
					[
						{
							type: 'array',
							items: false,
							prefixItems: [
								{
									type: 'string',
								},
								{
									type: 'string',
								},
							],
							uniqueItems: false,
						},
						['foo', 'bar', 'baz'],
						TypeError,
						'Element at index 0 was not of expected type!',
					],
				],
			],
			[
				{
					array_options: {
						array_mode: 'prefixItems',
						specified_mode: 'unspecified',
						unique_items_mode: 'yes',
						min_items_mode: 'optional',
					},
				},
				[
					[
						{
							type: 'array',
							items: false,
							prefixItems: [
								{
									type: 'string',
								},
								{
									type: 'string',
								},
							],
							uniqueItems: false,
						},
						['foo', 'bar', 'baz'],
						TypeError,
						'Invalid schema detected!',
					],
				],
			],
		];

		data_sets.forEach(([
			options,
			subsets,
		], i) => {
			subsets.forEach(([
				schema,
				data,
				expected_error,
				expected_message,
			], j) => {
				void it(`behaves with data_sets[${i}][${j}]`, () => {
					const schema_parser = new SchemaParser({ajv_options: {}});

					const instance = schema_parser.share_ajv(
						(ajv) => new ArrayType(
							{ajv},
							options,
						),
					);

					const callback = () => instance.generate_typescript_data(
						data,
						schema_parser,
						schema,
					);

					if (expected_error) {
						throws_Error(
							callback,
							expected_error,
							expected_message,
						);
					} else {
						assert.throws(callback);
					}
				});
			});
		});
	});
});
