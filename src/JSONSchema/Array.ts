import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
	ArrayLiteralExpression,
	Expression,
	TypeNode,
} from 'typescript';
import {
	factory,
} from 'typescript';

import type {
	ArrayTypeNode,
	OmitFromTupleish,
	PositiveInteger,
	TupleTypeNode,
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
	DefsType,
} from './types.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

import {
	array_type_node,
	tuple_type_node,
} from '../coercions.ts';

type ItemsType = undefined|SchemaObject;
type PrefixItemsType = undefined|[SchemaObject, ...SchemaObject[]];

type array_mode<
	Items extends ItemsType,
	PrefixItems extends PrefixItemsType,
> = (
	Items extends Exclude<ItemsType, undefined> // items required
		? (
			PrefixItems extends Exclude<
				PrefixItemsType,
				undefined
			>  // prefixItems required
				? 'both'
				: (
					PrefixItems extends Exclude<
						PrefixItemsType,
						[SchemaObject, ...SchemaObject[]]
					>
						? 'items-only' // prefixItems excluded
						: never // prefixItems indeterminate
				)
		)
		: (
			Items extends Exclude<ItemsType, SchemaObject> // items excluded
				? (
					PrefixItems extends Exclude<
						PrefixItemsType,
						undefined
					> // prefixItems required
						? 'prefix-only'
						: 'items-only'
				)
				: never // items indeterminiate
		)
);

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

export type MinItemsMode<
	MinItems extends MinItemsType,
> = (
	MinItems extends Exclude<MinItemsType, PositiveInteger>
		? 'excluded'
		: (
			MinItems extends Exclude<MinItemsType, undefined>
				? 'required'
				: 'optional'
		)
);

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

type array_type<
	Defs extends DefsType,
	MinItems extends MinItemsType,
	Items extends ItemsType,
	PrefixItems extends PrefixItemsType,
> = array_type_structured<
	Defs,
	MinItems,
	Items,
	PrefixItems
>[$defs_mode<Defs>][array_mode<Items, PrefixItems>][MinItemsMode<MinItems>];

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

type array_schema<
	Defs extends DefsType,
	MinItems extends MinItemsType,
	Items extends ItemsType,
	PrefixItems extends PrefixItemsType,
> = array_schema_structured[
	$defs_mode<Defs>
][
	array_mode<Items, PrefixItems>
][
	MinItemsMode<MinItems>
];

type createTypeNode<
	T1 extends TypeNode,
	T2 extends [T1, ...T1[]],
	MinItems extends MinItemsType,
	Items extends ItemsType,
	PrefixItems extends PrefixItemsType,
> = (
	PrefixItems extends Exclude<PrefixItemsType, undefined>
			? TupleTypeNode<T1, T2>
			: (
				MinItems extends Exclude<MinItemsType, undefined>
					? TupleTypeNode<T1, T2>
					: (
						Items extends Exclude<ItemsType, undefined>
							? ArrayTypeNode<T1>
							: never
					)
			)
);

type ArrayUncertain_options<
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

abstract class ArrayUncertain<
	T1 extends unknown[],
	T2 extends TypeNode,
	T3 extends [T2, ...T2[]],
	Defs extends DefsType,
	MinItems extends MinItemsType,
	Items extends ItemsType,
	PrefixItems extends PrefixItemsType,
> extends Type<
	T1,
	array_type<Defs, MinItems, Items, PrefixItems>,
	array_schema<Defs, MinItems, Items, PrefixItems>,
	createTypeNode<T2, T3, MinItems, Items, PrefixItems>,
	ArrayLiteralExpression
