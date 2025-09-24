import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import type {
	$defs_mode,
} from '../../../../src/JSONSchema/types.ts';

import type {
	object_properties_mode,
	object_schema,
	required_mode,
} from '../../../../src/JSONSchema/Object.ts';
import {
	generate_default_schema_definition,
} from '../../../../src/JSONSchema/Object.ts';

void describe('ObjectUncertain', () => {
	type DataSet<
		RequiredMode extends required_mode = required_mode,
		PropertiesMode extends object_properties_mode = object_properties_mode,
	> = [
		'optional',
		RequiredMode,
		PropertiesMode,
	];

	const full_schema_properties:Readonly<object_schema<
		'with',
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
		Exclude<$defs_mode, 'optional'>,
		Record<
			Exclude<required_mode, 'optional'>,
			Record<
				object_properties_mode,
				object_schema<
					required_mode,
					object_properties_mode
				>['required']
			>
		>
	> = {
		without: {
			without: {
				neither: ['type'],
				both: ['type', 'properties', 'patternProperties'],
				properties: ['type', 'properties'],
				pattern: ['type', 'patternProperties'],
			},
			with: {
				neither: ['type', 'required'],
				both: ['type', 'required', 'properties', 'patternProperties'],
				properties: ['type', 'required', 'properties'],
				pattern: ['type', 'required', 'patternProperties'],
			},
		},
		with: {
			without: {
				neither: ['type', '$defs'],
				both: ['type', '$defs', 'properties', 'patternProperties'],
				properties: ['type', '$defs', 'properties'],
				pattern: ['type', '$defs', 'patternProperties'],
			},
			with: {
				neither: ['type', '$defs', 'required'],
				both: [
					'type',
					'$defs',
					'required',
					'properties',
					'patternProperties',
				],
				properties: ['type', '$defs', 'required', 'properties'],
				pattern: ['type', '$defs', 'required', 'patternProperties'],
			},
		},
	};

	const property_sets:Readonly<
		Record<
			Exclude<required_mode, 'optional'>,
			Record<
				object_properties_mode,
				object_schema<
					required_mode,
					object_properties_mode
				>['properties']
			>
	>> = {
			without: {
				neither: {
					type: full_schema_properties.type,
					$defs: full_schema_properties.$defs,
				},
				both: {
					type: full_schema_properties.type,
					$defs: full_schema_properties.$defs,
					properties: full_schema_properties.properties,
					patternProperties: (
						full_schema_properties.patternProperties
					),
				},
				properties: {
					type: full_schema_properties.type,
					$defs: full_schema_properties.$defs,
					properties: full_schema_properties.properties,
				},
				pattern: {
					type: full_schema_properties.type,
					$defs: full_schema_properties.$defs,
					patternProperties: (
						full_schema_properties.patternProperties
					),
				},
			},
			with: {
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
			},
	};

	void describe('::generate_default_schema_definition()', () => {
		const data_sets:DataSet[] = [];

		const $defs_modes:[
			'optional',
		] = ['optional'];
		const required_modes:[
			required_mode,
			required_mode,
			required_mode,
		] = ['with', 'without', 'optional'];
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

		for (const $defs_mode of $defs_modes) {
			for (const required_mode of required_modes) {
				for (const properties_mode of properties_modes) {
					data_sets.push([
						$defs_mode,
						required_mode,
						properties_mode,
					]);
				}
			}
		}
		data_sets.forEach(([
			$defs_mode,
			required_mode,
			properties_mode,
		], i) => {
			void it(
				`behaves with data_sets[${
					i
				}] (object_schema<${
					$defs_mode
				}, ${
					required_mode
				}, ${
					properties_mode
				}>)`,
				() => {
					const schema = generate_default_schema_definition({
						$defs_mode,
						required_mode,
						properties_mode,
					});

					const required = expected_require_sets[
						'optional' === $defs_mode
							? 'without'
							: $defs_mode
					][
						'optional' === required_mode
							? 'without'
							: required_mode
					][properties_mode];

					const properties = property_sets[
						'optional' === required_mode
							? 'with'
							: required_mode
					][properties_mode];

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
