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
	Integer,
	PositiveNumber,
	TupleTypeNode,
} from '../types.ts';

import type {
	ObjectOfSchemas,
	SchemaDefinitionDefinition,
	TypeOptions,
} from './Type.ts';
import {
	Type,
} from './Type.ts';

import type {
	$defs_schema,
} from './types.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

type array_mode = 'both'|'items-only'|'prefix-only';

type array_without_$defs_type_both<
	MinItems extends undefined|PositiveNumber,
> = (
	MinItems extends undefined
		? {
			type: 'array',
			items: SchemaObject,
			prefixItems: [SchemaObject, ...SchemaObject[]],
			additionalItems: false,
		}
		: {
			type: 'array',
			items: SchemaObject,
			prefixItems: [SchemaObject, ...SchemaObject[]],
			additionalItems: false,
			minItems: MinItems,
		}
);

type array_with_$defs_type_both<
	MinItems extends undefined|PositiveNumber,
	Defs extends ObjectOfSchemas,
>  = (
	& array_without_$defs_type_both<MinItems>
	& {
		$defs: Defs,
	}
);

type array_type<
	ArrayMode extends array_mode,
	MinItems extends undefined|PositiveNumber,
	Defs extends undefined|ObjectOfSchemas,
>  = (
	Defs extends undefined
		? (
			ArrayMode extends 'both'
				? array_without_$defs_type_both<MinItems>
				: (
					ArrayMode extends 'items-only'
						? Omit<
							array_without_$defs_type_both<MinItems>,
							'prefixItems'
						>
						: (
							Omit<
								array_without_$defs_type_both<MinItems>,
								'items'
							>
							& {
								items: false,
							}
						)
				)
		)
		: (
			ArrayMode extends 'both'
				? array_with_$defs_type_both<
					MinItems,
					Exclude<Defs, undefined>
				>
				: (
					ArrayMode extends 'items-only'
						? Omit<
							array_with_$defs_type_both<
								MinItems,
								Exclude<Defs, undefined>
							>,
							'prefixItems'
						>
						: Omit<
							array_with_$defs_type_both<
								MinItems,
								Exclude<Defs, undefined>
							>,
							'items'
						>
				)
		)
);

type array_without_$defs_schema_both_no_minimum = SchemaDefinitionDefinition<
	['type', 'items', 'prefixItems', 'additionalItems'],
	{
		type: {
			type: 'string',
			const: 'array',
		},
		items: (
			& SchemaObject
			& {
				type: 'object',
				minProperties: 1,
			}
		),
		prefixItems: {
			type: 'array',
			minItems: 1,
			additionalItems: false,
			items: (
				& SchemaObject
				& {
					type: 'object',
					minProperties: 1,
				}
			),
		},
		additionalItems: {
			type: 'boolean',
			const: false,
		},
		minItems: {
			type: 'integer',
			minimum: 0,
		},
	}
>;

type array_without_$defs_schema_both_with_minimum<
	MinItems extends PositiveNumber,
> = SchemaDefinitionDefinition<
	[
		...array_without_$defs_schema_both_no_minimum['required'],
		'minItems',
	],
	(
		& array_without_$defs_schema_both_no_minimum['properties']
		& {
			minItems: {
				type: 'number',
				const: MinItems,
			}
		}
	)
>;

type array_without_$defs_schema_both<
	MinItems extends undefined|PositiveNumber,
> = (
	MinItems extends undefined
		? array_without_$defs_schema_both_no_minimum
		: array_without_$defs_schema_both_with_minimum<
			Exclude<MinItems, undefined>
		>
);

type array_schema_both<
	MinItems extends undefined|PositiveNumber,
	Defs extends undefined|ObjectOfSchemas,