> {
	constructor(
		{
			$defs,
			minItems,
			items,
			prefixItems,
			$defs_mode,
			minItems_mode,
			array_mode,
		}: {
			$defs: Defs,
			minItems: MinItems,
			items: Items,
			prefixItems: PrefixItems,
			$defs_mode: $defs_mode<Defs>,
			minItems_mode: MinItemsMode<MinItems>,
			array_mode: array_mode<Items, PrefixItems>,
		},
		{
			ajv,
		}: ArrayUncertain_options<
			array_schema<Defs, MinItems, Items, PrefixItems>,
			array_type<Defs, MinItems, Items, PrefixItems>
		>,
	) {
		super({
			ajv,
			type_definition: ArrayUncertain.#generate_default_type_definition(
				$defs,
				minItems,
				items,
				prefixItems,
			),
			schema_definition: (
				ArrayUncertain.generate_default_schema_definition({
					$defs_mode,
					minItems_mode,
					array_mode,
				})
			),
		});
	}

	generate_typescript_data(
		data: T1,
		schema_parser: SchemaParser,
		schema: array_type<Defs, MinItems, Items, PrefixItems>,
	): ArrayLiteralExpression {
		return factory.createArrayLiteralExpression(
			data.map((value, i) => {
				return ArrayUncertain.#convert(
					value,
					i,
					schema,
					schema_parser,
				);
			}),
			true,
		);
	}

	async generate_typescript_type(
		{
			data,
			schema,
			schema_parser,
		}: {
			data: T1,
			schema: array_type<Defs, MinItems, Items, PrefixItems>,
			schema_parser: SchemaParser,
		},
	): Promise<createTypeNode<T2, T3, MinItems, Items, PrefixItems>> {
		if (ArrayUncertain.#is_prefixItems_type(schema)) {
			return ArrayUncertain.#generate_typescript_type_has_prefixItems(
				data,
				schema,
				schema_parser,
			) as Promise<
				PrefixItems extends Exclude<PrefixItemsType, undefined>
					? TupleTypeNode<T2, T3>
					: never
			>;
		}

		const coerced = schema as array_type<
			Defs,
			MinItems,
			Items,
			undefined
		>;

		if (
			ArrayUncertain.#is_items_type(coerced)
		) {
			return ArrayUncertain.#generate_typescript_type_has_items<
				T1,
				T2,
				T3,
				Defs,
				MinItems,
				Exclude<Items, undefined>
			>(
				data,
				coerced,
				schema_parser,
			) as Promise<createTypeNode<
				T2,
				T3,
				MinItems,
				Exclude<Items, undefined>,
				PrefixItems
			>>;
		}

		throw new TypeError('Unsupported schema found!');
	}

	static generate_default_schema_definition<
		Defs extends DefsType,
		MinItems extends MinItemsType,
		Items extends ItemsType,
		PrefixItems extends PrefixItemsType,
	>(
		{
			$defs_mode,
			array_mode,
			minItems_mode,
		}: {
			$defs_mode: $defs_mode<Defs>,
			array_mode: array_mode<Items, PrefixItems>,
			minItems_mode: MinItemsMode<MinItems>,
		},
	): Readonly<array_schema<Defs, MinItems, Items, PrefixItems>> {

		let partial_required: (typeof partial)['required'];

		if ('with' === $defs_mode) {
			if ('both' === array_mode) {
				if (
					'excluded' === minItems_mode
					|| 'optional' === minItems_mode
				) {
					const sanity_check: array_schema_structured[
						'with'
					][
						'both'
					][
						'excluded' | 'optional'
					]['required'] = [
						'$defs',
						'type',
						'items',
						'prefixItems',
					];
					partial_required = sanity_check;
				} else {
					const sanity_check: array_schema_structured[
						'with'
					][
						'both'
					][
						'required'
					]['required'] = [
						'$defs',
						'type',
						'items',
						'prefixItems',
						'minItems',
					];
					partial_required = sanity_check;
				}
			} else if ('items-only' === array_mode) {
				if (
					'excluded' === minItems_mode
					|| 'optional' === minItems_mode
				) {
					const sanity_check: array_schema_structured[
						'with'
					][
						'items-only'
					][
						'excluded' | 'optional'
					]['required'] = [
						'$defs',
						'type',
						'items',
					];
					partial_required = sanity_check;
				} else {
					const sanity_check: array_schema_structured[
						'with'
					][
						'items-only'
					][
						'required'
					]['required'] = [
						'$defs',
						'type',
						'items',
						'minItems',
					];
					partial_required = sanity_check;
				}
			} else if (
				'excluded' === minItems_mode
				|| 'optional' === minItems_mode
			) {
				const sanity_check: array_schema_structured[
					'with'
				][
					'prefix-only'
				][
					'excluded' | 'optional'
				]['required'] = [
					'$defs',
					'type',
					'prefixItems',
				];
				partial_required = sanity_check;
			} else {
				const sanity_check: array_schema_structured[
					'with'
				][
					'prefix-only'
				][
					'required'
				]['required'] = [
					'$defs',
					'type',
					'prefixItems',
					'minItems',
				];
				partial_required = sanity_check;
			}
		} else {
			if ('both' === array_mode) {
				if (
					'excluded' === minItems_mode
					|| 'optional' === minItems_mode
				) {
					const sanity_check: array_schema_structured[
						'without'
					][
						'both'
					][
						'excluded' | 'optional'
					]['required'] = [
						'type',
						'items',
						'prefixItems',
					];
					partial_required = sanity_check;
				} else {
					const sanity_check: array_schema_structured[
						'without'
					][
						'both'
					][
						'required'
					]['required'] = [
						'type',
						'items',
						'prefixItems',
						'minItems',
					];
					partial_required = sanity_check;
				}
			} else if ('items-only' === array_mode) {
				if (
					'excluded' === minItems_mode
					|| 'optional' === minItems_mode
				) {
					const sanity_check: array_schema_structured[
						'without'
					][
						'items-only'
					][
						'excluded' | 'optional'
					]['required'] = [
						'type',
						'items',
					];
					partial_required = sanity_check;
				} else {
					const sanity_check: array_schema_structured[
						'without'
					][
						'items-only'
					][
						'required'
					]['required'] = [
						'type',
						'items',
						'minItems',
					];
					partial_required = sanity_check;
				}
			} else if (
				'excluded' === minItems_mode
				|| 'optional' === minItems_mode
			) {
				const sanity_check: array_schema_structured[
					'without'
				][
					'prefix-only'
				][
					'excluded' | 'optional'
				]['required'] = [
					'type',
					'prefixItems',
				];
				partial_required = sanity_check;
			} else {
				const sanity_check: array_schema_structured[
					'without'
				][
					'prefix-only'
				][
					'required'
				]['required'] = [
					'type',
					'prefixItems',
					'minItems',
				];
				partial_required = sanity_check;
			}
		}

		const partial: (
			& Pick<
				array_schema<
					Defs,
					MinItems,
					Items,
					PrefixItems
				>,
				(
					| 'type'
					| 'required'
					| 'additionalProperties'
				)
			>
			& {
				properties: (
					& Partial<array_schema_full['properties']>
					& Pick<
						array_schema_full['properties'],
						(
							| 'type'
							| 'items'
						)
					>
				),
			}
		) = {
			type: 'object',
			required: partial_required,
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'array',
				},
				items: {
					type: 'boolean',
					const: false,
				},
			},
		};

		if ('with' === $defs_mode) {
			partial.properties.$defs = {
				type: 'object',
				additionalProperties: {
					type: 'object',
				},
			};
		}

		if (
			'both' === array_mode
			|| 'items-only' === array_mode
		) {
			partial.properties.items = {
				type: 'object',
				minProperties: 1,
			};
		}

		if (
			'both' === array_mode
			|| 'prefix-only' === array_mode
		) {
			partial.properties.prefixItems = {
				type: 'array',
				minItems: 1,
				additionalItems: false,
				items: {
					type: 'object',
					minProperties: 1,
				},
			};
		}

		if (
			'required' === minItems_mode
			|| 'optional' === minItems_mode
		) {
			partial.properties.minItems = {
				type: 'integer',
				minimum: 0,
			};
		}

		return Object.freeze(partial as array_schema<
			Defs,
			MinItems,
			Items,
			PrefixItems
		>);
	}

	static #generate_default_type_definition<
		Defs extends DefsType,
		MinItems extends MinItemsType,
		Items extends ItemsType,
		PrefixItems extends PrefixItemsType,
	>(
		$defs: Defs,
		minItems: MinItems,
		items: Items,
		prefixItems: PrefixItems,
	): Readonly<array_type<Defs, MinItems, Items, PrefixItems>> {
		const partial: (
			& Partial<Omit<
				array_full_type<
					ObjectOfSchemas,
					PositiveInteger,
					SchemaObject,
					[SchemaObject, ...SchemaObject[]]
				>,
				(
					| 'type'
				)
			>>
			& Pick<
				array_full_type<
					ObjectOfSchemas,
					PositiveInteger,
					SchemaObject,
					[SchemaObject, ...SchemaObject[]]
				>,
				(
					| 'type'
				)
			>
		) = {
			type: 'array',
		};

		if ($defs) {
			partial.$defs = $defs;
		}
		if (items) {
			partial.items = items;
		}
		if (prefixItems) {
			partial.prefixItems = prefixItems;
		}
		if (minItems) {
			partial.minItems = minItems;
		}

		return Object.freeze(partial as array_type<
			Defs,
			MinItems,
			Items,
			PrefixItems
		>);
	}

	static #convert<
		Defs extends DefsType,
		MinItems extends MinItemsType,
		Items extends ItemsType,
		PrefixItems extends PrefixItemsType,
		N extends number,
	>(
		value: unknown,
		index: 0|PositiveInteger<N>,
		schema: array_type<Defs, MinItems, Items, PrefixItems>,
		schema_parser: SchemaParser,
	): Expression {
		const sub_schema = this.#sub_schema_for_value(
			index,
			schema,
		);
		const ajv = schema_parser.share_ajv((ajv) => ajv);
		const validator = ajv.compile(sub_schema);

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

	static async #generate_typescript_type_has_items<
		T1 extends unknown[],
		T2 extends TypeNode,
		T3 extends [T2, ...T2[]],
		Defs extends DefsType,
		MinItems extends MinItemsType,
		Items extends Exclude<ItemsType, undefined>,
	> (
		data: T1,
		schema: array_type<Defs, MinItems, Items, undefined>,
		schema_parser: SchemaParser,
	): Promise<
		createTypeNode<T2, T3, MinItems, Items, undefined>
	> {
		if (
			this.#is_minItems_type(schema)
		) {
			return this.#generate_typescript_type_has_items_and_minItems(
				data,
				schema,
				schema_parser,
			) as Promise<createTypeNode<
				T2,
				T3,
				Exclude<MinItems, undefined>,
				Items,
				undefined
			>>;
		}

		return this.#generate_typescript_type_has_items_only<
			T2,
			Defs,
			Exclude<MinItems, PositiveInteger>,
			Items
		>(
			schema,
			schema_parser,
		) as Promise<createTypeNode<
			T2,
			T3,
			Exclude<MinItems, PositiveInteger>,
			Items,
			undefined
		>>;
	}

	static async #generate_typescript_type_has_items_and_minItems<
		T1 extends unknown[],
		T2 extends TypeNode,
		T3 extends [T2, ...T2[]],
		Defs extends DefsType,
		MinItems extends Exclude<MinItemsType, undefined>,
		Items extends Exclude<ItemsType, undefined>,
	> (
		data: T1,
		schema: array_type<Defs, MinItems, Items, undefined> & {
			minItems: MinItems,
		},
		schema_parser: SchemaParser,
	): Promise<TupleTypeNode<T2, T3>> {
		const tuple_members: TypeNode[] = [];
		const sub_type = schema_parser.parse(
			schema.items,
		);

		let i = 0;
		while (tuple_members.length < schema.minItems && i < data.length) {
			tuple_members.push(
				await sub_type.generate_typescript_type({
					data: data[i],
					schema: schema.items,
					schema_parser,
				}),
			);
			++i;
		}

		tuple_members.push(factory.createRestTypeNode(
			await sub_type.generate_typescript_type({
				schema: schema.items,
				schema_parser,
			}),
		));

		return tuple_type_node<T2, T3>(tuple_members as T3);
	}

	static async #generate_typescript_type_has_items_only<
		T2 extends TypeNode,
		Defs extends DefsType,
		MinItems extends Exclude<MinItemsType, PositiveInteger>,
		Items extends Exclude<ItemsType, undefined>,
	> (
		schema: array_type<Defs, MinItems, Items, undefined>,
		schema_parser: SchemaParser,
	): Promise<ArrayTypeNode<T2>> {
		const sub_type = schema_parser.parse(
			schema.items,
		);

		return array_type_node(await sub_type.generate_typescript_type({
			schema: schema.items,
			schema_parser,
		}) as T2);
	}

	static async #generate_typescript_type_has_prefixItems<
		T1 extends unknown[],
		T2 extends TypeNode,
		T3 extends [T2, ...T2[]],
		Defs extends DefsType,
		MinItems extends MinItemsType,
		Items extends ItemsType,
		PrefixItems extends Exclude<PrefixItemsType, undefined>,
	> (
		data: T1,
		schema: array_type<Defs, MinItems, Items, PrefixItems>,
		schema_parser: SchemaParser,
	): Promise<TupleTypeNode<T2, T3>> {
		const tuple_members: TypeNode[] = [];

		let i = 0;
		for (const sub_schema of schema.prefixItems) {
			const sub_data = (i < data.length) ? data[i] : undefined;
			const sub_type = await schema_parser.parse(
				sub_schema,
			).generate_typescript_type({
				data: sub_data,
				schema: sub_schema,
				schema_parser,
			});

			tuple_members.push(sub_type);

			++i;
		}

		if (ArrayUncertain.#is_items_type(schema)) {
			const sub_type = schema_parser.parse(
				schema.items,
			);

			if (ArrayUncertain.#is_minItems_type(schema)) {
				while (tuple_members.length < schema.minItems) {
					tuple_members.push(
						await sub_type.generate_typescript_type({
							schema: schema.items,
							schema_parser,
						}),
					);
				}
			}

			tuple_members.push(factory.createRestTypeNode(
				await sub_type.generate_typescript_type({
					schema: schema.items,
					schema_parser,
				}),
			));
		}

		return tuple_type_node<T2, T3>(tuple_members as T3);
	}

	static #is_items_type<
		Defs extends DefsType,
		MinItems extends MinItemsType,
		Items extends ItemsType,
		PrefixItems extends PrefixItemsType,
	> (
		schema: array_type<Defs, MinItems, Items, PrefixItems>,
	): schema is (
		PrefixItems extends Exclude<PrefixItemsType, undefined>
			? array_type<
				Defs,
				MinItems,
				Exclude<Items, undefined>,
				Exclude<PrefixItems, undefined>
			>
			: (
				PrefixItems extends Exclude<
					PrefixItemsType,
					[SchemaObject, ...SchemaObject[]
				]>
					? array_type<
						Defs,
						MinItems,
						Exclude<Items, undefined>,
						undefined
					>
					: array_type<
						Defs,
						MinItems,
						Exclude<Items, undefined>,
						PrefixItems
					>
			)
	) {
		return 'items' in schema;
	}

	static #is_minItems_type<
		Defs extends DefsType,
		MinItems extends MinItemsType,
		Items extends ItemsType,
		PrefixItems extends PrefixItemsType,
	> (
		schema: array_type<
			Defs,
			MinItems,
			Items,
			PrefixItems
		>,
	): schema is array_type<
		Defs,
		Exclude<MinItems, undefined>,
		Items,
		PrefixItems
	> & {
		minItems: Exclude<MinItems, undefined>
	} {
		return 'minItems' in schema;
	}

	static #is_prefixItems_type<
		Defs extends DefsType,
		MinItems extends MinItemsType,
		Items extends ItemsType,
		PrefixItems extends PrefixItemsType,
	> (
		schema: array_type<Defs, MinItems, Items, PrefixItems>,
	): schema is array_type<
		Defs,
		MinItems,
		Items,
		Exclude<PrefixItems, undefined>
	> {
		return 'prefixItems' in schema;
	}

	static #sub_schema_for_value<
		Defs extends DefsType,
		MinItems extends MinItemsType,
		Items extends ItemsType,
		PrefixItems extends PrefixItemsType,
		N extends number,
	>(
		index: 0|PositiveInteger<N>,
		schema: array_type<Defs, MinItems, Items, PrefixItems>,
	): SchemaObject {
		if (
			this.#is_prefixItems_type(schema)
			&& index < schema.prefixItems.length
		) {
			return schema.prefixItems[index];
		}

		if (this.#is_items_type(schema)) {
			return schema.items;
		}

		throw new TypeError('Invalid schema detected!');
	}
}

