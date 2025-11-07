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

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import type {
	ts_asserter,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';

import type {
	pattern_string_type,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../../index.ts';
import {
	PatternString,
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../../index.ts';

void describe('PatternString', () => {
	void describe('::check_type()', () => {
		type DataSet = [
			pattern_string_type<string>,
			[[string, boolean], ...[string, boolean][]],
		];

		const data_sets: [DataSet, ...DataSet[]] = [
			[
				{
					type: 'string',
					pattern: '[^z]$',
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
				const a = new PatternString(type_schema.pattern, {ajv});
				const b = new PatternString(undefined, {ajv});

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
			pattern_string_type<string|undefined>,
			ts_asserter<Awaited<
				ReturnType<PatternString['generate_typescript_type']>
			>>,
		];

		const data_sets: [DataSet, ...DataSet[]] = [
			[
				{
					type: 'string',
					pattern: '[^z]$',
				},
				ts_assert.isTypeReferenceNode,
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
			const instance = new PatternString(
				'pattern' in type_schema ? type_schema.pattern : undefined,
				{ajv},
			);

			void it(`behaves with data_sets[${i}]`, async () => {
				const promise = instance.generate_typescript_type({
					schema: type_schema,
					schema_parser: new SchemaParser({ajv}),
				});

				await assert.doesNotReject(() => promise);

				const result = await promise;

				assert.doesNotThrow(() => asserter(result));

				const value = 'pattern' in type_schema
					? type_schema.pattern
					: '.*';

				const data = instance.generate_typescript_data(
					value,
					new SchemaParser({ajv}),
					type_schema,
				);

				if (!('pattern' in type_schema)) {
					ts_assert.isStringLiteral(data);
					assert.equal(data.text, value);
				} else {
					ts_assert.isCallExpression(data);
					assert.equal(data.arguments.length, 2);
					ts_assert.isStringLiteral(data.arguments[1]);
					assert.equal(data.arguments[1].text, value);
				}
			});
		});
	});
});
