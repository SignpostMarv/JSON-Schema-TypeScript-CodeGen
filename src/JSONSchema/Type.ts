import type {
	Ajv2020 as Ajv,
	ValidateFunction,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	TypeNode,
} from 'typescript';

import type {
	$def,
} from './Ref.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

import type {
	ObjectOfSchemas,
	SchemaObject,
} from '../types.ts';

export type SchemaDefinitionDefinition<
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

export type TypeDefinitionSchema<
	Schema extends SchemaObject = SchemaObject,
> = (
	& SchemaObject
	& Schema
);

export type TypeOptions<
	Schema extends SchemaDefinitionDefinition,
	Type extends TypeDefinitionSchema,
> = {
	ajv: Ajv,
	schema_definition: Readonly<Schema>,
	type_definition: Readonly<Type>,
};

export type SchemalessTypeOptions = Omit<
	TypeOptions<SchemaDefinitionDefinition, TypeDefinitionSchema>,
	(
		| 'schema_definition'
		| 'type_definition'
	)
>;

export class VerboseMatchError extends TypeError {
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

export abstract class ConversionlessType<
	T,
	TypeDefinition extends TypeDefinitionSchema = TypeDefinitionSchema,
	SchemaDefinition extends (
		SchemaDefinitionDefinition
	) = SchemaDefinitionDefinition,
	TSType extends TypeNode = TypeNode,
> {
	protected schema_definition: SchemaDefinition;

	protected type_definition: TypeDefinition;

	#check_type: ValidateFunction<T>;

	#check_schema: ValidateFunction<TypeDefinition>;

	constructor({
		ajv,
		schema_definition,
		type_definition,
	}: TypeOptions<SchemaDefinition, TypeDefinition>) {
		this.type_definition = type_definition;
		this.schema_definition = schema_definition;
		(
			this.constructor as typeof ConversionlessType<unknown>
		).configure_ajv(ajv);
		this.#check_schema = ajv.compile<TypeDefinition>(schema_definition);
		this.#check_type = ajv.compile<T>(type_definition);
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

	abstract generate_typescript_type(options: (
		| undefined
		| {
			data: T,
		}
		| {
			schema: TypeDefinition,
		}
		| {
			data?: T,
			schema: TypeDefinition,
			schema_parser: SchemaParser,
		}
	)): Promise<TSType>;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static configure_ajv(ajv: Ajv) {
	}

	static generate_default_schema_definition(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_: {[k: string]: unknown} = {},
	): Readonly<SchemaDefinitionDefinition> {
		throw new Error('Not implemented!');
	}

	static is_a(maybe: unknown): maybe is ConversionlessType<unknown> {
		return maybe instanceof this;
	}
}

export abstract class Type<
	T,
	TypeDefinition extends TypeDefinitionSchema = TypeDefinitionSchema,
	SchemaDefinition extends (
		SchemaDefinitionDefinition
	) = SchemaDefinitionDefinition,
	SchemaTo extends TypeNode = TypeNode,
	DataTo extends Expression = Expression,
> extends
	ConversionlessType<
		T,
		TypeDefinition,
		SchemaDefinition,
		SchemaTo
	> {
	abstract generate_typescript_data(
		data: T,
		schema_parser: SchemaParser,
		schema: TypeDefinition,
	): DataTo;

	static is_a(maybe: unknown): maybe is Type<unknown> {
		return super.is_a(maybe);
	}
}

export type TypedSchemaDefinition<
	TypeProperty extends string,
	Required extends [
		'type',
		...string[],
	] = [
		'type',
		...string[],
	],
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> = SchemaDefinitionDefinition<
	Required,
	(
		& Properties
		& {
			type: {
				type: 'string',
				const: TypeProperty,
			},
		}
	)
>;

export type TypedSchemaDefinition_without_$defs<
	TypeProperty extends string,
	Required extends [
		'type',
		...Exclude<string, '$defs'>[],
	] = [
		'type',
		...Exclude<string, '$defs'>[],
	],
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> = TypedSchemaDefinition<
	TypeProperty,
	Required,
	Properties
>;

export type TypeDefinition_with_$defs<
	TypeProperty extends string,
	Required extends [
		'type',
		'$defs',
		...string[],
	] = [
		'type',
		'$defs',
		...string[],
	],
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> = TypedSchemaDefinition<
	TypeProperty,
	Required,
	(
		& Properties
		& {
			$defs: {[key: $def]: SchemaObject},
		}
	)
>;

export type SchemaDefinition_with_$defs<
	Required extends (
		['$defs', string, ...string[]]
	) = (
		['$defs', string, ...string[]]
	),
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> = SchemaDefinitionDefinition<
	Required,
	(
		& Properties
		& {
			$defs: {
				type: 'object',
				additionalProperties: {
					type: 'object',
				},
				minProperties: 1,
			},
		}
	)
>;

export abstract class TypeWithDefs<
	T,
	SchemaDefinitionType extends string,
	TypeDefinition extends (
		TypeDefinition_with_$defs<SchemaDefinitionType>
	) = (
		TypeDefinition_with_$defs<SchemaDefinitionType>
	),
	SchemaDefinition extends (
		SchemaDefinition_with_$defs
	) = SchemaDefinition_with_$defs,
	SchemaTo extends TypeNode = TypeNode,
	DataTo extends Expression = Expression,
> extends
	Type<
		T,
		TypeDefinition,
		SchemaDefinition,
		SchemaTo,
		DataTo
	> {
}
