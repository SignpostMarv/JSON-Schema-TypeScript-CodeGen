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

import {
	ObjectWith$defs,
} from '../../../../src/JSONSchema/Object.ts';

import {
	VerboseMatchError,
} from '../../../../src/JSONSchema/Type.ts';

void describe('ObjectWith$defs', () => {
	void describe('.matches()', () => {
		const matches_expectations: (
			| [
				SchemaObject,
				boolean,
			]
			| [
				SchemaObject,
				boolean,
				'both'|'properties'|'patternProperties',
			]
		)[] = [
			[
				{type: 'string'},
				false,
			],
			[
				{type: 'object'},
				false,
			],
			[
				{
					type: 'object',
					$defs: {
						foo: {
							type: 'string',
						},
					},
				},
				false,
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
						foo: {
							$ref: '#/$defs/foo',
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
				false,
				'properties',
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
						type: {
							type: 'string',
							const: 'object',
						},
					},
					patternProperties: {
						type: {
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
					type: 'object',
					$defs: {
						foo: {
							type: 'string',
						},
					},
					patternProperties: {
						type: {
							type: 'string',
							const: 'object',
						},
					},
				},
				true,
				'patternProperties',
			],
		];

		matches_expectations.forEach(([
			schema,
			expectation,
			mode,
		], i) => {
			const ajv = new Ajv({strict: true});
			mode = mode || 'both';

			const instance:ObjectWith$defs<
				typeof mode,
				{[key: string]: unknown}
			> = new ObjectWith$defs<
				typeof mode,
				{[key: string]: unknown}
			>(
				{ajv},
				{mode: mode || 'both'},
			);

			void it(`behaves as expected with matches_expectations[${i}]`, () => {
				try {
					instance.must_match(schema, true);
					if (!expectation) {
						assert.fail('matched unexpectedly!');
					}
				} catch (err) {
					if (expectation) {
						if (err instanceof VerboseMatchError) {
							console.error(err.ajv_errors, schema);
						}
						assert.fail(err instanceof Error ? err : `Unexpected failure`);
					} else {
						assert.ok(false === expectation);
					}
				}
			});
		});
	})
});
