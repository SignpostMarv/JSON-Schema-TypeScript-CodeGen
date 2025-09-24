import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import type {
	object_properties_mode,
	object_schema,
} from '../../../../src/JSONSchema/Object.ts';
import {
	ObjectUnspecified,
} from '../../../../src/JSONSchema/Object.ts';

void describe('ObjectUncertain', () => {
	type DataSet<
		PropertiesMode extends object_properties_mode = object_properties_mode,
	> = [
		PropertiesMode,
	];

	const full_schema_properties:Readonly<object_schema<
		'both'
	>['properties']> = Object.freeze({
		$defs: {
			type: 'object',
			additionalProperties: {
				type: 'object',
			},
		},
		type: {type: 'string', const: 'object'},
		required: {
			type: 'array',
			minItems: 1,
			items: {
				type: 'string',
				minLength: 1,
			},
		},
		properties: {
			type: 'object',
			minProperties: 1,
			additionalProperties: {
				type: 'object',
			},
		},
		patternProperties: {
			type: 'object',
			minProperties: 1,
			additionalProperties: {
				type: 'object',
			},
		},
	});

	const expected_require_sets:Record<
				object_properties_mode,
				object_schema<
					object_properties_mode
				>['required']
	> = {
		neither: ['type'],
		both: ['type', 'properties', 'patternProperties'],
		properties: ['type', 'properties'],
		pattern: ['type', 'patternProperties'],
	};

	const property_sets:Readonly<
		Record<
				object_properties_mode,
				object_schema<
					object_properties_mode
				>['properties']
	>> = {
		neither: {
			type: full_schema_properties.type,
			$defs: full_schema_properties.$defs,
			required: full_schema_properties.required,
		},
		both: {
			type: full_schema_properties.type,
			$defs: full_schema_properties.$defs,
			required: full_schema_properties.required,
			properties: full_schema_properties.properties,
			patternProperties: (
				full_schema_properties.patternProperties
			),
		},
		properties: {
			type: full_schema_properties.type,
			$defs: full_schema_properties.$defs,
			required: full_schema_properties.required,
			properties: full_schema_properties.properties,
		},
		pattern: {
			type: full_schema_properties.type,
			$defs: full_schema_properties.$defs,
			required: full_schema_properties.required,
			patternProperties: (
				full_schema_properties.patternProperties
			),
		},
	};

	void describe('::generate_default_schema_definition()', () => {
		const data_sets:DataSet[] = [];

		const properties_modes: [
			object_properties_mode,
			object_properties_mode,
			object_properties_mode,
			object_properties_mode,
		] = [
			'neither',
			'both',
			'properties',
			'pattern',
		];

		for (const properties_mode of properties_modes) {
			data_sets.push([
				properties_mode,
			]);
		}

		data_sets.forEach(([
			properties_mode,
		], i) => {
			void it(
				`behaves with data_sets[${
					i
				}] (object_schema<${
					properties_mode
				}>)`,
				() => {
					const schema = ObjectUnspecified
						.generate_default_schema_definition({
						properties_mode,
					});

					const required = expected_require_sets[
						properties_mode
					];

					const properties = property_sets[properties_mode];

					const expected_schema = {
						type: 'object',
						required,
						additionalProperties: false,
						properties,
					};

					assert.deepEqual(schema, expected_schema);
				},
			);
		})
	})
});
