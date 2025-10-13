import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	not_undefined,
// eslint-disable-next-line imports/no-unresolved
} from '@satisfactory-dev/custom-assert';

import type {
	SchemaObject,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../src/types.ts';
import {
	Type,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../src/JSONSchema/Type.ts';

void describe('Type', () => {
	void describe('::maybe_add_$defs()', () => {
		type DataSet = [
			SchemaObject,
			boolean,
		];

		const data_sets: [DataSet, ...DataSet[]] = [
			[
				{
					$ref: '#/$defs/foo',
				},
				true,
			],
			[
				{
					$ref: '#/$defs/bar',
				},
				true,
			],
			[
				{
					$defs: {
						foo: {
							type: 'string',
						},
					},
					$ref: '#/$defs/foo',
				},
				false,
			],
			[
				{
					$defs: {
						foo: {
							type: 'number',
						},
					},
					$ref: '#/$defs/foo',
				},
				false,
			],
			[
				{
					type: 'string',
				},
				false,
			],
			[
				{
					type: 'string',
					minLength: 1,
				},
				false,
			],
			[
				{
					type: 'string',
					const: 'foo',
				},
				false,
			],
			[
				{
					type: 'string',
					enum: [
						'foo',
						'bar',
					],
				},
				false,
			],
			[
				{
					type: 'string',
					pattern: '.+',
				},
				false,
			],
			[
				{
					type: 'string',
					foo: {
						$ref: '#/$defs/foo',
					},
				},
				true,
			],
		];

		data_sets.forEach(([
			sub_schema,
			added,
		], i) => {
			void it(`behaves with data_sets[${i}]`, () => {
				const schema = {
					$defs: {
						foo: {
							type: 'string',
						},
					},
				};

				const result = Type.maybe_add_$defs(schema, sub_schema);

				if (added) {
					not_undefined(schema.$defs);
				}

				const expectation = added
					? {
						$defs: schema.$defs,
						...sub_schema,
					}
					: sub_schema;

				assert.deepEqual(result, expectation);
			});
		});
	});
});
