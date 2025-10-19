import type {
	IndexSignatureDeclaration,
	ObjectLiteralExpression,
	PropertySignature,
	TypeNode,
} from 'typescript';
import {
	SyntaxKind,
} from 'typescript';

import type {
	SchemaDefinitionDefinition,
	SchemaDefinitionDefinitionWith$defs,
	TypeDefinitionSchema,
	TypeOptions,
} from './Type.ts';
import {
	$defs_schema,
	Type,
} from './Type.ts';

import type {
	ExternalRef,
	LocalRef,
	pattern_either,
} from './Ref.ts';

import {
	$ref,
} from './Ref.ts';

import type {
	unknown_type,
} from './Unknown.ts';

import type {
	ObjectOfSchemas,
	OmitIf,
	SchemaObject,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../types.ts';

import type {
	IntersectionTypeNode,
	TypeLiteralNode,
	TypeReferenceNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/types.ts';

import type {
	adjust_name_callback,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../coercions.ts';
import {
	adjust_name_default,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../coercions.ts';

import {
	factory,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/factory.ts';

import type {
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../SchemaParser.ts';

type object_properties_mode = (
	| 'neither'
	| 'both'
	| 'properties'
	| 'pattern'
);

type object_type<
	PropertiesMode extends object_properties_mode,
	Defs extends SchemaObject,
	Required extends readonly [string, ...string[]],
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = (
	& {
		$defs?: Defs,
		$ref?: LocalRef|ExternalRef,
		type: 'object',
		required?: Required,
		unevaluatedProperties?: boolean,
	}
	& Omit<
		{
			properties: Properties,
			patternProperties: PatternProperties,
		},
		{
			both: '',
			neither: 'properties'|'patternProperties',
			properties: 'patternProperties',
			pattern: 'properties',
		}[PropertiesMode]
	>
);

type object_schema_required<
	PropertiesMode extends object_properties_mode,
> = (
	& readonly [string, ...string[]]
	& [
		'type',
		...{
			neither: readonly string[],
			both: readonly ['properties', 'patternProperties'],
			properties: readonly ['properties'],
			pattern: readonly ['patternProperties'],
		}[PropertiesMode],
	]
);

type object_schema<
	PropertiesMode extends object_properties_mode,
> = SchemaDefinitionDefinitionWith$defs<
	object_schema_required<PropertiesMode>,
	(
		& {
			type: {
				type: 'string',
				const: 'object',
			},
			required: {
				type: 'array',
				minItems: 1,
				items: {
					type: 'string',
					minLength: 1,
				},
			},
			$ref: {
				type: 'string',
				pattern: pattern_either,
			},
			unevaluatedProperties: {
				type: 'boolean',
			},
		}
		& OmitIf<
			{
				properties: {
					type: 'object',
					minProperties: 1,
					additionalProperties: {
						type: 'object',
					},
				},
			},
			'properties',
			{
				neither: 'without',
				both: 'with',
				properties: 'with',
				pattern: 'without',
			}[PropertiesMode]
		>
		& OmitIf<
			{
				patternProperties: {
					type: 'object',
					minProperties: 1,
					additionalProperties: {
						type: 'object',
					},
				},
			},
			'patternProperties',
			{
				neither: 'without',
				both: 'with',
				properties: 'without',
				pattern: 'with',
			}[PropertiesMode]
		>
	)
>;

type object_TypeLiteralNode<
	PropertiesMode extends object_properties_mode,
> = {
	['neither']: TypeLiteralNode<
		IndexSignatureDeclaration
	>,
	['both']: IntersectionTypeNode<[
		TypeLiteralNode<PropertySignature>,
		TypeLiteralNode<IndexSignatureDeclaration>,
	]>,
	['properties']: TypeLiteralNode<PropertySignature>,
	['pattern']: TypeLiteralNode<
		IndexSignatureDeclaration
	>,
}[PropertiesMode];

type ObjectUncertain_options<
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
);

class ObjectUnspecified<
	T extends {[key: string]: unknown},
	PropertiesMode extends object_properties_mode,
	Defs extends SchemaObject = SchemaObject,
	Required extends (
		readonly [string, ...string[]]
	) = (
		readonly [string, ...string[]]
	),
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends
	Type<
		T,
		object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		{
			properties_mode: PropertiesMode,
			$defs?: Defs,
			required?: Required,
			properties?: Properties,
			patternProperties?: PatternProperties,
		},
		object_schema<
			PropertiesMode
		>,
		{
			properties_mode: PropertiesMode,
		},
		(
			| object_TypeLiteralNode<PropertiesMode>
			| IntersectionTypeNode<[
				TypeReferenceNode,
				object_TypeLiteralNode<PropertiesMode>,
			]>
		),
		ObjectLiteralExpression
	> {
	#adjust_name: adjust_name_callback;

	readonly properties_mode: PropertiesMode;

	constructor(
		options: {
			adjust_name?: adjust_name_callback,
			properties_mode: PropertiesMode,
			$defs?: Defs,
			required?: Required,
			properties?: Properties,
			patternProperties?: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				PropertiesMode
			>,
			object_type<
				PropertiesMode,
				Defs,
				Required,
				Properties,
				PatternProperties
			>
		>,
	) {
		super({
			ajv,
			type_definition: options,
			schema_definition: options,
		});

		this.#adjust_name = options?.adjust_name || adjust_name_default;
		this.properties_mode = options.properties_mode;
	}

	generate_typescript_data(
		data: T,
		schema_parser: SchemaParser,
		schema: object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): ObjectLiteralExpression {
		return ObjectUnspecified.#createObjectLiteralExpression(
			this.properties_mode,
			data,
			schema,
			schema_parser,
			this.#adjust_name,
		);
	}

	async generate_typescript_type(
		{
			schema,
			schema_parser,
		}: {
			schema: object_type<
				PropertiesMode,
				Defs,
				Required,
				Properties,
				PatternProperties
			>,
			schema_parser: SchemaParser,
		},
	): Promise<(
		| object_TypeLiteralNode<PropertiesMode>
		| IntersectionTypeNode<[
			TypeReferenceNode,
			object_TypeLiteralNode<PropertiesMode>,
		]>
	)> {
		let object_type: (
			| Promise<object_TypeLiteralNode<PropertiesMode>>
			| IntersectionTypeNode<[
				TypeReferenceNode,
				object_TypeLiteralNode<PropertiesMode>,
			]>
		) = ObjectUnspecified.#createTypeNode(
			this.properties_mode,
			schema,
			schema_parser,
		);

		if ('string' === typeof schema?.$ref) {
			const $ref_instance = schema_parser.parse_by_type({
				$ref: schema.$ref,
			}, (maybe): maybe is $ref => $ref.is_a(maybe));

			object_type = factory.createIntersectionTypeNode([
				await $ref_instance.generate_typescript_type({
					schema: {
						$ref: schema.$ref,
					},
				}),
				await object_type,
			]);
		}

		return object_type;
	}

	static generate_schema_definition<
		PropertiesMode extends object_properties_mode,
	>({
		properties_mode,
	}: {
		properties_mode: PropertiesMode,
	}): Readonly<object_schema<
		PropertiesMode
	>> {
		const required_for_partial = (
			this.#generate_schema_definition_required(
				properties_mode,
			)
		);

		const properties_for_partial: Partial<
			object_schema<'both'>['properties']
		> = {
			...$defs_schema.properties,
			type: {
				type: 'string',
				const: 'object',
			},
			$ref: {
				type: 'string',
				pattern: '^(.+)?#\\/\\$defs\\/(.+)$',
			},
			unevaluatedProperties: {
				type: 'boolean',
			},
		};

		properties_for_partial.required = {
			type: 'array',
			minItems: 1,
			items: {
				type: 'string',
				minLength: 1,
			},
		};

		if ('pattern' !== properties_mode && 'neither' !== properties_mode) {
			const properties: (
				object_schema<
					'properties'
				>['properties']['properties']
			) = {
				type: 'object',
				minProperties: 1,
				additionalProperties: {
					type: 'object',
				},
			};
			properties_for_partial.properties = properties;
		}
		if (
			'properties' !== properties_mode
			&& 'neither' !== properties_mode
		) {
			const properties: (
				object_schema<
					'pattern'
				>['properties']['patternProperties']
			) = {
				type: 'object',
				minProperties: 1,
				additionalProperties: {
					type: 'object',
				},
			};
			properties_for_partial.patternProperties = properties;
		}

		const unpartial_properties: object_schema<
			PropertiesMode
		>['properties'] = properties_for_partial as object_schema<
			PropertiesMode
		>['properties'];

		const partial_required: object_schema<
			PropertiesMode
		>['required'] = required_for_partial;
		const partial_properties: object_schema<
			PropertiesMode
		>['properties'] = unpartial_properties;

		const result: object_schema<
			PropertiesMode
		> = {
			type: 'object',
			required: partial_required,
			additionalProperties: false,
			properties: partial_properties,
		} as object_schema<
			PropertiesMode
		>;

		return Object.freeze(result);
	}

	static #generate_schema_definition_required<
		PropertiesMode extends object_properties_mode,
	>(
		properties_mode: PropertiesMode,
	): object_schema<
		PropertiesMode
	>['required'] {
		const values_for_properties_mode: {
			neither: readonly string[],
			both: readonly ['properties', 'patternProperties'],
			properties: readonly ['properties'],
			pattern: readonly ['patternProperties'],
		}[PropertiesMode] = {
			neither: [] as readonly string[],
			both: ['properties', 'patternProperties'] as const,
			properties: ['properties'] as const,
			pattern: ['patternProperties'] as const,
		}[properties_mode];

		const required: object_schema<
			PropertiesMode
		>['required'] = [
			...['type'],
			...values_for_properties_mode,
		] as object_schema<
			PropertiesMode
		>['required'];

		return required;
	}

	static generate_type_definition<
		PropertiesMode extends object_properties_mode,
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
	>({
		properties_mode,
		$defs,
		required,
		properties,
		patternProperties,
	}: {
		properties_mode: PropertiesMode,
		$defs?: Defs,
		required?: Required,
		properties?: Properties,
		patternProperties?: PatternProperties,
	}): Readonly<object_type<
		PropertiesMode,
		Defs,
		Required,
		Properties,
		PatternProperties
	>> {
		const partial: Partial<object_type<
			'both',
			Defs,
			Required,
			Properties,
			PatternProperties
		>> = {
			type: 'object',
		};

		if ($defs) {
			partial.$defs = $defs;
		}

		if (required) {
			partial.required = required;
		}

		if ('both' === properties_mode || 'properties' === properties_mode) {
			partial.properties = properties;
		}

		if (
			'both' === properties_mode
			|| 'pattern' === properties_mode
		) {
			partial.patternProperties = patternProperties;
		}

		const frozen = Object.freeze(partial as object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>);

		return frozen;
	}

	static #is_schema_with_some_type_of_properties<
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
	>(
		schema: object_type<
			object_properties_mode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type<
		'both'|'properties'|'pattern',
		Defs,
		Required,
		Properties,
		PatternProperties
	> {
		return ('properties' in schema) || ('patternProperties' in schema);
	}

	static #is_schema_with_properties<
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
	>(
		schema: object_type<
			object_properties_mode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type<
		'both' | 'properties',
		Defs,
		Required,
		Properties,
		PatternProperties
	> {
		return 'properties' in schema;
	}

	static #is_schema_with_pattern_properties<
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
	>(
		schema: object_type<
			object_properties_mode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type<
		'both'|'pattern',
		Defs,
		Required,
		Properties,
		PatternProperties
	> {
		return 'patternProperties' in schema;
	}

	static #is_schema_with_required<
		Required extends readonly [string, ...string[]],
	>(
		schema: object_type<
			object_properties_mode,
			SchemaObject,
			Required,
			ObjectOfSchemas,
			ObjectOfSchemas
		>,
	): schema is object_type<
		object_properties_mode,
		SchemaObject,
		Required,
		ObjectOfSchemas,
		ObjectOfSchemas
	> & {required: Required} {
		return 'required' in schema;
	}

	static #convert<
		T,
		PropertiesMode extends object_properties_mode,
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
	>(
		properties_mode: PropertiesMode,
		value: unknown,
		property: string,
		schema: object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		schema_parser: SchemaParser,
	) {
		const sub_schema = this.#sub_schema_for_property(
			properties_mode,
			property,
			schema,
			{},
		);

		let maybe_modified = ObjectUnspecified.maybe_add_$defs(
			schema,
			sub_schema,
		);

		const ajv = schema_parser.share_ajv((ajv) => ajv);
		const validator = ajv.compile<T>(maybe_modified);

		if (!(validator(value))) {
			throw new TypeError('Supplied value not supported by property!');
		}

		if (0 === Object.keys(sub_schema).length) {
			maybe_modified = {
				type: 'object',
				additionalProperties: false,
				maxProperties: 0,
			};
		}

		return schema_parser.parse(
			maybe_modified,
		).generate_typescript_data(
			value,
			schema_parser,
			maybe_modified,
		);
	}

	static #createObjectLiteralExpression<
		T extends {[key: string]: unknown},
		PropertiesMode extends object_properties_mode,
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
	>(
		properties_mode: PropertiesMode,
		data: T,
		schema: object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		schema_parser: SchemaParser,
		adjust_name: adjust_name_callback,
	): ObjectLiteralExpression {
		return factory.createObjectLiteralExpression(
			Object.entries(
				data,
			).map(([
				property,
				value,
			]) => {
				const type = this.#convert(
					properties_mode,
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

	static async #createTypeNode<
		PropertiesMode extends object_properties_mode,
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
	>(
		properties_mode: PropertiesMode,
		schema: object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		schema_parser: SchemaParser,
	): Promise<object_TypeLiteralNode<PropertiesMode>> {
		if (!this.#is_schema_with_some_type_of_properties(schema)) {
			return factory.createTypeLiteralNode([
				factory.createIndexSignature(
					undefined,
					[
						factory.createParameterDeclaration(
							undefined,
							undefined,
							factory.createIdentifier('key'),
							undefined,
							factory.createToken(SyntaxKind.StringKeyword),
						),
					],
					factory.createToken(SyntaxKind.UnknownKeyword),
				),
			]) as object_TypeLiteralNode<PropertiesMode>;
		}

		let properties: PropertySignature[] = [];
		let patterned: [TypeNode, ...TypeNode[]]|never[] = [];

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
						? undefined
						: factory.createToken(SyntaxKind.QuestionToken)
				),
				await this.#generate_type(
					properties_mode,
					property,
					schema,
					schema_parser,
				),
			)));
		}

		if (this.#is_schema_with_pattern_properties(schema)) {
			patterned = await Promise.all(
				(
					Object.values(
						schema.patternProperties,
					)
				).map(
					(sub_schema) => {
						return schema_parser.parse(
							ObjectUnspecified.maybe_add_$defs(
								schema,
								sub_schema,
							),
						).generate_typescript_type({
							data: sub_schema,
							schema: sub_schema,
							schema_parser,
						});
					},
				),
			);
		}

		let result: object_TypeLiteralNode<
			Exclude<
				object_properties_mode,
				'neither'
			>
		>;

		if (properties.length > 0 && patterned.length > 0) {
			result = factory.createIntersectionTypeNode([
				factory.createTypeLiteralNode(properties),
				this.#patterned_literal_node(
					patterned as [TypeNode, ...TypeNode[]],
				),
			]);
		} else if (properties.length > 0) {
			result = factory.createTypeLiteralNode(properties);
		} else {
			result = this.#patterned_literal_node(
				patterned as [TypeNode, ...TypeNode[]],
			);
		}

		return result as object_TypeLiteralNode<PropertiesMode>;
	}

	static async #generate_type<
		PropertiesMode extends object_properties_mode,
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
	>(
		properties_mode: PropertiesMode,
		property: string,
		schema: object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		schema_parser: SchemaParser,
	) {
		const sub_schema = this.#sub_schema_for_property(
			properties_mode,
			property,
			schema,
			{},
		);

		let matched: (
			| undefined
			| Type<unknown>
		) = schema_parser.maybe_parse_by_type<
			$ref
		>(
			sub_schema,
			(
				maybe: unknown,
			): maybe is $ref => {
				return $ref.is_a(maybe);
			},
		);

		if (undefined === matched) {
			matched = schema_parser.parse(sub_schema);
		} else {
			return matched.generate_typescript_type({
				data: sub_schema,
				schema: sub_schema,
				schema_parser,
			});
		}

		return matched.generate_typescript_type({
			schema: sub_schema,
			schema_parser,
		});
	}

	static #patterned_literal_node(
		value: [TypeNode, ...TypeNode[]],
	): TypeLiteralNode<IndexSignatureDeclaration> {
		return factory.createTypeLiteralNode([
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
				1 === value.length
					? value[0]
					: factory.createUnionTypeNode(
						value as [TypeNode, TypeNode, ...TypeNode[]],
					),
			),
		]);
	}

	static #sub_schema_for_property<
		PropertiesMode extends object_properties_mode,
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
	>(
		properties_mode: PropertiesMode,
		property: string,
		schema: object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		fallback_if_neither: Record<string, never>|unknown_type,
	): SchemaObject {
		if (
			this.#is_schema_with_properties(schema)
			&& property in schema.properties
			&& undefined !== schema.properties[property]
		) {
			return schema.properties[property];
		}

		if (
			this.#is_schema_with_pattern_properties(schema)
		) {
			const matching = Object.keys(
				schema.patternProperties,
			).find((maybe) => {
				return (
					(new RegExp(maybe)).test(property)
					&& undefined !== schema.patternProperties[maybe]
				);
			});

			if (matching) {
				return schema.patternProperties[matching];
			}
		}

		if ('neither' === properties_mode) {
			return fallback_if_neither;
		}

		throw new TypeError(
			`Property "${property}" has no match on the specified schema!`,
		);
	}
}

export type {
	object_properties_mode,
	object_type,
	object_schema,
	object_TypeLiteralNode,
};

export {
	ObjectUnspecified,
};
