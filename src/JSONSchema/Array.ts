import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	TypeNode,
} from 'typescript';

import type {
	ArrayUncertain_options,
} from './Array/Type.ts';
import {
	ArrayUncertain,
} from './Array/Type.ts';

import type {
	array_mode,
	ArrayUncertain_TypeOptions,
	ItemsType_by_mode,
	MaxItemsType,
	MaxItemsType_mode,
	MinItemsType,
	MinItemsType_mode,
	unique_items_mode,
} from './Array/types.ts';

import type {
	PositiveIntegerOrZero,
} from '../guarded.ts';

import type {
	PartialPick,
} from '../types.ts';

export type ArrayWithout$defs_options<
	T1 extends unknown[],
	T4 extends Expression,
	T5 extends T4[],
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
	UniqueItems_mode extends unique_items_mode,
	MinItems extends MinItemsType,
	MaxItems extends MaxItemsType,
	Items extends ItemsType_by_mode<ArrayMode>,
	PrefixItems extends [SchemaObject, ...SchemaObject[]],
> = Omit<
	ArrayUncertain_options<
		T1,
		T4,
		T5,
		'without',
		ArrayMode,
		MinItems_mode,
		MaxItems_mode,
		UniqueItems_mode,
		SchemaObject,
		MinItems,
		MaxItems,
		Items,
		PrefixItems
	>,
	(
		| '$defs_mode'
	)
>;

export type ArrayWith$defs_options<
	T1 extends unknown[],
	T4 extends Expression,
	T5 extends T4[],
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
	ArrayUncertain_options<
		T1,
		T4,
		T5,
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
	(
		| '$defs_mode'
	)
>;

export type ArrayUnspecified_options<
	ArrayMode extends array_mode,
	UniqueItems_mode extends unique_items_mode,
	Items extends ItemsType_by_mode<ArrayMode>,
	PrefixItems extends [SchemaObject, ...SchemaObject[]],
> = PartialPick<Omit<
	ArrayUncertain_options<
		unknown[],
		Expression,
		Expression[],
		'optional',
		ArrayMode,
		'optional',
		'optional',
		UniqueItems_mode,
		SchemaObject,
		MinItemsType,
		MaxItemsType,
		Items,
		PrefixItems
	>,
	(
		| '$defs_mode'
		| 'minItems_mode'
		| 'maxItems_mode'
	)
>,
	(
		| 'expression_at_index_verifier'
	)
>;

function expression_at_index_verifier_default<
	T extends unknown[],
	Index extends ReturnType<
		typeof PositiveIntegerOrZero<number>
	>,
>(
	data: T,
	expression: Expression,
): expression is (Expression[])[Index] {
	return true;
}

export class ArrayUnspecified<
	T extends unknown[],
	ArrayMode extends array_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
	Items extends ItemsType_by_mode<ArrayMode> = ItemsType_by_mode<ArrayMode>,
	PrefixItems extends [
		SchemaObject,
		...SchemaObject[]
	] = [
		SchemaObject,
		...SchemaObject[]
	],
> extends ArrayUncertain<
	T,
	TypeNode,
	[TypeNode, ...TypeNode[]],
	Expression,
	Expression[],
	'optional',
	ArrayMode,
	'optional',
	'optional',
	UniqueItems_mode,
	SchemaObject,
	MinItemsType,
	MaxItemsType,
	Items,
	PrefixItems
> {
	constructor(
		options: ArrayUnspecified_options<
			ArrayMode,
			UniqueItems_mode,
			Items,
			PrefixItems
		>,
		{
			ajv,
		}: ArrayUncertain_TypeOptions<
				'optional',
				ArrayMode,
				'optional',
				'optional',
				UniqueItems_mode,
				SchemaObject,
				MinItemsType,
				MaxItemsType,
				Items,
				PrefixItems
		>,
	) {
		super(
			{
				...options,
				$defs_mode: 'optional',
				minItems_mode: 'optional',
				maxItems_mode: 'optional',
				expression_at_index_verifier: (
					options?.expression_at_index_verifier
					|| expression_at_index_verifier_default
				),
			},
			{
				ajv,
			},
		);
	}
}
