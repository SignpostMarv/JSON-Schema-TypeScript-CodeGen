import type {
	Expression,
	TypeNode,
} from 'typescript';

import type {
	GeneratesFrom_with_$defs,
	ObjectOfSchemas,
	SchemaDefinition_with_$defs,
	Type,
} from './Type.ts';
import {
	TypeWithDefs,
} from './Type.ts';

import type {
	SchemaParser,
	supported_type,
} from '../SchemaParser.ts';

import {
	object_keys,
} from '../coercions.ts';

export type GeneratesFromObject_schema = {
	type: 'object',
	additionalProperties?: false,
	unevaluatedProperties?: false,
	required?: string[],
	properties: ObjectOfSchemas,
	patternProperties: ObjectOfSchemas,
};

export type simple_object_schema = Omit<
	GeneratesFromObject_schema,
	'patternProperties'
>;

export type pattern_object_schema = Omit<
	GeneratesFromObject_schema,
	'properties'
>;

type schema_property_types = Pick<
	GeneratesFromObject_schema,
	(
		| 'properties'
		| 'patternProperties'
	)
>;

type GeneratesFromObject<
	T extends (
		| 'properties'
		| 'patternProperties'
		| 'both'
	) = (
		| 'properties'
		| 'patternProperties'
	),
> = (
	& GeneratesFrom_with_$defs
	& (
		T extends 'both'
			? schema_property_types
			: (
				T extends Exclude<
					(
						| 'properties'
						| 'patternProperties'
						| 'both'
					),
					(
						| 'patternProperties'
						| 'both'
					)
				>
					? Omit<schema_property_types, 'patternProperties'>
					: Omit<schema_property_types, 'properties'>
			)
	)
)

export abstract class BaseObject<
	T,
	Matches extends SchemaDefinition_with_$defs,
	GeneratesFrom extends (
		| GeneratesFromObject<'both'>
		| GeneratesFromObject<'properties'>
		| GeneratesFromObject<'patternProperties'>
	) = (
		| GeneratesFromObject<'both'>
		| GeneratesFromObject<'properties'>
		| GeneratesFromObject<'patternProperties'>
	),
	TSType extends TypeNode = TypeNode,
	TSExpression extends Expression = Expression
> extends TypeWithDefs<
	T,
	Matches,
	GeneratesFrom,
	TSType,
	TSExpression
> {
	protected get_type_for_property(
		property: string,
		schema: GeneratesFrom,
		schema_parser: SchemaParser,
		require_conversion = false,
	): (
		typeof require_conversion extends true
			? Type<unknown>
			: supported_type
	) {
		if (
			BaseObject.#is_schema_with_properties(schema)
			&& property in schema.properties
		) {
			return schema_parser.parse(
				schema.properties[property],
				require_conversion,
			);
		}

		type coerced = (
			& GeneratesFrom
			& GeneratesFromObject<'both'|'patternProperties'>
		);

		const matching = object_keys(
			(schema as coerced).patternProperties,
		).find((maybe) => {
			return (new RegExp(maybe)).test(property);
		});

		if (undefined === matching) {
			throw new TypeError(`Property "${property}" has no match on the specified schema!`);
		}

		return schema_parser.parse(
			(schema as coerced).patternProperties[matching],
			require_conversion,
		);
	}

	static #is_schema_with_properties<
		T extends GeneratesFromObject<'properties'|'patternProperties'>
	>(
		schema: T,
	): schema is T & GeneratesFromObject<'properties'> {
		return 'properties' in schema;
	}
}
