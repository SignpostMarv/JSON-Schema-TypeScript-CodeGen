import type {
	Options,
	SchemaObject,
} from 'ajv/dist/2020.js';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	ConversionlessType,
} from './JSONSchema/Type.ts';
import {
	Type,
} from './JSONSchema/Type.ts';

import {
	ConstString,
	NonEmptyString,
	String,
} from './JSONSchema/String.ts';

import {
	$ref,
} from './JSONSchema/Ref.ts';

import {
	ObjectUnspecified,
} from './JSONSchema/Object.ts';

import {
	ArrayUnspecified,
} from './JSONSchema/Array.ts';

import {
	PositiveIntegerOrZero,
} from './guarded.ts';

export type supported_type = (
	| ConversionlessType<unknown>
	| Type<unknown>
);

export type SchemaParserOptions = (
	& (
		| {
			ajv: Ajv,
		}
		| {
			ajv_options: Omit<
				Options,
				(
					| 'strict'
				)
			>,
		}
	)
	& {
		types?: [ConversionlessType<unknown>, ...ConversionlessType<unknown>[]]
	}
)

export type share_ajv_callback<T> = (ajv: Ajv) => T;

export class SchemaParser
{
	#ajv: Ajv;
	types: [ConversionlessType<unknown>, ...ConversionlessType<unknown>[]];

	constructor(options: SchemaParserOptions = {
		ajv_options: {
		},
	}) {
		this.#ajv = SchemaParser.#AjvFactory(options);
		const {types} = options;
		this.types = (
			types
			|| SchemaParser.#default_types(this.#ajv)
		);
	}

	parse(
		schema: SchemaObject,
		require_conversion: true,
	): Type<unknown>;
	parse(
		schema: SchemaObject,
		require_conversion?: false,
	): ConversionlessType<unknown>;
	parse(
		schema: SchemaObject,
		require_conversion?: boolean,
	): ConversionlessType<unknown> {
		for (const type of this.types) {
			const maybe: (
				| undefined
				| ConversionlessType<unknown>
			) = type.can_handle_schema(schema);

			if (maybe) {
				if (require_conversion && !Type.is_a(maybe)) {
					throw new TypeError(
						`schema resolved to the conversionless type ${
							maybe.constructor.name
						}`,
					);
				}

				return maybe;
			}
		}

		throw new TypeError('Could not determine type for schema!');
	}

	share_ajv<T>(
		callback: share_ajv_callback<T>,
	): T {
		return callback(this.#ajv);
	}

	static #AjvFactory(options: SchemaParserOptions): Ajv {
		if ('ajv' in options) {
			return options.ajv;
		}

		return new Ajv({
			...options.ajv_options,
			strict: true,
		});
	}

	static #default_types(ajv: Ajv): [
		String<string>,
		ConstString<undefined>,
		NonEmptyString<'optional'>,
		$ref<'neither'>,
		ObjectUnspecified<{[key: string]: unknown}, 'properties'>,
		ObjectUnspecified<{[key: string]: unknown}, 'pattern'>,
		ObjectUnspecified<{[key: string]: unknown}, 'both'>,
		ObjectUnspecified<{[key: string]: unknown}, 'neither'>,
		ArrayUnspecified<
			unknown[],
			'items-only',
			'no'
		>,
	] {
		return [
			new String({
				ajv,
			}),
			new ConstString(undefined, {ajv}),
			new NonEmptyString({}, {ajv}),
			new $ref(
				{
					mode: 'either',
				},
				{
					ajv,
				},
			),
			new ObjectUnspecified(
				{properties_mode: 'properties'},
				{ajv},
			),
			new ObjectUnspecified(
				{properties_mode: 'pattern'},
				{ajv},
			),
			new ObjectUnspecified(
				{properties_mode: 'both'},
				{ajv},
			),
			new ObjectUnspecified(
				{properties_mode: 'neither'},
				{ajv},
			),
			new ArrayUnspecified(
				{
					array_mode: 'items-only',
					items: {},
					uniqueItems_mode: 'no',
					minItems: PositiveIntegerOrZero(0),
				},
				{ajv},
			),
		];
	}
}
