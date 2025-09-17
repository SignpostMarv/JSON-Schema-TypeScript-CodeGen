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
	'without',
	MinItems_mode,
	ArrayMode,
	undefined,
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
				'without',
				MinItems_mode,
				ArrayMode
			>,
			array_type<'without', MinItems_mode, ArrayMode, Items, PrefixItems>
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

export class ArrayUnspecified<
	T extends unknown[],
	ArrayMode extends array_mode,
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
			array_schema<'without', 'optional', ArrayMode>,
			array_type<'without', 'optional', ArrayMode, Items, PrefixItems>
		>,
	) {
		super(
			{
				minItems,
				items,
				prefixItems,
				minItems_mode: 'optional',
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
	MinItems_mode extends MinItemsType_mode,
	ArrayMode extends array_mode,
	Defs extends DefsType_by_mode['with'],
	Items extends ItemsType_by_mode[ArrayMode],
	PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
> extends ArrayUncertain<
	T1,
	T2,
	T3,
	'with',
	MinItems_mode,
	ArrayMode,
	Defs,
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
				'with',
				MinItems_mode,
				ArrayMode
			>,
			array_type<
				'with',
				MinItems_mode,
				ArrayMode,
				Items,
				PrefixItems,
				Defs
			>
		>,
	) {
		super(
			{
				$defs,
				minItems,
				items,
				prefixItems,
				$defs_mode: 'with',
				minItems_mode,
				array_mode,
			},
			{
				ajv,
			},
		);
	}
}
