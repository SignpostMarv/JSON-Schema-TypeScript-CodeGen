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
} from '@satisfactory-dev/custom-assert';

import {
	isObjectLiteralExpression,
	isPropertyAssignment,
	SyntaxKind,
	factory as ts_factory,
} from 'typescript';

import type {
	SchemaObject,
} from '../../../src/types.ts';
import {
	Type,
} from '../../../src/JSONSchema/Type.ts';

import {
	ConstString,
	EnumString,
	NonEmptyString,
	PatternString,
	String,
} from '../../../src/JSONSchema/String.ts';

import {
	coerce_factory,
} from '../../../src/typescript/coercions.ts';

void describe('Type', () => {
	const factory = coerce_factory(ts_factory);
	const ts = {
		factory,
		SyntaxKind,
		isObjectLiteralExpression,
		isPropertyAssignment,
	};

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
				(ajv: Ajv) => new String({ajv, ts}),
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
				(ajv: Ajv) => new String({ajv, ts}),
			],
			[
				{
					type: 'string',
				},
				false,
				(ajv: Ajv) => new String({ajv, ts}),
			],
			[
				{
					type: 'string',
					minLength: 1,
				},
				false,
				(ajv: Ajv) => new NonEmptyString({ajv, ts}),
			],
			[
				{
					type: 'string',
					const: 'foo',
				},
				false,
				(ajv: Ajv) => new ConstString(undefined, {ajv, ts}),
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
				(ajv: Ajv) => new EnumString([], {ajv, ts}),
			],
			[
				{
					type: 'string',
					pattern: '.+',
				},
				false,
				(ajv: Ajv) => new PatternString(undefined, {ajv, ts}),
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
