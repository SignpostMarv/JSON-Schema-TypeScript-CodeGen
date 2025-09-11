import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
	IndexSignatureDeclaration,
	ObjectLiteralExpression,
	PropertySignature,
	TypeNode,
} from 'typescript';
import {
	factory,
	SyntaxKind,
} from 'typescript';

import type {
	ObjectOfSchemas,
	SchemaDefinitionDefinition,
	TypeDefinitionSchema,
	TypeOptions,
} from './Type.ts';
import {
	Type,
} from './Type.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

import type {
	adjust_name_callback,
} from '../coercions.ts';
import {
	adjust_name_default,
	intersection_type_node,
	object_keys,
	type_literal_node,
} from '../coercions.ts';

import type {
	IntersectionTypeNode,
	TypeLiteralNode,
} from '../types.ts';

type object_properties_mode = (
	| 'both'
	| 'properties'
	| 'patternProperties'
);

type object_$defs_mode = (
	| 'with'
	| 'without'
);

type object_without_$defs_type_both<
	Required extends undefined|[string, ...string[]],
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = (
	Required extends undefined
		? {
			type: 'object',
			properties: Properties,
			patternProperties: PatternProperties,
		}
		: {
			type: 'object',
			required: Required,
			properties: Properties,
			patternProperties: PatternProperties,
		}
);

type object_with_$defs_type_both<
	Required extends undefined|[string, ...string[]],
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
	Defs extends ObjectOfSchemas,
> = (
	& object_without_$defs_type_both<
		Required,
		Properties,
		PatternProperties
	>
	& {
		$defs: Defs,
	}
);

type object_without_$defs_type_properties<
	Required extends undefined|[string, ...string[]],
	Properties extends ObjectOfSchemas,
> = Omit<
	object_without_$defs_type_both<Required, Properties, never>,
	'patternProperties'
>;

type object_with_$defs_type_properties<
	Required extends undefined|[string, ...string[]],
	Properties extends ObjectOfSchemas,
	Defs extends ObjectOfSchemas,
> = Omit<
	object_with_$defs_type_both<Required, Properties, never, Defs>,
	'patternProperties'
>;

type object_without_$defs_type_pattern_properties<
	Required extends undefined|[string, ...string[]],
	PatternProperties extends ObjectOfSchemas,
> = Omit<
	object_without_$defs_type_both<Required, never, PatternProperties>,
	'properties'
>;

type object_with_$defs_type_pattern_properties<
	Required extends undefined|[string, ...string[]],
	PatternProperties extends ObjectOfSchemas,
	Defs extends ObjectOfSchemas,
> = Omit<
	object_with_$defs_type_both<Required, never, PatternProperties, Defs>,
	'properties'
>;

type object_without_$defs_type<
	Mode extends object_properties_mode = 'both',
	Required extends (
		| undefined
		| [string, ...string[]]
	) = (
		| undefined
		| [string, ...string[]]
	),
	Properties extends (
		Mode extends 'patternProperties'
			? never
			: ObjectOfSchemas
	) = (
		Mode extends 'patternProperties'
			? never
			: ObjectOfSchemas
	),
	PaternProperties extends (
		Mode extends 'properties'
			? never
			: ObjectOfSchemas
	) = (
		Mode extends 'properties'
			? never
			: ObjectOfSchemas
	),
> = TypeDefinitionSchema<
	Mode extends 'both'
		? object_without_$defs_type_both<
			Required,
			Properties,
			PaternProperties
		>
		: (
			Mode extends 'properties'
				? object_without_$defs_type_properties<Required, Properties>
				: object_without_$defs_type_pattern_properties<
					Required,
					PaternProperties
				>
		)
>;

export type object_with_$defs_type<
	Defs extends ObjectOfSchemas,
	Mode extends object_properties_mode = 'both',
	Required extends (
		| undefined
		| [string, ...string[]]
	) = (
		| undefined
		| [string, ...string[]]
	),
	Properties extends (
		Mode extends 'patternProperties'
			? never
			: ObjectOfSchemas
	) = (
		Mode extends 'patternProperties'
			? never
			: ObjectOfSchemas
	),
	PaternProperties extends (
		Mode extends 'properties'
			? never
			: ObjectOfSchemas
	) = (
		Mode extends 'properties'
			? never
			: ObjectOfSchemas
	),
