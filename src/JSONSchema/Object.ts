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
	IntersectionTypeNode,
	OmitFromTupleish,
	TypeLiteralNode,
} from '../types.ts';

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
	$defs_schema,
	DefsType,
	RequiredType,
} from './types.ts';

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
	SchemaParser,
} from '../SchemaParser.ts';

type object_properties_mode = (
	| 'neither'
	| 'both'
	| 'properties'
	| 'pattern'
);

type object_full_type<
	Defs extends ObjectOfSchemas,
	Required extends [string, ...string[]],
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = {
	type: 'object',
	$defs: Defs,
	required: Required,
	properties: Properties,
	patternProperties: PatternProperties,
};

type object_both_type<
	Defs extends DefsType,
	Required extends RequiredType,
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = (
	Defs extends Exclude<DefsType, ObjectOfSchemas>
		? (
			Required extends Exclude<RequiredType, [string, ...string[]]>
				? Omit<
					object_full_type<
						ObjectOfSchemas,
						[string, ...string[]],
						Properties,
						PatternProperties
					>,
					(
						| '$defs'
						| 'required'
					)
				>
				: (
					Required extends Exclude<RequiredType, undefined>
						? Omit<
							object_full_type<
								ObjectOfSchemas,
								Required,
								Properties,
								PatternProperties
							>,
							(
								| '$defs'
							)
						>
						: never
				)
		)
		: (
			Defs extends Exclude<DefsType, undefined>
				? (
					Required extends Exclude<
						RequiredType,
						[string, ...string[]]
					>
						? Omit<
							object_full_type<
								Defs,
								[string, ...string[]],
								Properties,
								PatternProperties
							>,
							(
								| 'required'
							)
						>
						: (
							Required extends Exclude<RequiredType, undefined>
								? object_full_type<
									Defs,
									Required,
									Properties,
									PatternProperties
								>
								: never
						)
				)
				: never
		)
);

type object_type<
	PropertiesMode extends object_properties_mode,
	Defs extends DefsType,
	Required extends RequiredType,
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = {
	['neither']: (
		Defs extends Exclude<DefsType, undefined>
			? never
			: (
				Required extends Exclude<RequiredType, undefined>
					? never
					: Pick<
						object_full_type<
							ObjectOfSchemas,
							[string, ...string[]],
							ObjectOfSchemas,
							ObjectOfSchemas
						>,
						'type'
					>
			)
	),
	['both']: object_both_type<
		Defs,
		Required,
		Properties,
		PatternProperties
	>,
	['properties']: Omit<
		object_both_type<
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		'patternProperties'
	>,
	['pattern']: Omit<
		object_both_type<
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		'properties'
	>
}[PropertiesMode];

type object_full_schema = SchemaDefinitionDefinition<
	['$defs', 'type', 'required', 'properties', 'patternProperties'],
	{
		$defs: $defs_schema['$defs'],
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
		properties: {
			type: 'object',
			minProperties: 1,
			additionalProperties: {
				type: 'object',
			},
		},
		patternProperties: {
			type: 'object',
			minProperties: 1,
			additionalProperties: {
				type: 'object',
			},
		},
	}
>

type object_schema<
	PropertiesMode extends object_properties_mode,
	Defs extends DefsType,
	Required extends RequiredType,