export class ArrayUnspecified<
	T extends unknown[],
> extends ArrayUncertain<
	T,
	TypeNode,
	[TypeNode, ...TypeNode[]],
	undefined,
	undefined,
	undefined,
	undefined
> {
	constructor(
		{
			ajv,
		}: ArrayUncertain_options<
			array_schema<undefined, undefined, undefined, undefined>,
			array_type<undefined, undefined, undefined, undefined>
		>,
	) {
		super(
			{
				$defs: undefined,
				minItems: undefined,
				items: undefined,
				prefixItems: undefined,
				$defs_mode: 'without',
				minItems_mode: 'excluded',
				array_mode: 'items-only',
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
	MinItems extends MinItemsType,
	Items extends ItemsType,
	PrefixItems extends PrefixItemsType,
> extends ArrayUncertain<
	T1,
	T2,
	T3,
	undefined,
	MinItems,
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
			minItems: MinItems,
			items: Items,
			prefixItems: PrefixItems,
			minItems_mode: MinItemsMode<MinItems>,
			array_mode: array_mode<Items, PrefixItems>,
		},
		{
			ajv,
		}: ArrayUncertain_options<
			array_schema<undefined, MinItems, Items, PrefixItems>,
			array_type<undefined, MinItems, Items, PrefixItems>
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
	MinItems extends MinItemsType,
	Items extends ItemsType,
	PrefixItems extends PrefixItemsType,
> extends ArrayUncertain<
	T1,
	T2,
	T3,
	Defs,
	MinItems,
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
			minItems: MinItems,
			items: Items,
			prefixItems: PrefixItems,
			minItems_mode: MinItemsMode<MinItems>,
			array_mode: array_mode<Items, PrefixItems>,
		},
		{
			ajv,
		}: ArrayUncertain_options<
			array_schema<Defs, MinItems, Items, PrefixItems>,
			array_type<Defs, MinItems, Items, PrefixItems>
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
