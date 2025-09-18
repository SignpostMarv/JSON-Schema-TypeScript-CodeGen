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
	$defs_mode,
	$defs_schema,
	DefsType_by_mode,
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

type required_mode = 'optional'|'with'|'without';

type RequiredType_by_mode<
	RequiredMode extends required_mode,
	Required extends [string, ...string[]] = [string, ...string[]]
> = {
	with: Required,
	without: undefined,
	optional: RequiredType_by_mode<'with', Required>,
}[RequiredMode];

type object_full_type<
	Defs extends DefsType_by_mode['with'],
	Required extends RequiredType_by_mode<'with'>,
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = {
	type: 'object',
	$defs: Defs,
	required: Required,
	properties: Properties,
	patternProperties: PatternProperties,
};

type object_type_structured<
	DefsMode extends $defs_mode,
	RequiredMode extends required_mode,
	Defs extends DefsType_by_mode[$defs_mode],
	Required extends RequiredType_by_mode<RequiredMode>,
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = {
	with: {
		with: {
			both: Omit<
				object_full_type<
					Exclude<Defs, DefsType_by_mode['without']>,
					Exclude<Required, RequiredType_by_mode<'without'>>,
					Properties,
					PatternProperties
				>,
				(
					| '$defs'
				)
			>,
			neither: never,
			properties: Omit<
				object_type_structured<
					DefsMode,
					RequiredMode,
					Defs,
					Required,
					Properties,
					PatternProperties
				>['with']['with']['both'],
				'patternProperties'
			>,
			pattern: Omit<
				object_type_structured<
					DefsMode,
					RequiredMode,
					Defs,
					Required,
					Properties,
					PatternProperties
				>['with']['with']['both'],
				'properties'
			>,
		},
		without: {
			both: Omit<
				object_full_type<
					Exclude<Defs, DefsType_by_mode['without']>,
					Exclude<Required, RequiredType_by_mode<'without'>>,
					Properties,
					PatternProperties
				>,
				(
					| '$defs'
					| 'required'
				)
			>,
			neither: never,
			properties: Omit<
				object_type_structured<
					DefsMode,
					RequiredMode,
					Defs,
					Required,
					Properties,
					PatternProperties
				>['with']['without']['both'],
				'patternProperties'
			>,
			pattern: Omit<
				object_type_structured<
					DefsMode,
					RequiredMode,
					Defs,
					Required,
					Properties,
					PatternProperties
				>['with']['without']['both'],
				'properties'
			>,
		},
		optional: object_type_structured<
			DefsMode,
			RequiredMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>['with']['with'],
	},
	without: {
		with: {
			both: object_full_type<
				Exclude<Defs, DefsType_by_mode['without']>,
				Exclude<Required, RequiredType_by_mode<'without'>>,
				Properties,
				PatternProperties
			>,
			neither: never,
			properties: Omit<
				object_type_structured<
					DefsMode,
					RequiredMode,
					Defs,
					Required,
					Properties,
					PatternProperties
				>['without']['with']['both'],
				'patternProperties'
			>,
			pattern: Omit<
				object_type_structured<
					DefsMode,
					RequiredMode,
					Defs,
					Required,
					Properties,
					PatternProperties
				>['without']['with']['both'],
				'properties'
			>,
		},
		without: {
			both: Omit<
				object_full_type<
					Exclude<Defs, DefsType_by_mode['without']>,
					Exclude<Required, RequiredType_by_mode<'without'>>,
					Properties,
					PatternProperties
				>,
				(
					| 'required'
				)
			>,
			neither: Pick<
				object_full_type<
					Exclude<Defs, DefsType_by_mode['without']>,
					Exclude<Required, RequiredType_by_mode<'without'>>,
					Properties,
					PatternProperties
				>,
				'type'
			>,
			properties: Omit<
				object_type_structured<
					DefsMode,
					RequiredMode,
					Defs,
					Required,
					Properties,
					PatternProperties
				>['without']['without']['both'],
				'patternProperties'
			>,
			pattern: Omit<
				object_type_structured<
					DefsMode,
					RequiredMode,
					Defs,
					Required,
					Properties,
					PatternProperties
				>['without']['without']['both'],
				'properties'
			>,
		},
		optional: object_type_structured<
			DefsMode,
			RequiredMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>['without']['with'],
	},
	optional: object_type_structured<
		DefsMode,
		RequiredMode,
		Defs,
		Required,
		Properties,
		PatternProperties
	>['with'],
};

