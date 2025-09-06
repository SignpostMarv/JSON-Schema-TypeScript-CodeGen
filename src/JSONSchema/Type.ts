import type {
	Ajv2020 as Ajv,
	SchemaObject,
	ValidateFunction,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	TypeNode,
} from 'typescript';

export type ObjectOfSchemas = {[key: string]: SchemaObject};

export type SchemaDefinition<
	Required extends [string, ...string[]] = [string, ...string[]],
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

export type TypeOptions<
	Definition extends SchemaDefinition,
> = {
	ajv: Ajv,
	schema_definition: Definition|Readonly<Definition>,
};

export type SchemalessTypeOptions = Omit<
	TypeOptions<SchemaDefinition>,
	'schema_definition'
>;

export abstract class Type<
	T,
	Definition extends SchemaDefinition = SchemaDefinition,
	TSType extends TypeNode = TypeNode,
	TSExpression extends Expression = Expression
> {
	readonly schema_definition: Readonly<Definition>;

	#validate: ValidateFunction<Definition>;

	constructor({
		ajv,
		schema_definition,
	}: TypeOptions<Definition>) {
		this.#validate = ajv.compile(schema_definition);
		this.schema_definition = Object.freeze(schema_definition);
	}

	matches(
		definition: SchemaObject,
	): this|undefined {
		return this.#validate(definition) ? this : undefined;
	}

	abstract convert(data: T, schema?: Definition): TSExpression;

	abstract generate_type(schema: Definition): TSType;

	static schema_definition(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_: {[k: string]: unknown} = {},
	): Readonly<SchemaDefinition> {
		throw new Error('Not implemented!');
	}
}
