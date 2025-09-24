import type {
	Options,
} from 'ajv/dist/2020.js';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import {
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

import type {
	SchemaObject,
} from './types.ts';

import {
	Unknown,
} from './JSONSchema/Unknown.ts';

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

type empty_object = Record<string, never>;

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

	maybe_parse<
		T extends ConversionlessType<unknown>
	>(
		schema: SchemaObject,
		must_be_of_type: typeof ConversionlessType<unknown>,
	): T|undefined {
		let result:T|undefined = undefined;
		for (const type of this.types) {
			const maybe: (
				| undefined
				| ConversionlessType<unknown>
			) = type.can_handle_schema(schema);

			if (maybe) {
				if (!must_be_of_type.is_a(maybe)) {
					continue;
				}

				result = maybe as T;
				break;
			}
		}

		return result;
	}

	maybe_parse_by_type<
		T extends ConversionlessType<unknown>
	>(
		schema: unknown,
		must_be_of_type: (maybe: unknown) => maybe is T,
	): (T & typeof must_be_of_type)|undefined {
		let result:(T & typeof must_be_of_type)|undefined = undefined;
		for (const type of this.types) {
			if (type.check_type(schema)) {
				if (!must_be_of_type(type)) {
					continue;
				}

				result = type as T & typeof must_be_of_type;
				break;
			}
		}

		return result;
	}

	parse<T extends boolean>(
		schema: SchemaObject,
		require_conversion?: T,
	): T extends true ? Type<unknown> : ConversionlessType<unknown> {
		const result = this.maybe_parse<
			typeof require_conversion extends true
				? Type<unknown>
				: ConversionlessType<unknown>
		>(
			schema,
			require_conversion ? Type : ConversionlessType,
		);

		if (result) {
			return result;
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
		$ref<empty_object, 'either'>,
		ObjectUnspecified<{[key: string]: unknown}, 'properties'>,
		ObjectUnspecified<{[key: string]: unknown}, 'pattern'>,
		ObjectUnspecified<{[key: string]: unknown}, 'both'>,
		ObjectUnspecified<{[key: string]: unknown}, 'neither'>,
		ArrayUnspecified<
			unknown[],
			'items-only',
			'no'
		>,
		Unknown,
	] {
		return [
			new String({
				ajv,
			}),
			new ConstString(undefined, {ajv}),
			new NonEmptyString({}, {ajv}),
			new $ref(
				{
					$ref_mode: 'either',
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
			new Unknown({ajv}),
		];
	}
}