type object_type<
	DefsMode extends $defs_mode,
	RequiredMode extends required_mode,
	PropertiesMode extends object_properties_mode,
	Defs extends DefsType_by_mode[DefsMode],
	Required extends RequiredType_by_mode<RequiredMode>,
	Properties extends ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas,
> = object_type_structured<
	DefsMode,
	RequiredMode,
	Defs,
	Required,
	Properties,
	PatternProperties
>[DefsMode][RequiredMode][PropertiesMode];

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

type object_schema_structured = {
	neither: {
		with: {
			with: never,
			without: SchemaDefinitionDefinition<
				['type'],
				Pick<object_full_schema['properties'], 'type'>
			>,
			optional: never,
		},
		without: {
			with: never,
			without: never,
			optional: never,
		},
		optional: {
			with: never,
			without: object_schema_structured['neither']['with']['without'],
			optional: never,
		},
	},
	both: {
		with: {
			with: object_full_schema,
			without: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_full_schema['required'],
					'required'
				>,
				Omit<
					object_full_schema['properties'],
					'required'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_full_schema['required'],
					'required'
				>,
				object_full_schema['properties']
			>,
		},
		without: {
			with: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_full_schema['required'],
					'$defs'
				>,
				Omit<
					object_full_schema['properties'],
					'$defs'
				>
			>,
			without: SchemaDefinitionDefinition<
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
			>,
			optional: SchemaDefinitionDefinition<
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
			>,
		},
		optional: {
			with: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_full_schema['required'],
					'$defs'
				>,
				object_full_schema['properties']
			>,
			without: SchemaDefinitionDefinition<
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
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_full_schema['required'],
					(
						| '$defs'
						| 'required'
					)
				>,
				object_full_schema['properties']
			>,
		},
	},
	properties: {
		with: {
			with: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'with'
					][
						'required'
					],
					'patternProperties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'with'
					]['properties'],
					'patternProperties'
				>
			>,
			without: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'without'
					][
						'required'
					],
					'patternProperties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'without'
					]['properties'],
					'patternProperties'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'optional'
					][
						'required'
					],
					'patternProperties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'optional'
					]['properties'],
					'patternProperties'
				>
			>,
		},
		without: {
			with: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'with'
					][
						'required'
					],
					'patternProperties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'with'
					]['properties'],
					'patternProperties'
				>
			>,
			without: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'without'
					][
						'required'
					],
					'patternProperties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'without'
					]['properties'],
					'patternProperties'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'optional'
					][
						'required'
					],
					'patternProperties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'optional'
					]['properties'],
					'patternProperties'
				>
			>,
		},
		optional: {
			with: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'with'
					][
						'required'
					],
					'patternProperties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'with'
					]['properties'],
					'patternProperties'
				>
			>,
			without: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'without'
					][
						'required'
					],
					'patternProperties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'without'
					]['properties'],
					'patternProperties'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'optional'
					][
						'required'
					],
					'patternProperties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'optional'
					]['properties'],
					'patternProperties'
				>
			>,
		},
	},
	pattern: {
		with: {
			with: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'with'
					][
						'required'
					],
					'properties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'with'
					]['properties'],
					'properties'
				>
			>,
			without: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'without'
					][
						'required'
					],
					'properties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'without'
					]['properties'],
					'properties'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'optional'
					][
						'required'
					],
					'properties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'with'
					][
						'optional'
					]['properties'],
					'properties'
				>
			>,
		},
		without: {
			with: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'with'
					][
						'required'
					],
					'properties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'with'
					]['properties'],
					'properties'
				>
			>,
			without: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'without'
					][
						'required'
					],
					'properties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'without'
					]['properties'],
					'properties'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'optional'
					][
						'required'
					],
					'properties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'without'
					][
						'optional'
					]['properties'],
					'properties'
				>
			>,
		},
		optional: {
			with: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'with'
					][
						'required'
					],
					'properties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'with'
					]['properties'],
					'properties'
				>
			>,
			without: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'without'
					][
						'required'
					],
					'properties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'without'
					]['properties'],
					'properties'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'optional'
					][
						'required'
					],
					'properties'
				>,
				Omit<
					object_schema_structured[
						'both'
					][
						'optional'
					][
						'optional'
					]['properties'],
					'properties'
				>
			>,
		},
	},
};