> = TypeDefinitionSchema<
	Mode extends 'both'
		? object_with_$defs_type_both<
			Required,
			Properties,
			PaternProperties,
			Defs
		>
		: (
			Mode extends 'properties'
				? object_with_$defs_type_properties<Required, Properties, Defs>
				: object_with_$defs_type_pattern_properties<
					Required,
					PaternProperties,
					Defs
				>
		)
>;

type object_without_$defs_schema_both = {
	type: 'object',
	required: ['type', 'properties', 'patternProperties'],
	additionalProperties: false,
	properties: {
		type: {
			type: 'string',
			const: 'object',
		},
		required: {
			type: 'array',
			items: {
				type: 'string',
			},
			minItems: 1,
		},
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
	},
};

type object_with_$defs_schema_both = (
	& Omit<object_without_$defs_schema_both, 'required'|'properties'>
	& {
		required: ['type', '$defs', 'properties', 'patternProperties'],
		properties: (
			& object_without_$defs_schema_both['properties']
			& {
				$defs: {
					type: 'object',
					additionalProperties: {
						type: 'object',
					},
				},
			}
		),
	}
);

type object_without_$defs_schema_properties = (
	& Omit<object_without_$defs_schema_both, 'required'|'properties'>
	& {
		required: ['type', 'properties'],
		properties: Omit<
			object_without_$defs_schema_both['properties'],
			'patternProperties'
		>,
	}
);

type object_with_$defs_schema_properties = (
	& Omit<object_with_$defs_schema_both, 'required'|'properties'>
	& {
		required: ['type', '$defs', 'properties'],
		properties: Omit<
			object_with_$defs_schema_both['properties'],
			'patternProperties'
		>,
	}
);

type object_without_$defs_schema_pattern_properties = (
	& Omit<object_without_$defs_schema_both, 'required'|'properties'>
	& {
		required: ['type', 'patternProperties'],
		properties: Omit<
			object_without_$defs_schema_both['properties'],
			'properties'
		>,
	}
);

type object_with_$defs_schema_pattern_properties = (
	& Omit<object_with_$defs_schema_both, 'required'|'properties'>
	& {
		required: ['type', 'patternProperties'],
		properties: Omit<
			object_with_$defs_schema_both['properties'],
			'properties'
		>,
	}
);

type object_without_$defs_schema<
	Mode extends object_properties_mode = 'both'
> = SchemaDefinitionDefinition<
	(
		Mode extends 'both'
			? object_without_$defs_schema_both['required']
			: (
				Mode extends 'properties'
					? object_without_$defs_schema_properties['required']
					: object_without_$defs_schema_pattern_properties[
						'required'
					]
			)
	),
	ObjectOfSchemas & (
		Mode extends 'both'
			? object_without_$defs_schema_both['properties']
			: (
				Mode extends 'properties'
					? object_without_$defs_schema_properties['properties']
					: object_without_$defs_schema_pattern_properties[
						'properties'
					]
			)
	)
>;

type object_with_$defs_schema<
	Mode extends object_properties_mode = 'both'
> = SchemaDefinitionDefinition<
	(
		Mode extends 'both'
			? object_with_$defs_schema_both['required']
			: (
				Mode extends 'properties'
					? object_with_$defs_schema_properties['required']
					: object_with_$defs_schema_pattern_properties[
						'required'
					]
			)
	),
	ObjectOfSchemas & (
		Mode extends 'both'
			? object_with_$defs_schema_both['properties']
			: (
				Mode extends 'properties'
					? object_with_$defs_schema_properties['properties']
					: object_with_$defs_schema_pattern_properties[
						'properties'
					]
			)
	)
>;

type object_TypeLiteralNode<
	Mode extends object_properties_mode = 'both'
> = (
	Mode extends 'both'
		? IntersectionTypeNode<[
			TypeLiteralNode<PropertySignature>,
			TypeLiteralNode<IndexSignatureDeclaration>,
		]>
		: (
			Mode extends 'properties'
				? TypeLiteralNode<PropertySignature>
				: TypeLiteralNode<IndexSignatureDeclaration>
		)
);