> = {
	['neither']: (
		Defs extends Exclude<DefsType, undefined>
			? never
			: (
				Required extends Exclude<RequiredType, undefined>
					? never
					: SchemaDefinitionDefinition<
						['type'],
						Pick<object_full_schema['properties'], 'type'>
					>
			)
	),
	['both']: (
		Defs extends Exclude<DefsType, undefined>
			? (
				Required extends Exclude<RequiredType, undefined>
					? object_full_schema
					: (
						Required extends Exclude<
							RequiredType,
							[string, ...string[]]
						>
							? SchemaDefinitionDefinition<
								OmitFromTupleish<
									object_full_schema['required'],
									'required'
								>,
								Omit<
									object_full_schema['properties'],
									'required'
								>
							>
							: SchemaDefinitionDefinition<
								OmitFromTupleish<
									object_full_schema['required'],
									'required'
								>,
								object_full_schema['properties']
							>
					)
			)
			: (
				Defs extends Exclude<DefsType, ObjectOfSchemas>
					? (
						Required extends Exclude<RequiredType, undefined>
							? SchemaDefinitionDefinition<
								OmitFromTupleish<
									object_full_schema['required'],
									'$defs'
								>,
								Omit<
									object_full_schema['properties'],
									'$defs'
								>
							>
							: (
								Required extends Exclude<
									RequiredType,
									[string, ...string[]]
								>
									? SchemaDefinitionDefinition<
										OmitFromTupleish<
											object_full_schema['required'],
											(
												| '$defs'
												| 'required'
											)
										>,
										Omit<
											object_full_schema['properties'],
											(
												| '$defs'
												| 'required'
											)
										>
									>
									: SchemaDefinitionDefinition<
										OmitFromTupleish<
											object_full_schema['required'],
											(
												| '$defs'
												| 'required'
											)
										>,
										Omit<
											object_full_schema['properties'],
											'$defs'
										>
									>
							)
					)
					: (
						Required extends Exclude<RequiredType, undefined>
							? SchemaDefinitionDefinition<
								OmitFromTupleish<
									object_full_schema['required'],
									'$defs'
								>,
								object_full_schema['properties']
							>
							: (
								Required extends Exclude<
									RequiredType,
									[string, ...string[]]
								>
									? SchemaDefinitionDefinition<
										OmitFromTupleish<
											object_full_schema['required'],
											(
												| '$defs'
												| 'required'
											)
										>,
										Omit<
											object_full_schema['properties'],
											'required'
										>
									>
									: SchemaDefinitionDefinition<
										OmitFromTupleish<
											object_full_schema['required'],
											(
												| '$defs'
												| 'required'
											)
										>,
										object_full_schema['properties']
									>
							)
					)
			)
	),
	['properties']: SchemaDefinitionDefinition<
		OmitFromTupleish<
			object_schema<
				'both',
				Defs,
				Required
			>['both']['required'],
			'patternProperties'
		>,
		Omit<
			object_schema<
				'both',
				Defs,
				Required
			>['both']['properties'],
			'patternProperties'
		>
	>,
	['pattern']: SchemaDefinitionDefinition<
		OmitFromTupleish<
			object_schema<
				'both',
				Defs,
				Required
			>['both']['required'],
			'properties'
		>,
		Omit<
			object_schema<
				'both',
				Defs,
				Required
			>['both']['properties'],
			'properties'
		>
	>,
}[PropertiesMode];

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

abstract class ObjectUncertain<
	T extends {[key: string]: unknown},
	PropertiesMode extends object_properties_mode,
	Defs extends DefsType,
	Required extends RequiredType,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends Type<
	T,
	object_type<
		PropertiesMode,
		Defs,
		Required,
		Properties,
		PatternProperties
	>,
	object_schema<
		PropertiesMode,
		Defs,
		Required
	>,
	object_TypeLiteralNode<PropertiesMode>,
	ObjectLiteralExpression
