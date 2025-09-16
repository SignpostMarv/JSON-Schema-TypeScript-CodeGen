import type {
	TypeNode,
} from 'typescript';

import type {
	ObjectOfSchemas,
} from './Type.ts';

import type {
	$defs_mode,
} from './types.ts';

import {
	ArrayUncertain,
} from './Array/Type.ts';

import type {
	array_mode,
	array_schema,
	array_type,
	ArrayUncertain_options,
	ItemsType_by_mode,
	MinItemsType_by_mode,
	MinItemsType_mode,
	PrefixItemsType_by_mode,
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
	array_mode: ArrayMode,
	items: Items,
	prefixItems: PrefixItems,
};

export class ArrayUnspecified<
	T extends unknown[],
	ArrayMode extends array_mode,
	Items extends ItemsType_by_mode[ArrayMode] = ItemsType_by_mode[ArrayMode],
	PrefixItems extends (
		PrefixItemsType_by_mode[ArrayMode]
	) = (
		PrefixItemsType_by_mode[ArrayMode]
	),
> extends ArrayUncertain<
	T,
	TypeNode,
	[TypeNode, ...TypeNode[]],
	undefined,
	'optional',
	ArrayMode,
	Items,
	PrefixItems
> {
	constructor(
		{
			minItems,
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
			array_schema<undefined, 'optional', ArrayMode>,
			array_type<undefined, 'optional', ArrayMode, Items, PrefixItems>
		>,
	) {
		super(
			{
				$defs: undefined,
				minItems,
				items,
				prefixItems,
				$defs_mode: 'without',
				minItems_mode: 'optional',
				array_mode,
			},
			{
				ajv,
			},
		);
	}
}

export class ArrayWithout$defs<
	T1 extends unknown[],
	T2 extends TypeNode,
	T3 extends [T2, ...T2[]],
	MinItems_mode extends MinItemsType_mode,
	ArrayMode extends array_mode,
	Items extends ItemsType_by_mode[ArrayMode],
	PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
> extends ArrayUncertain<
	T1,
	T2,
	T3,
	undefined,
	MinItems_mode,
	ArrayMode,
	Items,
	PrefixItems
> {
	constructor(
		{
			minItems,
			items,
			prefixItems,
			minItems_mode,
			array_mode,
		}: {
			minItems: MinItemsType_by_mode[MinItems_mode],
			items: Items,
			prefixItems: PrefixItems,
			minItems_mode: MinItems_mode,
			array_mode: ArrayMode,
		},
		{
			ajv,
		}: ArrayUncertain_options<
			array_schema<
				undefined,
				MinItems_mode,
				ArrayMode
			>,
			array_type<undefined, MinItems_mode, ArrayMode, Items, PrefixItems>
		>,
	) {
		super(
			{
				$defs: undefined,
				minItems,
				items,
				prefixItems,
				$defs_mode: 'without',
				minItems_mode,
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
	Defs extends ObjectOfSchemas,
	MinItems_mode extends MinItemsType_mode,
	ArrayMode extends array_mode,
	Items extends ItemsType_by_mode[ArrayMode],
	PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
> extends ArrayUncertain<
	T1,
	T2,
	T3,
	Defs,
	MinItems_mode,
	ArrayMode,
	Items,
	PrefixItems
> {
	constructor(
		{
			$defs,
			minItems,
			items,
			prefixItems,
			minItems_mode,
			array_mode,
		}: {
			$defs: Defs,
			minItems: MinItemsType_by_mode[MinItems_mode],
			items: Items,
			prefixItems: PrefixItems,
			minItems_mode: MinItems_mode,
			array_mode: ArrayMode,
		},
		{
			ajv,
		}: ArrayUncertain_options<
			array_schema<
				Defs,
				MinItems_mode,
				ArrayMode
			>,
			array_type<Defs, MinItems_mode, ArrayMode, Items, PrefixItems>
		>,
	) {
		super(
			{
				$defs,
				minItems,
				items,
				prefixItems,
				$defs_mode: 'with' as $defs_mode<Defs>,
				minItems_mode,
				array_mode,
			},
			{
				ajv,
			},
		);
	}
}
