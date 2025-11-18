import type {
	ComputedPropertyName,
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
	ObjectOfSchemas,
	SchemaObject,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../types.ts';

import type {
	IntersectionTypeNode,
	TypeLiteralNode,
	TypeReferenceNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/types.ts';

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

type object_type_base<
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
		additionalProperties?: boolean,
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

type object_type<
	PropertiesMode extends object_properties_mode,
	Defs extends SchemaObject,
	Required extends readonly [string, ...string[]],
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = (
	| object_type_base<
		PropertiesMode,
		Defs,
		Required,
		Properties,
		PatternProperties
	>
	| {
		type: 'object',
		$defs: Defs,
		$ref: LocalRef|ExternalRef,
	}
	| object_type_with_allOf<
		PropertiesMode,
		Defs,
		Required,
		Properties,
		PatternProperties
	>
);

type object_type_with_allOf<
	PropertiesMode extends object_properties_mode,
	Defs extends SchemaObject,
	Required extends readonly [string, ...string[]],
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = SchemaObject & {
	allOf: [
		object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		...object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>[],
	],
};

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

type object_schema_properties_base = {
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
	additionalProperties: {
		type: 'boolean',
	},
	unevaluatedProperties: {
		type: 'boolean',
	},
};

type object_schema_properties_properties = {
	properties: {
		type: 'object',
		minProperties: 1,
		additionalProperties: {
			type: 'object',
		},
	},
};

type object_schema_properties_pattern = {
	patternProperties: {
		type: 'object',
		minProperties: 1,
		additionalProperties: {
			type: 'object',
		},
	},
};

type object_properties_by_mode<
	PropertiesMode extends object_properties_mode,
> = {
	both: (
		& object_schema_properties_properties
		& object_schema_properties_pattern
	),
	properties: object_schema_properties_properties,
	pattern: object_schema_properties_pattern,
	neither: {
		additionalProperties: {
			type: 'boolean',
			const: false,
		},
		maxProperties: {
			type: 'integer',
			const: 0,
		},
	},
}[PropertiesMode];

type object_schema<
	PropertiesMode extends object_properties_mode,
> = SchemaDefinitionDefinitionWith$defs<
	object_schema_required<PropertiesMode>,
	(
		& ObjectOfSchemas
		& object_schema_properties_base
		& object_properties_by_mode<PropertiesMode>
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

type object_TypeLiteralNode_possibly_extended<
	PropertiesMode extends object_properties_mode,
> = (
	| object_TypeLiteralNode<PropertiesMode>
	| IntersectionTypeNode<[
		TypeReferenceNode,
		object_TypeLiteralNode<PropertiesMode>,
	]>
);

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
	readonly properties_mode: PropertiesMode;

	constructor(
		options: {
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
	): Promise<object_TypeLiteralNode_possibly_extended<PropertiesMode>> {
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

		if (
			'string' === typeof schema?.$ref
			&& $ref.is_supported_$ref_value(schema.$ref)
		) {
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

	static #computedProperty_or_string(
		property: string,
	): ComputedPropertyName|string {
		return /[?[\] ]/.test(property)
			? factory.createComputedPropertyName(
				factory.createStringLiteral(property),
			)
			: property;
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
			additionalProperties: {
				type: 'boolean',
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

		if ('neither' === properties_mode) {
			(
				properties_for_partial as Partial<
					object_schema<'neither'>['properties']
				>
			).additionalProperties = {
				type: 'boolean',
				const: false,
			};
			(
				properties_for_partial as Partial<
					object_schema<'neither'>['properties']
				>
			).maxProperties = {
				type: 'integer',
				const: 0,
			};
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
	}): Readonly<object_type_base<
		PropertiesMode,
		Defs,
		Required,
		Properties,
		PatternProperties
	>> {
		const partial: Partial<object_type_base<
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

		const frozen = Object.freeze(partial as object_type_base<
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
		schema: SchemaObject|object_type<
			object_properties_mode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type_base<
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
		schema: SchemaObject|object_type<
			object_properties_mode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type_base<
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
			schema_parser,
			properties_mode,
			property,
			schema,
			{},
		);

		const maybe_modified = ObjectUnspecified.maybe_add_$defs(
			schema,
			sub_schema,
		);

		const ajv = schema_parser.share_ajv((ajv) => ajv);
		const validator = ajv.compile<T>(maybe_modified);

		if (!(validator(value))) {
			throw new TypeError('Supplied value not supported by property!');
		}

		let instance: Type<unknown>;

		if (0 === Object.keys(sub_schema).length) {
			instance = schema_parser.parse_by_type(value);
		} else {
			instance = schema_parser.parse(
				maybe_modified,
			);
		}

		return instance.generate_typescript_data(
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
					this.#computedProperty_or_string(property),
					type,
				);
			}),
			true,
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
				this.#computedProperty_or_string(property),
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
			schema_parser,
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
		schema_parser: SchemaParser,
		properties_mode: PropertiesMode,
		property: string,
		schema: SchemaObject|object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		fallback_if_neither: Record<string, never>|undefined,
	): SchemaObject {
		if (
			!this.#is_schema_with_pattern_properties(schema)
			&& !this.#is_schema_with_properties(schema)
			&& '$ref' in schema
		) {
			const maybe = this.#sub_schema_for_property_resolve_$ref(
				schema_parser,
				schema as SchemaObject & {
					$ref: string,
				},
			);

			if (maybe) {
				schema = maybe;
			}
		}

		if (
			!this.#is_schema_with_pattern_properties(schema)
			&& !this.#is_schema_with_properties(schema)
			&& 'allOf' in schema
			&& undefined !== schema.allOf
			&& 2 === Object.keys(schema).length
			&& '$defs' in schema
		) {
			const matching = this.#sub_schema_for_property_from_allOf(
				schema_parser,
				properties_mode,
				property,
				schema as SchemaObject & {
					allOf: [
						SchemaObject,
						SchemaObject,
						...SchemaObject[],
					],
				},
			);

			if (matching) {
				return matching;
			}

			throw new TypeError(
				`Property "${property}" has no match on the specified schema!`,
			);
		}

		if (
			this.#is_schema_with_properties(schema)
			&& !(property in schema.properties)
			&& 'string' === typeof schema?.$ref
		) {
			let checking_schema: (
				| SchemaObject
				| undefined
			) = schema;

			while (
				undefined !== checking_schema
				&& !(property in checking_schema.properties)
				&& 'string' === typeof checking_schema.$ref
			) {
				checking_schema = this.#sub_schema_for_property_resolve_$ref(
					schema_parser,
					checking_schema as SchemaObject & {
						$ref: string,
					},
				);

				if (
					checking_schema
					&& 'allOf' in checking_schema
					&& undefined !== checking_schema.allOf
				) {
					const matching = this.#sub_schema_for_property_from_allOf(
						schema_parser,
						properties_mode,
						property,
						checking_schema as SchemaObject & {
							allOf: [
								SchemaObject,
								SchemaObject,
								...SchemaObject[],
							],
						},
					);

					if (matching) {
						return matching;
					}
				}
			}

			if (checking_schema !== undefined) {
				const maybe_type = schema_parser.parse_by_type<
					ObjectUnspecified<
						{[key: string]: unknown},
						'properties'
					>
				>(
					checking_schema,
					(maybe): maybe is ObjectUnspecified<
						{[key: string]: unknown},
						'properties'
					> => ObjectUnspecified.is_a<ObjectUnspecified<
						{[key: string]: unknown},
						'properties'
					>>(maybe) && 'properties' === maybe.properties_mode,
				);

				if (maybe_type && maybe_type.check_type(checking_schema)) {
					schema = checking_schema as typeof schema;
				}
			}
		}

		if (
			this.#is_schema_with_properties(schema)
			&& property in schema.properties
			&& undefined !== schema.properties[property]
		) {
			return this.maybe_add_$defs(
				schema,
				schema.properties[property],
			);
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

		if (
			'neither' === properties_mode
			&& undefined !== fallback_if_neither
		) {
			return fallback_if_neither;
		}

		throw new TypeError(
			`Property "${property}" has no match on the specified schema!`,
		);
	}

	static #sub_schema_for_property_resolve_$ref(
		schema_parser: SchemaParser,
		schema: SchemaObject & {$ref: string},
	): SchemaObject|undefined {
		if (!schema.$ref.startsWith('#/$defs/')) {
			const [
				other_schema_id,
				other_schema_ref_id,
			] = schema.$ref.split(
				'#/$defs/',
			) as [string, string];

			const other_schema = schema_parser.get_schema(
				other_schema_id,
			);

			if (
				other_schema
				&& '$defs' in other_schema
				&& undefined !== other_schema.$defs
				&& other_schema_ref_id in other_schema.$defs
			) {
				return this.maybe_add_$defs(
					other_schema,
					other_schema.$defs[other_schema_ref_id],
				);
			}
		} else {
			const $ref_id = schema.$ref.split('#/$defs/')[1];

			if (
				'$defs' in schema
				&& undefined !== schema.$defs
				&& $ref_id in schema.$defs
			) {
				return this.maybe_add_$defs(
					schema,
					schema.$defs[$ref_id],
				);
			}
		}

		return undefined;
	}

	static #sub_schema_for_property_from_allOf<
		PropertiesMode extends object_properties_mode,
	>(
		schema_parser: SchemaParser,
		properties_mode: PropertiesMode,
		property: string,
		schema: SchemaObject & {
			allOf: [
				SchemaObject,
				SchemaObject,
				...SchemaObject[],
			],
		},
	): SchemaObject|undefined {
		let matching: SchemaObject|undefined;

		for (const candidate of schema.allOf) {
			try {
				const maybe = this.#sub_schema_for_property(
					schema_parser,
					properties_mode,
					property,
					this.maybe_add_$defs(
						schema,
						candidate,
					),
					undefined,
				);

				if (
					undefined !== maybe
				) {
					matching = maybe;
				}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (err) { /* empty */ }
		}

		return matching;
	}
}

export type {
	object_properties_mode,
	object_type,
	object_type_base,
	object_type_with_allOf,
	object_schema,
	object_TypeLiteralNode,
	object_TypeLiteralNode_possibly_extended,
};

export {
	ObjectUnspecified,
};