> {
	#adjust_name: adjust_name_callback;

	constructor(
		{
			adjust_name,
			properties_mode,
			$defs,
			required,
			properties,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			properties_mode: PropertiesMode,
			$defs: Defs,
			required: Required,
			properties: Properties,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				PropertiesMode,
				Defs,
				Required
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
			type_definition: ObjectUncertain.#generate_default_type_definition(
				properties_mode,
				$defs,
				required,
				properties,
				patternProperties,
			),
			schema_definition: (
				ObjectUncertain.generate_default_schema_definition({
					properties_mode,
					$defs,
					required,
				})
			),
		});

		this.#adjust_name = adjust_name || adjust_name_default;
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
		return ObjectUncertain.#createObjectLiteralExpression(
			data,
			schema,
			schema_parser,
			this.#adjust_name,
		);
	}

	generate_typescript_type(
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
	): Promise<object_TypeLiteralNode<PropertiesMode>> {
		return ObjectUncertain.#createTypeNode(
			schema,
			schema_parser,
		);
	}

	static generate_default_schema_definition<
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType,
		Required extends RequiredType
	>({
		properties_mode,
		$defs,
		required,
	}: {
		properties_mode: PropertiesMode,
		$defs: Defs,
		required: Required,
	}): Readonly<object_schema<
		PropertiesMode,
		Defs,
		Required
	>> {
		if ('neither' === properties_mode) {
			const unfrozen:object_schema<
				'neither',
				undefined,
				undefined
			> = {
				type: 'object',
				required: ['type'],
				additionalProperties: false,
				properties: {
					type: {
						type: 'string',
						const: 'object',
					},
				},
			};

			return Object.freeze(unfrozen as object_schema<
				PropertiesMode,
				Defs,
				Required
			>);
		}

		const required_for_partial:object_schema<
			Exclude<PropertiesMode, 'neither'>,
			Defs,
			Required
		>['required'] = (
			this.#generate_default_schema_definition_required(
				properties_mode,
				$defs,
				required,
			)
		);

		const properties_for_partial:Partial<
			object_full_schema['properties']
		> = {
		}

		if ($defs) {
			properties_for_partial.$defs = {
				type: 'object',
				additionalProperties: {
					type: 'object',
				},
			};
		}

		if (required) {
			properties_for_partial.required = {
				type: 'array',
				minItems: 1,
				items: {
					type: 'string',
					minLength: 1,
				},
			};
		}

		if ('pattern' !== properties_mode) {
			const properties: (
				object_full_schema['properties']['properties']
			) = {
				type: 'object',
				minProperties: 1,
				additionalProperties: {
					type: 'object',
				},
			};
			properties_for_partial.properties = properties;
		}
		if ('properties' !== properties_mode) {
			const properties: (
				object_full_schema['properties']['patternProperties']
			) = {
				type: 'object',
				minProperties: 1,
				additionalProperties: {
					type: 'object',
				},
			};
			properties_for_partial.patternProperties = properties;
		}

		const unpartial_properties:object_schema<
			Exclude<PropertiesMode, 'neither'>,
			Defs,
			Required
		>['properties'] = properties_for_partial as object_schema<
			Exclude<PropertiesMode, 'neither'>,
			Defs,
			Required
		>['properties'];

		const partial_required: object_schema<
			Exclude<PropertiesMode, 'neither'>,
			Defs,
			Required
		>['required'] = required_for_partial;
		const partial_properties: object_schema<
			Exclude<PropertiesMode, 'neither'>,
			Defs,
			Required
		>['properties'] = unpartial_properties;

		const result:object_schema<
			Exclude<PropertiesMode, 'neither'>,
			Defs,
			Required
		> = {
			type: 'object',
			required: partial_required,
			additionalProperties: false,
			properties: partial_properties,
		} as object_schema<
			Exclude<PropertiesMode, 'neither'>,
			Defs,
			Required
		>;

		return Object.freeze(result);
	}

	static #generate_default_schema_definition_required<
		PropertiesMode extends Exclude<
			object_properties_mode,
			'neither'
		>,
		Defs extends DefsType,
		Required extends RequiredType
	>(
		properties_mode: PropertiesMode,
		$defs: Defs,
		required: Required,
	): object_schema<
		PropertiesMode,
		Defs,
		Required
	>['required'] {
		let required_for_unfrozen_both: object_schema<
			'both',
			Defs,
			Required
		>['required'];

		if ($defs) {
			if (!required) {
				const sanity_check:object_schema<
					'both',
					ObjectOfSchemas,
					undefined
				>['required'] = [
					'$defs',
					'type',
					'properties',
					'patternProperties',
				];
				required_for_unfrozen_both = sanity_check;
			} else {
				const sanity_check:object_schema<
					'both',
					ObjectOfSchemas,
					[string, ...string[]]
				>['required'] = [
					'$defs',
					'type',
					'required',
					'properties',
					'patternProperties',
				];
				required_for_unfrozen_both = sanity_check;
			}
		} else {
			if (!required) {
				const sanity_check:object_schema<
					'both',
					undefined,
					undefined
				>['required'] = [
					'type',
					'properties',
					'patternProperties',
				];
				required_for_unfrozen_both = sanity_check;
			} else {
				const sanity_check:object_schema<
					'both',
					undefined,
					[string, ...string[]]
				>['required'] = [
					'type',
					'required',
					'properties',
					'patternProperties',
				];
				required_for_unfrozen_both = sanity_check;
			}
		}

		if ('both' === properties_mode) {
			return required_for_unfrozen_both;
		} else if ('properties' === properties_mode) {
			return required_for_unfrozen_both.filter(
				(maybe) => 'patternProperties' !== maybe,
			);
		}

		return required_for_unfrozen_both.filter(
			(maybe) => 'properties' !== maybe,
		);
	}

	static #generate_default_type_definition<
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType,
		Required extends RequiredType,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	>(
		properties_mode: PropertiesMode,
		$defs: Defs,
		required: Required,
		properties: Properties,
		patternProperties: PatternProperties,
	): Readonly<object_type<
		PropertiesMode,
		Defs,
		Required,
		Properties,
		PatternProperties
	>> {
		if (properties_mode === 'neither') {
			const frozen:Readonly<object_type<
				'neither',
				undefined,
				undefined,
				Properties,
				PatternProperties
			>> = Object.freeze({
				type: 'object',
			});

			return frozen as Readonly<object_type<
				PropertiesMode,
				Defs,
				Required,
				Properties,
				PatternProperties
			>>;
		}

		const partial:Partial<object_full_type<
			ObjectOfSchemas,
			[string, ...string[]],
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

	static #is_schema_with_neither<
		Defs extends DefsType,
		Required extends RequiredType,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
		schema: object_type<
			object_properties_mode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type<
		'neither',
		Defs,
		Required,
		Properties,
		PatternProperties
	> {
		return ! ('properties' in schema) && !('patternProperties' in schema);
	}

	static #is_schema_with_properties<
		Defs extends DefsType,
		Required extends RequiredType,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
		schema: object_type<
			object_properties_mode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type<
		Exclude<
			object_properties_mode,
			(
				| 'neither'
				| 'pattern'
			)
		>,
		Defs,
		Required,
		Properties,
		PatternProperties
	> {
		return 'properties' in schema;
	}

	static #is_schema_with_pattern_properties<
		Defs extends DefsType,
		Required extends RequiredType,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
		schema: object_type<
			object_properties_mode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type<
		Exclude<
			object_properties_mode,
			(
				| 'neither'
				| 'properties'
			)
		>,
		Defs,
		Required,
		Properties,
		PatternProperties
	> {
		return 'patternProperties' in schema;
	}

	static #is_schema_with_required<
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
		schema: object_type<
			PropertiesMode,
			Defs,
			RequiredType,
			Properties,
			PatternProperties
		>,
	): schema is object_type<
		PropertiesMode,
		Defs,
		Exclude<RequiredType, undefined>,
		Properties,
		PatternProperties
	> {
		return 'required' in schema;
	}

	static #convert<
		T,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType,
		Required extends RequiredType,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
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

	static #createObjectLiteralExpression<
		T extends {[key: string]: unknown},
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType,
		Required extends RequiredType,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	>(
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
		Defs extends DefsType,
		Required extends RequiredType,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	>(
		schema: object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		schema_parser: SchemaParser,
	): Promise<object_TypeLiteralNode<PropertiesMode>> {
		if (this.#is_schema_with_neither(schema)) {
			return type_literal_node([
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
				await this.#generate_type(
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

		let result:object_TypeLiteralNode<
			Exclude<
				object_properties_mode,
				'neither'
			>
		>;

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

	static #generate_type<
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType,
		Required extends RequiredType,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
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
		Defs extends DefsType,
		Required extends RequiredType,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	>(
		property: string,
		schema: object_type<
			object_properties_mode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
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

export class ObjectUnspecified<
	T extends {[key: string]: unknown},
> extends ObjectUncertain<
	T,
	'neither',
	undefined,
	undefined
> {

	constructor(
		{
			adjust_name,
		}: {
			adjust_name?: adjust_name_callback,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'neither',
				undefined,
				undefined
			>,
			object_type<
				'neither',
				undefined,
				undefined,
				ObjectOfSchemas,
				ObjectOfSchemas
			>
		>,
	) {
		super(
			{
				adjust_name,
				properties_mode: 'neither',
				$defs: undefined,
				required: undefined,
				properties: {},
				patternProperties: {},
			},
			{
				ajv,
			},
		);
	}
}

abstract class ObjectWithout$defs<
	T extends {[key: string]: unknown},
	PropertiesMode extends Exclude<
		object_properties_mode,
		'neither'
	>,
	Required extends RequiredType,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectUncertain<
	T,
	PropertiesMode,
	undefined,
	Required,
	Properties,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			properties_mode,
			required,
			properties,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			properties_mode: PropertiesMode,
			required: Required,
			properties: Properties,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				PropertiesMode,
				undefined,
				Required
			>,
			object_type<
				PropertiesMode,
				undefined,
				Required,
				ObjectOfSchemas,
				ObjectOfSchemas
			>
		>,
	) {
		super(
			{
				adjust_name,
				properties_mode,
				$defs: undefined,
				required,
				properties,
				patternProperties,
			},
			{
				ajv,
			},
		);
	}
}

export class ObjectWithout$defs_both<
	T extends {[key: string]: unknown},
	Required extends RequiredType,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWithout$defs<
	T,
	'both',
	Required,
	Properties,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			required,
			properties,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			required: Required,
			properties: Properties,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'both',
				undefined,
				Required
			>,
			object_type<
				'both',
				undefined,
				Required,
				ObjectOfSchemas,
				ObjectOfSchemas
			>
		>,
	) {
		super(
			{
				adjust_name,
				properties_mode: 'both',
				required,
				properties,
				patternProperties,
			},
			{
				ajv,
			},
		);
	}
}

export class ObjectWithout$defs_property_only<
	T extends {[key: string]: unknown},
	Required extends RequiredType,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWithout$defs<
	T,
	'properties',
	Required,
	Properties,
	ObjectOfSchemas
> {
	constructor(
		{
			adjust_name,
			required,
			properties,
		}: {
			adjust_name?: adjust_name_callback,
			required: Required,
			properties: Properties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'properties',
				undefined,
				Required
			>,
			object_type<
				'properties',
				undefined,
				Required,
				ObjectOfSchemas,
				ObjectOfSchemas
			>
		>,
	) {
		super(
			{
				adjust_name,
				properties_mode: 'properties',
				required,
				properties,
				patternProperties: {},
			},
			{
				ajv,
			},
		);
	}
}

export class ObjectWithout$defs_pattern_properties_only<
	T extends {[key: string]: unknown},
	Required extends RequiredType,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWithout$defs<
	T,
	'pattern',
	Required,
	ObjectOfSchemas,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			required,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			required: Required,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'pattern',
				undefined,
				Required
			>,
			object_type<
				'pattern',
				undefined,
				Required,
				ObjectOfSchemas,
				ObjectOfSchemas
			>
		>,
	) {
		super(
			{
				adjust_name,
				properties_mode: 'pattern',
				required,
				properties: {},
				patternProperties,
			},
			{
				ajv,
			},
		);
	}
}

abstract class ObjectWith$defs<
	T extends {[key: string]: unknown},
	PropertiesMode extends Exclude<
		object_properties_mode,
		'neither'
	>,
	Defs extends ObjectOfSchemas,
	Required extends RequiredType,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectUncertain<
	T,
	PropertiesMode,
	Defs,
	Required,
	Properties,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			properties_mode,
			$defs,
			required,
			properties,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			properties_mode: PropertiesMode,
			$defs: Defs,
			required: Required,
			properties: Properties,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'neither',
				Defs,
				Required
			>,
			object_type<
				'neither',
				Defs,
				Required,
				ObjectOfSchemas,
				ObjectOfSchemas
			>
		>,
	) {
		super(
			{
				adjust_name,
				properties_mode,
				$defs,
				required,
				properties,
				patternProperties,
			},
			{
				ajv,
			},
		);
	}
}


