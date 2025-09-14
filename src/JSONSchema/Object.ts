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

import type {
	$defs_mode,
	$defs_schema,
	DefsType,
} from './types.ts';

export type object_properties_mode = (
	| 'both'
	| 'properties'
	| 'patternProperties'
);

type object_without_$defs_and_unspecified_properties_type = {
	type: 'object',
};

type object_without_$defs_type_both<
	Required extends undefined|[string, ...string[]],
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = (
	& object_without_$defs_and_unspecified_properties_type
	& Required extends Exclude<undefined, [string, ...string[]]>
		? {
			properties: Properties,
			patternProperties: PatternProperties,
		}
		: (
			Required extends Exclude<Required, undefined>
				? {
					required: Exclude<Required, undefined>,
					properties: Properties,
					patternProperties: PatternProperties,
				}
				: {
					required?: Exclude<Required, undefined>,
					properties: Properties,
					patternProperties: PatternProperties,
				}
		)
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
	PropertiesMode extends object_properties_mode = 'both',
	Required extends (
		| undefined
		| [string, ...string[]]
	) = (
		| undefined
		| [string, ...string[]]
	),
	Properties extends (
		PropertiesMode extends 'both'|'properties'
			? ObjectOfSchemas
			: never
	) = (
		PropertiesMode extends 'both'|'properties'
			? ObjectOfSchemas
			: never
	),
	PaternProperties extends (
		PropertiesMode extends 'both'|'patternProperties'
			? ObjectOfSchemas
			: never
	) = (
		PropertiesMode extends 'both'|'patternProperties'
			? ObjectOfSchemas
			: never
	),
> = TypeDefinitionSchema<
	PropertiesMode extends Exclude<
		object_properties_mode,
		(
			| 'properties'
			| 'patternProperties'
		)
	>
		? object_without_$defs_type_both<
			Required,
			Properties,
			PaternProperties
		>
		: (
			PropertiesMode extends 'properties'
				? object_without_$defs_type_properties<Required, Properties>
				: object_without_$defs_type_pattern_properties<
					Required,
					PaternProperties
				>
		)
>;

export type object_with_$defs_type<
	Defs extends ObjectOfSchemas,
	PropertiesMode extends object_properties_mode = 'both',
	Required extends (
		| undefined
		| [string, ...string[]]
	) = (
		| undefined
		| [string, ...string[]]
	),
	Properties extends (
		PropertiesMode extends ('both'|'properties')
			? ObjectOfSchemas
			: never
	) = (
		PropertiesMode extends ('both'|'properties')
			? ObjectOfSchemas
			: never
	),
	PaternProperties extends (
		PropertiesMode extends ('both'|'patternProperties')
			? ObjectOfSchemas
			: never
	) = (
		PropertiesMode extends ('both'|'patternProperties')
			? ObjectOfSchemas
			: never
	),
> = TypeDefinitionSchema<
	PropertiesMode extends Exclude<
		object_properties_mode,
		(
			| 'properties'
			| 'patternProperties'
		)
	>
		? object_with_$defs_type_both<
			Required,
			Properties,
			PaternProperties,
			Defs
		>
		: (
			PropertiesMode extends Exclude<
				object_properties_mode,
				(
					| 'both'
					| 'patternProperties'
				)
			>
				? object_with_$defs_type_properties<Required, Properties, Defs>
				: object_with_$defs_type_pattern_properties<
					Required,
					PaternProperties,
					Defs
				>
		)
>;

type object_without_$defs_and_unspecified_properties_schema = (
	SchemaDefinitionDefinition<
		['type'],
		{
			type: {
				type: 'string',
				const: 'object',
			},
		}
	>
);


type object_without_$defs_schema_both = SchemaDefinitionDefinition<
	[
		...object_without_$defs_and_unspecified_properties_schema['required'],
		'properties',
		'patternProperties',
	],
	(
		& object_without_$defs_and_unspecified_properties_schema['properties']
		& {
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
		}
	)
>

type object_with_$defs_schema_both = SchemaDefinitionDefinition<
	[
		...object_without_$defs_schema_both['required'],
		'$defs',
	],
	(
		& object_without_$defs_schema_both['properties']
		& $defs_schema
	)
>;

type object_without_$defs_schema_properties = SchemaDefinitionDefinition<
	['type', 'properties'],
	Omit<
		object_without_$defs_schema_both['properties'],
		'patternProperties'
	>
>;

type object_with_$defs_schema_properties = SchemaDefinitionDefinition<
	['type', '$defs', 'properties'],
	Omit<
		object_with_$defs_schema_both['properties'],
		'patternProperties'
	>
>;

type object_without_$defs_schema_pattern_properties = (
	SchemaDefinitionDefinition<
		['type', 'patternProperties'],
		Omit<
				object_without_$defs_schema_both['properties'],
				'properties'
		>
	>
);

type object_with_$defs_schema_pattern_properties = SchemaDefinitionDefinition<
	['type', 'patternProperties'],
	Omit<
		object_with_$defs_schema_both['properties'],
		'properties'
	>
>;

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
	(
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

export type object_with_$defs_schema<
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
	(
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
		PropertiesMode extends object_properties_mode,
		Defs extends undefined|ObjectOfSchemas,
	> (
		value: unknown,
		property: string,
		schema: (
			Defs extends undefined
				? object_without_$defs_type<PropertiesMode>
				: object_with_$defs_type<ObjectOfSchemas, PropertiesMode>
		),
		schema_parser: SchemaParser,
	) {
		const sub_schema = this.#sub_schema_for_property<
			PropertiesMode,
			Defs
		>(
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
		PropertiesMode extends object_properties_mode,
		Defs extends undefined|ObjectOfSchemas,
	>(
		data: T,
		schema: (
			Defs extends undefined
				? object_without_$defs_type<PropertiesMode>
				: object_with_$defs_type<ObjectOfSchemas, PropertiesMode>
		),
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
				const type = ObjectHelper.convert<
					unknown,
					PropertiesMode,
					Defs
				>(
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

	static async createTypeNode<
		DefsMode extends $defs_mode,
		PropertiesMode extends object_properties_mode,
	>(
		schema: (
			DefsMode extends 'without'
				? object_without_$defs_type<PropertiesMode>
				: object_with_$defs_type<ObjectOfSchemas, PropertiesMode>
		),
		schema_parser: SchemaParser,
	): Promise<object_TypeLiteralNode<PropertiesMode>> {
		let properties:PropertySignature[] = [];
		let patterned:TypeNode[] = [];

		if (this.#is_schema_with_properties(schema)) {
			properties = await Promise.all(Object.keys(
				schema.properties,
			).map(async (
				property,
			): Promise<PropertySignature> => factory.createPropertySignature(
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
						? factory.createToken(SyntaxKind.QuestionToken)
						: undefined
				),
				await ObjectHelper.generate_type(
					property,
					schema,
					schema_parser,
				),
			)));
		}

		if (this.#is_schema_with_pattern_properties(schema)) {
			patterned = await Promise.all(
				Object.values(schema.patternProperties).map(
					(sub_schema) => schema_parser.parse(
						sub_schema,
					).generate_typescript_type({
						schema: sub_schema,
						schema_parser,
					}),
				),
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
		PropertiesMode extends object_properties_mode,
		DefsMode extends $defs_mode,
	> (
		property: string,
		schema: (
			DefsMode extends 'without'
				? object_without_$defs_type<PropertiesMode>
				: object_with_$defs_type<ObjectOfSchemas, PropertiesMode>
		),
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

	static guess_schema<
		DefsMode extends $defs_mode,
	>(
		guess_from: {[key: string]: unknown},
		defs_mode: DefsMode,
	): Readonly<(
		DefsMode extends 'without'
			? object_without_$defs_type<'properties'>
			: object_with_$defs_type<ObjectOfSchemas, 'properties'>
	)> {
		return this.#guess_schema_with_chain(guess_from, defs_mode, []);
	}

	static #guess_schema_with_chain<
		DefsMode extends $defs_mode,
	>(
		guess_from: {[key: string]: unknown},
		defs_mode: DefsMode,
		chain: string[],
	): Readonly<(
		DefsMode extends 'without'
			? object_without_$defs_type<'properties'>
			: object_with_$defs_type<ObjectOfSchemas, 'properties'>
	)> {
		const parts:[string, unknown][] = [
			['type', 'object'],
		];

		if ('with' === defs_mode) {
			parts.push(['$defs', {}]);
		}

		const required:string[] = [];
		const properties:{[key: string]: SchemaObject} = {};

		for (const [property, value] of Object.entries(guess_from)) {
			const type = typeof value;

			if (
				'number' === type
				|| 'string' === type
			) {
				properties[property] = {
					type: type,
					const: value,
				};
			} else if (
				'object' === type
				&& null !== value
				&& undefined !== value
			) {
				properties[property] = this.#guess_schema_with_chain(
					value as {[key: string]: unknown},
					'without',
					[...chain, property],
				);
			} else {
				throw new TypeError(
					`Unable to guess schema of ${
						[...chain, property].join('.')
					}!`,
				);
			}

			required.push(property);
		}

		if (required.length > 0) {
			parts.push(['required', required]);
		}
		parts.push(['properties', properties]);

		return Object.freeze(Object.fromEntries(parts)) as Readonly<(
			DefsMode extends 'without'
				? object_without_$defs_type<'properties'>
				: object_with_$defs_type<ObjectOfSchemas, 'properties'>
		)>;
	}

	static #is_schema_with_pattern_properties<
		DefsMode extends $defs_mode,
	> (
		schema: (
			DefsMode extends 'without'
		? object_without_$defs_type<
			| 'both'
			| 'properties'
			| 'patternProperties'
				>
				: object_with_$defs_type<
					ObjectOfSchemas,
					(
						| 'both'
						| 'properties'
						| 'patternProperties'
					)
				>
		),
	): schema is (
		DefsMode extends 'without'
			? object_without_$defs_type<'patternProperties'>
			: object_with_$defs_type<ObjectOfSchemas, 'patternProperties'>
	) {
		return 'patternProperties' in schema;
	}

	static #is_schema_with_properties<
		DefsMode extends $defs_mode,
	> (
		schema: (
			DefsMode extends 'without'
		? object_without_$defs_type<
			| 'both'
			| 'properties'
			| 'patternProperties'
				>
				: object_with_$defs_type<
					ObjectOfSchemas,
					(
						| 'both'
						| 'properties'
						| 'patternProperties'
					)
				>
		),
	): schema is (
		DefsMode extends 'without'
			? object_without_$defs_type<'properties'>
			: object_with_$defs_type<ObjectOfSchemas, 'properties'>
	) {
		return 'properties' in schema;
	}

	static #is_schema_with_required<
		PropertiesMode extends (
			| 'both'
			| 'properties'
			| 'patternProperties'
		),
		DefsMode extends $defs_mode,
	>(
		schema: (
			DefsMode extends 'without'
				? object_without_$defs_type<PropertiesMode>
				: object_with_$defs_type<ObjectOfSchemas, PropertiesMode>
			),
	): schema is (
		DefsMode extends 'without'
			? object_without_$defs_type<
				PropertiesMode,
				[string, ...string[]]
			>
			: object_with_$defs_type<
				ObjectOfSchemas,
				PropertiesMode,
				[string, ...string[]]
			>
	) {
		return 'required' in schema;
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
		PropertiesMode extends object_properties_mode,
		Defs extends undefined|ObjectOfSchemas,
	>(
		property: string,
		schema: (
			Defs extends undefined
				? object_without_$defs_type<PropertiesMode>
				: object_with_$defs_type<ObjectOfSchemas, PropertiesMode>
		),
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
> = (
	& Omit<
		TypeOptions<SchemaDefinition, TypeDefinition>,
		(
			| 'schema_definition'
			| 'type_definition'
		)
	>
	& Partial<
		Pick<
			TypeOptions<SchemaDefinition, TypeDefinition>,
			(
				| 'type_definition'
			)
		>
	>
);

export type ObjectMaybeHas$defs_TypeDefinition<
	PropertiesMode extends object_properties_mode,
	Defs extends undefined|ObjectOfSchemas,
	Required extends (
		| undefined
		| [string, ...string[]]
	) = (
		| undefined
		| [string, ...string[]]
	),
> = (
	Defs extends undefined
		? object_without_$defs_type<PropertiesMode, Required>
		: object_with_$defs_type<
			Exclude<Defs, undefined>,
			PropertiesMode,
			Required
		>
);

export type ObjectMaybeHas$defs_SchemaDefinition<
	PropertiesMode extends object_properties_mode,
	Defs extends undefined|ObjectOfSchemas,
> = (
	Defs extends Exclude<undefined|ObjectOfSchemas, undefined>
		? object_without_$defs_schema<PropertiesMode>
		: object_with_$defs_schema<PropertiesMode>
);

abstract class ObjectMaybeHas$defs<
	T extends {[key: string]: unknown},
	PropertiesMode extends object_properties_mode,
	Defs extends DefsType,
> extends Type<
	T,
	(
		Defs extends Exclude<DefsType, ObjectOfSchemas>
			? object_without_$defs_type<PropertiesMode>
			: object_with_$defs_type<
				Exclude<Defs, undefined>,
				PropertiesMode
			>
	),
	(
		Defs extends Exclude<DefsType, ObjectOfSchemas>
			? object_without_$defs_schema<PropertiesMode>
			: object_with_$defs_schema<PropertiesMode>
	),
	object_TypeLiteralNode<PropertiesMode>,
	ObjectLiteralExpression
> {
	#adjust_name: adjust_name_callback;

	constructor(
		specific_options: {
			adjust_name?: adjust_name_callback,
			defs_mode: 'without',
		},
		type_options: TypeOptions<
			object_without_$defs_schema<PropertiesMode>,
			object_without_$defs_type<PropertiesMode>
		>,
	);
	constructor(
		specific_options: {
			adjust_name?: adjust_name_callback,
			defs_mode: 'with',
		},
		type_options: TypeOptions<
			object_with_$defs_schema<PropertiesMode>,
			object_with_$defs_type<
				Exclude<Defs, undefined>,
				PropertiesMode
			>
		>,
	);
	constructor(
		{
			adjust_name,
		}: {
			adjust_name?: adjust_name_callback,
			defs_mode: (
				Defs extends Exclude<DefsType, ObjectOfSchemas>
					? 'without'
					: 'with'
			),
		},
		{
			ajv,
			type_definition,
			schema_definition,
		}: TypeOptions<
			(
				Defs extends Exclude<DefsType, ObjectOfSchemas>
					? object_without_$defs_schema<PropertiesMode>
					: object_with_$defs_schema<PropertiesMode>
			),
			(
				Defs extends Exclude<DefsType, ObjectOfSchemas>
					? object_without_$defs_type<PropertiesMode>
					: object_with_$defs_type<
						Exclude<Defs, undefined>,
						PropertiesMode
					>
			)
		>,
	) {
		super({
			ajv,
			type_definition,
			schema_definition,
		});
		this.#adjust_name = adjust_name || adjust_name_default;
	}

	generate_typescript_data(
		data: T,
		schema_parser: SchemaParser,
		schema: ObjectMaybeHas$defs_TypeDefinition<
			PropertiesMode,
			Defs
		>,
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
			Defs extends undefined
				? object_without_$defs_type<PropertiesMode>
				: object_with_$defs_type<
					Exclude<Defs, undefined>,
					PropertiesMode
				>
		),
		schema_parser: SchemaParser,
	}): Promise<object_TypeLiteralNode<PropertiesMode>> {
		return ObjectHelper.createTypeNode(schema, schema_parser);
	}

	static generate_default_schema_definition<
		PropertiesMode extends object_properties_mode,
		DefsMode extends $defs_mode
	>({
		defs_mode,
		properties_mode,
	}: {
		defs_mode: DefsMode,
		properties_mode: PropertiesMode,
	}): (
		DefsMode extends 'without'
			? Readonly<
				object_without_$defs_schema<PropertiesMode>
			>
			: Readonly<
				object_with_$defs_schema<PropertiesMode>
			>
	) {
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
		} else if ('without' === defs_mode) {
			unfrozen.required = ['type', 'properties', 'patternProperties'];
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

		const frozen:(
			DefsMode extends 'without'
				? Readonly<
					object_without_$defs_schema<PropertiesMode>
				>
				: Readonly<
					object_with_$defs_schema<PropertiesMode>
				>
		) = Object.freeze(coerced) as unknown as (
			DefsMode extends 'without'
				? Readonly<
					object_without_$defs_schema<PropertiesMode>
				>
				: Readonly<
					object_with_$defs_schema<PropertiesMode>
				>
		);

		return frozen;
	}

	static generate_default_type_definition<
		PropertiesMode extends object_properties_mode,
		Defs extends undefined
	>(
		properties_mode: PropertiesMode,
		defs_mode: 'without',
	): (
		Defs extends Exclude<DefsType, ObjectOfSchemas>
			? Readonly<object_without_$defs_type<PropertiesMode>>
			: never
	);
	static generate_default_type_definition<
		PropertiesMode extends object_properties_mode,
		Defs extends Exclude<DefsType, undefined>
	>(
		properties_mode: PropertiesMode,
		defs_mode: 'with',
	): (
		Defs extends Exclude<DefsType, ObjectOfSchemas>
			? never
			: Readonly<object_with_$defs_type<
				Exclude<Defs, undefined>,
				PropertiesMode
			>>
	);
	static generate_default_type_definition<
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType
	>(
		properties_mode: PropertiesMode,
		defs_mode: (
			Defs extends Exclude<DefsType, ObjectOfSchemas>
				? 'without'
				: 'with'
		),
	): (
		Defs extends Exclude<DefsType, ObjectOfSchemas>
			? Readonly<object_without_$defs_type<PropertiesMode>>
			: Readonly<object_with_$defs_type<
				Exclude<Defs, undefined>,
				PropertiesMode
			>>
	) {
		const partial:[
			string,
			unknown,
		][] = [['type', 'object']];

		if ('with' === defs_mode) {
			partial.push([
				'$defs',
				{},
			]);
		}

		if ('both' === properties_mode || 'properties' === properties_mode) {
			partial.push(['properties', {}]);
		}

		if (
			'both' === properties_mode
			|| 'patternProperties' === properties_mode
		) {
			partial.push(['patternProperties', {}]);
		}

		return Object.freeze(
			Object.fromEntries(partial),
		) as (
			Defs extends Exclude<DefsType, ObjectOfSchemas>
				? Readonly<object_without_$defs_type<PropertiesMode>>
				: Readonly<object_with_$defs_type<
					Exclude<Defs, undefined>,
					PropertiesMode
				>>
		);
	}

	static #generate_default_schema_definition_both(
	): object_with_$defs_schema<'both'> {

		return {
			type: 'object',
			required: ['type', 'properties', 'patternProperties', '$defs'],
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
	undefined
> {
	constructor(
		{
			adjust_name,
			properties_mode,
		}: {
			adjust_name?: adjust_name_callback,
			properties_mode: PropertiesMode,
		},
		{
			ajv,
			type_definition,
		}: ObjectMaybeHas$defs_options<
			object_without_$defs_schema<PropertiesMode>,
			object_without_$defs_type<PropertiesMode>
		>,
	) {
		super(
			{
				adjust_name,
				defs_mode: 'without',
			},
			{
				ajv,
				type_definition: (
					type_definition
					||  ObjectMaybeHas$defs.generate_default_type_definition(
						properties_mode,
						'without',
					)
				),
				schema_definition: (
					ObjectMaybeHas$defs.generate_default_schema_definition({
						properties_mode,
						defs_mode: 'without',
					})
				),
			},
		);
	}
}

export class ObjectWith$defs<
	PropertiesMode extends object_properties_mode = 'both',
	T extends {[key: string]: unknown} = {[key: string]: unknown},
	Defs extends Exclude<DefsType, undefined> = ObjectOfSchemas,
> extends ObjectMaybeHas$defs<
	T,
	PropertiesMode,
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
		{
			ajv,
			type_definition,
		}: ObjectMaybeHas$defs_options<
			object_with_$defs_schema<PropertiesMode>,
			object_with_$defs_type<
				Defs,
				PropertiesMode
			>
		>,
	) {
		type type_options = TypeOptions<
			object_with_$defs_schema<PropertiesMode>,
			object_with_$defs_type<
				Exclude<Defs, undefined>,
				PropertiesMode
			>
		>;
		const _type_definition: type_options['type_definition'] = (
			type_definition
			||  ObjectWith$defs.generate_default_type_definition(
				properties_mode,
				'with',
			)
		) as type_options['type_definition'];
		const specific_options: {
			adjust_name?: adjust_name_callback,
			defs_mode: 'with',
		} = {
			adjust_name,
			defs_mode: 'with',
		};
		const type_options: type_options = {
			ajv,
			type_definition: _type_definition,
			schema_definition: (
				ObjectMaybeHas$defs.generate_default_schema_definition<
					PropertiesMode,
					'with'
				>({
					properties_mode,
					defs_mode: 'with',
				})
			),
		};
		super(
			specific_options,
			type_options,
		);
	}
}