> = SchemaDefinitionDefinition<
	(
		MinItems extends undefined
			? (
				Defs extends undefined
					? array_without_$defs_schema_both<
						MinItems
					>['required']
					: [
						...array_without_$defs_schema_both<
							MinItems
						>['required'],
						'$defs',
					]
			)
			: (
				Defs extends undefined
					? array_without_$defs_schema_both<
						Exclude<MinItems, undefined>
					>['required']
					: [
						...array_without_$defs_schema_both<
							Exclude<MinItems, undefined>
						>['required'],
						'$defs',
					]
			)
	),
	(
		MinItems extends undefined
			? (
				Defs extends undefined
					? array_without_$defs_schema_both<
						MinItems
					>['properties']
					: (
						& array_without_$defs_schema_both<
							MinItems
						>['properties']
						& $defs_schema
					)
			)
			: (
				Defs extends undefined
					? array_without_$defs_schema_both<
						Exclude<MinItems, undefined>
					>['properties']
					: (
						& array_without_$defs_schema_both<
							Exclude<MinItems, undefined>
						>['properties']
						& $defs_schema
					)
			)
	)
>;

type array_schema<
	ArrayMode extends array_mode,
	MinItems extends undefined|PositiveNumber,
	Defs extends undefined|ObjectOfSchemas,
> = SchemaDefinitionDefinition & (
	ArrayMode extends 'both'
		? array_schema_both<MinItems, Defs>
		: (
			ArrayMode extends 'items-only'
				? (
					& Omit<
						array_schema_both<MinItems, Defs>,
						(
							| 'required'
							| 'properties'
						)
					>
					& {
						required: (
							Defs extends undefined
								? ['type', 'items', 'additionalItems']
								: [
									'type',
									'items',
									'additionalItems',
									'$defs',
								]
						),
						properties: Omit<
							array_schema_both<MinItems, Defs>['properties'],
							(
								| 'prefixItems'
							)
						>
					}
				)
				: (
					& Omit<
						array_schema_both<MinItems, Defs>,
						(
							| 'required'
							| 'properties'
						)
					>
					& {
						required: (
							Defs extends undefined
								? ['type', 'prefixItems', 'additionalItems']
								: [
									'type',
									'prefixItems',
									'additionalItems',
									'$defs',
								]
						),
						properties: (
							& Omit<
								array_schema_both<
									MinItems,
									Defs
								>['properties'],
								(
									| 'items'
								)
							>
							& {
								items: {
									type: 'boolean',
									const: false,
								}
							}
						)
					}
				)
		)
)

type createTypeNode_resolve<
	ArrayMode extends array_mode,
	MinItems extends undefined|PositiveNumber,
	T2 extends TypeNode,
	T3 extends (
		MinItems extends undefined
			? (
				ArrayMode extends 'items-only'
					? never
					: [T2, ...T2[]]
			)
			: [T2, ...T2[]]
	),
> = (
	MinItems extends undefined
		? (
			ArrayMode extends 'items-only'
				? ArrayTypeNode<T2>
				: TupleTypeNode<T2, T3>
		)
		: TupleTypeNode<T2, T3>
);
type createTypeNode_return<
	ArrayMode extends array_mode,
	MinItems extends undefined|PositiveNumber,
	T2 extends TypeNode,
	T3 extends (
		MinItems extends undefined
			? (
				ArrayMode extends 'items-only'
					? never
					: [T2, ...T2[]]
			)
			: [T2, ...T2[]]
	),
> = Promise<createTypeNode_resolve<
	ArrayMode,
	MinItems,
	T2,
	T3
>>;

