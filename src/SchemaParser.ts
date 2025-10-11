import type {
	Options,
} from 'ajv/dist/2020.js';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import {
	Type,
} from './JSONSchema/Type.ts';

import {
	ConstString,
	EnumString,
	NonEmptyString,
	PatternString,
	String,
} from './JSONSchema/String.ts';

import {
	$ref,
} from './JSONSchema/Ref.ts';

import {
	ObjectUnspecified,
} from './JSONSchema/Object.ts';

import {
	ArrayType,
} from './JSONSchema/Array.ts';

import {
	PositiveIntegerGuard,
} from './guarded.ts';

import type {
	SchemaObject,
	SchemaObjectWith$id,
} from './types.ts';

import {
	Unknown,
} from './JSONSchema/Unknown.ts';

import {
	OneOf,
} from './JSONSchema/OneOf.ts';

import {
	AllOf,
} from './JSONSchema/AllOf.ts';

import {
	AnyOf,
} from './JSONSchema/AnyOf.ts';

import {
	$defs,
} from './JSONSchema/$defs.ts';

type supported_type = (
	| Type<unknown>
);

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
		types?: [
			Type<unknown>,
			...Type<unknown>[],
		],
	}
);

type share_ajv_callback<T> = (ajv: Ajv) => T;

class SchemaParser {
	#ajv: Ajv;

	types: [Type<unknown>, ...Type<unknown>[]];

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

	get imports(): Set<string> {
		return new Set<string>(this.types.filter(
			(maybe) => maybe instanceof $ref,
		).flatMap((
			instance: $ref,
		) => [...instance.needs_import.values()]));
	}

	add_schema(
		schema: SchemaObjectWith$id,
	) {
		this.#ajv.addSchema(schema);
		this.types.filter(
			(maybe): maybe is $ref => maybe instanceof $ref,
		).forEach((inform_this: $ref) => {
			inform_this.remote_defs[schema.$id] = schema.$defs || {};
		});
	}