type object_schema_from_structured<
	DefsMode extends $defs_mode,
	RequiredMode extends required_mode,
	PropertiesMode extends object_properties_mode,
> = object_schema_structured[PropertiesMode][DefsMode][RequiredMode];

type object_schema<
	DefsMode extends $defs_mode,
	RequiredMode extends required_mode,
	PropertiesMode extends object_properties_mode,
> = object_schema_from_structured<DefsMode, RequiredMode, PropertiesMode>;

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
	DefsMode extends $defs_mode,
	RequiredMode extends required_mode,
	PropertiesMode extends object_properties_mode,
	Defs extends DefsType_by_mode[DefsMode],
	Required extends RequiredType_by_mode<RequiredMode>,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends Type<
	T,
	object_type<
		DefsMode,
		RequiredMode,
		PropertiesMode,
		Defs,
		Required,
		Properties,
		PatternProperties
	>,
	object_schema<
		DefsMode,
		RequiredMode,
		PropertiesMode
	>,
	object_TypeLiteralNode<PropertiesMode>,
	ObjectLiteralExpression
> {
	#adjust_name: adjust_name_callback;

	constructor(
		{
			adjust_name,
			required_mode,
			properties_mode,
			$defs,
			required,
			properties,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			required_mode: RequiredMode,
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
				DefsMode,
				RequiredMode,
				PropertiesMode
			>,
			object_type<
				DefsMode,
				RequiredMode,
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
					required_mode,
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
			DefsMode,
			RequiredMode,
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
				DefsMode,
				RequiredMode,
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
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>
	>({
		required_mode,
		properties_mode,
		$defs,
		required,
	}: {
		required_mode: RequiredMode,
		properties_mode: PropertiesMode,
		$defs: Defs,
		required: Required,
	}): Readonly<object_schema<
		DefsMode,
		RequiredMode,
		PropertiesMode
	>> {
		if ('neither' === properties_mode) {
			const unfrozen:object_schema<
				DefsMode & 'with',
				RequiredMode & 'without',
				PropertiesMode & 'neither'
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

			return Object.freeze(unfrozen);
		}

		type CoercedSchema = object_schema<
			DefsMode,
			RequiredMode,
			Exclude<PropertiesMode, 'neither'>
		>;

		const required_for_partial:CoercedSchema['required'] = (
			this.#generate_default_schema_definition_required(
				required_mode,
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

		const unpartial_properties:(
			CoercedSchema['properties']
		) = properties_for_partial as (
			CoercedSchema['properties']
		);

		const partial_required: (
			CoercedSchema['required']
		) = required_for_partial;
		const partial_properties: (
			CoercedSchema['properties']
		) = unpartial_properties;

		const result:CoercedSchema = {
			type: 'object',
			required: partial_required,
			additionalProperties: false,
			properties: partial_properties,
		} as CoercedSchema;

		return Object.freeze(result);
	}

	static #generate_default_schema_definition_required<
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends Exclude<
			object_properties_mode,
			'neither'
		>,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>,
	>(
		required_mode: RequiredMode,
		properties_mode: PropertiesMode,
		$defs: Defs,
		required: Required,
	): object_schema<
		DefsMode,
		RequiredMode,
		PropertiesMode
	>['required'] {
		let required_for_unfrozen_both: object_schema<
			DefsMode,
			RequiredMode,
			'both'
		>['required'];

		if ($defs) {
			if (!required) {
				const sanity_check:object_schema<
					'with',
					'without',
					'both'
				>['required'] = [
					'$defs',
					'type',
					'properties',
					'patternProperties',
				];
				required_for_unfrozen_both = sanity_check as object_schema<
					DefsMode,
					RequiredMode,
					'both'
				>['required'];
			} else {
				const sanity_check:object_schema<
					'with',
					'with',
					'both'
				>['required'] = [
					'$defs',
					'type',
					'required',
					'properties',
					'patternProperties',
				];
				required_for_unfrozen_both = sanity_check as object_schema<
					DefsMode,
					RequiredMode,
					'both'
				>['required'];
			}
		} else {
			if (!required) {
				const sanity_check:object_schema<
					'without',
					'without',
					'both'
				>['required'] = [
					'type',
					'properties',
					'patternProperties',
				];
				required_for_unfrozen_both = sanity_check as object_schema<
					DefsMode,
					RequiredMode,
					'both'
				>['required'];
			} else {
				const sanity_check:object_schema<
					'without',
					'with',
					'both'
				>['required'] = [
					'type',
					'required',
					'properties',
					'patternProperties',
				];
				required_for_unfrozen_both = sanity_check as object_schema<
					DefsMode,
					RequiredMode,
					'both'
				>['required'];
			}
		}

		if ('both' === properties_mode) {
			return required_for_unfrozen_both as object_schema<
				DefsMode,
				RequiredMode,
				PropertiesMode
			>['required'];
		} else if ('properties' === properties_mode) {
			return (required_for_unfrozen_both as string[]).filter(
				(maybe) => 'patternProperties' !== maybe,
			)  as object_schema<
				DefsMode,
				RequiredMode,
				PropertiesMode
			>['required'];
		}

		return (required_for_unfrozen_both as string[]).filter(
			(maybe) => 'properties' !== maybe,
		) as object_schema<
			DefsMode,
			RequiredMode,
			PropertiesMode
		>['required'];
	}

	static #generate_default_type_definition<
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	>(
		properties_mode: PropertiesMode,
		$defs: Defs,
		required: Required,
		properties: Properties,
		patternProperties: PatternProperties,
	): Readonly<object_type<
		DefsMode,
		RequiredMode,
		PropertiesMode,
		Defs,
		Required,
		Properties,
		PatternProperties
	>> {
		if (properties_mode === 'neither') {
			const frozen:Readonly<object_type<
				DefsMode,
				RequiredMode,
				'neither',
				Defs,
				Required,
				Properties,
				PatternProperties
			>> = Object.freeze({
				type: 'object',
			});

			return frozen as Readonly<object_type<
				DefsMode,
				RequiredMode,
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
			DefsMode,
			RequiredMode,
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>);

		return frozen;
	}

	static #is_schema_with_neither<
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
		schema: object_type<
			DefsMode,
			RequiredMode,
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type<
		DefsMode,
		RequiredMode,
		Exclude<PropertiesMode, 'both'|'properties'|'patternProperties'>,
		Defs,
		Required,
		Properties,
		PatternProperties
	> {
		return ! ('properties' in schema) && !('patternProperties' in schema);
	}

	static #is_schema_with_properties<
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
		schema: object_type<
			DefsMode,
			RequiredMode,
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type<
		DefsMode,
		RequiredMode,
		Exclude<
			PropertiesMode,
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
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
		schema: object_type<
			DefsMode,
			RequiredMode,
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type<
		DefsMode,
		RequiredMode,
		Exclude<
			PropertiesMode,
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
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
		schema: object_type<
			DefsMode,
			RequiredMode,
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	): schema is object_type<
		DefsMode,
		'with',
		PropertiesMode,
		Defs,
		Exclude<Required, undefined>,
		Properties,
		PatternProperties
	> {
		return 'required' in schema;
	}

	static #convert<
		T,
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
		value: unknown,
		property: string,
		schema: object_type<
			DefsMode,
			RequiredMode,
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
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	>(
		data: T,
		schema: object_type<
			DefsMode,
			RequiredMode,
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
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	>(
		schema: object_type<
			DefsMode,
			RequiredMode,
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

	static #generate_type<
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	> (
		property: string,
		schema: object_type<
			DefsMode,
			RequiredMode,
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
		DefsMode extends $defs_mode,
		RequiredMode extends required_mode,
		PropertiesMode extends object_properties_mode,
		Defs extends DefsType_by_mode[DefsMode],
		Required extends RequiredType_by_mode<RequiredMode>,
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	>(
		property: string,
		schema: object_type<
			DefsMode,
			RequiredMode,
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
				return schema.patternProperties[matching] as Exclude<
					typeof schema.patternProperties[typeof matching],
					undefined
				>;
			}
		}

		throw new TypeError(`Property "${property}" has no match on the specified schema!`);
	}
}

export class ObjectUnspecified<
	T extends {[key: string]: unknown},
> extends ObjectUncertain<
	T,
	'without',
	'without',
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
				'without',
				'without',
				'neither'
			>,
			object_type<
				'without',
				'without',
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
				required_mode: 'without',
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
	RequiredMode extends required_mode,
	Required extends RequiredType_by_mode<RequiredMode>,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectUncertain<
	T,
	'without',
	RequiredMode,
	PropertiesMode,
	undefined,
	Required,
	Properties,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			required_mode,
			properties_mode,
			required,
			properties,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			required_mode: RequiredMode,
			properties_mode: PropertiesMode,
			required: Required,
			properties: Properties,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'without',
				RequiredMode,
				PropertiesMode
			>,
			object_type<
				'without',
				RequiredMode,
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
				required_mode,
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
	RequiredMode extends required_mode,
	Required extends RequiredType_by_mode<RequiredMode>,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWithout$defs<
	T,
	'both',
	RequiredMode,
	Required,
	Properties,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			required_mode,
			required,
			properties,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			required_mode: RequiredMode,
			required: Required,
			properties: Properties,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'without',
				RequiredMode,
				'both'
			>,
			object_type<
				'without',
				RequiredMode,
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
				required_mode,
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
	RequiredMode extends required_mode,
	Required extends RequiredType_by_mode<RequiredMode>,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWithout$defs<
	T,
	'properties',
	RequiredMode,
	Required,
	Properties,
	ObjectOfSchemas
> {
	constructor(
		{
			adjust_name,
			required_mode,
			required,
			properties,
		}: {
			adjust_name?: adjust_name_callback,
			required_mode: RequiredMode,
			required: Required,
			properties: Properties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'without',
				RequiredMode,
				'properties'
			>,
			object_type<
				'without',
				RequiredMode,
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
				required_mode,
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
	RequiredMode extends required_mode,
	Required extends RequiredType_by_mode<RequiredMode>,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWithout$defs<
	T,
	'pattern',
	RequiredMode,
	Required,
	ObjectOfSchemas,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			required_mode,
			required,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			required_mode: RequiredMode,
			required: Required,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'without',
				RequiredMode,
				'pattern'
			>,
			object_type<
				'without',
				RequiredMode,
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
				required_mode,
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
	Defs extends DefsType_by_mode['with'],
	RequiredMode extends required_mode,
	Required extends RequiredType_by_mode<RequiredMode>,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectUncertain<
	T,
	'with',
	RequiredMode,
	PropertiesMode,
	Defs,
	Required,
	Properties,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			required_mode,
			properties_mode,
			$defs,
			required,
			properties,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			required_mode: RequiredMode,
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
				'with',
				RequiredMode,
				'neither'
			>,
			object_type<
				'with',
				RequiredMode,
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
				required_mode,
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
	Defs extends DefsType_by_mode['with'],
	RequiredMode extends required_mode,
	Required extends RequiredType_by_mode<RequiredMode>,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWith$defs<
	T,
	'both',
	Defs,
	RequiredMode,
	Required,
	Properties,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			$defs,
			required_mode,
			required,
			properties,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			$defs: Defs,
			required_mode: RequiredMode,
			required: Required,
			properties: Properties,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'with',
				RequiredMode,
				'both'
			>,
			object_type<
				'with',
				RequiredMode,
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
				required_mode,
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
	Defs extends DefsType_by_mode['with'],
	RequiredMode extends required_mode,
	Required extends RequiredType_by_mode<RequiredMode>,
	Properties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWith$defs<
	T,
	'properties',
	Defs,
	RequiredMode,
	Required,
	Properties,
	ObjectOfSchemas
> {
	constructor(
		{
			adjust_name,
			$defs,
			required_mode,
			required,
			properties,
		}: {
			adjust_name?: adjust_name_callback,
			$defs: Defs,
			required_mode: RequiredMode,
			required: Required,
			properties: Properties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'with',
				RequiredMode,
				'properties'
			>,
			object_type<
				'with',
				RequiredMode,
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
				required_mode,
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
	Defs extends DefsType_by_mode['with'],
	RequiredMode extends required_mode,
	Required extends RequiredType_by_mode<RequiredMode>,
	PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
> extends ObjectWith$defs<
	T,
	'pattern',
	Defs,
	RequiredMode,
	Required,
	ObjectOfSchemas,
	PatternProperties
> {
	constructor(
		{
			adjust_name,
			$defs,
			required_mode,
			required,
			patternProperties,
		}: {
			adjust_name?: adjust_name_callback,
			$defs: Defs,
			required_mode: RequiredMode,
			required: Required,
			patternProperties: PatternProperties,
		},
		{
			ajv,
		}: ObjectUncertain_options<
			object_schema<
				'with',
				RequiredMode,
				'pattern'
			>,
			object_type<
				'with',
				RequiredMode,
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
				required_mode,
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
