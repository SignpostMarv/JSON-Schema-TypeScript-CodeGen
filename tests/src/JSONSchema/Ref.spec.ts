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

import {
	is_instanceof,
} from '@satisfactory-dev/custom-assert';

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

	const $ref_expectations:$ref_expectation[] = [
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
	];

	function* pad_expectations(): Generator<[
		...$ref_expectation,
		boolean, // from_parser_defualt
		number, // index
	]> {
		let index = 0;
		for (const expectation_set of $ref_expectations) {
			yield [...expectation_set, true, index];
			yield [...expectation_set, false, index];

			++index;
		}
	}

	for (const [
		data,
		ajv_options,
		expected_generated_type_name,
		from_parser_default,
		index,
	] of pad_expectations()) {
		void it(
			`.generate_type() behaves as expected with $ref_expectations[${
				index
			}] ${
				from_parser_default
					? ' from parser defaults'
					: 'directly from $ref'
			}`,
			async () => {
				const instance = new $ref(
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

				is_instanceof(instance, $ref);

				const typed = await instance.generate_typescript_type();

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
})
