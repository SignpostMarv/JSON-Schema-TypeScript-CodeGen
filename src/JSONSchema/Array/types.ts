import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
	OmitFromTupleishIf,
	OmitIf,
} from '../../types.ts';

import type {
	SchemaDefinitionDefinition,
	TypeOptions,
} from '../Type.ts';

import type {
	$defs_mode,
	$defs_schema,
	DefsType_by_mode,
} from '../types.ts';

import type {
	PositiveInteger,
	PositiveIntegerOrZero,
} from '../../guarded.ts';

export type array_mode = 'both'|'items-only'|'prefix-only';

export type ItemsType_by_mode<
	T extends SchemaObject = SchemaObject,
> = {
	both: T,
	'items-only': T,
	'prefix-only': undefined|false,
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

export type unique_items_mode = 'yes'|'no';
export type UniqueItemsType_by_mode<
	Mode extends unique_items_mode,
> = {
	yes: true,
	no: false,
}[Mode];

export type MinItemsType_by_mode = {
	with: ReturnType<typeof PositiveIntegerOrZero<number>>,
	optional: undefined|ReturnType<typeof PositiveIntegerOrZero<number>>,
	without: undefined,
};

export type MaxItemsType_by_mode = {
	with: ReturnType<typeof PositiveInteger<number>>,
	optional: undefined|ReturnType<typeof PositiveInteger<number>>,
	without: undefined,
};

export type MinItemsType_mode = 'with'|'optional'|'without';
export type MaxItemsType_mode = MinItemsType_mode;

export type array_type<
	DefsMode extends $defs_mode,
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
	Defs extends (
		DefsType_by_mode[DefsMode]
	) = DefsType_by_mode[DefsMode],
	MinItems extends (
		MinItemsType_by_mode[MinItems_mode]
	) = MinItemsType_by_mode[MinItems_mode],
	MaxItems extends (
		MaxItemsType_by_mode[MaxItems_mode]
	) = MaxItemsType_by_mode[MaxItems_mode],
	Items extends (
		ItemsType_by_mode[ArrayMode]
	) = ItemsType_by_mode[ArrayMode],
	PrefixItems extends (
		PrefixItemsType_by_mode[ArrayMode]
	) = PrefixItemsType_by_mode[ArrayMode],
> = (
	& OmitIf<
		{
			$defs: Defs,
		},
		'$defs',
		DefsMode
	>
	& {
		type: 'array',
	}
	& OmitIf<
		{
			minItems: MinItems,
		},
		'minItems',
		MinItems_mode
	>
	& OmitIf<
		{
			maxItems: MaxItems,
		},
		'maxItems',
		MaxItems_mode
	>
	& {
		yes: {
			uniqueItems: UniqueItemsType_by_mode<'yes'>,
		},
		no: {
			uniqueItems?: UniqueItemsType_by_mode<'no'>,
		},
	}[UniqueItems_mode]
	& {
		both: {
			items: Exclude<Items, false>,
			prefixItems: PrefixItems,
		},
		'items-only': {
			items: Exclude<Items, false>,
		},
		'prefix-only': {
			items?: false,
			prefixItems: PrefixItems,
		},
	}[ArrayMode]
);

export type array_schema<
	DefsMode extends $defs_mode,
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
> = SchemaDefinitionDefinition<
	OmitFromTupleishIf<
		OmitFromTupleishIf<
			OmitFromTupleishIf<
				OmitFromTupleishIf<
					OmitFromTupleishIf<
						[
							'$defs',
							'type',
							'items',
							'prefixItems',
							'minItems',
							'maxItems',
							'uniqueItems'
						],
						'$defs',
						DefsMode
					>,
					'minItems',
					MinItemsType_mode
				>,
				'maxItems',
				MaxItemsType_mode
			>,
			'items',
			{
				both: 'with',
				'items-only': 'with',
				'prefix-only': 'with',
			}[ArrayMode] // yes, this is effectively a no-op
		>,
		'prefixItems',
		{
			both: 'with',
			'items-only': 'without',
			'prefix-only': 'with',
		}[ArrayMode]
	>,
	(
		& OmitIf<
			$defs_schema,
			'$defs',
			DefsMode
		>
		& {
			type: {
				type: 'string',
				const: 'array',
			},
			uniqueItems: {
				type: 'boolean',
				const: UniqueItemsType_by_mode<UniqueItems_mode>,
			}
		}
		& OmitIf<
			{
				minItems: {
					type: 'integer',
					minimum: 0,
				},
			},
			'minItems',
			MinItems_mode
		>
		& OmitIf<
			{
				maxItems: {
					type: 'integer',
					minimum: 1,
				},
			},
			'maxItems',
			MaxItems_mode
		>
		& {
			both: {
				items: {
					type: 'object',
					minProperties: 1,
				},
				prefixItems: {
					type: 'array',
					minItems: 1,
					items: (
						& {
							type: 'object',
							minProperties: 1,
						}
					),
				},
			},
			'items-only': {
				items: {
					type: 'object',
					minProperties: 1,
				},
			},
			'prefix-only': {
				items?: {
					type: 'boolean',
					const: false
				},
				prefixItems: {
					type: 'array',
					minItems: 1,
					items: (
						& {
							type: 'object',
							minProperties: 1,
						}
					),
				},
			},
		}[ArrayMode]
	)
>;

export type ArrayUncertain_options<
	DefsMode extends $defs_mode,
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
	UniqueItems_mode extends unique_items_mode,
	Defs extends DefsType_by_mode[DefsMode],
	MinItems extends MinItemsType_by_mode[MinItems_mode],
	MaxItems extends MaxItemsType_by_mode[MaxItems_mode],
	Items extends ItemsType_by_mode[ArrayMode],
	PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
> = Omit<
	TypeOptions<
		array_schema<
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode
		>,
		array_type<
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode,
			Defs,
			MinItems,
			MaxItems,
			Items,
			PrefixItems
		>
	>,
	(
		| 'schema_definition'
		| 'type_definition'
	)
>;
