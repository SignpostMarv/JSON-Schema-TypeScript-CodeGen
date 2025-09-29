import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import {
	SyntaxKind,
} from 'typescript';

import ts_assert from '@signpostmarv/ts-assert';

import type {
	enum_string_type,
} from '../../../../src/JSONSchema/String.ts';
import {
	EnumString,
} from '../../../../src/JSONSchema/String.ts';

import type {
	ts_asserter,
} from '../../../types.ts';

void describe('EnumString', () => {
	void describe('::check_type()', () => {
		type DataSet = [
			enum_string_type<[string, string, ...string[]]>,
			[[string, boolean], ...[string, boolean][]],
		];

		const data_sets: [DataSet, ...DataSet[]] = [
			[
				{
					type: 'string',
					enum: ['foo', 'bar'],
				},
				[
					['foo', true],
					['bar', true],
					['baz', false],
				],
			],
		];

		data_sets.forEach(([
			type_schema,
			args,
		], i) => {
			args.forEach(([
				value,
				pass_or_fail,
			], j) => {
				const ajv = new Ajv({strict: true});
				const a = new EnumString(type_schema.enum, {ajv});
				const b = new EnumString([], {ajv});

				void it(
					`${
						pass_or_fail
							? 'passes'
							: 'fails'
					} with data_sets[${
						i
					}][1][${
						j
					}]`,
					pass_or_fail
						? () => {
							assert.ok(a.check_type(value));
							assert.ok(b.check_type(value));
						}
						: () => {
							assert.ok(!a.check_type(value));
							assert.ok(b.check_type(value));
						},
				);
			});
		});
	});

	void describe('::generate_typescript_type()', () => {
		type DataSet = [
			enum_string_type,
			ts_asserter<Awaited<
				ReturnType<EnumString['generate_typescript_type']>
			>>,
		];

		const data_sets: [DataSet, ...DataSet[]] = [
			[
				{
					type: 'string',
					enum: ['foo', 'bar'],
				},
				ts_assert.isUnionTypeNode,
			],
			[
				{
					type: 'string',
				},
				(value) => {
					ts_assert.isTokenWithExpectedKind(
						value,
						SyntaxKind.StringKeyword,
					);
				},
			],
		];

		data_sets.forEach(([
			type_schema,
			asserter,
		], i) => {
			const ajv = new Ajv({strict: true});
			const instance = new EnumString(
				'enum' in type_schema ? type_schema.enum : [],
				{ajv},
			);

			void it(`behaves with data_sets[${i}]`, async () => {
				const promise = instance.generate_typescript_type({
					schema: type_schema,
				});

				await assert.doesNotReject(() => promise);

				const result = await promise;

				assert.doesNotThrow(() => asserter(result));
			});
		});
	});
});