export class ObjectWith$defs_both<
	T extends {[key: string]: unknown},
	Defs extends ObjectOfSchemas,
	Required extends RequiredType,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWith$defs<
	T,
	'both',
	Defs,
	Required,
	Properties,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			$defs,
			required,
			properties,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			$defs: Defs,
			required: Required,
			properties: Properties,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'both',
				Defs,
				Required
			>,
			object_type<
				'both',
				Defs,
				Required,
				ObjectOfSchemas,
				ObjectOfSchemas
			>
		>,
	) {
		super(
			{
				adjust_name,
				properties_mode: 'both',
				$defs,
				required,
				properties,
				patternProperties,
			},
			{
				ajv,
			},
		);
	}
}

export class ObjectWith$defs_property_only<
	T extends {[key: string]: unknown},
	Defs extends ObjectOfSchemas,
	Required extends RequiredType,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWith$defs<
	T,
	'properties',
	Defs,
	Required,
	Properties,
	ObjectOfSchemas
> {
	constructor(
		{
			adjust_name,
			$defs,
			required,
			properties,
		}: {
			adjust_name?: adjust_name_callback,
			$defs: Defs,
			required: Required,
			properties: Properties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'properties',
				Defs,
				Required
			>,
			object_type<
				'properties',
				Defs,
				Required,
				ObjectOfSchemas,
				ObjectOfSchemas
			>
		>,
	) {
		super(
			{
				adjust_name,
				properties_mode: 'properties',
				$defs,
				required,
				properties,
				patternProperties: {},
			},
			{
				ajv,
			},
		);
	}
}

export class ObjectWith$defs_pattern_properties_only<
	T extends {[key: string]: unknown},
	Defs extends ObjectOfSchemas,
	Required extends RequiredType,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWith$defs<
	T,
	'pattern',
	Defs,
	Required,
	ObjectOfSchemas,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			$defs,
			required,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			$defs: Defs,
			required: Required,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'pattern',
				Defs,
				Required
			>,
			object_type<
				'pattern',
				Defs,
				Required,
				ObjectOfSchemas,
				ObjectOfSchemas
			>
		>,
	) {
		super(
			{
				adjust_name,
				properties_mode: 'pattern',
				$defs,
				required,
				properties: {},
				patternProperties,
			},
			{
				ajv,
			},
		);
	}
}
