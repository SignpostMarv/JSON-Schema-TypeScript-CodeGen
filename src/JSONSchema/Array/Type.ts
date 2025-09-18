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
	TupleTypeNode,
} from '../../types.ts';

import {
	Type,
} from '../Type.ts';

import type {
	$defs_mode,
	DefsType_by_mode,
} from '../types.ts';

import type {
	SchemaParser,
} from '../../SchemaParser.ts';

import {
	array_type_node,
	tuple_type_node,
} from '../../coercions.ts';

import {
	PositiveIntegerOrZero,
} from '../../guarded.ts';

import type {
	array_mode,
	array_schema_alt,
	array_type_alt,
	ArrayUncertain_options,
	ItemsType_by_mode,
	MaxItemsType_by_mode,
	MaxItemsType_mode,
	MinItemsType_by_mode,
	MinItemsType_mode,
	PrefixItemsType_by_mode,
	unique_items_mode,
	UniqueItemsType_by_mode,
} from './types.ts';

type createTypeNode_structured<
	T1 extends TypeNode,
	T2 extends [T1, ...T1[]],
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
};

type createTypeNode<
	T1 extends TypeNode,
	T2 extends [T1, ...T1[]],
	MinItems_mode extends MinItemsType_mode,
	ArrayMode extends array_mode,
> = createTypeNode_structured<T1, T2>[ArrayMode][MinItems_mode];

export abstract class ArrayUncertain<
	T1 extends unknown[],
	T2 extends TypeNode,
	T3 extends [T2, ...T2[]],
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
> extends Type<
	T1,
	array_type_alt<
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
	array_schema_alt<
		DefsMode,
		ArrayMode,
		MinItems_mode,
		MaxItems_mode,
		UniqueItems_mode
	>,
	createTypeNode<T2, T3, MinItems_mode, ArrayMode>,
	ArrayLiteralExpression
