import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import type {
	Expression,
} from 'typescript';

import Ajv from 'ajv/dist/2020.js';

import {
	is_instanceof,
// eslint-disable-next-line imports/no-unresolved
} from '@satisfactory-dev/custom-assert';

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import type {
	TypeReferenceNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../src/typescript/index.ts';

import type {
	$ref_type,
	ObjectOfSchemas,
	SchemaObject,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';
import {
	$ref,
	ArrayType,
	NonEmptyString,
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';

import type {
	ts_asserter,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../index.ts';

import {
	throws_Error,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../index.ts';

void describe('$ref', () => {
	type DataSet<
		PassesCheckType extends boolean = boolean,
		TestValue = PassesCheckType extends true
			? {$ref: string, $defs?: ObjectOfSchemas}
			: unknown,
		ResolvesTo = {[Symbol.hasInstance](instance: unknown): boolean},
	> = [
		TestValue,
		PassesCheckType,
		PassesCheckType extends true ? string : undefined,

		// $ref passes check_schema as const
		PassesCheckType extends true ? boolean : undefined,

		// ref resolves to
		PassesCheckType extends true ? (ResolvesTo|undefined) : undefined,
	];

	const data_sets: [DataSet, ...DataSet[]] = [
		[
			1,
			false,
			undefined,
			undefined,
			undefined,
		],
		[
			'two',
			false,
			undefined,
			undefined,
			undefined,
		],
		[
			{$ref: 1},
			false,
			undefined,
			undefined,
			undefined,
		],
		[
			{$ref: 'two'},
			false,
			undefined,
			undefined,
			undefined,
		],
		[
			{
				$defs: {
					foo: {
						type: 'string',
						minLength: 1,
					},
				},
				$ref: '#/$defs/foo',
			},
			true,
			'foo',
			true,
			NonEmptyString,
		],
		[
			{$ref: '#/$defs/foo'},
			true,
			'foo',
			true,
			undefined,
		],
		[
			{$ref: 'bar#/$defs/foo'},
			true,
			'bar_foo',
			true,
			undefined,
		],
		[
			{$ref: 'foo.schema.json#/$defs/foo'},
			true,
			'foo_schema_json_foo',
			true,
			undefined,
		],
		[
			{$ref: '#/$defs/foo bar baz bat #bag'},
			true,
			'foo_bar_baz_bat_bag',
			true,
			undefined,
		],
	];

	function subset(
		filter: (maybe: [DataSet, number]) => boolean,
	): [DataSet, number][] {
		return data_sets
			.map((e, i): [DataSet, number] => [e, i])
			.filter(filter);
	}

	const passes_check_type = subset(
		(settings): settings is [DataSet<true>, number] => {
			return settings[0][1];
		},
	);

	void describe('::check_type()', () => {
		data_sets.forEach(([
			value,
			expectation,
		], i) => {
			const instance = new $ref(
				{},
				{ajv: new Ajv({strict: true})},
			);
			void it(`behaves with data_sets[${i}]`, () => {
				assert.equal(
					instance.check_type(value),
					expectation,
				);
			});
		});
	});

	void describe('::generate_typescript_type()', () => {
		passes_check_type
			.forEach(([
				[
					data,
					,
					expectation,
				],
				i,
			]) => {
				void it(`behaves with data_sets[${i}]`, async () => {
					const instance = new $ref(
						{},
						{ajv: new Ajv({strict: true})},
					);
					assert.ok(instance.check_type(data));
					const result = await instance.generate_typescript_type({
						schema: data,
					});
					ts_assert.isTypeReferenceNode(result);
					ts_assert.isIdentifier(result.typeName);
					assert.equal(result.typeName.text, expectation);
				});
			});
	});

	void describe('::resolve_def()', () => {
		void it('behaves with external $defs', () => {
			const parser = new SchemaParser();

			const instance = parser.parse_by_type(
				{
					$ref: 'foo#/$defs/bar',
				},
			);

			is_instanceof<$ref>(instance, $ref);

			const $ref_value = {$ref: 'foo#/$defs/bar'};

			assert.ok($ref.is_supported_$ref($ref_value));

			assert.throws(() => instance.resolve_def($ref_value, {}));

			parser.add_schema({
				$id: 'foo',
				$defs: {
					bar: {
						type: 'string',
					},
				},
			});

			assert.deepEqual(
				instance.resolve_def($ref_value, {}),
				{
					type: 'string',
				},
			);

			const $ref_value_2 = {$ref: 'bar#/$defs/bar'};

			assert.ok($ref.is_supported_$ref($ref_value_2));

			assert.throws(() => instance.resolve_def($ref_value_2, {}));

			parser.add_schema({
				$id: 'bar',
			});

			assert.throws(() => instance.resolve_def($ref_value_2, {}));
		});

		void it('fails when expected', () => {
			const parser = new SchemaParser();

			const instance = parser.parse_by_type(
				{
					$ref: 'foo#/$defs/bar',
				},
			);

			is_instanceof<$ref>(instance, $ref);

			const value: $ref_type = {
				$ref: 'not-valid',
			} as unknown as $ref_type;

			assert.ok(!$ref.is_supported_$ref(value));

			throws_Error(
				() => instance.resolve_def(
					value,
					{},
				),
				TypeError,
				'Unsupported ref found: not-valid',
			);
		});
	});

	void describe('::is_a()', () => {
		void it('behaves as expected', () => {
			const ajv = new Ajv({strict: true});
			assert.ok($ref.is_a(new $ref({}, {ajv})));
			assert.ok(!$ref.is_a(
				new ArrayType(
					{ajv},
					{
						array_options: {
							array_mode: 'items',
							specified_mode: 'specified',
							unique_items_mode: 'yes',
							min_items_mode: 'optional',
							items: {
								type: 'string',
							},
						},
					},
				),
			));
			assert.ok(!$ref.is_a(undefined));
			assert.ok(!$ref.is_a(new String({ajv})));
		});
	});
});

void describe('$ref', () => {
	type DataSubSet = [
		unknown,
		SchemaObject,
		ts_asserter<Expression>,
		ts_asserter<TypeReferenceNode>,
	];

	type DataSet = [
		ConstructorParameters<typeof $ref>[0],
		[DataSubSet, ...DataSubSet[]],
	];

	function* split_data_sets(
		data_sets: [DataSet, ...DataSet[]],
	): Generator<[
		DataSet[0],
		DataSubSet[0],
		DataSubSet[1],
		DataSubSet[2],
		DataSubSet[3],
		number,
		number,
	]> {
		let i = 0;
		for (const [
			specific_options,
			sub_sets,
		] of data_sets) {
			let j = 0;
			for (const [
				data,
				$ref,
				data_asserter,
				type_asserter,
			] of sub_sets) {
				yield [
					specific_options,
					data,
					$ref,
					data_asserter,
					type_asserter,
					i,
					j,
				];

				++j;
			}

			++i;
		}
	}

	const data_sets: [DataSet, ...DataSet[]] = [
		[
			{},
			[
				[
					'foo',
					{
						$defs: {
							foo: {
								type: 'string',
							},
						},
						$ref: '#/$defs/foo',
					},
					(maybe) => {
						ts_assert.isStringLiteral(maybe);
						assert.equal(maybe.text, 'foo');
					},
					(maybe) => {
						ts_assert.isTypeReferenceNode(maybe);
						ts_assert.isIdentifier(maybe.typeName);

						assert.equal(maybe.typeArguments, undefined);
						assert.equal(maybe.typeName.text, 'foo');
					},
				],
			],
		],
	];

	for (const [
		specific_options,
		data,
		schema,
		data_asserter,
		type_asserter,
		i,
		j,
	] of split_data_sets(data_sets)) {
		void describe('::generate_typescript_data()', () => {
			void it(`behaves with data_sets[${i}][${j}]`, () => {
				const schema_parser = new SchemaParser({ajv_options: {}});
				const instance = schema_parser.share_ajv(
					(ajv) => new $ref(specific_options, {ajv}),
				);

				assert.ok($ref.is_supported_$ref(schema));

				const foo: ts_asserter<Expression> = data_asserter;

				foo(instance.generate_typescript_data(
					data,
					schema_parser,
					schema,
				));
			});
		});

		void describe('::generate_typescript_type()', () => {
			void it(`behaves with data_sets[${i}][${j}]`, async () => {
				const schema_parser = new SchemaParser({ajv_options: {}});
				const instance = schema_parser.share_ajv(
					(ajv) => new $ref(specific_options, {ajv}),
				);

				const foo: ts_asserter<TypeReferenceNode> = type_asserter;

				assert.ok($ref.is_supported_$ref(schema));

				foo(await instance.generate_typescript_type({
					schema,
				}));
			});
		});
	}

	void describe('::generate_typescript_data()', () => {
		void it('fails when expected', () => {
			const schema_parser = new SchemaParser({ajv_options: {}});
			const instance = schema_parser.share_ajv(
				(ajv) => new $ref({}, {ajv}),
			);

			const $ref_value = '#/$defs/foo';

			assert.ok($ref.is_supported_$ref_value($ref_value));

			assert.throws(() => instance.generate_typescript_data(
				'foo',
				schema_parser,
				{
					$ref: $ref_value,
				},
			));

			assert.throws(() => instance.generate_typescript_data(
				'foo',
				schema_parser,
				{
					$defs: undefined,
					$ref: $ref_value,
				},
			));
		});
	});
});
