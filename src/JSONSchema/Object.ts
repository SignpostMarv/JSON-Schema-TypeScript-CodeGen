import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
	ObjectLiteralExpression,
	PropertySignature,
	TypeLiteralNode,
} from 'typescript';
import {
	factory,
	SyntaxKind,
} from 'typescript';

import type {
	GeneratesFrom_with_$defs,
	ObjectOfSchemas,
	SchemaDefinition_with_$defs,
	SchemalessTypeOptions,
	TypedSchemaDefinition_without_$defs,
} from './Type.ts';
import {
	Type,
	TypeWithDefs,
} from './Type.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

import type {
	adjust_name_callback,
} from '../coercions.ts';
import {
	adjust_name_default,
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

export type GeneratesFromObject<
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
			? (schema_property_types & GeneratesFromObject_schema)
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
					? (
						& Omit<schema_property_types, 'patternProperties'>
						& simple_object_schema
					)
					: (
						& Omit<schema_property_types, 'properties'>
						& pattern_object_schema
					)
			)
	)
)

export class ObjectHelper
{

	static convert<
		T,
		GeneratesFrom extends (
			| GeneratesFromObject<'both'>
			| GeneratesFromObject<'properties'>
			| GeneratesFromObject<'patternProperties'>
		) = (
			| GeneratesFromObject<'both'>
			| GeneratesFromObject<'properties'>
			| GeneratesFromObject<'patternProperties'>
		),
	> (
		value: unknown,
		property: string,
		schema: GeneratesFrom,
		schema_parser: SchemaParser,
	) {
		const sub_schema = this.#sub_schema_for_property(
			property,
			schema,
		);
		const ajv = schema_parser.share_ajv((ajv) => ajv);
		const validator = ajv.compile<T>(sub_schema);

		if (!(validator(value))) {
			throw new TypeError('Supplied value not supported by property!');
		}

		return schema_parser.parse(
			sub_schema,
			true,
		).convert(
			value,
			sub_schema,
			schema_parser,
		);
	}

	static createObjectLiteralExpression<
		T extends {[key: string]: unknown},
		Mode extends keyof ObjectWith$defs_Definition_required_by_mode,
		GeneratesFrom extends (
			Mode extends 'both'
				? GeneratesFromObject<'both'>
				: (
					Mode extends 'properties'
						? GeneratesFromObject<'properties'>
						: GeneratesFromObject<'patternProperties'>
				)
		)
	>(
		data: T,
		schema: GeneratesFrom,
		schema_parser: SchemaParser,
		adjust_name: adjust_name_callback,
	) {
		return factory.createObjectLiteralExpression(
			Object.entries(
				data,
			).map(([
				property,
				value,
			]) => {
				const type = ObjectHelper.convert(
					value,
					property,
					schema,
					schema_parser,
				);

				return factory.createPropertyAssignment(
					adjust_name(property),
					type,
				)
			}),
		);
	}

	static createTypeLiteralNode<
		Mode extends keyof ObjectWith$defs_Definition_required_by_mode,
		GeneratesFrom extends (
			& (
				Mode extends 'both'
					? GeneratesFromObject<'both'>
					: (
						Mode extends 'properties'
							? GeneratesFromObject<'properties'>
							: GeneratesFromObject<'patternProperties'>
					)
			)
			& (
				| GeneratesFromObject<'both'>
				| GeneratesFromObject<'properties'>
			)
		),
	>(
		schema: (
			& GeneratesFrom
			& (
				| GeneratesFromObject<'both'>
				| GeneratesFromObject<'properties'>
			)
		),
		schema_parser: SchemaParser,
	) {
		return factory.createTypeLiteralNode(
			Object.keys(
				schema.properties,
			).map((
				property,
			): PropertySignature => factory.createPropertySignature(
				undefined,
				(
					/[?[\] ]/.test(property)
						? factory.createComputedPropertyName(
							factory.createStringLiteral(property),
						)
						: property
				),
				(
					(schema.required || []).includes(property)
						? undefined
						: factory.createToken(SyntaxKind.QuestionToken)
				),
				ObjectHelper.generate_type(
					property,
					schema,
					schema_parser,
				),
			)),
		);
	}

	static generate_type<
		GeneratesFrom extends (
			| GeneratesFromObject<'both'>
			| GeneratesFromObject<'properties'>
			| GeneratesFromObject<'patternProperties'>
		) = (
			| GeneratesFromObject<'both'>
			| GeneratesFromObject<'properties'>
			| GeneratesFromObject<'patternProperties'>
		),
	> (
		property: string,
		schema: GeneratesFrom,
		schema_parser: SchemaParser,
	) {
		const sub_schema = this.#sub_schema_for_property(
			property,
			schema,
		);

		return schema_parser.parse(
			sub_schema,
		).generate_type(
			sub_schema,
			schema_parser,
		);
	}

	static #sub_schema_for_property<
		GeneratesFrom extends (
			| GeneratesFromObject<'both'>
			| GeneratesFromObject<'properties'>
			| GeneratesFromObject<'patternProperties'>
		) = (
			| GeneratesFromObject<'both'>
			| GeneratesFromObject<'properties'>
			| GeneratesFromObject<'patternProperties'>
		),
	>(
		property: string,
		schema: GeneratesFrom,
	): SchemaObject {
		if (
			ObjectHelper.#is_schema_with_properties(schema)
			&& property in schema.properties
		) {
			return schema.properties[property];
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

		return (schema as coerced).patternProperties[matching];
	}

	static #is_schema_with_properties<
		T extends GeneratesFromObject<'properties'|'patternProperties'>
	>(
		schema: T,
	): schema is T & GeneratesFromObject<'properties'> {
		return 'properties' in schema;
	}
}

