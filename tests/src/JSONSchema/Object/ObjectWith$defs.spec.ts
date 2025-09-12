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
	object_properties_mode,
	ObjectMaybeHas$defs_TypeDefinition,
} from '../../../../src/JSONSchema/Object.ts';
import {
	ObjectWith$defs,
} from '../../../../src/JSONSchema/Object.ts';

import type {
	ObjectOfSchemas,
	TypeDefinitionSchema,
} from '../../../../src/JSONSchema/Type.ts';

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
});
