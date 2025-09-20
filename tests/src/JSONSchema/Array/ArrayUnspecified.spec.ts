import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import type {
	SchemaObject,
} from 'ajv/dist/2020.js';
import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	Node,
	StringLiteral,
	TypeNode,
} from 'typescript';
import {
	SyntaxKind,
} from 'typescript';

import {
	is_instanceof,
	not_undefined,
} from '@satisfactory-dev/custom-assert';

import ts_assert from '@signpostmarv/ts-assert';

import type {
	ArrayLiteralExpression,
	ArrayTypeNode,
	LiteralTypeNode,
	TupleTypeNode,
} from '../../../../src/types.ts';
import type {
	ts_asserter,
} from '../../../types.ts';

import {
	is_ArrayLiteralExpression,
	is_ArrayTypeNode,
	is_TupleTypeNode,
} from '../../../assertions.ts';

import {
	SchemaParser,
} from '../../../../src/SchemaParser.ts';

import type {
	ArrayUnspecified_options,
} from '../../../../src/JSONSchema/Array.ts';
import {
	ArrayUnspecified,
} from '../../../../src/JSONSchema/Array.ts';

import type {
	array_mode,
	array_type,
	ItemsType_by_mode,
	MaxItemsType_mode,
	MinItemsType_mode,
	unique_items_mode,
} from '../../../../src/JSONSchema/Array/types.ts';

import type {
	$defs_mode,
} from '../../../../src/JSONSchema/types.ts';
import type {
	Type,
} from '../../../../src/JSONSchema/Type.ts';

import {
	PositiveInteger,
	PositiveIntegerOrZero,
} from '../../../../src/guarded.ts';

