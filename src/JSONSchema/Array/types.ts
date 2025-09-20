import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
	Expression,
} from 'typescript';

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
} from '../types.ts';

import type {
	PositiveInteger,
	PositiveIntegerOrZero,
} from '../../guarded.ts';

export type array_mode = 'both'|'items-only'|'prefix-only';

export type ItemsType_by_mode<
	ArrayMode extends array_mode,
	Items extends SchemaObject = SchemaObject,
> = {
	both: Items,
	'items-only': Items,
	'prefix-only': undefined|false,
}[ArrayMode];

export type unique_items_mode = 'yes'|'no';
export type UniqueItemsType_by_mode<
	Mode extends unique_items_mode,
> = {
	yes: true,
	no: false,
}[Mode];

export type MinItemsType_mode = 'with'|'optional'|'without';
export type MaxItemsType_mode = MinItemsType_mode;

export type MinItemsType = ReturnType<typeof PositiveIntegerOrZero<number>>;
export type MaxItemsType = ReturnType<typeof PositiveInteger<number>>;

export type array_type<
	DefsMode extends $defs_mode,
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
	Defs extends SchemaObject = SchemaObject,
	MinItems extends MinItemsType = MinItemsType,
	MaxItems extends MaxItemsType = MaxItemsType,
	Items extends (
		ItemsType_by_mode<ArrayMode>
	) = ItemsType_by_mode<ArrayMode>,
	PrefixItems extends [
		SchemaObject,
		...SchemaObject[]
	] = [
		SchemaObject,
		...SchemaObject[]
	],
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

export type ArrayUncertain_TypeOptions<
	DefsMode extends $defs_mode,
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
	UniqueItems_mode extends unique_items_mode,
	Defs extends SchemaObject,
	MinItems extends MinItemsType,
	MaxItems extends MaxItemsType,
	Items extends ItemsType_by_mode<ArrayMode>,
	PrefixItems extends [SchemaObject, ...SchemaObject[]],
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

export type ExpressionAtIndexVerifier<
	Data extends unknown[],
	T1 extends Expression,
	Result extends T1[],
	Index extends ReturnType<
		typeof PositiveIntegerOrZero<number>
	> = ReturnType<
		typeof PositiveIntegerOrZero<number>
	>
> = (
	data: Data,
	expression: Expression,
	index: Index,
) => expression is Result[Index];
