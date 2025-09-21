import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import type {
	$defs_mode,
} from '../../../../src/JSONSchema/types.ts';
import type {
	array_mode,
	array_schema,
	MaxItemsType_mode,
	MinItemsType_mode,
	unique_items_mode,
} from '../../../../src/JSONSchema/Array/types.ts';
import {
	ArrayUnspecified,
} from '../../../../src/JSONSchema/Array.ts';

void describe('ArrayUncertain', () => {
	void describe('::generate_default_schema_definition()', () => {
		type DataSet<
			DefsMode extends $defs_mode = $defs_mode,
			ArrayMode extends array_mode = array_mode,
			MinItems_mode extends MinItemsType_mode = MinItemsType_mode,
			MaxItems_mode extends MaxItemsType_mode = MaxItemsType_mode,
			UniqueItems_mode extends unique_items_mode = unique_items_mode,
		> = [
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode,
			array_schema<
				DefsMode,
				ArrayMode,
				MinItems_mode,
				MaxItems_mode,
				UniqueItems_mode
			>,
		];

		const data_sets:[DataSet, ...DataSet[]] = [
			[
				'without',
				'items-only',
				'without',
				'without',
				'no',
				{
					type: 'object',
					required: ['type', 'items'],
					additionalProperties: false,
					properties: {
						type: {type: 'string', const: 'array'},
						items: {type: 'object', minProperties: 1},
					},
				},
			],
			[
				'with',
				'items-only',
				'without',
				'without',
				'no',
				{
					type: 'object',
					required: ['$defs', 'type', 'items'],
					additionalProperties: false,
					properties: {
						$defs: {
							type: 'object',
							additionalProperties: {
								type: 'object',
							},
						},
						type: {type: 'string', const: 'array'},
						items: {type: 'object', minProperties: 1},
					},
				},
			],
			[
				'without',
				'both',
				'without',
				'without',
				'no',
				{
					type: 'object',
					required: ['type', 'items', 'prefixItems'],
					additionalProperties: false,
					properties: {
						type: {type: 'string', const: 'array'},
						items: {type: 'object', minProperties: 1},
						prefixItems: {
							type: 'array',
							items: {
								type: 'object',
								minProperties: 1,
							},
							minItems: 1,
						},
					},
				},
			],
			[
				'without',
				'prefix-only',
				'without',
				'without',
				'no',
				{
					type: 'object',
					required: ['type', 'items', 'prefixItems'],
					additionalProperties: false,
					properties: {
						type: {type: 'string', const: 'array'},
						items: {type: 'boolean', const: false},
						prefixItems: {
							type: 'array',
							items: {
								type: 'object',
								minProperties: 1,
							},
							minItems: 1,
						},
					},
				},
			],
			[
				'without',
				'items-only',
				'with',
				'without',
				'no',
				{
					type: 'object',
					required: ['type', 'items', 'minItems'],
					additionalProperties: false,
					properties: {
						type: {type: 'string', const: 'array'},
						items: {type: 'object', minProperties: 1},
						minItems: {
							type: 'integer',
							minimum: 0,
						},
					},
				},
			],
			[
				'without',
				'items-only',
				'optional',
				'without',
				'no',
				{
					type: 'object',
					required: ['type', 'items'],
					additionalProperties: false,
					properties: {
						type: {type: 'string', const: 'array'},
						items: {type: 'object', minProperties: 1},
						minItems: {
							type: 'integer',
							minimum: 0,
						},
					},
				},
			],
			[
				'without',
				'items-only',
				'without',
				'with',
				'no',
				{
					type: 'object',
					required: ['type', 'items', 'maxItems'],
					additionalProperties: false,
					properties: {
						type: {type: 'string', const: 'array'},
						items: {type: 'object', minProperties: 1},
						maxItems: {
							type: 'integer',
							minimum: 1,
						},
					},
				},
			],
			[
				'without',
				'items-only',
				'without',
				'optional',
				'no',
				{
					type: 'object',
					required: ['type', 'items'],
					additionalProperties: false,
					properties: {
						type: {type: 'string', const: 'array'},
						items: {type: 'object', minProperties: 1},
						maxItems: {
							type: 'integer',
							minimum: 1,
						},
					},
				},
			],
			[
				'with',
				'both',
				'with',
				'with',
				'yes',
				{
					type: 'object',
					required: [
						'$defs',
						'type',
						'items',
						'prefixItems',
						'minItems',
						'maxItems',
						'uniqueItems',
					],
					additionalProperties: false,
					properties: {
						$defs: {
							type: 'object',
							additionalProperties: {
								type: 'object',
							},
						},
						type: {type: 'string', const: 'array'},
						items: {type: 'object', minProperties: 1},
						prefixItems: {
							type: 'array',
							items: {
								type: 'object',
								minProperties: 1,
							},
							minItems: 1,
						},
						minItems: {
							type: 'integer',
							minimum: 0,
						},
						maxItems: {
							type: 'integer',
							minimum: 1,
						},
						uniqueItems: {
							type: 'boolean',
							const: true,
						},
					},
				},
			],
		];

		data_sets.forEach(([
			$defs_mode,
			array_mode,
			minItems_mode,
			maxItems_mode,
			uniqueItems_mode,
			expectation,
		], i) => {
			void it(`behaves as expected with data_sets[${i}]`, () => {
				const result = ArrayUnspecified
					.generate_default_schema_definition({
						$defs_mode,
						array_mode,
						minItems_mode,
						maxItems_mode,
						uniqueItems_mode,
					});

				assert.deepEqual(result, expectation);
			})
		})
	})
})
