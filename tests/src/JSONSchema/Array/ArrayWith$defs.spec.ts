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
	Node,
	StringLiteral,
	TypeNode,
} from 'typescript';
import {
	SyntaxKind,
} from 'typescript';

import {
	is_instanceof,
} from '@satisfactory-dev/custom-assert';

import ts_assert from '@signpostmarv/ts-assert';

import type {
	ArrayTypeNode,
	LiteralTypeNode,
	TupleTypeNode,
} from '../../../../src/types.ts';
import type {
	ts_asserter,
} from '../../../types.ts';

import {
	is_TupleTypeNode,
} from '../../../assertions.ts';

import {
	SchemaParser,
} from '../../../../src/SchemaParser.ts';

import type {
	ArrayWith$defs_options,
} from '../../../../src/JSONSchema/Array.ts';
import {
	ArrayWith$defs,
} from '../../../../src/JSONSchema/Array.ts';

import type {
	array_mode,
	array_type,
	ItemsType_by_mode,
	MaxItemsType,
	MaxItemsType_mode,
	MinItemsType,
	MinItemsType_mode,
	unique_items_mode,
} from '../../../../src/JSONSchema/Array/types.ts';

import type {
	Type,
} from '../../../../src/JSONSchema/Type.ts';

import {
	PositiveIntegerOrZero,
} from '../../../../src/guarded.ts';

void describe('ArrayWith$defs', () => {
	void describe('::generate_typescript_type()', () => {
		type DataSet<
			T1 extends TypeNode = TypeNode,
			T2 extends (
				| TupleTypeNode<T1, [T1, ...T1[]]>
				| ArrayTypeNode<T1>
			) = (
				| TupleTypeNode<T1, [T1, ...T1[]]>
				| ArrayTypeNode<T1>
			),
			MinItems_mode extends MinItemsType_mode = MinItemsType_mode,
			MaxItems_mode extends MaxItemsType_mode = MaxItemsType_mode,
			ArrayMode extends array_mode = array_mode,
			UniqueItems_mode extends unique_items_mode = unique_items_mode,
			Defs extends SchemaObject = SchemaObject,
			MinItems extends MinItemsType = MinItemsType,
			MaxItems extends MaxItemsType = MaxItemsType,
			Items extends (
				ItemsType_by_mode<ArrayMode>
			) = (
				ItemsType_by_mode<ArrayMode>
			),
			PrefixItems extends (
				[SchemaObject, ...SchemaObject[]]
			) = (
				[SchemaObject, ...SchemaObject[]]
			),
		> = [
			MinItems_mode,
			MaxItems_mode,
			ArrayMode,
			UniqueItems_mode,
			unknown[], // input
			array_type<
				'with',
				ArrayMode,
				MinItems_mode,
				MaxItems_mode,
				UniqueItems_mode
			>,
			ArrayWith$defs_options<
				ArrayMode,
				MinItems_mode,
				MaxItems_mode,
				UniqueItems_mode,
				Defs,
				MinItems,
				MaxItems,
				Items,
				PrefixItems
			>,
			ts_asserter<T2>, // expectation asserter
			boolean, // will or won't fail on default
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
					$defs: {},
					type: 'array',
					items: {
						type: 'string',
					},
					minItems: PositiveIntegerOrZero(2),
				},
				{
					$defs: {},
					minItems: PositiveIntegerOrZero(2),
					minItems_mode: 'with',
					maxItems_mode: 'without',
					array_mode: 'items-only',
					items: {},
					uniqueItems_mode: 'no',
				},
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
				true,
			],
		];

		data_sets.forEach(([
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			minItems_mode,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			maxItems_mode,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			array_mode,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			unique_items_mode,
			data,
			schema,
			ctor_args,
			expectation_asserter,
			will_fail_on_default,
		], i) => {
			type InferredType<
				T2 extends TypeNode,
				T3 extends [T2, ...T2[]],
			> = ArrayWith$defs<
				typeof data,
				T2,
				T3,
				typeof array_mode,
				typeof minItems_mode,
				typeof maxItems_mode,
				typeof unique_items_mode,
				SchemaObject,
				MinItemsType,
				MaxItemsType,
				ItemsType_by_mode<typeof array_mode>,
				[SchemaObject, ...SchemaObject[]]
			>;

			const ajv = new Ajv({strict: false});

			async function do_test<
				T2 extends TypeNode,
				T3 extends [T2, ...T2[]],
			>(
				instance: InferredType<T2, T3>,
				schema_parser: SchemaParser,
			) {
				assert.ok(
					instance.check_type(data),
					`ArrayWith$defs::check_type(data_set[${i}][0]) failed`,
				);
				const generated = await instance.generate_typescript_type({
					data,
					schema: schema as array_type<
						'with',
						array_mode,
						'optional',
						'optional',
						unique_items_mode,
						SchemaObject,
						MinItemsType,
						MaxItemsType
					>,
					schema_parser,
				});
				assert.doesNotThrow(() => expectation_asserter(
					generated,
					`Did not pass asserter on data_set[${i}]`,
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
			}

			void it(`behaves with data_sets[${i}] directly`, async () => {
				const instance = new ArrayWith$defs(ctor_args, {ajv});

				assert.ok(
					instance.check_schema(schema),
					`ArrayWith$defs::check_schema(data_set[${i}][1]) failed`,
				);

				await do_test(instance, new SchemaParser({ajv}));
			})

			void it(`behaves with data_sets[${i}] from parser`, async () => {
				const schema_parser = new SchemaParser({ajv});
				if (will_fail_on_default) {
					const manual = new ArrayWith$defs(ctor_args, {ajv});

					assert.throws(() => schema_parser.parse(schema));
					schema_parser.types.push(manual);
				}
				const instance = schema_parser.parse(schema);

				assert.ok(
					instance.check_schema(schema),
					`ArrayWith$defs::check_schema(data_set[${i}][1]) failed`,
				);

				is_instanceof<
					InferredType<TypeNode, [TypeNode, ...TypeNode[]]>
				>(
					instance,
					ArrayWith$defs,
				);

				await do_test(instance, schema_parser);
			})
		});
	});
})