export class ObjectHelper
{
	static convert<
		T,
		Mode extends object_properties_mode,
	> (
		value: unknown,
		property: string,
		schema: object_without_$defs_type<Mode>,
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
		).generate_typescript_data(
			value,
			schema_parser,
			sub_schema,
		);
	}

	static createObjectLiteralExpression<
		T extends {[key: string]: unknown},
		Mode extends object_properties_mode,
	>(
		data: T,
		schema: object_without_$defs_type<Mode>,
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
				);
			}),
		);
	}

	static createTypeNode<
		DefsMode extends object_$defs_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends (
			DefsMode extends 'with'
				? ObjectOfSchemas
				: never
		),
	>(
		schema: (
			DefsMode extends 'without'
				? object_without_$defs_type<PropertiesMode>
				: object_with_$defs_type<Defs, PropertiesMode>
		),
		schema_parser: SchemaParser,
	): object_TypeLiteralNode<PropertiesMode> {
		let properties:PropertySignature[] = [];
		let patterned:TypeNode[] = [];

		if (this.#is_schema_with_properties(schema)) {
			properties = Object.keys(
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
					(
						this.#is_schema_with_required(schema)
						&& schema.required.includes(property)
					)
						? undefined
						: factory.createToken(SyntaxKind.QuestionToken)
				),
				ObjectHelper.generate_type(
					property,
					schema,
					schema_parser,
				),
			));
		}

		if (this.#is_schema_with_pattern_properties(schema)) {
			patterned = Object.values(schema.patternProperties).map(
				(sub_schema) => schema_parser.parse(
					sub_schema,
				).generate_typescript_type({
					schema: sub_schema,
					schema_parser,
				}),
			);
		}

		let result:(
			| object_TypeLiteralNode<'both'>
			| object_TypeLiteralNode<'properties'>
			| object_TypeLiteralNode<'patternProperties'>
		);

		if (properties.length > 0 && patterned.length > 0) {
			result = intersection_type_node([
				type_literal_node(properties),
				this.#patterned_literal_node(patterned),
			]);
		} else if (properties.length > 0) {
			result = type_literal_node(properties);
		} else {
			result = this.#patterned_literal_node(patterned);
		}

		return result as object_TypeLiteralNode<PropertiesMode>;
	}

	static generate_type<
		Mode extends object_properties_mode,
	> (
		property: string,
		schema: object_without_$defs_type<Mode>,
		schema_parser: SchemaParser,
	) {
		const sub_schema = this.#sub_schema_for_property(
			property,
			schema,
		);

		return schema_parser.parse(
			sub_schema,
		).generate_typescript_type({
			schema,
			schema_parser,
		});
	}

	static #is_schema_with_pattern_properties(
		schema: object_without_$defs_type<
			| 'both'
			| 'properties'
			| 'patternProperties'
		>,
	): schema is object_without_$defs_type<'patternProperties'> {
		return 'patternProperties' in schema;
	}

	static #is_schema_with_properties(
		schema: object_without_$defs_type<
			| 'both'
			| 'properties'
			| 'patternProperties'
		>,
	): schema is object_without_$defs_type<'properties'> {
		return 'properties' in schema;
	}

	static #is_schema_with_required<
		Mode extends (
			| 'both'
			| 'properties'
			| 'patternProperties'
		)
	>(
		schema: object_without_$defs_type<Mode>,
	): schema is object_without_$defs_type<Mode, [string, ...string[]]> {
		return 'properties' in schema;
	}

	static #patterned_literal_node(
		value: TypeNode[],
	): TypeLiteralNode<IndexSignatureDeclaration> {
		return type_literal_node([
			factory.createIndexSignature(
				undefined,
				[
					factory.createParameterDeclaration(
						undefined,
						undefined,
						'key',
						undefined,
						factory.createKeywordTypeNode(
							SyntaxKind.StringKeyword,
						),
						undefined,
					),
				],
				factory.createUnionTypeNode(value),
			),
		]);
	}

	static #sub_schema_for_property<
		Mode extends object_properties_mode,
	>(
		property: string,
		schema: object_without_$defs_type<Mode>,
	): SchemaObject {
		if (
			this.#is_schema_with_properties(schema)
			&& property in schema.properties
		) {
			return schema.properties[property];
		}

		if (
			this.#is_schema_with_pattern_properties(schema)
		) {
			const matching = object_keys(
				schema.patternProperties,
			).find((maybe) => {
				return (new RegExp(maybe)).test(property);
			});

			if (matching) {
				return schema.patternProperties[matching];
			}
		}

		throw new TypeError(`Property "${property}" has no match on the specified schema!`);
	}
}

