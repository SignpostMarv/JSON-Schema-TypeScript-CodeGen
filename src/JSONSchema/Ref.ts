import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
	TypeReferenceNode,
} from 'typescript';
import {
	factory,
} from 'typescript';

import type {
	SchemaDefinition,
	SchemalessTypeOptions,
} from './Type.ts';

import {
	ConversionlessType,
} from './Type.ts';

import type {
	adjust_name_callback,
} from '../coercions.ts';
import {
	adjust_name_finisher,
} from '../coercions.ts';
import {
	adjust_name_default,
	object_keys,
} from '../coercions.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

export type $def = (
	& string
	& {
		_$def_guard: never,
	}
);

export type LocalRef<T extends $def = $def> = `#/$defs/${T}`;
export type ExternalRef<
	$ID extends $def = $def,
	Local extends $def = $def,
> = `${$ID}${LocalRef<Local>}`;

type ref_identifier = '([a-zA-Z0-9][a-zA-Z0-9._-]*)';

export type pattern = `^${ref_identifier}?#\\/\\$defs\\/${ref_identifier}$`;
export const sub_pattern:`^${ref_identifier}$` = '^([a-zA-Z0-9][a-zA-Z0-9._-]*)$';
export const pattern:pattern = (
	'^([a-zA-Z0-9][a-zA-Z0-9._-]*)?#\\/\\$defs\\/([a-zA-Z0-9][a-zA-Z0-9._-]*)$'
);

type ref_schema<
	T extends undefined|[$def, ...$def[]] = undefined,
> = SchemaDefinition<
	['$ref'],
	{
		$ref: (
			T extends undefined
				? {
					type: 'string',
					pattern: pattern,
				}
				: {
					type: 'string',
					pattern: pattern,
					enum: T,
				}
		),
	}
>;

type $def_schema = SchemaDefinition<
	['$defs'],
	{
		$defs: {[key: string]: SchemaDefinition}
	}
>;

export class $ref<
	T extends (ExternalRef | LocalRef) = ExternalRef | LocalRef,
	$Defs extends {[key: $def]: SchemaObject} = {[key: $def]: SchemaObject},
> extends ConversionlessType<
	ref_schema<undefined|[
		(keyof $Defs & $def),
		...(keyof $Defs & $def)[]
	]>,
	{$ref: T},
	TypeReferenceNode
> {
	#adjust_name: adjust_name_callback;

	// eslint-disable-next-line no-unused-private-class-members
	#$defs?: $Defs;

	static #pattern = new RegExp(pattern);

	constructor(
		$defs: $Defs|undefined,
		options: SchemalessTypeOptions,
		{
			adjust_name,
		}: {
			adjust_name: adjust_name_callback,
		} = {
			adjust_name: adjust_name_default,
		},
	) {
		super({
			...options,
			schema_definition: $ref.schema_definition({
				$defs,
			}),
		});
		this.#$defs = $defs;
		this.#adjust_name = adjust_name;
	}

	generate_type(schema: {$ref: T}) {
		return factory.createTypeReferenceNode(
			adjust_name_finisher(
				schema.$ref.replace(
					/^#\/\$defs\//,
					'',
				).replace(
					'#/$defs/',
					'_',
				),
				this.#adjust_name,
			),
		);
	}

	static is_ref(value: string): value is LocalRef|ExternalRef
	{
		return this.#pattern.test(value);
	}

	static require_ref<T extends string>(value: T): (LocalRef|ExternalRef) & T
	{
		if (!this.is_ref(value)) {
			throw new TypeError(`value "${value}" is not a supported $ref string!`);
		}

		return value;
	}

	static schema_definition<
		T extends {[key: $def]: SchemaObject} = {[key: $def]: SchemaObject},
	>({
		$defs = undefined,
	}: {
		$defs: T|undefined,
	}): ref_schema<undefined|[
		(keyof T & $def),
		...(keyof T & $def)[]
	]> {
		const _enum = object_keys($defs || {});

		return {
			type: 'object',
			required: ['$ref'],
			additionalProperties: false,
			properties: {
				$ref: {
					type: 'string',
					pattern: pattern,
					...(
						_enum.length >= 1
							? {
								enum: _enum,
							}
							: {}
					),
				},
			},
		}
	}
}

export class $defs
{
	static #pattern = new RegExp(sub_pattern);

	static assert_$defs(
		value: {[key: string]: SchemaObject},
	): asserts value is {[key: $def]: SchemaObject} {
		if (!this.is_$defs(value)) {
			throw new TypeError(
				'Value is not a supported object of definitions!',
			);
		}
	}

	static is_$def_key(value: string): value is $def
	{
		return this.#pattern.test(value);
	}

	static is_$defs(
		value: {[key: string]: SchemaObject},
	): value is {[key: $def]: SchemaObject} {
		return Object.keys(value).every((key) => this.is_$def_key(key));
	}

	static require_$defs(
		value: {[key: string]: SchemaObject},
	): {[key: $def]: SchemaObject} {
		this.assert_$defs(value);

		return value;
	}

	static schema_definition({
		definitions,
		schema_parser,
	}: {
		definitions: {[key: $def]: SchemaObject},
		schema_parser: SchemaParser,
	}): Readonly<$def_schema> {
		const result:Partial<$def_schema> = {};

		for (const [
			$ref,
			$def,
		] of Object.entries(definitions) as [$def, SchemaObject][]) {
			const type = schema_parser.parse($def);

			if (!type) {
				throw new TypeError(`Could not find type for ${$ref}`);
			}

			result[$ref] = type.schema_definition;
		}

		return Object.freeze(result as Required<typeof result>);
	}
}
