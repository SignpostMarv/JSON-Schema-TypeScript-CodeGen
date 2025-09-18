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
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
> = {
	minItems?: MinItemsType_by_mode['optional'],
	maxItems?: MaxItemsType_by_mode['optional'],
	array_mode: ArrayMode,
	items: Items,
	prefixItems: PrefixItems,
	uniqueItems_mode: UniqueItems_mode,
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
			array_mode,
			minItems_mode,
			maxItems_mode,
			uniqueItems_mode,
			minItems,
			maxItems,
			items,
			prefixItems,
		}: {
			array_mode: ArrayMode,
			minItems_mode: MinItems_mode,
			maxItems_mode: MaxItems_mode,
			uniqueItems_mode: UniqueItems_mode,
			minItems: MinItems,
			maxItems: MaxItems,
			items: Items,
			prefixItems: PrefixItems,
		},
		{
			ajv,
		}: ArrayUncertain_options<
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
		>,
	) {
		super(
			{
				$defs_mode: 'without',
				array_mode,
				minItems_mode,
				maxItems_mode,
				uniqueItems_mode,
				$defs: undefined,
				minItems,
				maxItems,
				items,
				prefixItems,
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
			uniqueItems_mode,
		}: ArrayUnspecified_options<
			ArrayMode,
			Items,
			PrefixItems,
			UniqueItems_mode
		>,
		{
			ajv,
		}: ArrayUncertain_options<
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
				uniqueItems_mode,
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
			uniqueItems_mode,
		}: {
			$defs: Defs,
			minItems: MinItems,
			maxItems: MaxItems,
			items: Items,
			prefixItems: PrefixItems,
			minItems_mode: MinItems_mode,
			maxItems_mode: MaxItems_mode,
			array_mode: ArrayMode,
			uniqueItems_mode: UniqueItems_mode,
		},
		{
			ajv,
		}: ArrayUncertain_options<
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
		>,
	) {
		super(
			{
				$defs_mode: 'with',
				array_mode,
				minItems_mode,
				maxItems_mode,
				uniqueItems_mode,
				$defs,
				minItems,
				maxItems,
				items,
				prefixItems,
			},
			{
				ajv,
			},
		);
	}
}
