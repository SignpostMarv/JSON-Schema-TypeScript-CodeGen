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

type supported_type = (
	| ConversionlessType
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
		types?: [supported_type, ...supported_type[]]
	}
)

export class SchemaParser
{
	#ajv: Ajv;
	types: [supported_type, ...supported_type[]];

	constructor(options: SchemaParserOptions = {
		ajv_options: {
		},
	}) {
		this.#ajv = SchemaParser.#AjvFactory(options);
		const {types} = options;
		this.types = types || SchemaParser.#default_types(this.#ajv);
	}

	parse(
		schema: SchemaObject,
	): supported_type {
		for (const type of this.types) {
			const maybe = type.matching(schema);

			if (maybe) {
				return maybe;
			}
		}

		throw new TypeError('Could not determine type for schema!');
	}

	parse_for_conversion(
		schema: SchemaObject,
	): Type<unknown> {
		const maybe = this.parse(schema);

		if (!(maybe instanceof Type)) {
			throw new TypeError(
				`schema resolved to the conversionless type ${
					maybe.constructor.name
				}`,
			);
		}

		return maybe;
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

	static #default_types(ajv: Ajv): SchemaParser['types'] {
		return [
			new String({
				ajv,
			}),
			new ConstString(undefined, {ajv}),
			new NonEmptyString(1, {ajv}),
			new $ref(undefined, {
				ajv,
			}),
		];
	}
}
