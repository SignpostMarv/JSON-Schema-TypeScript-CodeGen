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
} from '../../../types.ts';

import type {
	enum_string_type,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../../index.ts';
import {
	EnumString,
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../../index.ts';

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
			[string, string, ...string[]],
		];

		const data_sets: [DataSet, ...DataSet[]] = [
			[
				{
					type: 'string',
					enum: ['foo', 'bar'],
				},
				ts_assert.isUnionTypeNode,
				['foo', 'bar'],
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
				['foo', 'bar', 'baz', 'bat'],
			],
		];

		function* split_data_sets<
			J extends number,
		>(data_sets: [DataSet, ...DataSet[]]): Generator<[
			DataSet[0],
			DataSet[1],
			DataSet[2][J],
			number,
			J,
		]> {
			let i = 0;
			for (const [
				type_schema,
				asserter,
				data_to_check,
			] of data_sets) {
				let j = 0;

				for (const value of data_to_check) {
					yield [
						type_schema,
						asserter,
						value,
						i,
						j as J,
					];

					++j;
				}

				++i;
			}
		}

		for (const [
			type_schema,
			asserter,
			value,
			i,
			j,
		] of split_data_sets(data_sets)) {
			const ajv = new Ajv({strict: true});
			const instance = new EnumString(
				'enum' in type_schema ? type_schema.enum : [],
				{ajv},
			);

			void it(`behaves with data_sets[${i}][2][${j}]`, async () => {
				const promise = instance.generate_typescript_type({
					schema: type_schema,
					schema_parser: new SchemaParser({ajv}),
				});

				await assert.doesNotReject(() => promise);

				const result = await promise;

				assert.doesNotThrow(() => asserter(result));

				const data = instance.generate_typescript_data(
					value,
					new SchemaParser({ajv}),
					type_schema,
				);

				ts_assert.isStringLiteral(data);
				assert.equal(data.text, value);
			});
		}
	});
});
