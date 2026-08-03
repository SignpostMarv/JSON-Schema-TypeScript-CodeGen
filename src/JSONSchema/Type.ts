import type {
	ValidateFunction,
} from 'ajv/dist/2020.js';
import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	NamedExports,
	TypeNode,
} from '@typescript/typescript6';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

import type {
	ObjectOfSchemas,
	SchemaObject,
} from '../types.ts';

import {
	AlwaysFreshCompile,
	type Is,
	type MaybeCacheCompile,
} from '../MaybeCacheCompile.ts';

import type {
	$defs_schema,
} from './$defs.ts';

import type {
	ts,
} from '../typescript/types.ts';

type SchemaDefinitionDefinition<
	Required extends readonly [
		string,
		...string[],
	] = readonly [
		string,
		...string[],
	],
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> = (
	& SchemaObject
	& {
		type: 'object',
		required: Required,
		additionalProperties: false,
		properties: Properties,
	}
);

type SchemaDefinitionDefinitionWith$defs<
	Required extends readonly [
		string,
		...string[],
	] = readonly [
		string,
		...string[],
	],
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> = SchemaDefinitionDefinition<
	Required,
	(
		& $defs_schema['properties']
		& {
			$defs: (
				| $defs_schema['properties']['$defs']
				| {
					type: 'object',
					const: ObjectOfSchemas,
				}
			),
		}
		& Properties
	)
>;

type SchemaDefinitionDefinitionWithNoSpecifiedProperties = {
	type: 'object',
	minProperties: 1,
	additionalProperties: Record<string, never>,
};

type SchemaDefinitionOneOf_choices = (
	| SchemaDefinitionDefinition
	| SchemaDefinitionDefinitionWithNoSpecifiedProperties
);

type SchemaDefinitionOneOf = {
	oneOf: [
		SchemaDefinitionOneOf_choices,
		SchemaDefinitionOneOf_choices,
		...SchemaDefinitionOneOf_choices[],
	],
};

type TypeDefinitionSchema<
	Schema extends SchemaObject = SchemaObject,
> = (
	& SchemaObject
	& Schema
);

type TypeOptions<
	SchemaDefinitionOptions extends {[key: string]: unknown},
	TypeDefinitionOptions extends {[key: string]: unknown},
> = {
	ajv: Ajv,
	schema_definition: SchemaDefinitionOptions,
	type_definition: TypeDefinitionOptions,
	add_to_$defs_excluded?: true,
	schema_compiler?: MaybeCacheCompile,
	ts: ts,
};

type SchemalessTypeOptions = Omit<
	TypeOptions<SchemaDefinitionDefinition, TypeDefinitionSchema>,
	(
		| 'schema_definition'
		| 'type_definition'
	)
>;

class VerboseMatchError extends TypeError {
	readonly ajv_errors: ValidateFunction['errors'];

	constructor(
		message: string,
		errors: VerboseMatchError['ajv_errors'],
		options?: ErrorOptions,
	) {
		super(message, options);
		this.ajv_errors = errors;
	}
}

abstract class Type<
	T,
	TypeDefinition extends TypeDefinitionSchema = TypeDefinitionSchema,
	TypeDefinitionOptions extends (
		{[key: string]: unknown}
	) = (
		{[key: string]: unknown}
	),
	SchemaDefinition extends (
		| SchemaDefinitionDefinition
		| SchemaDefinitionDefinitionWithNoSpecifiedProperties
		| SchemaDefinitionOneOf
	) = (
		| SchemaDefinitionDefinition
		| SchemaDefinitionDefinitionWithNoSpecifiedProperties
		| SchemaDefinitionOneOf
	),
	SchemaDefinitionOptions extends (
		{[key: string]: unknown}
	) = (
		{[key: string]: unknown}
	),
	TSType extends TypeNode|NamedExports = TypeNode,
	DataTo extends Expression = Expression,
	TypeDefinition_For_Generate extends TypeDefinitionSchema = TypeDefinition,