	maybe_parse<
		T extends Type<unknown>,
	>(
		schema: SchemaObject,
		must_be_of_type: typeof Type<unknown>,
	): T|undefined {
		let result: T|undefined = undefined;
		for (const type of this.types) {
			const maybe: (
				| undefined
				| Type<unknown>
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
		T extends Type<unknown>,
	>(
		value: unknown,
		must_be_of_type: (maybe: unknown) => maybe is T,
	): T|undefined;
	maybe_parse_by_type(
		value: unknown,
		must_be_of_type?: undefined,
	): Type<unknown>|undefined;
	maybe_parse_by_type<
		T extends Type<unknown>,
	>(
		value: unknown,
		must_be_of_type?: (maybe: unknown) => maybe is T,
	): Type<unknown>|T|undefined {
		let result: T|undefined = undefined;
		for (const type of this.types) {
			if (type.check_type(value)) {
				if (!must_be_of_type) {
					return type;
				}

				if (!must_be_of_type(type)) {
					continue;
				}

				result = type;
				break;
			}
		}

		return result;
	}

	parse(
		schema: SchemaObject,
	): Type<unknown> {
		if (0 === Object.keys(schema).length) {
			const result = this.types.find<Unknown>(
				(maybe) => maybe instanceof Unknown,
			);

			if (result) {
				return result;
			}
		}

		const result = this.maybe_parse<
			Type<unknown>
		>(
			schema,
			Type,
		);

		if (undefined === result && '$ref' in schema) {
			const maybe_$ref = this.types.find(
				(maybe) => maybe instanceof $ref,
			);

			if (maybe_$ref && maybe_$ref.check_type(schema)) {
				return maybe_$ref;
			}
		}

		if (result) {
			return result;
		}

		throw new TypeError('Could not determine type for schema!');
	}

	parse_by_type<
		T extends Type<unknown>,
	>(
		value: unknown,
		must_be_of_type: (maybe: unknown) => maybe is T,
	): T;
	parse_by_type(
		value: unknown,
		must_be_of_type?: undefined,
	): Type<unknown>;
	parse_by_type<
		T extends Type<unknown>,
	>(
		value: unknown,
		must_be_of_type?: (maybe: unknown) => maybe is T,
	): Type<unknown>|T {
		const result = must_be_of_type
			? this.maybe_parse_by_type(value, must_be_of_type)
			: this.maybe_parse_by_type(value);

		if (undefined === result) {
			throw new TypeError(
				'Could not determine type for schema!',
			);
		}

		return result;
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
		EnumString<string, never[]>,
		PatternString<string, undefined>,
		ConstString,
		NonEmptyString,
		$ref,
		ObjectUnspecified<{[key: string]: unknown}, 'properties'>,
		ObjectUnspecified<{[key: string]: unknown}, 'pattern'>,
		ObjectUnspecified<{[key: string]: unknown}, 'both'>,
		ObjectUnspecified<{[key: string]: unknown}, 'neither'>,
		ArrayType<
			'items',
			'unspecified',
			'no',
			'optional'
		>,
		ArrayType<
			'prefixItems',
			'unspecified',
			'no',
			'optional'
		>,
		ArrayType<
			'items',
			'unspecified',
			'yes',
			'optional'
		>,
		ArrayType<
			'prefixItems',
			'unspecified',
			'yes',
			'optional'
		>,
		OneOf<unknown, 'unspecified'>,
		AllOf<unknown, 'unspecified'>,
		AnyOf<unknown, 'unspecified'>,
		$defs,
		Unknown,
	] {
		return [
			new String({
				ajv,
			}),
			new EnumString([], {ajv}),
			new PatternString(undefined, {ajv}),
			new ConstString(undefined, {ajv}),
			new NonEmptyString({ajv}),
			new $ref(
				{},
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
			new ArrayType(
				{ajv},
				{
					array_options: {
						array_mode: 'items',
						specified_mode: 'unspecified',
						unique_items_mode: 'no',
						min_items_mode: 'optional',
					},
				},
			),
			new ArrayType(
				{ajv},
				{
					array_options: {
						array_mode: 'prefixItems',
						specified_mode: 'unspecified',
						unique_items_mode: 'no',
						min_items_mode: 'optional',
						minItems: PositiveIntegerGuard(1),
					},
				},
			),
			new ArrayType(
				{ajv},
				{
					array_options: {
						array_mode: 'items',
						specified_mode: 'unspecified',
						unique_items_mode: 'yes',
						min_items_mode: 'optional',
					},
				},
			),
			new ArrayType(
				{ajv},
				{
					array_options: {
						array_mode: 'prefixItems',
						specified_mode: 'unspecified',
						unique_items_mode: 'yes',
						min_items_mode: 'optional',
						minItems: PositiveIntegerGuard(1),
					},
				},
			),
			new OneOf<unknown, 'unspecified'>({
				ajv,
				type_definition: {
					kind: 'oneOf',
					mode: 'unspecified',
				},
				schema_definition: {
					kind: 'oneOf',
					mode: 'unspecified',
				},
			}),
			new AllOf<unknown, 'unspecified'>({
				ajv,
				type_definition: {
					kind: 'allOf',
					mode: 'unspecified',
				},
				schema_definition: {
					kind: 'allOf',
					mode: 'unspecified',
				},
			}),
			new AnyOf<unknown, 'unspecified'>({
				ajv,
				type_definition: {
					kind: 'anyOf',
					mode: 'unspecified',
				},
				schema_definition: {
					kind: 'anyOf',
					mode: 'unspecified',
				},
			}),
			new $defs({ajv}, {}),
			new Unknown({ajv}),
		];
	}
}

export type {
	supported_type,
	SchemaParserOptions,
	share_ajv_callback,
};

export {
	SchemaParser,
};
