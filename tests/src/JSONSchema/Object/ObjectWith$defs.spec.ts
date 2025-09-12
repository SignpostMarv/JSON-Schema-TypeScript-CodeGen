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
} from 'typescript';

import {
	is_instanceof,
	not_undefined,
} from '@satisfactory-dev/custom-assert';

import ts_assert from '@signpostmarv/ts-assert';

import type {
	object_properties_mode,
	ObjectMaybeHas$defs_TypeDefinition,
} from '../../../../src/JSONSchema/Object.ts';
import {
	ObjectHelper,
	ObjectWith$defs,
} from '../../../../src/JSONSchema/Object.ts';

import type {
	ObjectOfSchemas,
	TypeDefinitionSchema,
} from '../../../../src/JSONSchema/Type.ts';

import {
	SchemaParser,
} from '../../../../src/SchemaParser.ts';

import {
	object_keys,
} from '../../../../src/coercions.ts';

import {
	bool_throw,
} from '../../../assertions.ts';

void describe('ObjectWith$defs', () => {
	void describe('.check_schema()', () => {
		type ExpectationDataSet<
			PropertiesMode extends object_properties_mode,
		> = [
			ObjectMaybeHas$defs_TypeDefinition<
				PropertiesMode,
				'with',
				ObjectOfSchemas
			>,
			PropertiesMode,
			TypeDefinitionSchema,
			boolean,
		];

		const expectations:(
			| ExpectationDataSet<'both'>
			| ExpectationDataSet<'properties'>
			| ExpectationDataSet<'patternProperties'>
		)[] = [
			[
				{
					$defs: {},
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'string',
							const: 'foo',
						},
					},
				},
				'properties',
				{
					$defs: {},
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'string',
							const: 'foo',
						},
					},
				},
				true,
			],
			[
				{
					$defs: {},
					type: 'object',
					properties: {
						foo: {
							type: 'string',
							const: 'foo',
						},
					},
				},
				'properties',
				{
					$defs: {},
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'string',
							const: 'foo',
						},
					},
				},
				true,
			],
			[
				{
					$defs: {},
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'string',
							const: 'foo',
						},
					},
				},
				'properties',
				{
					$defs: {},
					type: 'object',
					properties: {
						foo: {
							type: 'string',
							const: 'foo',
						},
					},
				},
				true,
			],
			[
				{
					$defs: {},
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'string',
							const: 'foo',
						},
					},
				},
				'properties',
				{
					$defs: {},
					type: 'object',
					patternProperties: {
						'.+': {
							type: 'string',
							const: 'foo',
						},
					},
				},
				false,
			],
			[
				{
					$defs: {},
					type: 'object',
					properties: {
					},
				},
				'properties',
				{
					$defs: {},
					type: 'object',
					properties: {
						foo: {
							type: 'string',
							const: 'foo',
						},
					},
				},
				true,
			],
		];
		expectations.forEach(([
			type_definition,
			properties_mode,
			test_schema,
			expectation,
		], i) => {
			const ajv = new Ajv({strict: true});

			void it(`behaves as expected with matches_expectations[${i}]`, () => {
				const instance:ObjectWith$defs<
					typeof properties_mode
				> = new ObjectWith$defs<typeof properties_mode>(
					{
						properties_mode,
					},
					{
						ajv,
						type_definition: Object.freeze<
							ExpectationDataSet<typeof properties_mode>[0]
						>(
							type_definition,
						),
					},
				);
				assert.equal(expectation, instance.check_schema(test_schema));
			});
		});
	})

	void describe('.check_type()', () => {
		type ExpectationDataSet = [
			SchemaObject,
			(
				| ObjectMaybeHas$defs_TypeDefinition<
					'both',
					'with',
					ObjectOfSchemas
				>
				| ObjectMaybeHas$defs_TypeDefinition<
					'properties',
					'with',
					ObjectOfSchemas
				>
				| ObjectMaybeHas$defs_TypeDefinition<
					'patternProperties',
					'with',
					ObjectOfSchemas
				>
			),
			boolean,
		];

		const expectations: (
			| ExpectationDataSet
			| [
				...ExpectationDataSet,
				'both'|'properties'|'patternProperties',
			]
		)[] = [
			[
				{
					type: 'object',
					$defs: {
						foo: {
							type: 'string',
						},
					},
					properties: {
						foo: {
							$ref: '#/$defs/foo',
						},
					},
				},
				{
					$defs: {},
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'string',
							const: 'foo',
						},
					},
				},
				false,
				'both',
			],
			[
				{
					type: 'object',
					$defs: {
						foo: {
							type: 'string',
						},
					},
					properties: {
						properties: {
							type: 'object',
							properties: {
								foo: {
									$ref: '#/$defs/foo',
								},
							},
						},
					},
				},
				{
					$defs: {},
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'string',
							const: 'foo',
						},
					},
				},
				false,
				'patternProperties',
			],
			[
				{
					type: 'object',
					$defs: {
						foo: {
							type: 'string',
						},
					},
					properties: {
						patternProperties: {
							type: 'object',
							properties: {
								foo: {
									$ref: '#/$defs/foo',
								},
							},
						},
					},
				},
				{
					$defs: {},
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'string',
							const: 'foo',
						},
					},
				},
				false,
				'properties',
			],
			[
				{
					type: 'object',
					a1: 'object',
				},
				{
					type: 'object',
					$defs: {
						foo: {
							type: 'string',
						},
					},
					properties: {
						type: {
							type: 'string',
							const: 'object',
						},
					},
					patternProperties: {
						'a\\d+': {
							type: 'string',
							const: 'object',
						},
					},
				},
				true,
				'both',
			],
			[
				{
					a1: 'object',
				},
				{
					type: 'object',
					$defs: {
						foo: {
							type: 'string',
						},
					},
					patternProperties: {
						'^a\\d+': {
							type: 'string',
							const: 'object',
						},
					},
				},
				true,
				'patternProperties',
			],
			[
				{
					a1: 'object',
				},
				{
					$defs: {},
					type: 'object',
					properties: {
					},
				},
				true,
				'properties',
			],
		];

		expectations.forEach(([
			data,
			type_definition,
			expectation,
			properties_mode,
		], i) => {
			const ajv = new Ajv({strict: true});
			properties_mode = properties_mode || 'both';

			void it(`behaves as expected with matches_expectations[${i}]`, () => {
				const instance:ObjectWith$defs<
					typeof properties_mode
				> = new ObjectWith$defs<typeof properties_mode>(
					{
						properties_mode,
					},
					{
						ajv,
						type_definition: Object.freeze<
							ExpectationDataSet[1]
						>(
							type_definition,
						),
					},
				);
				assert.equal(expectation, instance.check_type(data));
			});
		});
	})

	void describe('.generate_typescript_data()', () => {
		type ExpectationDataSet<
			PropertiesMode extends object_properties_mode,
			Schema extends (
				| undefined
				| ObjectMaybeHas$defs_TypeDefinition<
					PropertiesMode,
					'with',
					ObjectOfSchemas
				>
			) = (
				| undefined
				| ObjectMaybeHas$defs_TypeDefinition<
					PropertiesMode,
					'with',
					ObjectOfSchemas
				>
			),
		> = [
			{[key: string]: unknown},
			Schema,
			PropertiesMode,
			Schema extends undefined ? boolean : false, // guess schema
			[
				string,
				<
					T extends Node,
				>(
					value:Node,
					message:string|Error
				) => asserts value is T,
			][],
		];

		const expectations:(
			| ExpectationDataSet<'both'>
			| ExpectationDataSet<'properties'>
			| ExpectationDataSet<'patternProperties'>
		)[] = [
			[
				{},
				undefined,
				'both',
				false,
				[],
			],
			[
				{
					foo: 'bar',
				},
				undefined,
				'both',
				true,
				[
					['foo', ts_assert.isStringLiteral],
				],
			],
			[
				{
					foo: 'bar',
				},
				{
					$defs: {},
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'string',
						},
					},
					patternProperties: {},
				},
				'both',
				false,
				[
					['foo', ts_assert.isStringLiteral],
				],
			],
		];

		function* padded(): Generator<[
			...ExpectationDataSet<object_properties_mode>,
			number,
		]> {
			let i = 0;
			for (const data_set of expectations) {
				yield [
					...data_set,
					i,
				];
				++i;
			}
		}

		for (const [
			input,
			type_definition,
			properties_mode,
			guess_schema,
			expected_properties,
			index,
		] of padded()) {
			void it(
				`behaves as expected with expecations[${
					index
				}]`,
				() => {
					const ajv = new Ajv({strict: true});
					const parser = new SchemaParser({ajv});
					const schema = (
						(
							guess_schema
								? ObjectHelper.guess_schema(input, 'with')
								: type_definition
						)
						|| ObjectWith$defs.generate_default_type_definition(
							properties_mode,
						)
					);
					const instance = new ObjectWith$defs({properties_mode}, {
						ajv,
						type_definition,
					});

					is_instanceof(instance, ObjectWith$defs);

					const generated = (
						instance as unknown as ObjectWith$defs<
							typeof properties_mode
						>
					).generate_typescript_data(
						input,
						parser,
						schema,
					);

					ts_assert.isObjectLiteralExpression(generated);

					const input_keys = object_keys(input);

					assert.equal(
						generated.properties.length,
						input_keys.length,
					);

					assert.ok(generated.properties.every((maybe) => {
						return bool_throw(
							maybe,
							ts_assert.isPropertyAssignment,
						);
					}));

					expected_properties.forEach((
						[expected_name, expected_asserter],
						i,
					) => {
						ts_assert.isPropertyAssignment(
							generated.properties[i],
						);
						not_undefined(generated.properties[i].name);
						ts_assert.isIdentifier(generated.properties[i].name);
						assert.equal(
							generated.properties[i].name.text,
							expected_name,
						);
						// eslint-disable-next-line max-len
						const asserter:typeof expected_asserter = expected_asserter;
						asserter(
							generated.properties[i].initializer,
							'',
						);
					});
				},
			);
		}
	})
});
