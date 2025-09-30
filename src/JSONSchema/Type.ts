import type {
	Ajv2020 as Ajv,
	ValidateFunction,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	TypeNode,
} from 'typescript';

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
	]|never[] = readonly [
		string,
		...string[],
	]|never[],
	Properties extends (
		| ObjectOfSchemas
		| Record<string, never>
	) = (
		| ObjectOfSchemas
		| Record<string, never>
	),
	HasProperties extends 'yes'|'no' = 'yes'|'no',
> = (
	& SchemaObject
	& (
		{
			yes: {
				type: 'object',
				required: Required,
				additionalProperties: false,
				properties: Properties,
			},
			no: {
				type: 'object',
				minProperties: 1,
				additionalProperties: Record<string, never>,
			},
		}[HasProperties]
	)
);

export type SchemaObjectDefinition = SchemaDefinitionDefinition<
	[],
	Record<string, never>
>;

export type TypeDefinitionSchema<
	Schema extends SchemaObject = SchemaObject,
> = (
	& SchemaObject
	& Schema
);

export type TypeOptions<
	SchemaDefinitionOptions extends {[key: string]: unknown},
	TypeDefinitionOptions extends {[key: string]: unknown},
> = {
	ajv: Ajv,
	schema_definition: SchemaDefinitionOptions,
	type_definition: TypeDefinitionOptions,
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
	TypeDefinitionOptions extends (
		{[key: string]: unknown}
	) = (
		{[key: string]: unknown}
	),
	SchemaDefinition extends (
		SchemaDefinitionDefinition
	) = SchemaDefinitionDefinition,
	SchemaDefinitionOptions extends (
		{[key: string]: unknown}
	) = (
		{[key: string]: unknown}
	),
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
	}: TypeOptions<SchemaDefinitionOptions, TypeDefinitionOptions>) {
		const static_class = (
			this.constructor as typeof ConversionlessType<
				T,
				TypeDefinition,
				TypeDefinitionOptions,
				SchemaDefinition,
				SchemaDefinitionOptions,
				TSType
			>
		);

		this.type_definition = static_class.generate_type_definition(
			type_definition,
		) as TypeDefinition;

		this.schema_definition = static_class.generate_schema_definition(
			schema_definition,
		) as SchemaDefinition;

		static_class.configure_ajv(ajv);
		this.#check_schema = ajv.compile<TypeDefinition>(
			this.schema_definition,
		);
		this.#check_type = ajv.compile<T>(this.type_definition);
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

	static generate_schema_definition(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_: {[key: string]: unknown},
	): Readonly<SchemaDefinitionDefinition> {
		throw new Error('Not implemented!');
	}

	static generate_type_definition(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_: {[key: string]: unknown},
	): Readonly<TypeDefinitionSchema> {
		throw new Error('Not implemented!');
	}

	static is_a<
		T extends ConversionlessType<unknown>,
	>(maybe: unknown): maybe is T {
		return maybe instanceof this;
	}
}

export abstract class Type<
	T,
	TypeDefinition extends TypeDefinitionSchema = TypeDefinitionSchema,
	TypeDefinitionOptions extends (
		{[key: string]: unknown}
	) = (
		{[key: string]: unknown}
	),
	SchemaDefinition extends (
		SchemaDefinitionDefinition
	) = SchemaDefinitionDefinition,
	SchemaDefinitionOptions extends (
		{[key: string]: unknown}
	) = (
		{[key: string]: unknown}
	),
	SchemaTo extends TypeNode = TypeNode,
	DataTo extends Expression = Expression,
> extends
	ConversionlessType<
		T,
		TypeDefinition,
		TypeDefinitionOptions,
		SchemaDefinition,
		SchemaDefinitionOptions,
		SchemaTo
	> {
	abstract generate_typescript_data(
		data: T,
		schema_parser: SchemaParser,
		schema: TypeDefinition,
	): DataTo;
}