> {
	constructor(
		{
			$defs_mode,
			array_mode,
			minItems_mode,
			maxItems_mode,
			uniqueItems_mode,
			$defs,
			minItems,
			maxItems,
			items,
			prefixItems,
		}: {
			$defs_mode: DefsMode,
			array_mode: ArrayMode,
			minItems_mode: MinItems_mode,
			maxItems_mode: MaxItems_mode,
			uniqueItems_mode: UniqueItems_mode,
			$defs: Defs,
			minItems: MinItemsType_by_mode[MinItems_mode],
			maxItems: MaxItemsType_by_mode[MaxItems_mode],
			items: Items,
			prefixItems: PrefixItems,
		},
		{
			ajv,
		}: ArrayUncertain_options<
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
				$defs,
				minItems as MinItems,
				maxItems as MaxItems,
				items,
				prefixItems,
				uniqueItems_mode,
			),
			schema_definition: (
				ArrayUncertain.generate_default_schema_definition({
					$defs_mode,
					array_mode,
					minItems_mode,
					maxItems_mode,
					uniqueItems_mode,
				})
			),
		});
	}

	generate_typescript_data(
		data: T1,
		schema_parser: SchemaParser,
		schema: array_type_alt<
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
	): ArrayLiteralExpression {
		return factory.createArrayLiteralExpression(
			data.map((value, i) => {
				return ArrayUncertain.#convert(
					value,
					PositiveIntegerOrZero(i),
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
			schema: array_type_alt<
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
	): Readonly<array_schema_alt<
		DefsMode,
		ArrayMode,
		MinItems_mode,
		MaxItems_mode,
		UniqueItems_mode
	>> {
		const full_required:[
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
		const partial_required: array_schema_alt<
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
		});

		const partial: (
			& Pick<
				array_schema_alt<
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
					& Partial<array_schema_alt<
							'with',
							'both'|'prefix-only',
							'with',
							'with',
							UniqueItems_mode
						>['properties']>
					& Pick<
						array_schema_alt<
							'with',
							'both'|'prefix-only',
							'with',
							'with',
							UniqueItems_mode
						>['properties'],
						(
							| 'type'
							| 'items'
							| 'uniqueItems'
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
					const: (
						'yes' === uniqueItems_mode
					) as UniqueItemsType_by_mode<UniqueItems_mode>,
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

		return Object.freeze(partial as array_schema_alt<
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode
		>);
	}

	static #generate_default_type_definition<
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
	>(
		$defs: Defs,
		minItems: MinItems,
		maxItems: MaxItems,
		items: Items,
		prefixItems: PrefixItems,
		uniqueItems_mode: UniqueItems_mode,
	): Readonly<array_type_alt<
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
					array_type_alt<
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
				array_type_alt<
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

		return Object.freeze(partial as array_type_alt<
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
		N extends number = number,
	>(
		value: unknown,
		index: ReturnType<typeof PositiveIntegerOrZero<N>>,
		schema: array_type_alt<
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
		DefsMode extends $defs_mode,
		ArrayMode extends Exclude<array_mode, 'prefix-only'>,
		MinItems_mode extends MinItemsType_mode,
		MaxItems_mode extends MaxItemsType_mode,
		UniqueItems_mode extends unique_items_mode,
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
			Exclude<ItemsType_by_mode[ArrayMode], false>
		) = Exclude<ItemsType_by_mode[ArrayMode], false>,
		PrefixItems extends (
			PrefixItemsType_by_mode[ArrayMode]
		) = PrefixItemsType_by_mode[ArrayMode],
	> (
		data: T1,
		schema: array_type_alt<
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
				schema as array_type_alt<
					DefsMode,
					ArrayMode,
					'with',
					MaxItems_mode,
					UniqueItems_mode,
					Defs,
					MinItemsType_by_mode['with'],
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
		Defs extends (
			DefsType_by_mode[DefsMode]
		) = DefsType_by_mode[DefsMode],
		MaxItems extends (
			MaxItemsType_by_mode[MaxItems_mode]
		) = MaxItemsType_by_mode[MaxItems_mode],
		Items extends (
			ItemsType_by_mode[ArrayMode]
		) = ItemsType_by_mode[ArrayMode],
		PrefixItems extends (
			PrefixItemsType_by_mode[ArrayMode]
		) = PrefixItemsType_by_mode[ArrayMode],
	> (
		data: T1,
		schema: array_type_alt<
			DefsMode,
			ArrayMode,
			'with',
			MaxItems_mode,
			UniqueItems_mode,
			Defs,
			MinItemsType_by_mode['with'],
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
			Exclude<ItemsType_by_mode[ArrayMode], false>
		) = Exclude<ItemsType_by_mode[ArrayMode], false>,
		PrefixItems extends (
			PrefixItemsType_by_mode[ArrayMode]
		) = PrefixItemsType_by_mode[ArrayMode],
	> (
		schema: array_type_alt<
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
		Defs extends (
			DefsType_by_mode[DefsMode]
		) = DefsType_by_mode[DefsMode],
		MinItems extends (
			MinItemsType_by_mode[MinItems_mode]
		) = MinItemsType_by_mode[MinItems_mode],
		MaxItems extends (
			MaxItemsType_by_mode[MaxItems_mode]
		) = MaxItemsType_by_mode[MaxItems_mode],
	> (
		data: T1,
		schema: array_type_alt<
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
		Defs extends DefsType_by_mode[DefsMode],
		MinItems extends MinItemsType_by_mode[MinItems_mode],
		MaxItems extends MaxItemsType_by_mode[MaxItems_mode],
	> (
		schema: array_type_alt<
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode,
			Defs,
			MinItems,
			MaxItems,
			ItemsType_by_mode[ArrayMode],
			PrefixItemsType_by_mode[ArrayMode]
		>,
	): schema is array_type_alt<
		DefsMode,
		Exclude<ArrayMode, 'prefix-only'>,
		MinItems_mode,
		MaxItems_mode,
		UniqueItems_mode,
		Defs,
		MinItems,
		MaxItems,
		Exclude<ItemsType_by_mode[Exclude<ArrayMode, 'prefix-only'>], false>,
		PrefixItemsType_by_mode[Exclude<ArrayMode, 'prefix-only'>]
	> {
		return 'items' in schema && false !== schema.items;
	}

	static #is_minItems_required_type<
		DefsMode extends $defs_mode,
		ArrayMode extends array_mode,
		MaxItems_mode extends MaxItemsType_mode,
		UniqueItems_mode extends unique_items_mode,
		Defs extends DefsType_by_mode[DefsMode],
		MaxItems extends MaxItemsType_by_mode[MaxItems_mode],
		Items extends ItemsType_by_mode[ArrayMode],
		PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
	>(
		schema: array_type_alt<
			DefsMode,
			ArrayMode,
			MinItemsType_mode,
			MaxItems_mode,
			UniqueItems_mode,
			Defs,
			MinItemsType_by_mode[MinItemsType_mode],
			MaxItems,
			Items,
			PrefixItems
		>,
	): schema is array_type_alt<
		DefsMode,
		ArrayMode,
		'with',
		MaxItems_mode,
		UniqueItems_mode,
		Defs,
		MinItemsType_by_mode['with'],
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
		Defs extends DefsType_by_mode[DefsMode],
		MinItems extends MinItemsType_by_mode[MinItems_mode],
		MaxItems extends MaxItemsType_by_mode[MaxItems_mode],
	> (
		schema: array_type_alt<
			DefsMode,
			ArrayMode,
			MinItems_mode,
			MaxItems_mode,
			UniqueItems_mode,
			Defs,
			MinItems,
			MaxItems
		>,
	): schema is array_type_alt<
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
		Defs extends DefsType_by_mode[DefsMode],
		MinItems extends MinItemsType_by_mode[MinItems_mode],
		MaxItems extends MaxItemsType_by_mode[MaxItems_mode],
		Items extends ItemsType_by_mode[ArrayMode],
		PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
		N extends number,
	> (
		index: ReturnType<typeof PositiveIntegerOrZero<N>>,
		schema: array_type_alt<
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
