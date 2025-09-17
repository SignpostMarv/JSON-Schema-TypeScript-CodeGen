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
	PositiveInteger,
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

import type {
	array_mode,
	array_schema,
	array_type,
	ArrayUncertain_options,
	ItemsType_by_mode,
	MinItemsType_by_mode,
	MinItemsType_mode,
	PrefixItemsType_by_mode,
} from './types.ts';

type createTypeNode_structured<
	T1 extends TypeNode,
	T2 extends [T1, ...T1[]],
> = {
	both: {
		required: TupleTypeNode<T1, T2>,
		optional: TupleTypeNode<T1, T2>,
		excluded: TupleTypeNode<T1, T2>,
	},
	'items-only': {
		required: TupleTypeNode<T1, T2>,
		optional: ArrayTypeNode<T1>|TupleTypeNode<T1, T2>,
		excluded: ArrayTypeNode<T1>,
	},
	'prefix-only': {
		required: TupleTypeNode<T1, T2>,
		optional: TupleTypeNode<T1, T2>,
		excluded: TupleTypeNode<T1, T2>,
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
	MinItems_mode extends MinItemsType_mode,
	ArrayMode extends array_mode,
	Defs extends DefsType_by_mode[DefsMode],
	Items extends ItemsType_by_mode[ArrayMode],
	PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
> extends Type<
	T1,
	array_type<
		DefsMode,
		MinItems_mode,
		ArrayMode,
		Items,
		PrefixItems,
		Defs
	>,
	array_schema<
		DefsMode,
		MinItems_mode,
		ArrayMode
	>,
	createTypeNode<T2, T3, MinItems_mode, ArrayMode>,
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
			minItems: MinItemsType_by_mode[MinItems_mode],
			items: Items,
			prefixItems: PrefixItems,
			$defs_mode: DefsMode,
			minItems_mode: MinItems_mode,
			array_mode: ArrayMode,
		},
		{
			ajv,
		}: ArrayUncertain_options<
			array_schema<
				DefsMode,
				MinItems_mode,
				ArrayMode
			>,
			array_type<
				DefsMode,
				MinItems_mode,
				ArrayMode,
				Items,
				PrefixItems,
				Defs
			>
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
		schema: array_type<
			DefsMode,
			MinItems_mode,
			ArrayMode,
			Items,
			PrefixItems,
			Defs
		>,
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
			schema: array_type<
				DefsMode,
				MinItems_mode,
				ArrayMode,
				Items,
				PrefixItems,
				Defs
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
				schema as array_type<
					DefsMode,
					MinItems_mode,
					Exclude<array_mode, 'items-only'>,
					Items,
					PrefixItemsType_by_mode[Exclude<array_mode, 'items-only'>],
					Defs
				>,
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
			) as Promise<createTypeNode<
				T2,
				T3,
				MinItems_mode,
				ArrayMode
			>>;
		}

		throw new TypeError('Unsupported schema found!');
	}

	static generate_default_schema_definition<
		DefsMode extends $defs_mode,
		MinItems_mode extends MinItemsType_mode,
		ArrayMode extends array_mode,
	>(
		{
			$defs_mode,
			array_mode,
			minItems_mode,
		}: {
			$defs_mode: DefsMode,
			array_mode: ArrayMode,
			minItems_mode: MinItems_mode,
		},
	): Readonly<array_schema<
		DefsMode,
		MinItems_mode,
		ArrayMode
	>> {

		let partial_required: (typeof partial)['required'];

		if ('with' === $defs_mode) {
			if ('both' === array_mode) {
				if (
					'excluded' === minItems_mode
					|| 'optional' === minItems_mode
				) {
					const sanity_check: array_schema<
						'with',
						'excluded' | 'optional',
						'both'
					>['required'] = [
						'$defs',
						'type',
						'items',
						'prefixItems',
					];
					partial_required = sanity_check;
				} else {
					const sanity_check: array_schema<
						'with',
						'required',
						'both'
					>['required'] = [
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
					const sanity_check: array_schema<
						'with',
						'excluded' | 'optional',
						'items-only'
					>['required'] = [
						'$defs',
						'type',
						'items',
					];
					partial_required = sanity_check;
				} else {
					const sanity_check: array_schema<
						'with',
						'required',
						'items-only'
					>['required'] = [
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
				const sanity_check: array_schema<
					'with',
					'excluded' | 'optional',
						'prefix-only'
				>['required'] = [
					'$defs',
					'type',
					'prefixItems',
				];
				partial_required = sanity_check;
			} else {
				const sanity_check: array_schema<
					'with',
					'required',
						'prefix-only'
				>['required'] = [
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
					const sanity_check: array_schema<
						'without',
						'excluded' | 'optional',
						'both'
					>['required'] = [
						'type',
						'items',
						'prefixItems',
					];
					partial_required = sanity_check;
				} else {
					const sanity_check: array_schema<
						'without',
						'required',
						'both'
					>['required'] = [
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
					const sanity_check: array_schema<
						'without',
						'excluded' | 'optional',
						'items-only'
					>['required'] = [
						'type',
						'items',
					];
					partial_required = sanity_check;
				} else {
					const sanity_check: array_schema<
						'without',
						'required',
						'items-only'
					>['required'] = [
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
				const sanity_check: array_schema<
					'without',
					'excluded' | 'optional',
					'prefix-only'
				>['required'] = [
					'type',
					'prefixItems',
				];
				partial_required = sanity_check;
			} else {
				const sanity_check: array_schema<
					'without',
					'required',
					'prefix-only'
				>['required'] = [
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
					DefsMode,
					MinItems_mode,
					ArrayMode
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
							'required',
							'both'
						>['properties']>
					& Pick<
						array_schema<
							'with',
							'required',
							'both'
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
			DefsMode,
			MinItems_mode,
			ArrayMode
		>);
	}

	static #generate_default_type_definition<
		DefsMode extends $defs_mode,
		MinItems_mode extends MinItemsType_mode,
		MinItems extends MinItemsType_by_mode[MinItems_mode],
		ArrayMode extends array_mode,
		Items extends ItemsType_by_mode[ArrayMode],
		PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
		Defs extends DefsType_by_mode[DefsMode],
	>(
		$defs: Defs,
		minItems: MinItems,
		items: Items,
		prefixItems: PrefixItems,
	): Readonly<array_type<
		DefsMode,
		MinItems_mode,
		ArrayMode,
		Items,
		PrefixItems,
		Defs
	>> {
		const partial: (
			& Partial<Omit<
				array_type<
					'with',
					'required',
					'both'
				>,
				(
					| 'type'
				)
			>>
			& Pick<
				array_type<
					'with',
					'required',
					'both'
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
			DefsMode,
			MinItems_mode,
			ArrayMode,
			Items,
			PrefixItems,
			Defs
		>);
	}

	static #convert<
		DefsMode extends $defs_mode,
		MinItems_mode extends MinItemsType_mode,
		ArrayMode extends array_mode,
		Items extends ItemsType_by_mode[ArrayMode],
		PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
		Defs extends DefsType_by_mode[DefsMode],
		N extends number,
	>(
		value: unknown,
		index: 0|PositiveInteger<N>,
		schema: array_type<
			DefsMode,
			MinItems_mode,
			ArrayMode,
			Items,
			PrefixItems,
			Defs
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
		MinItems_mode extends MinItemsType_mode,
		ArrayMode extends Exclude<array_mode, 'prefix-only'>,
		Items extends ItemsType_by_mode[ArrayMode],
		PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
		Defs extends DefsType_by_mode[DefsMode]
	> (
		data: T1,
		schema: array_type<
			DefsMode,
			MinItems_mode,
			ArrayMode,
			Items,
			PrefixItems,
			Defs
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
					'required',
					ArrayMode,
					Items,
					PrefixItems,
					Defs
				> & {
					minItems: MinItemsType_by_mode['required'],
				},
				schema_parser,
			);
		}

		return this.#generate_typescript_type_has_items_only(
			schema as array_type<
				DefsMode,
				Exclude<MinItems_mode, 'required'>,
				Exclude<ArrayMode, 'both'|'prefix-only'>,
				ItemsType_by_mode[
					Exclude<ArrayMode, 'both'|'prefix-only'>
				],
				PrefixItemsType_by_mode[
					Exclude<ArrayMode, 'both'|'prefix-only'>
				],
				Defs
			>,
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
		Items extends ItemsType_by_mode[ArrayMode],
		PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
		Defs extends DefsType_by_mode[DefsMode],
	> (
		data: T1,
		schema: array_type<
			DefsMode,
			'required',
			ArrayMode,
			Items,
			PrefixItems,
			Defs
		> & {
			minItems: MinItemsType_by_mode['required'],
		},
		schema_parser: SchemaParser,
	): Promise<createTypeNode<
		T2,
		T3,
		'required',
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
		MinItems_mode extends Exclude<MinItemsType_mode, 'required'>,
		ArrayMode extends Exclude<array_mode, 'both'|'prefix-only'>,
		Items extends ItemsType_by_mode[ArrayMode],
		PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
		Defs extends DefsType_by_mode[DefsMode],
	> (
		schema: array_type<
			DefsMode,
			MinItems_mode,
			ArrayMode,
			Items,
			PrefixItems,
			Defs
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
		MinItems_mode extends MinItemsType_mode,
		ArrayMode extends Exclude<array_mode, 'items-only'>,
		Items extends ItemsType_by_mode[ArrayMode],
		PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
		Defs extends DefsType_by_mode[DefsMode],
	> (
		data: T1,
		schema: array_type<
			DefsMode,
			MinItems_mode,
			ArrayMode,
			Items,
			PrefixItems,
			Defs
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
		MinItems_mode extends MinItemsType_mode,
		ArrayMode extends array_mode,
		Items extends ItemsType_by_mode[ArrayMode],
		Defs extends DefsType_by_mode[DefsMode]
	> (
		schema: array_type<
			DefsMode,
			MinItems_mode,
			ArrayMode,
			Items,
			PrefixItemsType_by_mode[ArrayMode],
			Defs
		>,
	): schema is array_type<
		DefsMode,
		MinItems_mode,
		Exclude<ArrayMode, 'prefix-only'>,
		Exclude<Items, ItemsType_by_mode['prefix-only']>,
		PrefixItemsType_by_mode[Exclude<ArrayMode, 'prefix-only'>],
		Defs
	> {
		return 'items' in schema;
	}

	static #is_minItems_required_type<
		DefsMode extends $defs_mode,
		MinItems_mode extends MinItemsType_mode,
		ArrayMode extends array_mode,
		Items extends ItemsType_by_mode[ArrayMode],
		PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
		Defs extends DefsType_by_mode[DefsMode],
	>(
		schema: array_type<
			DefsMode,
			MinItems_mode,
			ArrayMode,
			Items,
			PrefixItems,
			Defs
		>,
	): schema is array_type<
		DefsMode,
		Exclude<MinItems_mode, 'optional'|'excluded'>,
		ArrayMode,
		Items,
		PrefixItems,
		Defs
	> & {
		minItems: MinItemsType_by_mode['required']
	} {
		return 'minItems' in schema;
	}

	static #is_prefixItems_type<
		DefsMode extends $defs_mode,
		MinItems_mode extends MinItemsType_mode,
		ArrayMode extends array_mode,
		Defs extends DefsType_by_mode[DefsMode]
	> (
		schema: array_type<
			DefsMode,
			MinItems_mode,
			ArrayMode,
			ItemsType_by_mode[ArrayMode],
			PrefixItemsType_by_mode[ArrayMode],
			Defs
		>,
	): schema is array_type<
		DefsMode,
		MinItems_mode,
		Exclude<ArrayMode, 'items-only'>,
		ItemsType_by_mode[Exclude<ArrayMode, 'items-only'>],
		PrefixItemsType_by_mode[Exclude<ArrayMode, 'items-only'>],
		Defs
	> {
		return 'prefixItems' in schema;
	}

	static #sub_schema_for_value<
		DefsMode extends $defs_mode,
		MinItems_mode extends MinItemsType_mode,
		ArrayMode extends array_mode,
		Items extends ItemsType_by_mode[ArrayMode],
		PrefixItems extends PrefixItemsType_by_mode[ArrayMode],
		Defs extends DefsType_by_mode[DefsMode],
		N extends number,
	>(
		index: 0|PositiveInteger<N>,
		schema: array_type<
			DefsMode,
			MinItems_mode,
			ArrayMode,
			Items,
			PrefixItems,
			Defs
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
