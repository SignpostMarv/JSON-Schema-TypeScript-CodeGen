import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

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

import {
	ConstString,
	EnumString,
	NonEmptyString,
	PatternString,
	String,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../src/JSONSchema/String.ts';

void describe('Type', () => {
	void describe('::maybe_add_$defs()', () => {
		type DataSet = (
			| [
				SchemaObject,
				true,
			]
			| [
				SchemaObject,
				false,
				(ajv: Ajv) => Type<unknown>,
			]
		);

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
				(ajv: Ajv) => new String({ajv}),
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
				(ajv: Ajv) => new String({ajv}),
			],
			[
				{
					type: 'string',
				},
				false,
				(ajv: Ajv) => new String({ajv}),
			],
			[
				{
					type: 'string',
					minLength: 1,
				},
				false,
				(ajv: Ajv) => new NonEmptyString({ajv}),
			],
			[
				{
					type: 'string',
					const: 'foo',
				},
				false,
				(ajv: Ajv) => new ConstString(undefined, {ajv}),
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
				(ajv: Ajv) => new EnumString([], {ajv}),
			],
			[
				{
					type: 'string',
					pattern: '.+',
				},
				false,
				(ajv: Ajv) => new PatternString(undefined, {ajv}),
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
			initialise,
		], i) => {
			void it(`behaves with data_sets[${i}]`, () => {
				Type.clear_$defs_excluded_schemas();
				const schema = {
					$defs: {
						foo: {
							type: 'string',
						},
					},
				};

				if (initialise) {
					initialise(new Ajv({strict: true}));
				}

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
