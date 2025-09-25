import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import Ajv from 'ajv/dist/2020.js';

import {
	is_instanceof,
} from '@satisfactory-dev/custom-assert';
import {
	object_has_property,
} from '@satisfactory-dev/predicates.ts';

import ts_assert from '@signpostmarv/ts-assert';

import type {
	$ref_mode,
	$ref_value_by_mode,
} from '../../../src/JSONSchema/Ref.ts';
import {
	$ref,
} from '../../../src/JSONSchema/Ref.ts';

import {
	NonEmptyString,
} from '../../../src/JSONSchema/String.ts';

import {
	SchemaParser,
} from '../../../src/SchemaParser.ts';

import type {
	ObjectOfSchemas,
} from '../../../src/types.ts';

import {
	ConversionlessType,
} from '../../../src/JSONSchema/Type.ts';

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
	];

	function subset(
		filter:(maybe:[DataSet, number]) => boolean,
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

	void describe('::check_schema()', () => {
		passes_check_type
			.forEach(([
				[
					value,
					,,
					expectation,
				],
				i,
			]) => {
				void it(`behaves with data_sets[${i}]`, () => {
					const instance = new $ref(
						{$ref_mode: 'either'},
						{ajv: new Ajv({strict: true})},
					);

					assert.ok(instance.check_type(value));
					assert.equal(
						instance.check_schema({
							type: 'object',
							required: ['$ref'],
							additionalProperties: false,
							properties: {
								$ref: {
									type: 'string',
									const: value.$ref,
								},
							},
						}),
						expectation,
					);
				})
			});
	})

	void describe('::check_type()', () => {
		data_sets.forEach(([
			value,
			expectation,
		], i) => {
			const instance = new $ref(
				{$ref_mode: 'either'},
				{ajv: new Ajv({strict: true})},
			);
			void it(`behaves with data_sets[${i}]`, () => {
				assert.equal(
					instance.check_type(value),
					expectation,
				);
			});
		})
	})

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
						{$ref_mode: 'either'},
						{ajv: new Ajv({strict: true})},
					);
					assert.ok(instance.check_type(data));
					const result = await instance.generate_typescript_type({
						data,
					});
					ts_assert.isTypeReferenceNode(result);
					ts_assert.isIdentifier(result.typeName);
					assert.equal(result.typeName.text, expectation);
				});
			})
	})

	void describe('::resolve_def()', () => {
		void it('behaves with external $defs', () => {
			const parser = new SchemaParser();

			const instance = parser.maybe_parse_by_type(
				{
					$ref: 'foo#/$defs/bar',
				},
				(maybe) => ConversionlessType.is_a(maybe),
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
	});

	void describe('::resolve_ref()', () => {
		passes_check_type
			.forEach(([
				[
					has_$ref,
					,,,
					expectation,
				],
				i,
			]) => {
				function do_test($ref_mode: $ref_mode) {
					const ajv = new Ajv({strict: true});
					const instance = new $ref(
						{$ref_mode},
						{ajv},
					);
					assert.ok(instance.check_type(has_$ref));
					const $defs = has_$ref.$defs || {};
					assert.ok($ref.is_supported_$defs($defs));
					try {
						const result = instance
							.resolve_ref(
								has_$ref,
								$defs,
								new SchemaParser({ajv}),
							);
						if (undefined === expectation) {
							assert.fail('was expected to fail!');
						} else {
							is_instanceof(result, expectation);
						}
					} catch (err) {
						if (undefined !== expectation) {
							assert.fail(
								(
									'string' === typeof err
									|| err instanceof Error
								)
									? err
									: 'was not expected to fail!',
							);
						} else {
							assert.ok(true);
						}
					}

					const failure_mode:$ref_mode =
						has_$ref.$ref.startsWith('#')
							? 'external'
							: 'local';

					assert.throws(() => (
						new $ref({$ref_mode: failure_mode}, {ajv})
					).resolve_ref(
						has_$ref as {
							$ref: $ref_value_by_mode<typeof failure_mode>,
						},
						$defs,
						new SchemaParser({ajv}),
					));
				}
				void it(`behaves with data_sets[${i}]`, () => {
					do_test('either');
					if (
						object_has_property(has_$ref, '$ref')
						&& 'string' === typeof has_$ref.$ref
					) {
						do_test(
							has_$ref.$ref.startsWith('#')
								? 'local'
								: 'external',
						);
					}
				});
			})
	})
})
