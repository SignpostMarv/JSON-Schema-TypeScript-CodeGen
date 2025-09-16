import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
	OmitFromTupleish,
	PositiveInteger,
} from '../../types.ts';

import type {
	ObjectOfSchemas,
	SchemaDefinitionDefinition,
	TypeDefinitionSchema,
	TypeOptions,
} from '../Type.ts';

import type {
	$defs_mode,
	$defs_schema,
	DefsType,
} from '../types.ts';

export type ItemsType = undefined|SchemaObject;
export type PrefixItemsType = undefined|[SchemaObject, ...SchemaObject[]];

export type array_mode = 'both'|'items-only'|'prefix-only';

export type ItemsType_by_mode<
	T extends SchemaObject = SchemaObject,
> = {
	both: T,
	'items-only': T,
	'prefix-only': undefined,
};

export type PrefixItemsType_by_mode<
	T extends [
		SchemaObject,
		...SchemaObject[]
	] = [
		SchemaObject,
		...SchemaObject[]
	],
> = {
	both: T,
	'items-only': undefined,
	'prefix-only': T,
};

type array_full_type<
	Defs extends ObjectOfSchemas,
	MinItems extends PositiveInteger,
	Items extends SchemaObject,
	PrefixItems extends [SchemaObject, ...SchemaObject[]],
> = {
	$defs: Defs,
	type: 'array',
	items: Items,
	prefixItems: PrefixItems,
	minItems: MinItems,
};

export type MinItemsType<
	N extends Exclude<number, 0> = Exclude<number, 0>,
> = undefined|PositiveInteger<N>;

export type MinItemsType_by_mode = {
	required: PositiveInteger,
	optional: undefined|PositiveInteger,
	excluded: undefined,
};

export type MinItemsType_mode = 'required'|'optional'|'excluded';

type array_type_structured<
	Defs extends DefsType,
	MinItems extends MinItemsType,
	Items extends ItemsType,
	PrefixItems extends PrefixItemsType,
> = {
	with: {
		both: {
			excluded: Omit<
				array_full_type<
					Exclude<Defs, undefined>,
					PositiveInteger,
					Exclude<Items, undefined>,
					Exclude<PrefixItems, undefined>
				>,
				'minItems'
			>,
			required: array_full_type<
				Exclude<Defs, undefined>,
				Exclude<MinItems, undefined>,
				Exclude<Items, undefined>,
				Exclude<PrefixItems, undefined>
			>,
			optional: (
				& array_type_structured<
					Exclude<Defs, undefined>,
					undefined,
					Exclude<Items, undefined>,
					Exclude<PrefixItems, undefined>
				>['with']['both']['excluded']
				& Partial<Pick<
					array_type_structured<
						Exclude<Defs, undefined>,
						Exclude<MinItems, undefined>,
						Exclude<Items, undefined>,
						Exclude<PrefixItems, undefined>
					>['with']['both']['required'],
					'minItems'
				>>
			),
		},
		'items-only': {
			excluded: Omit<
				array_type_structured<
					Exclude<Defs, undefined>,
					PositiveInteger,
					Exclude<Items, undefined>,
					[SchemaObject, ...SchemaObject[]]
				>['with']['both']['excluded'],
				'prefixItems'
			>,
			required: Omit<
				array_type_structured<
					Exclude<Defs, undefined>,
					Exclude<MinItems, undefined>,
					Exclude<Items, undefined>,
					[SchemaObject, ...SchemaObject[]]
				>['with']['both']['required'],
				'prefixItems'
			>,
			optional: Omit<
				array_type_structured<
					Exclude<Defs, undefined>,
					MinItems,
					Exclude<Items, undefined>,
					[SchemaObject, ...SchemaObject[]]
				>['with']['both']['optional'],
				'prefixItems'
			>,
		},
		'prefix-only': {
			excluded: Omit<
				array_type_structured<
					Exclude<Defs, undefined>,
					PositiveInteger,
					SchemaObject,
					Exclude<PrefixItems, undefined>
				>['with']['both']['excluded'],
				'items'
			>,
			required: Omit<
				array_type_structured<
					Exclude<Defs, undefined>,
					Exclude<MinItems, undefined>,
					SchemaObject,
					Exclude<PrefixItems, undefined>
				>['with']['both']['required'],
				'items'
			>,
			optional: Omit<
				array_type_structured<
					Exclude<Defs, undefined>,
					MinItems,
					SchemaObject,
					Exclude<PrefixItems, undefined>
				>['with']['both']['optional'],
				'items'
			>,
		},
	},
	without: {
		both: {
			excluded: Omit<
				array_type_structured<
					ObjectOfSchemas,
					undefined,
					Exclude<Items, undefined>,
					Exclude<PrefixItems, undefined>
				>['with']['both']['excluded'],
				'$defs'
			>,
			required: Omit<
				array_type_structured<
					ObjectOfSchemas,
					Exclude<MinItems, undefined>,
					Exclude<Items, undefined>,
					Exclude<PrefixItems, undefined>
				>['with']['both']['required'],
				'$defs'
			>,
			optional: Omit<
				array_type_structured<
					ObjectOfSchemas,
					MinItems,
					Exclude<Items, undefined>,
					Exclude<PrefixItems, undefined>
				>['with']['both']['optional'],
				'$defs'
			>,
		},
		'items-only': {
			excluded: Omit<
				array_type_structured<
					SchemaObject,
					undefined,
					Exclude<Items, undefined>,
					undefined
				>['with']['items-only']['excluded'],
				'$defs'
			>,
			required: Omit<
				array_type_structured<
					SchemaObject,
					Exclude<MinItems, undefined>,
					Exclude<Items, undefined>,
					undefined
				>['with']['items-only']['excluded'],
				'$defs'
			>,
			optional: Omit<
				array_type_structured<
					SchemaObject,
					MinItems,
					Exclude<Items, undefined>,
					undefined
				>['with']['items-only']['excluded'],
				'$defs'
			>,
		},
		'prefix-only': {
			excluded: Omit<
				array_type_structured<
					SchemaObject,
					undefined,
					undefined,
					Exclude<PrefixItems, undefined>
				>['with']['prefix-only']['excluded'],
				'$defs'
			>,
			required: Omit<
				array_type_structured<
					SchemaObject,
					Exclude<MinItems, undefined>,
					undefined,
					Exclude<PrefixItems, undefined>
				>['with']['prefix-only']['excluded'],
				'$defs'
			>,
			optional: Omit<
				array_type_structured<
					SchemaObject,
					MinItems,
					undefined,
					Exclude<PrefixItems, undefined>
				>['with']['prefix-only']['excluded'],
				'$defs'
			>,
		},
	},
};