class ArrayHelper
{
	static createArrayLiteralExpression<
		T0 = unknown,
		T1 extends T0[] = T0[],
		ArrayMode extends array_mode = array_mode,
		MinItems extends undefined|PositiveNumber = undefined|PositiveNumber,
		Defs extends undefined|ObjectOfSchemas = undefined|ObjectOfSchemas,
	> (
		data: T1,
		schema_parser: SchemaParser,
		schema: array_type<ArrayMode, MinItems, Defs>,
	): ArrayLiteralExpression {
		return factory.createArrayLiteralExpression(
			data.map((value, i) => {
				return this.#convert(
					value,
					i,
					schema,
					schema_parser,
				);
			}),
			true,
		);
	}

	static createTypeNode<
		ArrayMode extends array_mode,
		MinItems extends undefined|PositiveNumber,
		Defs extends undefined|ObjectOfSchemas,
		T2 extends TypeNode,
		T3 extends (
			MinItems extends undefined
				? (
					ArrayMode extends 'items-only'
						? never
						: [T2, ...T2[]]
				)
				: [T2, ...T2[]]
		),
	>(
		schema: array_type<ArrayMode, MinItems, Defs>,
		schema_parser: SchemaParser,
	): createTypeNode_return<
		ArrayMode,
		MinItems,
		T2,
		T3
	> {
		if (
			!('minItems' in schema)
			&& !('prefixItems' in schema)
		) {
			return this.#createArrayTypeNode<
				ArrayMode,
				MinItems,
				Defs,
				T2
			>(
				schema as array_type<
					'items-only',
					undefined,
					Defs
				>,
				schema_parser,
			) as createTypeNode_return<
				ArrayMode,
				MinItems,
				T2,
				T3
			>;
		}

		return this.#createTupleTypeNode(
			schema as Exclude<
				array_type<ArrayMode, MinItems, Defs>,
				array_type<
					Exclude<
						ArrayMode,
						(
							| 'both'
							| 'prefix-only'
						)
					>,
					Exclude<MinItems, PositiveNumber>,
					Defs
				>
			>,
			schema_parser,
		);
	}

	static #convert<
		T1 extends unknown[],
		ArrayMode extends array_mode,
		MinItems extends undefined|PositiveNumber,
		Defs extends undefined|ObjectOfSchemas,
	>(
		value: unknown,
		index: Integer,
		schema: array_type<ArrayMode, MinItems, Defs>,
		schema_parser: SchemaParser,
	): Expression {
		let sub_schema:SchemaObject;
		if ('prefixItems' in schema && index < schema.prefixItems.length) {
			sub_schema = schema.prefixItems[index];
		} else if (!('items' in schema) || false === schema.items) {
			throw new TypeError(
				`No sub-schema to fall back on for array item at index ${
					index
				}`,
			);
		} else {
			sub_schema = schema.items;
		}

		const ajv = schema_parser.share_ajv((ajv) => ajv);
		const validator = ajv.compile<T1>(sub_schema);

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

	static async #createArrayTypeNode<
		ArrayMode extends array_mode,
		MinItems extends undefined|PositiveNumber,
		Defs extends undefined|ObjectOfSchemas,
		T2 extends TypeNode,
	>(
		schema: array_type<'items-only', undefined, Defs>,
		schema_parser: SchemaParser,
	): Promise<(
		MinItems extends undefined
			? (
				ArrayMode extends 'items-only'
					? ArrayTypeNode<T2>
					: never
			)
			: never
	)> {
		return Promise.resolve(
			factory.createArrayTypeNode(await schema_parser.parse(
				schema.items,
			).generate_typescript_type({
				schema,
				schema_parser,
			})) as (
				MinItems extends undefined
					? (
						ArrayMode extends 'items-only'
							? ArrayTypeNode<T2>
							: never
					)
					: never
			),
		);
	}

	static async #createTupleTypeNode<
		ArrayMode extends array_mode,
		MinItems extends undefined|PositiveNumber,
		Defs extends undefined|ObjectOfSchemas,
		T2 extends TypeNode,
		T3 extends [T2, ...T2[]]
	>(
		schema: Exclude<
			array_type<ArrayMode, MinItems, Defs>,
			array_type<
				Exclude<
					ArrayMode,
					(
						| 'both'
						| 'prefix-only'
					)
				>,
				Exclude<MinItems, PositiveNumber>,
				Defs
			>
		>,
		schema_parser: SchemaParser,
	): Promise<(
		MinItems extends undefined
			? (
				ArrayMode extends 'items-only'
					? never
					: TupleTypeNode<T2, T3>
			)
			: TupleTypeNode<T2, T3>
	)> {
		const types = [];

		if ('prefixItems' in schema) {
			for (const sub_schema of schema.prefixItems) {
				types.push(await schema_parser.parse(
					sub_schema,
				).generate_typescript_type({
					schema,
					schema_parser,
				}));
			}
		}

		if ('items' in schema && schema.items) {
			if ('minItems' in schema) {
				while (types.length < schema.minItems) {
					types.push(await schema_parser.parse(
						schema.items,
					).generate_typescript_type({
						schema,
						schema_parser,
					}));
				}
			}

			types.push(factory.createRestTypeNode(await schema_parser.parse(
				schema.items,
			).generate_typescript_type({
				schema,
				schema_parser,
			})));
		}

		if ('minItems' in schema && types.length < schema.minItems) {
			throw new TypeError(
				`Not enough types discovered, expecting ${
					schema.minItems
				}, found ${types.length}`,
			);
		}

		return Promise.resolve(
			factory.createTupleTypeNode(types) as (
				MinItems extends undefined
					? (
						ArrayMode extends 'items-only'
							? never
							: TupleTypeNode<T2, T3>
					)
					: TupleTypeNode<T2, T3>
			),
		);
	}
}