export type ObjectMaybeHas$defs_options<
	SchemaDefinition extends (
		SchemaDefinitionDefinition
	) = (
		SchemaDefinitionDefinition
	),
	TypeDefinition extends TypeDefinitionSchema = TypeDefinitionSchema,
> = Omit<
	TypeOptions<SchemaDefinition, TypeDefinition>,
	(
		| 'schema_definition'
	)
>;

export type ObjectMaybeHas$defs_TypeDefinition<
	PropertiesMode extends object_properties_mode,
	DefsMode extends object_$defs_mode,
	Defs extends (
		DefsMode extends 'with'
			? ObjectOfSchemas
			: never
	),
> = (
	DefsMode extends 'without'
		? object_without_$defs_type<PropertiesMode>
		: object_with_$defs_type<Defs, PropertiesMode>
);

type ObjectMaybeHas$defs_SchemaDefinition<
	PropertiesMode extends object_properties_mode,
	DefsMode extends object_$defs_mode,
> = (
	DefsMode extends 'without'
		? object_without_$defs_schema<PropertiesMode>
		: object_with_$defs_schema<PropertiesMode>
);

abstract class ObjectMaybeHas$defs<
	T extends {[key: string]: unknown},
	PropertiesMode extends object_properties_mode,
	DefsMode extends object_$defs_mode,
	Defs extends (
		DefsMode extends 'with'
			? ObjectOfSchemas
			: never
	),
> extends Type<
	T,
	ObjectMaybeHas$defs_TypeDefinition<
		PropertiesMode,
		DefsMode,
		Defs
	>,
	ObjectMaybeHas$defs_SchemaDefinition<
		PropertiesMode,
		DefsMode
	>,
	object_TypeLiteralNode<PropertiesMode>,
	ObjectLiteralExpression