> {
	protected schema_compiler: MaybeCacheCompile;

	protected schema_definition: SchemaDefinition;

	protected type_definition: TypeDefinition;

	protected ts: ts;

	#check_type: Is<T>;

	#check_schema: Is<TypeDefinition>;

	protected static maybe_add_$defs_check: (
		| ValidateFunction
		| undefined
	) = undefined;

	protected static maybe_add_$defs_excluded_schemas: SchemaObject[] = [
	];

	constructor({
		ajv,
		schema_definition,
		type_definition,
		add_to_$defs_excluded,
		schema_compiler,
		ts,
	}: TypeOptions<SchemaDefinitionOptions, TypeDefinitionOptions>) {
		const static_class = (
			this.constructor as typeof Type<
				T,
				TypeDefinition,
				TypeDefinitionOptions,
				SchemaDefinition,
				SchemaDefinitionOptions,
				TSType,
				DataTo
			>
		);

		this.schema_compiler = schema_compiler || new AlwaysFreshCompile();

		this.type_definition = static_class.generate_type_definition(
			type_definition,
		) as TypeDefinition;

		this.schema_definition = static_class.generate_schema_definition(
			schema_definition,
		) as SchemaDefinition;

		if (add_to_$defs_excluded) {
			Type.maybe_add_$defs_excluded_schemas.push(this.schema_definition);
			Type.maybe_add_$defs_check = undefined;
		}

		this.#check_schema = this.schema_compiler.compile<TypeDefinition>(
			ajv,
			this.schema_definition,
		);
		this.#check_type = this.schema_compiler.compile<T>(
			ajv,
			this.type_definition,
		);

		this.ts = ts;
	}

	can_handle_schema(
		definition: TypeDefinitionSchema,
		must: true|'verbose',
	): this;
	can_handle_schema(
		definition: TypeDefinitionSchema,
		must?: false,
	): this|undefined;
	can_handle_schema(
		definition: TypeDefinitionSchema,
		must: boolean|'verbose' = false,
	): this|undefined {
		const check = this.check_schema(definition);
		if (!check && must) {
			if ('verbose' === must) {
				throw new VerboseMatchError(
					'supplied defintion did not match expected definition',
					this.#check_type.errors,
				);
			}
			throw new TypeError(
				'supplied defintion did not match expected definition',
			);
		}

		return check ? this : undefined;
	}

	check_schema(
		value: TypeDefinitionSchema,
	): value is TypeDefinition {
		return this.#check_schema(value);
	}

	check_type(
		value: unknown,
	): value is T {
		return this.#check_type(value);
	}

	abstract generate_typescript_data(
		data: T,
		schema_parser: SchemaParser,
		schema: TypeDefinition_For_Generate,
	): DataTo;

	abstract generate_typescript_type(options: (
		| undefined
		| {
			data: T,
		}
		| {
			schema: TypeDefinition_For_Generate,
		}
		| {
			data?: T,
			schema: TypeDefinition_For_Generate,
			schema_parser: SchemaParser,
		}
	)): Promise<TSType>;

	static clear_$defs_excluded_schemas() {
		this.maybe_add_$defs_excluded_schemas = [];
		this.maybe_add_$defs_check = undefined;
	}

	static generate_schema_definition(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_: {[key: string]: unknown},
	): Readonly<(
		| SchemaDefinitionDefinition
		| SchemaDefinitionDefinitionWithNoSpecifiedProperties
		| SchemaDefinitionOneOf
	)> {
		throw new Error('Not implemented!');
	}

	static generate_type_definition(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_: {[key: string]: unknown},
	): Readonly<TypeDefinitionSchema> {
		throw new Error('Not implemented!');
	}

	static is_a<
		T extends Type<unknown>,
	>(maybe: unknown): maybe is T {
		return maybe instanceof this;
	}

	/**
	 * @todo refactor to SchemaParser
	 */
	static maybe_add_$defs<
		T extends SchemaObject,
	>(
		schema: SchemaObject,
		sub_schema: T,
	): T {
		if ('$defs' in schema) {
			let modify = (
				undefined === this.maybe_add_$defs_check
				&& this.maybe_add_$defs_excluded_schemas.length < 1
			);

			if (
				undefined === this.maybe_add_$defs_check
				&& this.maybe_add_$defs_excluded_schemas.length >= 1
			) {
				this.maybe_add_$defs_check = (new Ajv({
					strict: true,
				})).compile({
					not: {
						oneOf: this.maybe_add_$defs_excluded_schemas,
					},
				});
			}

			if (undefined !== this.maybe_add_$defs_check) {
				modify = this.maybe_add_$defs_check(sub_schema);
			}

			if (modify) {
				return {
					$defs: schema.$defs,
					...sub_schema,
				};
			}
		}

		return sub_schema;
	}
}

export type {
	SchemaDefinitionDefinition,
	SchemaDefinitionDefinitionWith$defs,
	SchemaDefinitionDefinitionWithNoSpecifiedProperties,
	SchemaDefinitionOneOf,
	TypeDefinitionSchema,
	TypeOptions,
	SchemalessTypeOptions,
};

export {
	Type,
};