type ArrayMaybeHas$defs_options<
	ArrayMode extends array_mode,
	MinItems extends undefined|PositiveNumber,
	Defs extends undefined|ObjectOfSchemas,
> = (
	& Omit<
		TypeOptions<
			array_schema<ArrayMode, MinItems, Defs>,
			array_type<ArrayMode, MinItems, Defs>
		>,
		(
			| 'type_definition'
		)
	>
	& Pick<
		TypeOptions<
			array_schema<ArrayMode, MinItems, Defs>,
			array_type<ArrayMode, MinItems, Defs>
		>,
		(
			| 'type_definition'
		)
	>
);

abstract class ArrayMaybeHas$defs<
	T1 extends unknown[],
	ArrayMode extends array_mode,
	MinItems extends undefined|PositiveNumber,
	Defs extends undefined|ObjectOfSchemas,
	T2 extends TypeNode,
	T3 extends (
		MinItems extends undefined
			? (
				ArrayMode extends 'items-only'
					? never
					: [T2, ...T2[]]
			)
			: [T2, ...T2[]]
	),
> extends Type<
	T1,
	array_type<ArrayMode, MinItems, Defs>,
	array_schema<ArrayMode, MinItems, Defs>,
	createTypeNode_resolve<
		ArrayMode,
		MinItems,
		T2,
		T3
	>,
	ArrayLiteralExpression