type ObjectPropertiesForDefinition = {
	required: [
		'properties',
		'patternProperties',
		...string[],
	],
	properties: {
		type: 'object',
		additionalProperties: {
			type: 'object',
		},
	},
	patternProperties: {
		type: 'object',
		additionalProperties: {
			type: 'object',
		},
	},
};

const ObjectPropertiesForDefinition: (
	ObjectPropertiesForDefinition
) = {
	required: ['properties', 'patternProperties'],
	properties: {
		type: 'object',
		additionalProperties: {
			type: 'object',
		},
	},
	patternProperties: {
		type: 'object',
		additionalProperties: {
			type: 'object',
		},
	},
};

type ObjectPropertiesForDefinition_by_mode = {
	both: ObjectPropertiesForDefinition & {
		required: [
			'properties',
			'patternProperties',
			...string[]
		]
	},
	properties: Pick<ObjectPropertiesForDefinition, 'properties'> & {
		required: [
			'properties',
			...string[]
		]
	},
	patternProperties: Pick<
		ObjectPropertiesForDefinition,
		'patternProperties'
	> & {
		required: [
			'patternProperties',
			...string[]
		]
	},
};

const ObjectPropertiesForDefinition_by_mode: (
	ObjectPropertiesForDefinition_by_mode
) = {
	both: ObjectPropertiesForDefinition,
	properties: {
		required: ['properties'],
		properties: ObjectPropertiesForDefinition.properties,
	},
	patternProperties: {
		required: ['patternProperties'],
		patternProperties: (
			ObjectPropertiesForDefinition.patternProperties
		),
	},
}

type ObjectWith$defs_Definition_required_by_mode = {
	both: ['type', '$defs', 'properties', 'patternProperties'],
	properties: ['type', '$defs', 'properties'],
	patternProperties: ['type', '$defs', 'patternProperties'],
};

const ObjectWith$defs_Definition_required_by_mode: (
	ObjectWith$defs_Definition_required_by_mode
) = {
	both: ['type', '$defs', 'properties', 'patternProperties'],
	properties: ['type', '$defs', 'properties'],
	patternProperties: ['type', '$defs', 'patternProperties'],
};

