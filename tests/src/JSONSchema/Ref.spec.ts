import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import type {
	Options,
} from 'ajv/dist/2020.js';
import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import ts_assert from '@signpostmarv/ts-assert';

import type {
	ExternalRef,
	LocalRef,
} from '../../../src/JSONSchema/Ref.ts';
import {
	$ref,
} from '../../../src/JSONSchema/Ref.ts';
import {
	throws_Error,
} from '../../assertions.ts';

void describe('$ref', () => {
	type $ref_expectation = [
		{$ref: ExternalRef | LocalRef},
		Omit< // Ajv Options
			Options,
			(
				| 'strict'
			)
		>,
		string, // expected type generation result name
	];

	const $ref_expectations:(
		| $ref_expectation
		| [
			...$ref_expectation,
			{
				data: {$ref: Exclude<ExternalRef | LocalRef, undefined>},
			}
		]
	)[] = [
		[
			{$ref: $ref.require_ref('#/$defs/foo')},
			{},
			'foo',
		],
		[
			{$ref: $ref.require_ref('foo.json#/$defs/foo')},
			{},
			'foo_json_foo',
		],
		[
			{$ref: $ref.require_ref('#/$defs/boolean')},
			{},
			'__boolean',
		],
		[
			{$ref: $ref.require_ref('foo.json#/$defs/boolean')},
			{},
			'foo_json_boolean',
		],
		[
			{$ref: $ref.require_ref('#/$defs/class')},
			{},
			'__class',
		],
		[
			{$ref: $ref.require_ref('foo.json#/$defs/class')},
			{},
			'foo_json_class',
		],
		[
			{$ref: $ref.require_ref('#/$defs/1.1')},
			{},
			'v1_1',
		],
		[
			{$ref: $ref.require_ref('foo.json#/$defs/1.1')},
			{},
			'foo_json_1_1',
		],
		[
			{$ref: $ref.require_ref('foo.json#/$defs/1.1')},
			{},
			'foo_json_1_1',
			{
				data: {
					$ref: 'foo.json#/$defs/1.1' as ExternalRef,
				},
			},
		],
	];

	function* pad_defaults(): Generator<[
		...$ref_expectation,
		(
			| undefined
			| {
				data: {
					$ref: ExternalRef|LocalRef,
				},
			}
		)
	]> {
		for (const expectation_set of $ref_expectations) {
			if (3 === expectation_set.length) {
				yield [
					...expectation_set,
					undefined,
				];
			} else {
				yield expectation_set;
			}
		}
	}

	function* pad_expectations(): Generator<[
		...[
			...$ref_expectation,
			(
				| undefined
				| {
					data: {
						$ref: ExternalRef | LocalRef,
					},
				}
			),
		],
		number, // index
	]> {
		let index = 0;
		for (const expectation_set of pad_defaults()) {
			yield [
				...expectation_set,
				index,
			];
			yield [
				...expectation_set,
				index,
			];

			++index;
		}
	}

	for (const [
		data,
		ajv_options,
		expected_generated_type_name,
		type_options,
		index,
	] of pad_expectations()) {
		void it(
			`.generate_type${
				type_options
					? '(type_options)'
					: '()'
			} behaves as expected with $ref_expectations[${
				index
			}]`,
			async () => {
				const instance = new $ref<'neither'>(
					{
						mode: 'either',
						required_as: data.$ref,
					},
					{
						ajv: new Ajv({
							...ajv_options,
							strict: true,
						}),
					},
				);

				const typed = await (
					type_options
						? instance.generate_typescript_type(type_options)
						: instance.generate_typescript_type()
				);

				ts_assert.isTypeReferenceNode(typed);
				ts_assert.isIdentifier(typed.typeName);
				assert.equal(
					typed.typeName.text,
					expected_generated_type_name,
				);
			},
		)
	}

	void it('.require_ref() fails', () => {
		const expectations:[string, ...string[]] = [
			'foo',
		];

		expectations.forEach((value, i) => {
			throws_Error(
				() => {
					$ref.require_ref(value)
				},
				TypeError,
				`value "${value}" is not a supported $ref string!`,
				`$ref.require_ref() failed to throw as expected with expectations[${i}]`,
			);
		});
	})

	void it('.is_$ref() behaves', () => {
		type ExpectationDataSet<T> = [
			T,
			(
				| 'either'
				| 'external'
				| 'local'
			),
			boolean,
		];

		const expectations: ExpectationDataSet<unknown>[] = [];

		function* pad_failure<
			T = Exclude<unknown, string>,
		>(value: T): Generator<ExpectationDataSet<T>> {
			yield [
				value,
				'either',
				false,
			];
			yield [
				value,
				'external',
				false,
			];
			yield [
				value,
				'local',
				false,
			];
		}

		function* pad_success<
			T extends ExternalRef|LocalRef = ExternalRef|LocalRef,
		>(
			value: T,
		): Generator<ExpectationDataSet<T>> {
			yield [
				value,
				'either',
				true,
			];

			yield [
				value,
				value.startsWith('#/$defs/') ? 'local' : 'external',
				true,
			];
		}

		for (const failure_value of [
			false,
			true,
			undefined,
			'fail',
		]) {
			for (const data_set of pad_failure(failure_value)) {
				expectations.push(data_set);
			}
		}

		const success_values:(
			LocalRef|ExternalRef
		)[] = [
			'#/$defs/foo' as LocalRef,
			'foo.json#/$defs/bar' as ExternalRef,
		];

		for (const success_value of success_values) {
			for (const data_set of pad_success(success_value)) {
				expectations.push(data_set);
			}
		}

		for (const [
			value,
			mode,
			expectation,
		] of expectations) {
			assert.equal(
				$ref.is_$ref(value, mode),
				expectation,
			);
		}
	})
})