> {
	constructor(
		{
			array_mode,
			minItems,
			defs,
		}: {
			array_mode: ArrayMode,
			minItems?: MinItems,
			defs?: Defs,
		},
		{
			ajv,
			type_definition,
		}: Omit<ArrayMaybeHas$defs_options<
			ArrayMode,
			MinItems,
			Defs
		>, 'schema_definition'>,
	) {
		super({
			ajv,
			type_definition,
			schema_definition: (
				ArrayWithout$defs.generate_default_schema_definition<
					ArrayMode,
					MinItems,
					Defs
				>({
					array_mode,
					minItems,
					defs,
				})
			),
		});
	}

	generate_typescript_data(
		data: T1,
		schema_parser: SchemaParser,
		schema: array_type<ArrayMode, MinItems, Defs>,
	): ArrayLiteralExpression {
		return ArrayHelper.createArrayLiteralExpression(
			data,
			schema_parser,
			schema,
		);
	}

	generate_typescript_type({
		schema,
		schema_parser,
	}: {
		schema: array_type<ArrayMode, MinItems, Defs>,
		schema_parser: SchemaParser,
	}): createTypeNode_return<
		ArrayMode,
		MinItems,
		T2,
		T3
	> {
		return ArrayHelper.createTypeNode(schema, schema_parser);
	}

	static generate_default_schema_definition<
		ArrayMode extends array_mode,
		MinItems extends undefined|PositiveNumber,
		Defs extends undefined|ObjectOfSchemas,
	>({
		defs,
		array_mode,
		minItems,
	}: {
		defs?: Defs,
		array_mode: ArrayMode,
		minItems?: MinItems,
	}): Readonly<array_schema<ArrayMode, MinItems, Defs>> {
		const items: array_schema<
			ArrayMode,
			MinItems,
			Defs
		>['properties']['items'] = (
			'prefix-only' === array_mode
				? {
					type: 'boolean',
					const: false,
				}
				: {
					type: 'object',
					minProperties: 1,
				}
		);

		const required: array_schema<
			ArrayMode,
			MinItems,
			Defs
		>['required'] = (
			'both' === array_mode
				? (
					undefined === minItems
						? (
							undefined === defs
								? [
									'type',
									'items',
									'prefixItems',
									'additionalItems',
								]
								: [
									'type',
									'items',
									'prefixItems',
									'additionalItems',
									'$defs',
								]
						)
						: (
							undefined === defs
								? [
									'type',
									'items',
									'prefixItems',
									'additionalItems',
									'minItems',
								]
								: [
									'type',
									'items',
									'prefixItems',
									'additionalItems',
									'minItems',
									'$defs',
								]
						)
				)
				: (
					'items-only' === array_mode
						? (
							undefined === defs
								? ['type', 'items', 'additionalItems']
								: [
									'type',
									'items',
									'additionalItems',
									'$defs',
								]
						)
						: (
							undefined === defs
								? ['type', 'prefixItems', 'additionalItems']
								: [
									'type',
									'prefixItems',
									'additionalItems',
									'$defs',
								]
						)
				)
		);

		const properties: array_schema<
			ArrayMode,
			MinItems,
			Defs
		>['properties'] = {
			type: {
				type: 'string',
				const: 'array',
			},
			items,
			...(
				'items-only' !== array_mode
					? {
						prefixItems: {
							type: 'array',
							minItems: 1,
							additionalItems: false,
							items: {
								type: 'object',
								minProperties: 1,
							},
						},
					}
					: {}
			),
			additionalItems: {
				type: 'boolean',
				const: false,
			},
			minItems: (
				undefined === minItems
					? {
						type: 'integer',
						minimum: 0,
					}
					: {
						type: 'integer',
						const: minItems,
					}
			),
		};

		if (defs) {
			const result:array_schema<
				'both'|'items-only'|'prefix-only',
				undefined|PositiveNumber,
				ObjectOfSchemas
			> = {
				$defs: defs,
				type: 'object',
				required,
				additionalProperties: false,
				properties,
			};

			return Object.freeze<array_schema<
				ArrayMode,
				MinItems,
				Defs
			>>(result as array_schema<
				ArrayMode,
				MinItems,
				Defs
			>);
		}

		const result:array_schema<
			'both'|'items-only'|'prefix-only',
			undefined|PositiveNumber,
			undefined
		> = {
			type: 'object',
			required,
			additionalProperties: false,
			properties,
		};

		return Object.freeze<array_schema<
			ArrayMode,
			MinItems,
			Defs
		>>(result as array_schema<
			ArrayMode,
			MinItems,
			Defs
		>);
	}
}

export class ArrayWithout$defs<
	T1 extends unknown[],
	ArrayMode extends array_mode,
	MinItems extends undefined|PositiveNumber,
	Defs extends undefined,
	T2 extends TypeNode,
	T3 extends (
		MinItems extends undefined
			? never
			: [T2, ...T2[]]
	),
> extends ArrayMaybeHas$defs<
	T1,
	ArrayMode,
	MinItems,
	Defs,
	T2,
	T3
> {
}

export class ArrayWith$defs<
	T1 extends unknown[],
	ArrayMode extends array_mode,
	MinItems extends undefined|PositiveNumber,
	Defs extends ObjectOfSchemas,
	T2 extends TypeNode,
	T3 extends (
		MinItems extends undefined
			? never
			: [T2, ...T2[]]
	),
> extends ArrayMaybeHas$defs<
	T1,
	ArrayMode,
	MinItems,
	Defs,
	T2,
	T3
> {
}