export type array_type<
	Defs extends DefsType,
	MinItemsMode extends MinItemsType_mode,
	ArrayMode extends array_mode,
	Items extends ItemsType_by_mode[ArrayMode] = ItemsType_by_mode[ArrayMode],
	PrefixItems extends (
		PrefixItemsType_by_mode[ArrayMode]
	) = (
		PrefixItemsType_by_mode[ArrayMode]
	),
> = array_type_structured<
	Defs,
	MinItemsType_by_mode[MinItemsMode],
	Items,
	PrefixItems
>[$defs_mode<Defs>][ArrayMode][MinItemsMode];

type array_schema_full = SchemaDefinitionDefinition<
	['$defs', 'type', 'items', 'prefixItems', 'minItems'],
	{
		$defs: $defs_schema['$defs'],
		type: {
			type: 'string',
			const: 'array',
		},
		items: (
			| {
				type: 'object',
				minProperties: 1,
			}
			| {
				type: 'boolean',
				const: false,
			}
		),
		prefixItems: {
			type: 'array',
			minItems: 1,
			additionalItems: false,
			items: (
				& {
					type: 'object',
					minProperties: 1,
				}
			),
		},
		minItems: {
			type: 'integer',
			minimum: 0,
		},
	}
>;

type array_schema_structured = {
	with: {
		both: {
			excluded: SchemaDefinitionDefinition<
				OmitFromTupleish<array_schema_full['required'], 'minItems'>,
				Omit<array_schema_full['properties'], 'minItems'>
			>,
			required: array_schema_full,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<array_schema_full['required'], 'minItems'>,
				array_schema_full['properties']
			>
		},
		'items-only': {
			excluded: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['both']['excluded']['required']
					),
					'prefixItems'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['both']['excluded']['properties']
					),
					'prefixItems'
				>
			>,
			required: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['both']['required']['required']
					),
					'prefixItems'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['both']['required']['properties']
					),
					'prefixItems'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['both']['optional']['required']
					),
					'prefixItems'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['both']['optional']['properties']
					),
					'prefixItems'
				>
			>,
		},
		'prefix-only': {
			excluded: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['both']['excluded']['required']
					),
					'items'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['both']['excluded']['properties']
					),
					'items'
				>
			>,
			required: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['both']['required']['required']
					),
					'items'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['both']['required']['properties']
					),
					'items'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['both']['optional']['required']
					),
					'items'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['both']['optional']['properties']
					),
					'items'
				>
			>,
		},
	},
	without: {
		both: {
			excluded: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['both']['excluded']['required']
					),
					'$defs'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['both']['excluded']['properties']
					),
					'$defs'
				>
			>,
			required: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['both']['required']['required']
					),
					'$defs'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['both']['required']['properties']
					),
					'$defs'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['both']['optional']['required']
					),
					'$defs'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['both']['optional']['properties']
					),
					'$defs'
				>
			>,
		}
		'items-only': {
			excluded: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['items-only']['excluded']['required']
					),
					'$defs'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['items-only']['excluded']['properties']
					),
					'$defs'
				>
			>,
			required: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['items-only']['required']['required']
					),
					'$defs'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['items-only']['required']['properties']
					),
					'$defs'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['items-only']['optional']['required']
					),
					'$defs'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['items-only']['optional']['properties']
					),
					'$defs'
				>
			>,
		},
		'prefix-only': {
			excluded: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['prefix-only']['excluded']['required']
					),
					'$defs'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['prefix-only']['excluded']['properties']
					),
					'$defs'
				>
			>,
			required: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['prefix-only']['required']['required']
					),
					'$defs'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['prefix-only']['required']['properties']
					),
					'$defs'
				>
			>,
			optional: SchemaDefinitionDefinition<
				OmitFromTupleish<
					(
						array_schema_structured[
							'with'
						]['prefix-only']['optional']['required']
					),
					'$defs'
				>,
				Omit<
					(
						array_schema_structured[
							'with'
						]['prefix-only']['optional']['properties']
					),
					'$defs'
				>
			>,
		},
	}
}

export type array_schema<
	Defs extends DefsType,
	MinItems_mode extends MinItemsType_mode,
	ArrayMode extends array_mode,
> = array_schema_structured[
	$defs_mode<Defs>
][
	ArrayMode
][
	MinItems_mode
];

export type ArrayUncertain_options<
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
