import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import type {
	SchemaObject,
} from 'ajv';

import type {
	$defs_mode,
} from '../../../../src/JSONSchema/types.ts';

import {
	ObjectHelper,
} from '../../../../src/JSONSchema/Object.ts';

import type {
	ObjectOfSchemas,
} from '../../../../src/JSONSchema/Type.ts';

import {
	SchemaParser,
} from '../../../../src/SchemaParser.ts';

void describe('ObjectHelper', () => {
	void describe('.convert()', () => {
		void it ('fails', () => {
			assert.throws(() => {
				ObjectHelper.convert(
					{
						foo: 'bar',
					},
					'bar',
					{
						type: 'object',
						required: ['bar'],
						properties: {
							bar: {
								type: 'string',
							},
						},
					},
					new SchemaParser({ajv_options: {}}),
				)
			})
			assert.throws(() => {
				ObjectHelper.convert(
					{
						bar: 'bar',
					},
					'bar',
					{
						type: 'object',
						required: ['bar'],
						patternProperties: {
							'^bar\\d+$': {
								type: 'string',
							},
						},
					},
					new SchemaParser({ajv_options: {}}),
				)
			})
		})
	})
	void describe('.guess_schema()', () => {
		type ExpectationDataSet<
			DefsMode extends $defs_mode,
		> = [
			DefsMode,
			{[key: string]: unknown}, // input
			( // expectation
				DefsMode extends 'with'
					? ({$defs: ObjectOfSchemas} & SchemaObject)
					: Omit<SchemaObject, '$defs'>
			)
		]
		const expectations: ExpectationDataSet<$defs_mode>[] = [
			[
				'with',
				{},
				{
					type: 'object',
					$defs: {},
					properties: {},
				},
			],
			[
				'without',
				{},
				{
					type: 'object',
					properties: {},
				},
			],
			[
				'with',
				{
					foo: 'bar',
				},
				{
					type: 'object',
					$defs: {},
					required: ['foo'],
					properties: {
						foo: {
							type: 'string',
							const: 'bar',
						},
					},
				},
			],
			[
				'without',
				{
					foo: 'bar',
				},
				{
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'string',
							const: 'bar',
						},
					},
				},
			],
			[
				'with',
				{
					foo: 1,
				},
				{
					type: 'object',
					$defs: {},
					required: ['foo'],
					properties: {
						foo: {
							type: 'number',
							const: 1,
						},
					},
				},
			],
			[
				'without',
				{
					foo: 1,
				},
				{
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'number',
							const: 1,
						},
					},
				},
			],
			[
				'with',
				{
					foo: {
						bar: 'baz',
					},
				},
				{
					type: 'object',
					$defs: {},
					required: ['foo'],
					properties: {
						foo: {
							type: 'object',
							required: ['bar'],
							properties: {
								bar: {
									type: 'string',
									const: 'baz',
								},
							},
						},
					},
				},
			],
			[
				'without',
				{
					foo: {
						bar: 'baz',
					},
				},
				{
					type: 'object',
					required: ['foo'],
					properties: {
						foo: {
							type: 'object',
							required: ['bar'],
							properties: {
								bar: {
									type: 'string',
									const: 'baz',
								},
							},
						},
					},
				},
			],
		];

		expectations.forEach(([
			defs_mode,
			input,
			expectation,
		], i) => {
			void it(`behaves with expectations[${i}]`, () => {
				assert.deepEqual(
					ObjectHelper.guess_schema(input, defs_mode),
					expectation,
				);
			})
		})

		void it('fails when expected', () => {
			assert.throws(() => ObjectHelper.guess_schema(
				{foo: undefined},
				'with',
			))
		});
	})
});
