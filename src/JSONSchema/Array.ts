import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	TypeNode,
} from 'typescript';
import {
	factory,
} from 'typescript';

import type {
	SchemaDefinitionDefinition,
	TypeOptions,
} from './Type.ts';
import {
	Type,
} from './Type.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

import type {
	PositiveInteger,
} from '../guarded.ts';
import {
	PositiveIntegerOrZero,
} from '../guarded.ts';

import {
	array_literal_expression,
	array_type_node,
	tuple_type_node,
} from '../coercions.ts';

import type {
	ArrayLiteralExpression,
	ArrayTypeNode,
	OmitFromTupleishIf,
	OmitIf,
	PartialPick,
	TupleTypeNode,
} from '../types.ts';

import type {
	$defs_mode,
	$defs_schema,
} from './types.ts';

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

type base_required = [
							'$defs',
							'type',
							'items',
							'prefixItems',
							'minItems',
							'maxItems',
							'uniqueItems'
];

type if_DefsMode<
	DefsMode extends $defs_mode,
> = OmitFromTupleishIf<
	base_required,
						'$defs',
						DefsMode
>;

type if_MinItemsType_mode<
	DefsMode extends $defs_mode,
	MinItems_mode extends MinItemsType_mode,
> = OmitFromTupleishIf<
	if_DefsMode<DefsMode>,
					'minItems',
					MinItems_mode
>;

type if_MaxItemsType_mode<
	DefsMode extends $defs_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
> = OmitFromTupleishIf<
	if_MinItemsType_mode<
		DefsMode,
		MinItems_mode
	>,
				'maxItems',
				MaxItems_mode
>;

type ArrayMode_handler<
	DefsMode extends $defs_mode,
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
> = OmitFromTupleishIf<
		OmitFromTupleishIf<
			if_MaxItemsType_mode<
				DefsMode,
				MinItems_mode,
				MaxItems_mode
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
>;

type array_schema_required<
	DefsMode extends $defs_mode,
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
> = OmitFromTupleishIf<
	ArrayMode_handler<
		DefsMode,
		ArrayMode,
		MinItems_mode,
		MaxItems_mode
	>,
	'uniqueItems',
	{
		yes: 'with',
		no: 'without',
	}[UniqueItems_mode]
>;

export type array_schema<
	DefsMode extends $defs_mode,
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
> = SchemaDefinitionDefinition<
	array_schema_required<
		DefsMode,
		ArrayMode,
		MinItems_mode,
		MaxItems_mode
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
		}
		& {
			yes: {
			uniqueItems: {
				type: 'boolean',
					const: true,
				},
			},
			no: {
				uniqueItems?: {
					type: 'boolean',
					const: false,
				},
			},
		}[UniqueItems_mode]
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
type createTypeNode<
	T1 extends TypeNode,
	T2 extends [T1, ...T1[]],
	MinItems_mode extends MinItemsType_mode,
	ArrayMode extends array_mode,
> = {
	both: {
		with: TupleTypeNode<T1, T2>,
		optional: TupleTypeNode<T1, T2>,
		without: TupleTypeNode<T1, T2>,
	},
	'items-only': {
		with: TupleTypeNode<T1, T2>,
		optional: ArrayTypeNode<T1>|TupleTypeNode<T1, T2>,
		without: ArrayTypeNode<T1>,
	},
	'prefix-only': {
		with: TupleTypeNode<T1, T2>,
		optional: TupleTypeNode<T1, T2>,
		without: TupleTypeNode<T1, T2>,
	},
}[ArrayMode][MinItems_mode];

export type ArrayUncertain_options<
	T1 extends unknown[],
	T4 extends Expression,
	T5 extends T4[],
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
> = (
	& {
		$defs_mode: DefsMode,
		array_mode: ArrayMode,
		minItems_mode: MinItems_mode,
		maxItems_mode: MaxItems_mode,
		uniqueItems_mode: UniqueItems_mode,
		$defs?: Defs,
		minItems?: MinItems,
		maxItems?: MaxItems,
		items: Items,
		prefixItems?: PrefixItems,
		expression_at_index_verifier: ExpressionAtIndexVerifier<T1, T4, T5>,
	}
);

export abstract class ArrayUncertain<
	T1 extends unknown[],
	T2 extends TypeNode,
	T3 extends [T2, ...T2[]],
	T4 extends Expression,
	T5 extends T4[],
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
> extends Type<
	T1,
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
	>,
	array_schema<
		DefsMode,
		ArrayMode,
		MinItems_mode,
		MaxItems_mode,
		UniqueItems_mode
	>,
	createTypeNode<T2, T3, MinItems_mode, ArrayMode>,
	ArrayLiteralExpression<T4, T5, true>
