import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	one_of_mode,
	one_of_schema_options,
	one_of_type_options,
	schema_choices,
	type_choices,
} from '../../../src/JSONSchema/OneOf.ts';
import {
	OneOf,
} from '../../../src/JSONSchema/OneOf.ts';

import type {
	$ref_mode,
} from '../../../src/JSONSchema/Ref.ts';
import {
	$ref,
} from '../../../src/JSONSchema/Ref.ts';

import type {
	ConversionlessType,
} from '../../../src/JSONSchema/Type.ts';

import {
	ConstString,
	PatternString,
} from '../../../src/JSONSchema/String.ts';

import type {
	PositiveInteger,
} from '../../../src/guarded.ts';

void describe('OneOf', () => {
	void describe('::is_a()', () => {
		type DataSet<
			Mode extends one_of_mode = one_of_mode,
			TypeChoices extends type_choices = type_choices,
			SchemaChoices extends schema_choices = schema_choices,
		> = [
			one_of_type_options<Mode, TypeChoices>,
			one_of_schema_options<Mode, SchemaChoices>,
			[
				(ajv: Ajv) => ConversionlessType<unknown>,
				boolean,
			][],
		];

		function sanity_check<
			Mode extends one_of_mode = one_of_mode,
			TypeChoices extends type_choices = type_choices,
			SchemaChoices extends schema_choices = schema_choices,
		>(
			entry: DataSet<Mode, TypeChoices, SchemaChoices>,
		): DataSet<Mode, TypeChoices, SchemaChoices> {
			return entry;
		}

		const data_sets: [DataSet, ...DataSet[]] = [
			sanity_check<'unspecified'>([
				{
					mode: 'unspecified',
				},
				{
					mode: 'unspecified',
				},
				[
					[
						(ajv) => new $ref({$ref_mode: 'either'}, {ajv}),
						false,
					],
				],
			]),
			sanity_check<'specified'>([
				{
					mode: 'specified',
					choices: [
						{type: 'string', const: 'foo'},
						{type: 'string', pattern: '.+'},
					],
				},
				{
					mode: 'specified',
					choices: [
						ConstString.generate_schema_definition<
							'const',
							never[],
							undefined,
							ReturnType<typeof PositiveInteger<1>>,
							'foo'
						>({
							string_mode: 'const',
							const: 'foo',
						}),
						PatternString.generate_schema_definition<
							'pattern',
							never[],
							'.+',
							ReturnType<typeof PositiveInteger<1>>,
							undefined
						>({
							string_mode: 'pattern',
							pattern: '.+',
						}),
					],
				},
				[],
			]),
		];

		data_sets.forEach(([
			type_definition,
			schema_definition,
			additional_checks,
		], i) => {
			void it(`behaves with data_sets[${i}]`, () => {
				const ajv = new Ajv({strict: true});

				const instance = new OneOf({
					ajv,
					type_definition,
					schema_definition,
				});

				assert.ok(OneOf.is_a(instance));
				assert.ok(OneOf.is_a<$ref<$ref_mode>>(
					new OneOf<unknown, 'unspecified'>({
						ajv,
						type_definition: {
							mode: 'unspecified',
						},
						schema_definition: {
							mode: 'unspecified',
						},
					}),
				));
				assert.ok(!OneOf.is_a<OneOf<unknown>>(
					new $ref({$ref_mode: 'either'}, {ajv}),
				));
			});

			additional_checks.forEach(([
				generator,
				passes,
			], j) => {
				void it(`behaves with data_sets[${i}][2][${j}]`, () => {
					const ajv = new Ajv({strict: true});

					assert.equal(
						OneOf.is_a(generator(ajv)),
						passes,
					);
				});
			});
		});
	});
});
