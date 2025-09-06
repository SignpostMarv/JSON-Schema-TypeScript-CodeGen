import type {
	Options,
	SchemaObject,
} from 'ajv/dist/2020.js';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	Type,
} from './JSONSchema/Type.ts';

import {
	ConstString,
	NonEmptyString,
	String,
} from './JSONSchema/String.ts';

type SchemaParserOptions = (
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
		types?: [Type<unknown>, ...Type<unknown>[]]
	}
)

export class SchemaParser
{
	#ajv: Ajv;
	types: [Type<unknown>, ...Type<unknown>[]];

	constructor(options: SchemaParserOptions = {
		ajv_options: {
		},
	}) {
		this.#ajv = SchemaParser.#AjvFactory(options);
		const {types} = options;
		this.types = types || SchemaParser.#default_types(this.#ajv);
	}

	parse(schema:SchemaObject): Type<unknown>
	{
		for (const type of this.types) {
			const maybe = type.matching(schema);

			if (maybe) {
				return maybe;
			}
		}

		throw new TypeError('Could not determine type for schema!');
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
		];
	}
}
