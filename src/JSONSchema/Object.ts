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

import {
	is_instanceof,
} from '@satisfactory-dev/custom-assert';

import {
	property_exists_on_object,
} from '@satisfactory-dev/predicates.ts';

import type {
	IntersectionTypeNode,
	ObjectOfSchemas,
	OmitIf,
	SchemaObject,
	TypeLiteralNode,
} from '../types.ts';

import type {
	ConversionlessType,
	SchemaDefinitionDefinition,
	TypeDefinitionSchema,
	TypeOptions,
} from './Type.ts';
import {
	Type,
} from './Type.ts';

import type {
	$defs_schema,
} from './types.ts';

import type {
	adjust_name_callback,
} from '../coercions.ts';
import {
	adjust_name_default,
	intersection_type_node,
	object_keys,
	object_literal_expression,
	type_literal_node,
} from '../coercions.ts';
import type {
	SchemaParser,
} from '../SchemaParser.ts';

import type {
	$def,
	$ref_mode,
	$ref_value_by_mode,
} from './Ref.ts';
import {
	$ref,
} from './Ref.ts';

export type object_properties_mode = (
	| 'neither'
	| 'both'
	| 'properties'
	| 'pattern'
);

export type required_mode = 'optional'|'with'|'without';

export type object_type<
	PropertiesMode extends object_properties_mode,
	Defs extends SchemaObject,
	Required extends readonly [string, ...string[]],
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = (
	& {
		$defs?: Defs,
		type: 'object',
		required?: Required,
	}
	& Omit<
		{
			properties: Properties,
			patternProperties: PatternProperties
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
	RequiredMode extends required_mode,
	PropertiesMode extends object_properties_mode,
> = (
	& readonly [string, ...string[]]
	& [
		'type',
		...{
			with: readonly ['required'],
			without: readonly string[],
			optional: readonly string[],
		}[RequiredMode],
		...{
			neither: readonly string[],
			both: readonly ['properties', 'patternProperties'],
			properties: readonly ['properties'],
			pattern: readonly ['patternProperties'],
		}[PropertiesMode],
	]
);

export type object_schema<
	RequiredMode extends required_mode,
	PropertiesMode extends object_properties_mode,
> = SchemaDefinitionDefinition<
	object_schema_required<RequiredMode, PropertiesMode>,
	(
		& $defs_schema
		& {
			type: {
				type: 'string',
				const: 'object',
			}
		}
		& OmitIf<
			{
				required: {
					type: 'array',
					minItems: 1,
					items: {
						type: 'string',
						minLength: 1,
					},
				},
			},
			'required',
			RequiredMode
		>
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

export type object_TypeLiteralNode<
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
	RequiredMode extends required_mode,
	PropertiesMode extends object_properties_mode,
	Defs extends SchemaObject,
	Required extends readonly [string, ...string[]],
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
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
		RequiredMode,
		PropertiesMode
	>,
	object_TypeLiteralNode<PropertiesMode>,
	ObjectLiteralExpression
> {
	#adjust_name: adjust_name_callback;

	readonly properties_mode: PropertiesMode;
	readonly required_mode: RequiredMode;

	constructor(
		options: {
			adjust_name?: adjust_name_callback,
			required_mode: RequiredMode,
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
				RequiredMode,
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
			type_definition: ObjectUncertain.#generate_default_type_definition(
				options,
			),
			schema_definition: (
				ObjectUncertain.generate_default_schema_definition(
					options,
				)
			),
		});

		this.#adjust_name = options?.adjust_name || adjust_name_default;
		this.required_mode = options.required_mode;
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
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
	>({
		required_mode,
		properties_mode,
	}: {
		required_mode: RequiredMode,
		properties_mode: PropertiesMode,
	}): Readonly<object_schema<
		RequiredMode,
		PropertiesMode
	>> {
		const required_for_partial = (
			this.#generate_default_schema_definition_required(
				required_mode,
				properties_mode,
			)
		);

		const properties_for_partial:Partial<
			object_schema<'with', 'both'>['properties']
		> = {
			type: {
				type: 'string',
				const: 'object',
			},
		};

			properties_for_partial.$defs = {
				type: 'object',
				additionalProperties: {
					type: 'object',
				},
			};

		if ('without' !== required_mode) {
			properties_for_partial.required = {
				type: 'array',
				minItems: 1,
				items: {
					type: 'string',
					minLength: 1,
				},
			};
		}

		if ('pattern' !== properties_mode && 'neither' !== properties_mode) {
			const properties: (
				object_schema<
					'with',
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
					'with',
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

		const unpartial_properties:object_schema<
			RequiredMode,
			PropertiesMode
		>['properties'] = properties_for_partial as object_schema<
			RequiredMode,
			PropertiesMode
		>['properties'];

		const partial_required: object_schema<
			RequiredMode,
			PropertiesMode
		>['required'] = required_for_partial;
		const partial_properties: object_schema<
			RequiredMode,
			PropertiesMode
		>['properties'] = unpartial_properties;

		const result:object_schema<
			RequiredMode,
			PropertiesMode
		> = {
			type: 'object',
			required: partial_required,
			additionalProperties: false,
			properties: partial_properties,
		} as object_schema<
			RequiredMode,
			PropertiesMode
		>;

		return Object.freeze(result);
	}

	static #generate_default_schema_definition_required<
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
	>(
		required_mode: RequiredMode,
		properties_mode: PropertiesMode,
	): object_schema<
		RequiredMode,
		PropertiesMode
	>['required'] {
		const maybe_required: {
			with: readonly ['required'],
			without: readonly string[],
			optional: readonly string[],
		}[RequiredMode] = {
			with: ['required'] as const,
			without: [] as readonly string[],
			optional: [] as readonly string[],
		}[required_mode];
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
			RequiredMode,
			PropertiesMode
		>['required'] = [
			...['type'],
			...maybe_required,
			...values_for_properties_mode,
		] as object_schema<
			RequiredMode,
			PropertiesMode
		>['required'];

		return required;
	}

	static #generate_default_type_definition<
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
		const partial:Partial<object_type<
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
	> (
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
	> (
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
	> (
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
	> (
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

		const $defs = this.#get_defs(schema, sub_schema);

		const ajv = schema_parser.share_ajv((ajv) => ajv);
		const validator = ajv.compile<T>({
			...sub_schema,
			$defs,
		});

		if (!(validator(value))) {
			throw new TypeError('Supplied value not supported by property!');
		}

		let converter:(
			| undefined
			| Type<unknown>
			| $ref<Record<string, never>, 'either'>
		) = schema_parser.maybe_parse_by_type<
			$ref<Record<string, never>, 'either'>
		>(
			sub_schema,
			(
				maybe: unknown,
			): maybe is $ref<Record<string, never>, 'either'> => {
				return $ref.is_a(maybe);
			},
		);

		if (undefined === converter) {
			converter = schema_parser.parse(sub_schema, true);
		}

		if (converter instanceof $ref) {
			converter = converter.resolve_ref(
				sub_schema as {$ref: $ref_value_by_mode<$ref_mode>},
				$defs,
				schema_parser,
				true,
			);
		}

		is_instanceof<Type<unknown>>(converter, Type);

		return converter.generate_typescript_data(
			value,
			schema_parser,
			sub_schema,
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
		return object_literal_expression(
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
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
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
		if (!this.#is_schema_with_some_type_of_properties(schema)) {
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
				Object.values(
					schema.patternProperties,
				).filter((maybe) => undefined !== maybe).map(
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

	static #get_defs(
		schema: (
			& SchemaObject
			& {
				$defs?: ObjectOfSchemas,
			}
		),
		sub_schema: SchemaObject,
	): {[key: $def]: SchemaObject} {
		let $defs:{[key: $def]: SchemaObject} = {};

		if (
			'$ref' in sub_schema
			&& '$defs' in schema
			&& schema.$defs
			&& !('$defs' in sub_schema)
		) {
			$defs = sub_schema.$defs = schema.$defs;
		} else if (
			property_exists_on_object(sub_schema, '$defs')
			&& undefined !== sub_schema.$defs
			&& $ref.is_supported_$defs(sub_schema.$defs)
		) {
			$defs = sub_schema.$defs;
		}

		return $defs;
	}

	static async #generate_type<
		PropertiesMode extends object_properties_mode,
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
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

		let matched:(
			| undefined
			| ConversionlessType<unknown>
		) = schema_parser.maybe_parse_by_type<
			$ref<Record<string, never>, 'either'>
		>(
			sub_schema,
			(
				maybe: unknown,
			): maybe is $ref<Record<string, never>, 'either'> => {
				return $ref.is_a(maybe);
			},
		);

		if (undefined === matched) {
			matched = schema_parser.parse(sub_schema, true);
		} else {
			return matched.generate_typescript_type({
				data: sub_schema,
				schema_parser,
			});
		}

		return matched.generate_typescript_type({
			schema: sub_schema,
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
		PropertiesMode extends object_properties_mode,
		Defs extends SchemaObject,
		Required extends readonly [string, ...string[]],
		Properties extends ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas,
	>(
		property: string,
		schema: object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
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
			const matching = object_keys(
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

		throw new TypeError(`Property "${property}" has no match on the specified schema!`);
	}
}

export function generate_default_schema_definition<
	DefsMode extends 'optional',
	RequiredMode extends required_mode,
	PropertiesMode extends object_properties_mode,
>(options: {
	$defs_mode: DefsMode,
	required_mode: RequiredMode,
	properties_mode: PropertiesMode,
}): Readonly<object_schema<
	RequiredMode,
	PropertiesMode
>> {
	return ObjectUncertain.generate_default_schema_definition(options);
}

export class ObjectUnspecified<
	T extends {[key: string]: unknown},
	PropertiesMode extends object_properties_mode,
> extends ObjectUncertain<
	T,
	'optional',
	PropertiesMode,
	SchemaObject,
	readonly [string, ...string[]],
	ObjectOfSchemas,
	ObjectOfSchemas
> {

	constructor(
		{
			adjust_name,
			properties_mode,
			$defs,
		}: {
			adjust_name?: adjust_name_callback,
			properties_mode: PropertiesMode,
			$defs?: SchemaObject,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'optional',
				PropertiesMode
			>,
			object_type<
				PropertiesMode,
				SchemaObject,
				readonly [string, ...string[]],
				ObjectOfSchemas,
				ObjectOfSchemas
			>
		>,
	) {
		super(
			{
				adjust_name,
				required_mode: 'optional',
				properties_mode,
				$defs,
			},
			{
				ajv,
			},
		);
	}
}