type ObjectWithout$defs_Definition_required_by_mode = {
	both: ['type', 'properties', 'patternProperties'],
	properties: ['type', 'properties'],
	patternProperties: ['type', 'patternProperties'],
};

const ObjectWithout$defs_Definition_required_by_mode: (
	ObjectWithout$defs_Definition_required_by_mode
) = {
	both: ['type', 'properties', 'patternProperties'],
	properties: ['type', 'properties'],
	patternProperties: ['type', 'patternProperties'],
};

type ObjectWith$defs_Definition<
	Mode extends 'both'|'properties'|'patternProperties',
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> = SchemaDefinition_with_$defs<
	'object',
	ObjectWith$defs_Definition_required_by_mode[Mode],
	(
		& Properties
		& ObjectPropertiesForDefinition_by_mode[Mode]
	)
>;

type ObjectWithout$defs_Definition<
	Mode extends 'both'|'properties'|'patternProperties',
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> = TypedSchemaDefinition_without_$defs<
	'object',
	ObjectWithout$defs_Definition_required_by_mode[Mode],
	(
		& Properties
		& ObjectPropertiesForDefinition_by_mode[Mode]
	)
>;

export class ObjectWith$defs<
	Mode extends keyof ObjectWith$defs_Definition_required_by_mode = (
		keyof ObjectWith$defs_Definition_required_by_mode
	),
	T extends {[key: string]: unknown} = {[key: string]: unknown},
	GeneratesFrom extends (
		Mode extends 'both'
			? GeneratesFromObject<'both'>
			: (
				Mode extends 'properties'
					? GeneratesFromObject<'properties'>
					: GeneratesFromObject<'patternProperties'>
			)
	) = (
		Mode extends 'both'
			? GeneratesFromObject<'both'>
			: (
				Mode extends 'properties'
					? GeneratesFromObject<'properties'>
					: GeneratesFromObject<'patternProperties'>
			)
	)
> extends TypeWithDefs<
	T,
	'object',
	ObjectWith$defs_Definition<Mode>,
	GeneratesFrom,
	TypeLiteralNode,
	ObjectLiteralExpression
> {
	#adjust_name: adjust_name_callback;

	constructor(
		options: SchemalessTypeOptions,
		{
			adjust_name,
			mode,
		}: {
			adjust_name?: adjust_name_callback,
			mode: Mode,
		},
	) {
		super({
			...options,
			schema_definition: ObjectWith$defs.schema_definition({mode}),
		});
		this.#adjust_name = adjust_name || adjust_name_default;
	}

	convert(
		data: T,
		schema: GeneratesFrom,
		schema_parser: SchemaParser,
	) {
		return ObjectHelper.createObjectLiteralExpression(
			data,
			schema,
			schema_parser,
			this.#adjust_name,
		);
	}

	generate_type(
		schema: (
			& GeneratesFrom
			& (
				| GeneratesFromObject<'both'>
				| GeneratesFromObject<'properties'>
			)
		),
		schema_parser: SchemaParser,
	) {
		return ObjectHelper.createTypeLiteralNode(schema, schema_parser);
	}

	static schema_definition<
		Mode extends keyof ObjectWith$defs_Definition_required_by_mode,
	>({
		mode,
	}: {
		mode: Mode,
	}): Readonly<ObjectWith$defs_Definition<Mode>> {

		const required:(
			ObjectWith$defs_Definition<
				Mode
			>['properties']['required']
		) = (
			'both' === mode
				? ['properties', 'patternProperties']
				: (
					'properties' === mode
						? ['properties']
						: ['patternProperties']
				)
		);
		const properties:Partial<
			ObjectWith$defs_Definition<
				'both'
			>['properties']
		> = {
			$defs: {
				type: 'object',
				additionalProperties: {
					type: 'object',
				},
				minProperties: 1,
			},
			required: required as ObjectWith$defs_Definition<
				'both'
			>['properties']['required'],
			type: {
				type: 'string',
				const: 'object',
			},
		};

		if ('properties' === mode || 'both' === mode) {
			properties.properties = ObjectPropertiesForDefinition.properties;
		}

		if ('patternProperties' === mode || 'both' === mode) {
			properties.patternProperties = (
				ObjectPropertiesForDefinition.patternProperties
			);
		}

		const coerced:ObjectWith$defs_Definition<
			Mode
		>[
			'properties'
		] = properties as ObjectWith$defs_Definition<
			Mode
		>['properties'];

		return Object.freeze<ObjectWith$defs_Definition<Mode>>({
			type: 'object',
			additionalProperties: false,
			required: ObjectWith$defs_Definition_required_by_mode[mode],
			properties: coerced,
		});
	}
}

