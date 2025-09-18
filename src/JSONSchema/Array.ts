import type {
	TypeNode,
} from 'typescript';

import type {
	DefsType_by_mode,
} from './types.ts';

import {
	ArrayUncertain,
} from './Array/Type.ts';

import type {
	array_mode,
	array_schema,
	array_type_alt,
	ArrayUncertain_options,
	ItemsType_by_mode,
	MaxItemsType_by_mode,
	MaxItemsType_mode,
	MinItemsType_by_mode,
	MinItemsType_mode,
	PrefixItemsType_by_mode,
	unique_items_mode,
} from './Array/types.ts';

export type ArrayUnspecified_options<
	ArrayMode extends array_mode,
	Items extends ItemsType_by_mode[ArrayMode] = ItemsType_by_mode[ArrayMode],
	PrefixItems extends (
		PrefixItemsType_by_mode[ArrayMode]
	) = (
		PrefixItemsType_by_mode[ArrayMode]
	),
> = {
	minItems?: MinItemsType_by_mode['optional'],
	maxItems?: MaxItemsType_by_mode['optional'],
	array_mode: ArrayMode,
	items: Items,
	prefixItems: PrefixItems,
};

export class ArrayWithout$defs<
	T1 extends unknown[],
	T2 extends TypeNode,
	T3 extends [T2, ...T2[]],
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
	UniqueItems_mode extends unique_items_mode,
	MinItems extends MinItemsType_by_mode[MinItems_mode],
	MaxItems extends MaxItemsType_by_mode[MaxItems_mode],
	Items extends ItemsType_by_mode[ArrayMode],
	PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
> extends ArrayUncertain<
	T1,
	T2,
	T3,
	'without',
	ArrayMode,
	MinItems_mode,
	MaxItems_mode,
	UniqueItems_mode,
	undefined,
	MinItems,
	MaxItems,
	Items,
	PrefixItems
> {
	constructor(
		{
			minItems,
			maxItems,
			items,
			prefixItems,
			minItems_mode,
			maxItems_mode,
			array_mode,
		}: {
			minItems: MinItems,
			maxItems: MaxItems,
			items: Items,
			prefixItems: PrefixItems,
			minItems_mode: MinItems_mode,
			maxItems_mode: MaxItems_mode,
			array_mode: ArrayMode,
		},
		{
			ajv,
		}: ArrayUncertain_options<
			array_schema<
				'without',
				MinItems_mode,
				ArrayMode
			>,
			array_type_alt<
				'without',
				ArrayMode,
				MinItems_mode,
				MaxItems_mode,
				UniqueItems_mode,
				undefined,
				MinItems,
				MaxItems,
				Items,
				PrefixItems
			>
		>,
	) {
		super(
			{
				$defs: undefined,
				minItems,
				maxItems,
				items,
				prefixItems,
				$defs_mode: 'without',
				minItems_mode,
				maxItems_mode,
				array_mode,
			},
			{
				ajv,
			},
		);
	}
}

export class ArrayUnspecified<
	T extends unknown[],
	ArrayMode extends array_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
	Items extends ItemsType_by_mode[ArrayMode] = ItemsType_by_mode[ArrayMode],
	PrefixItems extends (
		PrefixItemsType_by_mode[ArrayMode]
	) = (
		PrefixItemsType_by_mode[ArrayMode]
	),
> extends ArrayWithout$defs<
	T,
	TypeNode,
	[TypeNode, ...TypeNode[]],
	ArrayMode,
	'optional',
	'optional',
	UniqueItems_mode,
	MinItemsType_by_mode['optional'],
	MaxItemsType_by_mode['optional'],
	Items,
	PrefixItems
> {
	constructor(
		{
			minItems,
			maxItems,
			array_mode,
			items,
			prefixItems,
		}: ArrayUnspecified_options<
			ArrayMode,
			Items,
			PrefixItems
		>,
		{
			ajv,
		}: ArrayUncertain_options<
			array_schema<'without', 'optional', ArrayMode>,
			array_type_alt<
				'without',
				ArrayMode,
				'optional',
				'optional',
				UniqueItems_mode,
				undefined,
				MinItemsType_by_mode['optional'],
				MaxItemsType_by_mode['optional'],
				Items,
				PrefixItems
			>
		>,
	) {
		super(
			{
				minItems,
				maxItems,
				items,
				prefixItems,
				minItems_mode: 'optional',
				maxItems_mode: 'optional',
				array_mode,
			},
			{
				ajv,
			},
		);
	}
}

export class ArrayWith$defs<
	T1 extends unknown[],
	T2 extends TypeNode,
	T3 extends [T2, ...T2[]],
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
	UniqueItems_mode extends unique_items_mode,
	Defs extends DefsType_by_mode['with'],
	MinItems extends MinItemsType_by_mode[MinItems_mode],
	MaxItems extends MaxItemsType_by_mode[MaxItems_mode],
	Items extends ItemsType_by_mode[ArrayMode],
	PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
> extends ArrayUncertain<
	T1,
	T2,
	T3,
	'with',
	ArrayMode,
	MinItems_mode,
	MaxItems_mode,
	UniqueItems_mode,
	Defs,
	MinItems,
	MaxItems,
	Items,
	PrefixItems
> {
	constructor(
		{
			$defs,
			minItems,
			maxItems,
			items,
			prefixItems,
			minItems_mode,
			maxItems_mode,
			array_mode,
		}: {
			$defs: Defs,
			minItems: MinItemsType_by_mode[MinItems_mode],
			maxItems: MaxItemsType_by_mode[MaxItems_mode],
			items: Items,
			prefixItems: PrefixItems,
			minItems_mode: MinItems_mode,
			maxItems_mode: MaxItems_mode,
			array_mode: ArrayMode,
		},
		{
			ajv,
		}: ArrayUncertain_options<
			array_schema<
				'with',
				MinItems_mode,
				ArrayMode
			>,
			array_type_alt<
				'with',
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
	) {
		super(
			{
				$defs,
				minItems,
				maxItems,
				items,
				prefixItems,
				$defs_mode: 'with',
				minItems_mode,
				maxItems_mode,
				array_mode,
			},
			{
				ajv,
			},
		);
	}
}
