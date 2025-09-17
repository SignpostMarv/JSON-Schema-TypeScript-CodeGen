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
	array_type,
	ItemsType_by_mode,
	MinItemsType_mode,
	PrefixItemsType_by_mode,
} from '../../../../src/JSONSchema/Array/types.ts';

import type {
	$defs_mode,
} from '../../../../src/JSONSchema/types.ts';

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
			ArrayMode extends array_mode = array_mode,
		> = [
			unknown[], // input
			array_type<
				DefsMode,
				MinItems,
				ArrayMode
			>,
			ArrayUnspecified_options<
				ArrayMode,
				ItemsType_by_mode[ArrayMode],
				PrefixItemsType_by_mode[ArrayMode]
			>,
			ts_asserter<T2>, // expectation asserter
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
					minItems: 2,
				},
				{
					minItems: 2,
					array_mode: 'items-only',
					items: {},
					prefixItems: undefined,
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
					minItems: 2,
					items: false,
				},
				{
					array_mode: 'prefix-only',
					minItems: 2,
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
			],
		];

		data_sets.forEach(([
			data,
			schema,
			ctor_args,
			expectation_asserter,
		], i) => {
			const ajv = new Ajv({strict: false});

			async function do_test(
				instance: ArrayUnspecified<
					typeof data,
					array_mode
				>,
			) {
				assert.ok(
					instance.check_type(data),
					`ArrayUnspecified::check_type(data_set[${i}][0]) failed`,
				);
				const generated = await instance.generate_typescript_type({
					data,
					schema,
					schema_parser: new SchemaParser({ajv}),
				});
				assert.doesNotThrow(() => expectation_asserter(
					generated,
					`Did not pass asserter on data_set[${i}]`,
				));
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

				await do_test(instance);
			})

			void it(`behaves with data_sets[${i}] from parser`, async () => {
				const manual = new ArrayUnspecified<
					typeof data,
					array_mode
				>(ctor_args, {ajv});
				const schema_parser = new SchemaParser({ajv});
				schema_parser.types.push(manual);
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

				await do_test(instance);
			})
		})
	});
})