> {
	#adjust_name: adjust_name_callback;

	constructor(
		{
			adjust_name,
			properties_mode,
			defs_mode,
		}: {
			adjust_name?: adjust_name_callback,
			properties_mode: PropertiesMode,
			defs_mode: 'with',
		},
		options: ObjectMaybeHas$defs_options<
			ObjectMaybeHas$defs_SchemaDefinition<
				PropertiesMode,
				DefsMode
			>,
			ObjectMaybeHas$defs_TypeDefinition<
				PropertiesMode,
				DefsMode,
				Defs
			>
		>,
	);
	constructor(
		{
			adjust_name,
			properties_mode,
			defs_mode,
		}: {
			adjust_name?: adjust_name_callback,
			properties_mode: PropertiesMode,
			defs_mode: 'without',
		},
		options: ObjectMaybeHas$defs_options<
			ObjectMaybeHas$defs_SchemaDefinition<
				PropertiesMode,
				DefsMode
			>,
			ObjectMaybeHas$defs_TypeDefinition<
				PropertiesMode,
				DefsMode,
				Defs
			>
		>,
	);
	constructor(
		{
			adjust_name,
			properties_mode,
			defs_mode,
		}: {
			adjust_name?: adjust_name_callback,
			properties_mode: PropertiesMode,
			defs_mode: DefsMode,
		},
		options: ObjectMaybeHas$defs_options<
			ObjectMaybeHas$defs_SchemaDefinition<
				PropertiesMode,
				DefsMode
			>,
			ObjectMaybeHas$defs_TypeDefinition<
				PropertiesMode,
				DefsMode,
				Defs
			>
		>,
	) {
		super({
			...options,
			schema_definition: (
				ObjectMaybeHas$defs.generate_default_schema_definition({
					defs_mode,
					properties_mode,
				})
			),
		});
		this.#adjust_name = adjust_name || adjust_name_default;
	}

	generate_typescript_data(
		data: T,
		schema_parser: SchemaParser,
		schema: object_without_$defs_type<PropertiesMode>,
	): ObjectLiteralExpression {
		return ObjectHelper.createObjectLiteralExpression(
			data,
			schema,
			schema_parser,
			this.#adjust_name,
		);
	}

	generate_typescript_type({
		schema,
		schema_parser,
	}: {
		schema: (
			DefsMode extends 'without'
				? object_without_$defs_type<PropertiesMode>
				: object_with_$defs_type<Defs, PropertiesMode>
		),
		schema_parser: SchemaParser,
	}): object_TypeLiteralNode<PropertiesMode> {
		return ObjectHelper.createTypeNode(schema, schema_parser);
	}

	static generate_default_schema_definition<
		DefsMode extends object_$defs_mode,
		PropertiesMode extends object_properties_mode
	>({
		defs_mode,
		properties_mode,
	}: {
		defs_mode: DefsMode,
		properties_mode: PropertiesMode,
	}): Readonly<
		DefsMode extends 'without'
			? object_without_$defs_schema<PropertiesMode>
			: object_with_$defs_schema<PropertiesMode>
	> {
		const unfrozen:(
			& Omit<object_with_$defs_schema<'both'>, 'properties'>
			& {
				properties: {
					type: object_with_$defs_schema<
						'both'
					>['properties']['type'],
					$defs?: object_with_$defs_schema<
						'both'
					>['properties']['$defs'],
					properties?: object_with_$defs_schema<
						'both'
					>['properties']['properties']
					patternProperties?: object_with_$defs_schema<
						'both'
					>['properties']['patternProperties']
				}
			}
		) = this.#generate_default_schema_definition_both();

		if ('properties' === properties_mode) {
			delete unfrozen.properties.patternProperties;

			if ('without' === defs_mode) {
				unfrozen.required = ['type', 'properties'];
			} else {
				unfrozen.required = ['type', '$defs', 'properties'];
			}
		} else if ('patternProperties' === properties_mode) {
			delete unfrozen.properties.properties;

			if ('without' === defs_mode) {
				unfrozen.required = ['type', 'patternProperties'];
			} else {
				unfrozen.required = ['type', '$defs', 'patternProperties'];
			}
		}

		if ('without' === defs_mode) {
			delete unfrozen.properties.$defs;
		}

		const coerced:(
			DefsMode extends 'without'
				? object_without_$defs_schema<PropertiesMode>
				: object_with_$defs_schema<PropertiesMode>
		) = unfrozen as (
			DefsMode extends 'without'
				? object_without_$defs_schema<PropertiesMode>
				: object_with_$defs_schema<PropertiesMode>
		);

		return Object.freeze(coerced);
	}

	static #generate_default_schema_definition_both(
	): object_with_$defs_schema<'both'> {

		return {
			type: 'object',
			required: ['type', '$defs', 'properties', 'patternProperties'],
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'object',
				},
				$defs: {
					type: 'object',
					additionalProperties: {
						type: 'object',
					},
				},
				required: {
					type: 'array',
					items: {
						type: 'string',
					},
					minItems: 1,
				},
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
			},
		};
	}
}

export class ObjectWithout$defs<
	PropertiesMode extends object_properties_mode = 'both',
	T extends {[key: string]: unknown} = {[key: string]: unknown},
> extends ObjectMaybeHas$defs<
	T,
	PropertiesMode,
	'without',
	never
> {
	constructor(
		{
			adjust_name,
			properties_mode,
		}: {
			adjust_name?: adjust_name_callback,
			properties_mode: PropertiesMode,
		},
		options: ObjectMaybeHas$defs_options<
			ObjectMaybeHas$defs_SchemaDefinition<
				PropertiesMode,
				never
			>,
			ObjectMaybeHas$defs_TypeDefinition<
				PropertiesMode,
				never,
				never
			>
		>,
	) {
		super(
			{
				adjust_name,
				properties_mode,
				defs_mode: 'without',
			},
			options,
		);
	}
}

export class ObjectWith$defs<
	PropertiesMode extends object_properties_mode = 'both',
	T extends {[key: string]: unknown} = {[key: string]: unknown},
	Defs extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectMaybeHas$defs<
	T,
	PropertiesMode,
	'with',
	Defs
> {
	constructor(
		{
			adjust_name,
			properties_mode,
		}: {
			adjust_name?: adjust_name_callback,
			properties_mode: PropertiesMode,
		},
		options: ObjectMaybeHas$defs_options<
			ObjectMaybeHas$defs_SchemaDefinition<
				PropertiesMode,
				'with'
			>,
			ObjectMaybeHas$defs_TypeDefinition<
				PropertiesMode,
				'with',
				Defs
			>
		>,
	) {
		super(
			{
				adjust_name,
				properties_mode,
				defs_mode: 'with',
			},
			options,
		);
	}
}