void describe('ArrayUnspecified', () => {
	type DataSet<
		T1 extends TypeNode = TypeNode,
		T2 extends (
			| TupleTypeNode<T1, [T1, ...T1[]]>
			| ArrayTypeNode<T1>
		) = (
			| TupleTypeNode<T1, [T1, ...T1[]]>
			| ArrayTypeNode<T1>
		),
		T3 extends Expression = Expression,
		T4 extends T3[] = T3[],
		DefsMode extends $defs_mode = $defs_mode,
		MinItems extends MinItemsType_mode = MinItemsType_mode,
		MaxItems extends MaxItemsType_mode = MaxItemsType_mode,
		ArrayMode extends array_mode = array_mode,
		UniqueItems_mode extends unique_items_mode = unique_items_mode,
	> = [
		MinItems,
		MaxItems,
		ArrayMode,
		UniqueItems_mode,
		unknown[], // input
		array_type<
			DefsMode,
			ArrayMode,
			MinItems,
			MaxItems,
			UniqueItems_mode
		>,
		ArrayUnspecified_options<
			ArrayMode,
			UniqueItems_mode,
			ItemsType_by_mode<ArrayMode>,
			[SchemaObject, ...SchemaObject[]]
		>,
		boolean, // will or won't fail on default
		// ArrayUnspecified::generate_typescript_type() asserter
		ts_asserter<T2>,
		// ArrayUnspecified::generate_typescript_data() asserter
		ts_asserter<ArrayLiteralExpression<T3, T4, boolean>>,
	];

	const data_sets:[
		DataSet,
		...DataSet[]
	] = [
		[
			'optional',
			'optional',
			'items-only',
			'no',
			[
				'foo',
				'bar',
			],
			{
				type: 'array',
				items: {
					type: 'string',
				},
				minItems: PositiveIntegerOrZero(2),
				maxItems: PositiveInteger(2),
			},
			{
				minItems: PositiveIntegerOrZero(2),
				maxItems: PositiveInteger(2),
				array_mode: 'items-only',
				items: {},
				uniqueItems_mode: 'no',
			},
			false,
			(
				value: Node,
				message?: string|Error,
			): asserts value is (
				TupleTypeNode<LiteralTypeNode<StringLiteral>>
			) => {
				is_TupleTypeNode(
					value,
					(
						element: Node,
					) => {
						ts_assert.isTokenWithExpectedKind(
							element,
							SyntaxKind.StringKeyword,
						);
					},
					message,
				);
			},
			(
				value: Node,
				message?: string|Error,
			): asserts value is ArrayLiteralExpression<
				StringLiteral,
				[StringLiteral, StringLiteral],
				boolean
			> => {
				is_ArrayLiteralExpression(
					value,
					ts_assert.isStringLiteral,
					PositiveIntegerOrZero(2),
					message,
				);
			},
		],
		[
			'optional',
			'optional',
			'prefix-only',
			'no',
			[
				'foo',
				'bar',
			],
			{
				type: 'array',
				prefixItems: [
					{
						type: 'string',
						const: 'foo',
					},
					{
						type: 'string',
						const: 'bar',
					},
				],
				minItems: PositiveIntegerOrZero(2),
				items: false,
			},
			{
				array_mode: 'prefix-only',
				minItems: PositiveIntegerOrZero(2),
				items: false,
				prefixItems: [
					{
						type: 'string',
						const: 'foo',
					},
					{
						type: 'string',
						const: 'bar',
					},
				],
				uniqueItems_mode: 'no',
			},
			true,
			(
				value: Node,
				message?: string|Error,
			): asserts value is (
				TupleTypeNode<LiteralTypeNode<StringLiteral>>
			) => {
				is_TupleTypeNode(
					value,
					(
						element: Node,
					) => {
						ts_assert.isLiteralTypeNode(element);
						ts_assert.isStringLiteral(element.literal);
					},
					false,
					message,
				);
			},
			(
				value: Node,
				message?: string|Error,
			): asserts value is ArrayLiteralExpression<
				StringLiteral,
				[StringLiteral, StringLiteral],
				boolean
			> => {
				is_ArrayLiteralExpression(
					value,
					ts_assert.isStringLiteral,
					PositiveIntegerOrZero(2),
					message,
				);
			},
		],
		[
			'optional',
			'optional',
			'items-only',
			'no',
			[
				'foo',
				'bar',
			],
			{
				type: 'array',
				items: {
					type: 'string',
				},
			},
			{
				array_mode: 'items-only',
				items: {},
				uniqueItems_mode: 'no',
			},
			false,
			(
				value: Node,
				message?: string|Error,
			): asserts value is (
				TupleTypeNode<LiteralTypeNode<StringLiteral>>
			) => {
				is_ArrayTypeNode(
					value,
					(
						element: Node,
					) => {
						ts_assert.isTokenWithExpectedKind(
							element,
							SyntaxKind.StringKeyword,
						);
					},
					message,
				);
			},
			(
				value: Node,
				message?: string|Error,
			): asserts value is ArrayLiteralExpression<
				StringLiteral,
				[StringLiteral, StringLiteral],
				boolean
			> => {
				is_ArrayLiteralExpression(
					value,
					ts_assert.isStringLiteral,
					PositiveIntegerOrZero(2),
					message,
				);
			},
		],
		[
			'optional',
			'optional',
			'prefix-only',
			'no',
			[
				'foo',
				'bar',
				'baz',
				'bat',
			],
			{
				type: 'array',
				prefixItems: [
					{
						type: 'string',
						const: 'foo',
					},
					{
						type: 'string',
						const: 'bar',
					},
				],
				minItems: PositiveIntegerOrZero(2),
				items: {
					type: 'string',
				},
			},
			{
				array_mode: 'both',
				minItems: PositiveIntegerOrZero(2),
				items: {},
				prefixItems: [
					{
						type: 'string',
						const: 'foo',
					},
					{
						type: 'string',
						const: 'bar',
					},
				],
				uniqueItems_mode: 'no',
			},
			true,
			(
				value: Node,
				message?: string|Error,
			): asserts value is (
				TupleTypeNode<LiteralTypeNode<StringLiteral>>
			) => {
				is_TupleTypeNode(
					value,
					(
						element: Node,
						_,
						context,
					) => {
						if (context?.is_last) {
							ts_assert.isTokenWithExpectedKind(
								element,
								SyntaxKind.StringKeyword,
							);
						} else {
							ts_assert.isLiteralTypeNode(element);
							ts_assert.isStringLiteral(element.literal);
						}
					},
					true,
					message,
				);
			},
			(
				value: Node,
				message?: string|Error,
			): asserts value is ArrayLiteralExpression<
				StringLiteral,
				[StringLiteral, StringLiteral],
				boolean
			> => {
				is_ArrayLiteralExpression(
					value,
					ts_assert.isStringLiteral,
					PositiveIntegerOrZero(4),
					message,
				);
			},
		],
		[
			'optional',
			'optional',
			'prefix-only',
			'no',
			[
				'foo',
				'bar',
				'baz',
				'bat',
			],
			{
				type: 'array',
				prefixItems: [
					{
						type: 'string',
						const: 'foo',
					},
					{
						type: 'string',
						const: 'bar',
					},
				],
				minItems: PositiveIntegerOrZero(4),
				items: {
					type: 'string',
				},
			},
			{
				array_mode: 'both',
				minItems: PositiveIntegerOrZero(4),
				items: {},
				prefixItems: [
					{
						type: 'string',
						const: 'foo',
					},
				],
				uniqueItems_mode: 'no',
			},
			true,
			(
				value: Node,
				message?: string|Error,
			): asserts value is (
				TupleTypeNode<LiteralTypeNode<StringLiteral>>
			) => {
				is_TupleTypeNode(
					value,
					(
						element: Node,
						_,
						context,
					) => {
						not_undefined(context);
						if (context.is_last || context.index >= 2) {
							ts_assert.isTokenWithExpectedKind(
								element,
								SyntaxKind.StringKeyword,
							);
						} else {
							ts_assert.isLiteralTypeNode(element);
							ts_assert.isStringLiteral(element.literal);
						}
					},
					true,
					message,
				);
			},
			(
				value: Node,
				message?: string|Error,
			): asserts value is ArrayLiteralExpression<
				StringLiteral,
				[StringLiteral, StringLiteral],
				boolean
			> => {
				is_ArrayLiteralExpression(
					value,
					ts_assert.isStringLiteral,
					PositiveIntegerOrZero(4),
					message,
				);
			},
		],
		[
			'optional',
			'optional',
			'prefix-only',
			'no',
			[],
			{
				type: 'array',
				prefixItems: [
					{
						type: 'string',
						const: 'foo',
					},
					{
						type: 'string',
						const: 'bar',
					},
				],
				minItems: PositiveIntegerOrZero(0),
				items: {
					type: 'string',
				},
			},
			{
				array_mode: 'both',
				minItems: PositiveIntegerOrZero(0),
				items: {},
				prefixItems: [
					{
						type: 'string',
						const: 'foo',
					},
				],
				uniqueItems_mode: 'no',
			},
			true,
			(
				value: Node,
				message?: string|Error,
			): asserts value is (
				TupleTypeNode<LiteralTypeNode<StringLiteral>>
			) => {
				is_TupleTypeNode(
					value,
					(
						element: Node,
						_,
						context,
					) => {
						if (context?.is_last) {
							ts_assert.isTokenWithExpectedKind(
								element,
								SyntaxKind.StringKeyword,
							);
						} else {
							ts_assert.isLiteralTypeNode(element);
							ts_assert.isStringLiteral(element.literal);
						}
					},
					true,
					message,
				);
			},
			(
				value: Node,
				message?: string|Error,
			): asserts value is ArrayLiteralExpression<
				StringLiteral,
				[StringLiteral, StringLiteral],
				boolean
			> => {
				is_ArrayLiteralExpression(
					value,
					ts_assert.isStringLiteral,
					PositiveIntegerOrZero(0),
					message,
				);
			},
		],
	];
	data_sets.forEach(([
		,,,,
		data,
		schema,
		ctor_args,
		will_fail_on_default,
		generate_typescript_type_asserter,
		generate_typescript_data_asserter,
	], i) => {
		const ajv = new Ajv({strict: false});

		function test_generate_typescript_type(
			instance: ArrayUnspecified<
				typeof data,
				array_mode
			>,
			schema_parser: SchemaParser,
		) {
			void it(`::generate_typescript_type() behaves with data_sets[${i}]`, async () => {
				assert.ok(
					instance.check_type(data),
					`ArrayUnspecified::check_type(data_set[${i}][0]) failed`,
				);
				const generated = await instance.generate_typescript_type({
					data,
					schema,
					schema_parser,
				});
				assert.doesNotThrow(() => generate_typescript_type_asserter(
					generated,
					`Did not pass type asserter on data_set[${i}]`,
				));
				await assert.rejects(
					() => (
						instance as Type<unknown>
					).generate_typescript_type({
						data,
						schema: {
							type: 'string',
						},
						schema_parser,
					}),
					`Incorrectly matched array against string on data_set[${i}]`,
				);
			})
		}

		function test_generate_typescript_data(
			instance: ArrayUnspecified<
				typeof data,
				array_mode
			>,
			schema_parser: SchemaParser,
		) {
			void it(`::generate_typescript_data() behaves with data_sets[${i}]`, () => {
				assert.ok(
					instance.check_type(data),
					`ArrayUnspecified::check_type(data_set[${i}][0]) failed`,
				);
				const generated = instance.generate_typescript_data(
					data,
					schema_parser,
					schema,
				);
				assert.doesNotThrow(() => generate_typescript_data_asserter(
					generated,
					`Did not pass data asserter on data_set[${i}]`,
				));
				const call = 0 === data.length ? 'doesNotThrow' : 'throws';
				assert[call](() => (
					new ArrayUnspecified<
						typeof data,
						array_mode
					>({
						...ctor_args,
						expression_at_index_verifier: <
							Data extends unknown[],
							T1 extends Expression,
							Result extends T1[],
							Index extends ReturnType<
								typeof PositiveIntegerOrZero<number>
							> = ReturnType<
								typeof PositiveIntegerOrZero<number>
							>
						> (
							data: Data,
							expression: Expression,
						):  expression is Result[Index] => false,
					}, {ajv})
				).generate_typescript_data(
					data,
					schema_parser,
					schema,
				));
			})
		}

		void describe(`directly instantiate with data_sets[${i}]`, () => {
			const instance = new ArrayUnspecified<
				typeof data,
				array_mode
			>(ctor_args, {ajv});

			assert.ok(
				instance.check_schema(schema),
				`ArrayUnspecified::check_schema(data_set[${i}][1]) failed`,
			);

			test_generate_typescript_type(instance, new SchemaParser({ajv}));
			test_generate_typescript_data(instance, new SchemaParser({ajv}));
		})

		void describe(`instantiated from parser with data_sets[${i}]`, () => {
			const schema_parser = new SchemaParser({ajv});
			if (will_fail_on_default) {
				const manual = new ArrayUnspecified<
					typeof data,
					array_mode
				>(ctor_args, {ajv});

				assert.throws(() => schema_parser.parse(schema));
				schema_parser.types.push(manual);
			}
			const instance = schema_parser.parse(schema);

			assert.ok(
				instance.check_schema(schema),
				`ArrayUnspecified::check_schema(data_set[${i}][1]) failed`,
			);

			is_instanceof<
				ArrayUnspecified<
					typeof data,
					array_mode
				>
			>(
				instance,
				ArrayUnspecified,
			);

			test_generate_typescript_type(instance, schema_parser);
			test_generate_typescript_data(instance, schema_parser);
		})
	});
})
