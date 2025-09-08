import type {
	Ajv2020 as Ajv,
	SchemaObject,
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

export abstract class ConversionlessType<
	Matches extends SchemaDefinition = SchemaDefinition,
	GeneratesFrom extends SchemaObject = SchemaObject,
	TSType extends TypeNode = TypeNode,
> {
	readonly schema_definition: Readonly<Matches>;

	#validate: ValidateFunction<Matches>;

	constructor({
		ajv,
		schema_definition,
	}: TypeOptions<Matches>) {
		this.#validate = ajv.compile(schema_definition);
		this.schema_definition = Object.freeze(schema_definition);
	}

	matches(
		definition: SchemaObject,
	): definition is GeneratesFrom {
		return this.#validate(definition);
	}

	matching(
		definition: SchemaObject,
	): this|undefined {
		return this.matches(definition) ? this : undefined;
	}

	must_match(
		definition: SchemaObject,
	): asserts definition is GeneratesFrom {
		if (!this.matches(definition)) {
			throw new TypeError(
				'supplied defintion did not match expected definition',
			);
		}
	}

	abstract generate_type(
		schema: GeneratesFrom,
		schema_parser: SchemaParser,
	): TSType;

	static schema_definition(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_: {[k: string]: unknown} = {},
	): Readonly<SchemaDefinition> {
		throw new Error('Not implemented!');
	}
}

export abstract class Type<
	T,
	Matches extends SchemaDefinition = SchemaDefinition,
	GeneratesFrom extends SchemaObject = SchemaObject,
	TSType extends TypeNode = TypeNode,
	TSExpression extends Expression = Expression
> extends ConversionlessType<
	Matches,
	GeneratesFrom,
	TSType
> {
	abstract convert(
		data: T,
		schema: GeneratesFrom,
		schema_parser: SchemaParser,
	): TSExpression;
}

export type TypedSchemaDefinition<
	Type extends string,
	Required extends [
		'type',
		...string[]
	] = [
		'type',
		...string[]
	],
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> = SchemaDefinition<
	Required,
	(
		& Properties
		& {
			type: {
				type: 'string',
				const: Type,
			}
		}
	)
>;

export type TypedSchemaDefinition_without_$defs<
	Type extends string,
	Required extends [
		'type',
		...Exclude<string, '$defs'>[]
	] = [
		'type',
		...Exclude<string, '$defs'>[]
	],
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> = TypedSchemaDefinition<
	Type,
	Required,
	(
		& Properties
		& {
			type: {
				type: 'string',
				const: Type,
			}
		}
	)
>;

export type SchemaDefinition_with_$defs<
	Type extends string,
	Required extends [
		'type',
		'$defs',
		...string[]
	] = [
		'type',
		'$defs',
		...string[]
	],
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> = TypedSchemaDefinition<
	Type,
	Required,
	(
		& Properties
		& {
			$defs: {
				type: 'object',
				additionalProperties: {
					type: 'object',
				},
			},
		}
	)
>;

export type GeneratesFrom_with_$defs = (
	& SchemaObject
	& {
		$defs: {[key: $def]: SchemaObject},
	}
);

export abstract class TypeWithDefs<
	T,
	SchemaDefinitionType extends string,
	Matches extends SchemaDefinition_with_$defs<SchemaDefinitionType>,
	GeneratesFrom extends GeneratesFrom_with_$defs = GeneratesFrom_with_$defs,
	TSType extends TypeNode = TypeNode,
	TSExpression extends Expression = Expression
> extends Type<
	T,
	Matches,
	GeneratesFrom,
	TSType,
	TSExpression
> {
}