export class ObjectWithout$defs<
	T extends {[key: string]: unknown},
	Mode extends keyof ObjectWithout$defs_Definition_required_by_mode,
	GeneratesFrom extends (
		Mode extends 'both'
			? GeneratesFromObject<'both'>
			: (
				Mode extends 'properties'
					? GeneratesFromObject<'properties'>
					: GeneratesFromObject<'patternProperties'>
			)
	) = (
		Mode extends 'both'
			? GeneratesFromObject<'both'>
			: (
				Mode extends 'properties'
					? GeneratesFromObject<'properties'>
					: GeneratesFromObject<'patternProperties'>
			)
	)
> extends Type<
	T,
	ObjectWithout$defs_Definition<Mode>,
	GeneratesFrom,
	TypeLiteralNode,
	ObjectLiteralExpression
> {
	#adjust_name: adjust_name_callback;

	constructor(
		options: SchemalessTypeOptions,
		{
			adjust_name,
			mode,
		}: {
			adjust_name?: adjust_name_callback,
			mode: Mode,
		},
	) {
		super({
			...options,
			schema_definition: ObjectWithout$defs.schema_definition({mode}),
		});
		this.#adjust_name = adjust_name || adjust_name_default;
	}

	convert(
		data: T,
		schema: GeneratesFrom,
		schema_parser: SchemaParser,
	) {
		return ObjectHelper.createObjectLiteralExpression(
			data,
			schema,
			schema_parser,
			this.#adjust_name,
		);
	}

	generate_type(
		schema: (
			& GeneratesFrom
			& (
				| GeneratesFromObject<'both'>
				| GeneratesFromObject<'properties'>
			)
		),
		schema_parser: SchemaParser,
	) {
		return ObjectHelper.createTypeLiteralNode(schema, schema_parser);
	}

	static schema_definition<
		Mode extends keyof ObjectWithout$defs_Definition_required_by_mode,
	>({
		mode,
	}: {
		mode: Mode,
	}): Readonly<ObjectWithout$defs_Definition<Mode>> {
		const properties:Partial<
			ObjectWithout$defs_Definition<
				'both'
			>['properties']
		> = {
			type: {
				type: 'string',
				const: 'object',
			},
			$defs: {
				type: 'object',
				additionalProperties: {
					type: 'object',
				},
				minProperties: 1,
			},
		};

		if ('properties' === mode || 'both' === mode) {
			properties.properties = ObjectPropertiesForDefinition.properties;
		}

		if ('patternProperties' === mode || 'both' === mode) {
			properties.patternProperties = (
				ObjectPropertiesForDefinition.patternProperties
			);
		}

		const coerced:ObjectWithout$defs_Definition<
			Mode
		>[
			'properties'
		] = properties as ObjectWithout$defs_Definition<
			Mode
		>['properties'];

		return Object.freeze<ObjectWithout$defs_Definition<Mode>>({
			type: 'object',
			additionalProperties: false,
			required: ObjectWithout$defs_Definition_required_by_mode[mode],
			properties: coerced,
		});
	}
}
