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

export class SchemaParser
{
	#ajv: Ajv;
	types: [ConversionlessType<never>, ...ConversionlessType<never>[]];

	constructor(options: SchemaParserOptions = {
		ajv_options: {
		},
	}) {
		this.#ajv = SchemaParser.#AjvFactory(options);
		const {types} = options;
		this.types = (
			types
			|| SchemaParser.#default_types(this.#ajv)
		) as SchemaParser['types'];
	}

	parse<T extends boolean|undefined = undefined>(
		schema: SchemaObject,
		require_conversion?: T,
	): T extends true ? Type<unknown> : supported_type {
		for (const type of this.types) {
			const maybe = type.can_handle_schema(schema);

			if (maybe) {
				if (require_conversion && !(maybe instanceof Type)) {
					throw new TypeError(
						`schema resolved to the conversionless type ${
							maybe.constructor.name
						}`,
					);
				}

				return maybe as (
					T extends true
						? Type<unknown>
						: supported_type
				);
			}
		}

		throw new TypeError('Could not determine type for schema!');
	}

	share_ajv<T>(
		callback: (ajv: Ajv) => T,
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
		NonEmptyString<1>,
		$ref<'neither'>,
		ObjectUnspecified<{[key: string]: unknown}>,
		ArrayUnspecified<unknown[]>,
	] {
		return [
			new String({
				ajv,
			}),
			new ConstString(undefined, {ajv}),
			new NonEmptyString(1, {ajv}),
			new $ref(
				{
					mode: 'either',
				},
				{
					ajv,
				},
			),
			new ObjectUnspecified(
				{},
				{ajv},
			),
			new ArrayUnspecified({ajv}),
		];
	}
}