> {
	#expression_at_index_verifier: ExpressionAtIndexVerifier<T1, T4, T5>;

	constructor(
		options: ArrayUncertain_options<
			T1,
			T4,
			T5,
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
		>,
		{
			ajv,
		}: ArrayUncertain_TypeOptions<
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
		>,
	) {
		super({
			ajv,
			type_definition: ArrayUncertain.#generate_default_type_definition(
				options,
			),
			schema_definition: (
				ArrayUncertain.generate_default_schema_definition(
					options,
				)
			),
		});
		this.#expression_at_index_verifier = (
			options.expression_at_index_verifier
		);
	}

	generate_typescript_data(
		data: T1,
		schema_parser: SchemaParser,
		schema: array_type<
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
		>,
	): ArrayLiteralExpression<T4, T5, true> {
		return array_literal_expression(
			data.map((value, i): T4 => {
				const index = PositiveIntegerOrZero(i);
				const element = ArrayUncertain.#convert(
					value,
					index,
					schema,
					schema_parser,
				);

				if (!(this.#expression_at_index_verifier(
					data,
					element,
					index,
				))) {
					throw new TypeError(
						`Element at index ${
							index
						} was not of expected type!`,
					);
				}

				return element;
			}) as T5,
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
			schema: array_type<
				DefsMode,
				ArrayMode,
				MinItems_mode,
				MaxItems_mode,
				UniqueItems_mode,
				Defs,
				MinItems,
				MaxItems
			>,
			schema_parser: SchemaParser,
		},
	): Promise<createTypeNode<
		T2,
		T3,
		MinItems_mode,
		ArrayMode
	>> {
		if (ArrayUncertain.#is_prefixItems_type(schema)) {
			return ArrayUncertain.#generate_typescript_type_has_prefixItems(
				data,
				schema,
				schema_parser,
			);
		}

		if (
			ArrayUncertain.#is_items_type(schema)
		) {
			return ArrayUncertain.#generate_typescript_type_has_items(
				data,
				schema,
				schema_parser,
			);
		}

		throw new TypeError('Unsupported schema found!');
	}

	static generate_default_schema_definition<
		DefsMode extends $defs_mode,
		ArrayMode extends array_mode,
		MinItems_mode extends MinItemsType_mode,
		MaxItems_mode extends MaxItemsType_mode,
		UniqueItems_mode extends unique_items_mode,
	>(
		{
			$defs_mode,
			array_mode,
			minItems_mode,
			maxItems_mode,
			uniqueItems_mode,
		}: {
			$defs_mode: DefsMode,
			array_mode: ArrayMode,
			minItems_mode: MinItems_mode,
			maxItems_mode: MaxItems_mode,
			uniqueItems_mode: UniqueItems_mode,
		},
	): Readonly<array_schema<
		DefsMode,
		ArrayMode,
		MinItems_mode,
		MaxItems_mode,
		UniqueItems_mode
	>> {
		const full_required: [
			'$defs',
			'type',
			'items',
			'prefixItems',
			'minItems',
			'maxItems',
			'uniqueItems',
		] = [
			'$defs',
			'type',
			'items',
			'prefixItems',
			'minItems',
			'maxItems',
			'uniqueItems',
		];
		const partial_required: array_schema<
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode
		>['required'] = full_required.filter((maybe) => {
			if (
				('$defs' === maybe && 'with' !== $defs_mode)
				|| ('prefixItems' === maybe && 'items-only' === array_mode)
				|| ('minItems' === maybe && 'with' !== minItems_mode)
				|| ('maxItems' === maybe && 'with' !== maxItems_mode)
				|| ('uniqueItems' === maybe && 'yes' !== uniqueItems_mode)
			) {
				return false;
			}

			return true;
		}) as array_schema<
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode
		>['required'];

		const partial: (
			& Pick<
				array_schema<
					DefsMode,
					ArrayMode,
					MinItems_mode,
					MaxItems_mode,
					UniqueItems_mode
				>,
				(
					| 'type'
					| 'required'
					| 'additionalProperties'
				)
			>
			& {
				properties: (
					& Partial<array_schema<
						'with',
						'both'|'prefix-only',
						'with',
						'with',
						'yes'
					>['properties']>
					& Pick<
						array_schema<
							'with',
							'both'|'prefix-only',
							'with',
							'with',
							'yes'
						>['properties'],
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
				uniqueItems: {
					type: 'boolean',
					const: true,
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
				items: {
					type: 'object',
					minProperties: 1,
				},
			};
		}

		if (
			'with' === minItems_mode
			|| 'optional' === minItems_mode
		) {
			partial.properties.minItems = {
				type: 'integer',
				minimum: 0,
			};
		}

		if (
			'with' === maxItems_mode
			|| 'optional' === maxItems_mode
		) {
			partial.properties.maxItems = {
				type: 'integer',
				minimum: 1,
			};
		}

		if ('no' === uniqueItems_mode) {
			delete partial.properties.uniqueItems;
		}

		return Object.freeze(partial as array_schema<
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode
		>);
	}

	static #generate_default_type_definition<
		T1 extends unknown[],
		T4 extends Expression,
		T5 extends T4[],
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
	>({
		minItems = undefined,
		maxItems = undefined,
		items,
		uniqueItems_mode,
		$defs,
		prefixItems = undefined,
	}: ArrayUncertain_options<
		T1,
		T4,
		T5,
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
	>): Readonly<array_type<
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
	>> {
		const partial: (
			& (
				| Partial<Omit<
					array_type<
						'with',
						'both'|'prefix-only',
						'with',
						'with',
						unique_items_mode
					>,
					(
						| 'type'
					)
				>>
			)
			& Pick<
				array_type<
					'with',
					'both',
					'with',
					'with',
					unique_items_mode
				>,
				(
					| 'type'
					| 'uniqueItems'
				)
			>
		) = {
			type: 'array',
			uniqueItems: 'yes' === uniqueItems_mode,
		};

		if ($defs) {
			partial.$defs = $defs;
		}
		if (undefined !== items) {
			partial.items = items;
		}
		if (prefixItems) {
			partial.prefixItems = prefixItems;
		}
		if (undefined !== minItems) {
			partial.minItems = minItems;
		}
		if (maxItems) {
			partial.maxItems = maxItems;
		}

		return Object.freeze(partial as array_type<
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
		>);
	}

	static #convert<
		DefsMode extends $defs_mode,
		ArrayMode extends array_mode,
		MinItems_mode extends MinItemsType_mode,
		MaxItems_mode extends MaxItemsType_mode,
		UniqueItems_mode extends unique_items_mode,
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
		N extends number = number,
	>(
		value: unknown,
		index: ReturnType<typeof PositiveIntegerOrZero<N>>,
		schema: array_type<
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
		>,
		schema_parser: SchemaParser,
	): Expression {
		const sub_schema = this.#sub_schema_for_value(
			index,
			schema,
		);
		const ajv = schema_parser.share_ajv((ajv) => ajv);
		const validator = ajv.compile(sub_schema);

		if (!(validator(value))) {
			throw new TypeError('Supplied value not supported by index!');
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
		DefsMode extends $defs_mode,
		ArrayMode extends Exclude<array_mode, 'prefix-only'>,
		MinItems_mode extends MinItemsType_mode,
		MaxItems_mode extends MaxItemsType_mode,
		UniqueItems_mode extends unique_items_mode,
		Defs extends SchemaObject = SchemaObject,
		MinItems extends MinItemsType = MinItemsType,
		MaxItems extends MaxItemsType = MaxItemsType,
		Items extends (
			Exclude<ItemsType_by_mode<ArrayMode>, false>
		) = Exclude<ItemsType_by_mode<ArrayMode>, false>,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[]
		] = [
			SchemaObject,
			...SchemaObject[]
		],
	> (
		data: T1,
		schema: array_type<
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
		>,
		schema_parser: SchemaParser,
	): Promise<
		createTypeNode<
			T2,
			T3,
			MinItems_mode,
			ArrayMode
		>
	> {
		if (
			this.#is_minItems_required_type(schema)
		) {
			return this.#generate_typescript_type_has_items_and_minItems(
				data,
				schema as array_type<
					DefsMode,
					ArrayMode,
					'with',
					MaxItems_mode,
					UniqueItems_mode,
					Defs,
					MinItems,
					MaxItems,
					Items,
					PrefixItems
				>,
				schema_parser,
			);
		}

		return this.#generate_typescript_type_has_items_only(
			schema,
			schema_parser,
		) as Promise<
			createTypeNode<
				T2,
				T3,
				MinItems_mode,
				ArrayMode
			>
		>;
	}

	static async #generate_typescript_type_has_items_and_minItems<
		T1 extends unknown[],
		T2 extends TypeNode,
		T3 extends [T2, ...T2[]],
		DefsMode extends $defs_mode,
		ArrayMode extends Exclude<array_mode, 'prefix-only'>,
		MaxItems_mode extends MaxItemsType_mode,
		UniqueItems_mode extends unique_items_mode,
		Defs extends SchemaObject = SchemaObject,
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
	> (
		data: T1,
		schema: array_type<
			DefsMode,
			ArrayMode,
			'with',
			MaxItems_mode,
			UniqueItems_mode,
			Defs,
			MinItemsType,
			MaxItems,
			Items,
			PrefixItems
		>,
		schema_parser: SchemaParser,
	): Promise<createTypeNode<
		T2,
		T3,
		'with',
		ArrayMode
	>> {
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
		DefsMode extends $defs_mode,
		ArrayMode extends Exclude<array_mode, 'prefix-only'>,
		MinItems_mode extends Exclude<MinItemsType_mode, 'with'>,
		MaxItems_mode extends MaxItemsType_mode,
		UniqueItems_mode extends unique_items_mode,
		Defs extends SchemaObject = SchemaObject,
		MinItems extends MinItemsType = MinItemsType,
		MaxItems extends MaxItemsType = MaxItemsType,
		Items extends (
			Exclude<ItemsType_by_mode<ArrayMode>, false>
		) = Exclude<ItemsType_by_mode<ArrayMode>, false>,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[]
		] = [
			SchemaObject,
			...SchemaObject[]
		],
	> (
		schema: array_type<
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
		>,
		schema_parser: SchemaParser,
	): Promise<createTypeNode<
		T2,
		[T2, ...T2[]],
		MinItems_mode,
		ArrayMode
	>> {
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
		DefsMode extends $defs_mode,
		ArrayMode extends Exclude<array_mode, 'items-only'>,
		MinItems_mode extends MinItemsType_mode,
		MaxItems_mode extends MaxItemsType_mode,
		UniqueItems_mode extends unique_items_mode,
		Defs extends SchemaObject = SchemaObject,
		MinItems extends MinItemsType = MinItemsType,
		MaxItems extends MaxItemsType = MaxItemsType,
	> (
		data: T1,
		schema: array_type<
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode,
			Defs,
			MinItems,
			MaxItems
		>,
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

			if (ArrayUncertain.#is_minItems_required_type(schema)) {
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
		DefsMode extends $defs_mode,
		ArrayMode extends array_mode,
		MinItems_mode extends MinItemsType_mode,
		MaxItems_mode extends MaxItemsType_mode,
		UniqueItems_mode extends unique_items_mode,
		Defs extends SchemaObject,
		MinItems extends MinItemsType,
		MaxItems extends MaxItemsType,
	> (
		schema: array_type<
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode,
			Defs,
			MinItems,
			MaxItems,
			ItemsType_by_mode<ArrayMode>,
			[SchemaObject, ...SchemaObject[]]
		>,
	): schema is array_type<
		DefsMode,
		Exclude<ArrayMode, 'prefix-only'>,
		MinItems_mode,
		MaxItems_mode,
		UniqueItems_mode,
		Defs,
		MinItems,
		MaxItems,
		Exclude<ItemsType_by_mode<Exclude<ArrayMode, 'prefix-only'>>, false>,
		[SchemaObject, ...SchemaObject[]]
	> {
		return 'items' in schema && false !== schema.items;
	}

	static #is_minItems_required_type<
		DefsMode extends $defs_mode,
		ArrayMode extends array_mode,
		MaxItems_mode extends MaxItemsType_mode,
		UniqueItems_mode extends unique_items_mode,
		Defs extends SchemaObject,
		MaxItems extends MaxItemsType,
		Items extends ItemsType_by_mode<ArrayMode>,
		PrefixItems extends [SchemaObject, ...SchemaObject[]],
	>(
		schema: array_type<
			DefsMode,
			ArrayMode,
			MinItemsType_mode,
			MaxItems_mode,
			UniqueItems_mode,
			Defs,
			MinItemsType,
			MaxItems,
			Items,
			PrefixItems
		>,
	): schema is array_type<
		DefsMode,
		ArrayMode,
		'with',
		MaxItems_mode,
		UniqueItems_mode,
		Defs,
		MinItemsType,
		MaxItems,
		Items,
		PrefixItems
	> {
		return 'minItems' in schema;
	}

	static #is_prefixItems_type<
		DefsMode extends $defs_mode,
		ArrayMode extends array_mode,
		MinItems_mode extends MinItemsType_mode,
		MaxItems_mode extends MaxItemsType_mode,
		UniqueItems_mode extends unique_items_mode,
		Defs extends SchemaObject,
		MinItems extends MinItemsType,
		MaxItems extends MaxItemsType,
	> (
		schema: array_type<
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode,
			Defs,
			MinItems,
			MaxItems
		>,
	): schema is array_type<
		DefsMode,
		Exclude<ArrayMode, 'items-only'>,
		MinItems_mode,
		MaxItems_mode,
		UniqueItems_mode,
		Defs,
		MinItems,
		MaxItems
	> {
		return 'prefixItems' in schema;
	}

	static #sub_schema_for_value<
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
		N extends number,
	> (
		index: ReturnType<typeof PositiveIntegerOrZero<N>>,
		schema: array_type<
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
		>,
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
