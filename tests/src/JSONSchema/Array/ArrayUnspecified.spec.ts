import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

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
	ArrayUnspecified_options,
} from '../../../../src/JSONSchema/Array.ts';
import {
	ArrayUnspecified,
} from '../../../../src/JSONSchema/Array.ts';

import type {
	array_mode,
	array_type_alt,
	ItemsType_by_mode,
	MaxItemsType_by_mode,
	MaxItemsType_mode,
	MinItemsType_by_mode,
	MinItemsType_mode,
	PrefixItemsType_by_mode,
	unique_items_mode,
} from '../../../../src/JSONSchema/Array/types.ts';

import type {
	$defs_mode,
} from '../../../../src/JSONSchema/types.ts';
import type {
	Type,
} from '../../../../src/JSONSchema/Type.ts';

import {
	PositiveIntegerOrZero,
} from '../../../../src/guarded.ts';

void describe('ArrayUnspecified', () => {
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
			DefsMode extends $defs_mode = $defs_mode,
			MinItems extends MinItemsType_mode = MinItemsType_mode,
			MaxItems extends MaxItemsType_mode = MaxItemsType_mode,
			ArrayMode extends array_mode = array_mode,
			UniqueItems_mode extends unique_items_mode = unique_items_mode,
		> = [
			unknown[], // input
			array_type_alt<
				DefsMode,
				ArrayMode,
				MinItems,
				MaxItems,
				UniqueItems_mode
			>,
			ArrayUnspecified_options<
				ArrayMode,
				ItemsType_by_mode[ArrayMode],
				PrefixItemsType_by_mode[ArrayMode],
				UniqueItems_mode
			>,
			ts_asserter<T2>, // expectation asserter
			boolean, // will or won't fail on default
		];

		const data_sets:[
			DataSet,
			...DataSet[]
		] = [
			[
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
				},
				{
					minItems: PositiveIntegerOrZero(2),
					array_mode: 'items-only',
					items: {},
					prefixItems: undefined,
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
				false,
			],
			[
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
				true,
			],
		];

		data_sets.forEach(([
			data,
			schema,
			ctor_args,
			expectation_asserter,
			will_fail_on_default,
		], i) => {
			const ajv = new Ajv({strict: false});

			async function do_test(
				instance: ArrayUnspecified<
					typeof data,
					array_mode
				>,
				schema_parser: SchemaParser,
			) {
				assert.ok(
					instance.check_type(data),
					`ArrayUnspecified::check_type(data_set[${i}][0]) failed`,
				);
				const generated = await instance.generate_typescript_type({
					data,
					schema: schema as array_type_alt<
						'without',
						array_mode,
						'optional',
						'optional',
						unique_items_mode,
						undefined,
						MinItemsType_by_mode['optional'],
						MaxItemsType_by_mode['optional']
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
				const instance = new ArrayUnspecified<
					typeof data,
					array_mode
				>(ctor_args, {ajv});

				assert.ok(
					instance.check_schema(schema),
					`ArrayUnspecified::check_schema(data_set[${i}][1]) failed`,
				);

				await do_test(instance, new SchemaParser({ajv}));
			})

			void it(`behaves with data_sets[${i}] from parser`, async () => {
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

				await do_test(instance, schema_parser);
			})
		})
	});
})
