import type {
	Expression,
	TypeNode,
} from 'typescript';
import {
	SyntaxKind,
} from 'typescript';

import type {
	SchemaDefinitionDefinitionWith$defs,
	SchemalessTypeOptions,
} from './Type.ts';
import {
	$defs_schema,
	Type,
} from './Type.ts';

import {
	PositiveIntegerGuard,
	PositiveIntegerOrZeroGuard,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../guarded.ts';

import type {
	ObjectOfSchemas,
	PositiveInteger,
	SchemaObject,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../types.ts';

import type {
	ArrayLiteralExpression,
	ArrayTypeNode,
	TupleTypeNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/types.ts';

import type {
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../SchemaParser.ts';

import {
	factory,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/factory.ts';

import {
	SchemaValidationError,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../SchemaValidationError.ts';

type array_mode = 'items'|'prefixItems';

type specified_mode = 'specified'|'unspecified';

type unique_items_mode = 'yes'|'no';

type MinItemsType_mode = 'with'|'optional';

type MinItemsType = ReturnType<typeof PositiveIntegerOrZeroGuard<number>>;
type MaxItemsType = ReturnType<typeof PositiveIntegerOrZeroGuard<number>>;

type array_options<
	ArrayMode extends array_mode = array_mode,
	SpecifiedMode extends specified_mode = specified_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
	MinItems_mode extends MinItemsType_mode = MinItemsType_mode,
	Items extends SchemaObject = SchemaObject,
	PrefixItems extends [
		SchemaObject,
		...SchemaObject[],
	] = [
		SchemaObject,
		...SchemaObject[],
	],
	T1 extends unknown[] = unknown[],
	T4 extends Expression = Expression,
	T5 extends T4[] = T4[],
> = (
	& {
		$defs?: ObjectOfSchemas,
		array_mode: ArrayMode,
		specified_mode: SpecifiedMode,
		unique_items_mode: UniqueItems_mode,
		min_items_mode: MinItems_mode,
		expression_at_index_verifier?: ExpressionAtIndexVerifier<T1, T4, T5>,
	}
	& (
		ArrayMode extends 'items'
			? (
				SpecifiedMode extends 'specified'
					? (
						MinItems_mode extends 'with'
							? {
								minItems: MinItemsType,
								maxItems?: MaxItemsType,
							}
							: {
								minItems?: MinItemsType,
								maxItems?: MaxItemsType,
							}
					)
					: {
						minItems?: undefined,
						maxItems?: undefined,
					}
			)
			: (
				SpecifiedMode extends 'specified'
					? {
						minItems?: undefined,
						maxItems?: undefined,
					}
					: {
						minItems: MinItemsType,
						maxItems?: MaxItemsType,
					}
			)
	)
	& (
		ArrayMode extends 'items'
			? (
				SpecifiedMode extends 'specified'
					? {
						items: Items,
					}
					: {
						items?: undefined,
					}
			)
			: (
				SpecifiedMode extends 'specified'
					? {
						items?: false,
						prefixItems: PrefixItems,
					}
					: {
						items?: undefined,
					}
			)
	)
);

type ExpressionAtIndexVerifier<
	Data extends unknown[],
	T1 extends Expression,
	Result extends T1[],
	Index extends ReturnType<
		typeof PositiveIntegerOrZeroGuard<number>
	> = ReturnType<
		typeof PositiveIntegerOrZeroGuard<number>
	>,
> = (
	data: Data,
	expression: Expression,
	index: Index,
) => expression is Result[Index];

function expression_at_index_verifier_default<
	T extends unknown[],
	ArrayMode extends array_mode = array_mode,
	MinItems_mode extends MinItemsType_mode = MinItemsType_mode,
	T4 extends Expression = Expression,
	T5 extends {
		items: {
			with: [T4, ...T4[]],
			optional: T4[],
		}[MinItems_mode],
		prefixItems: [T4, ...T4[]],
	}[ArrayMode] = {
		items: {
			with: [T4, ...T4[]],
			optional: T4[],
		}[MinItems_mode],
		prefixItems: [T4, ...T4[]],
	}[ArrayMode],
	Index extends ReturnType<
		typeof PositiveIntegerOrZeroGuard<number>
	> = ReturnType<
		typeof PositiveIntegerOrZeroGuard<number>
	>,
>(
	data: T,
	expression: Expression,
): expression is T5[Index] {
	return true;
}

type array_type<
	ArrayMode extends array_mode = array_mode,
	SpecifiedMode extends specified_mode = specified_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
	MinItems_mode extends MinItemsType_mode = MinItemsType_mode,
	Items extends SchemaObject = SchemaObject,
	PrefixItems extends [
		SchemaObject,
		...SchemaObject[],
	] = [
		SchemaObject,
		...SchemaObject[],
	],
> = (
	& {
		$schema?: 'https://json-schema.org/draft/2020-12/schema',
		$id?: Exclude<string, ''>,
		$defs?: ObjectOfSchemas,
		type: 'array',
		uniqueItems: {
			yes: true,
			no: false,
		}[UniqueItems_mode],
		items: (
			& (
				SpecifiedMode extends 'unspecified'
					? (SchemaObject & {})
					: (
						ArrayMode extends 'items'
							? Items
							: false
					)
			)
		),
	}
	& {
		items: {
			specified: (
				& {
					maxItems?: MaxItemsType,
				}
				& {
					with: {
						minItems: MinItemsType,
					},
					optional: {
						minItems?: MinItemsType,
					},
				}[MinItems_mode]
			),
			unspecified: (
				& {
					maxItems?: MaxItemsType,
				}
				& {
					with: {
						minItems: MinItemsType,
					},
					optional: {
						minItems?: MinItemsType,
					},
				}[MinItems_mode]
			),
		},
		prefixItems: {
			specified: {
				prefixItems: PrefixItems,
				minItems: PositiveInteger<number>,
			},
			unspecified: {
				prefixItems?: undefined,
				minItems: PositiveInteger<number>,
				maxItems?: MaxItemsType,
			},
		},
	}[ArrayMode][SpecifiedMode]
);

type array_schema_properties<
	ArrayMode extends array_mode,
	SpecifiedMode extends specified_mode = specified_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
	Items extends SchemaObject = SchemaObject,
	PrefixItems extends [
		SchemaObject,
		...SchemaObject[],
	] = [
		SchemaObject,
		...SchemaObject[],
	],
> = (
	& {
		$schema: {
			type: 'string',
			enum: [
				'https://json-schema.org/draft/2020-12/schema',
			],
		},
		$id: {
			type: 'string',
			minLength: 1,
		},
		type: {
			type: 'string',
			const: 'array',
		},
		uniqueItems: {
			type: 'boolean',
			const: {
				yes: true,
				no: false,
			}[UniqueItems_mode],
		},
	}
	& {
		items: {
			items: {
				specified: Items,
				unspecified: {
					type: 'object',
					minProperties: 0,
				},
			}[SpecifiedMode],
			minItems: {
				type: 'integer',
				minimum: 0,
			},
			maxItems: {
				type: 'integer',
				minimum: 0,
			},
		},
		prefixItems: {
			specified: {
				items: {
					type: 'boolean',
					const: false,
				},
				prefixItems: {
					type: 'array',
					const: PrefixItems,
				},
			},
			unspecified: {
				items: {
					type: 'boolean',
					const: false,
				},
				prefixItems: {
					type: 'array',
					minItems: 1,
					items: {
						type: 'object',
						minProperties: 1,
					},
				},
			},
		}[SpecifiedMode],
	}[ArrayMode]
);

type array_schema<
	ArrayMode extends array_mode = array_mode,
	SpecifiedMode extends specified_mode = specified_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
	MinItems_mode extends MinItemsType_mode = MinItemsType_mode,
	Items extends SchemaObject = SchemaObject,
	PrefixItems extends [
		SchemaObject,
		...SchemaObject[],
	] = [
		SchemaObject,
		...SchemaObject[],
	],
> = SchemaDefinitionDefinitionWith$defs<
	{
		items: {
			with: {
				yes: [
					'type',
					'items',
					'minItems',
					'uniqueItems',
				],
				no: [
					'type',
					'items',
					'minItems',
				],
			}[UniqueItems_mode],
			optional: {
				yes: [
					'type',
					'items',
					'uniqueItems',
				],
				no: [
					'type',
					'items',
				],
			}[UniqueItems_mode],
		}[MinItems_mode],
		prefixItems: {
			specified: {
				yes: [
					'type',
					'items',
					'prefixItems',
					'uniqueItems',
				],
				no: [
					'type',
					'items',
					'prefixItems',
				],
			}[UniqueItems_mode],
			unspecified: {
				yes: [
					'type',
					'items',
					'prefixItems',
					'uniqueItems',
				],
				no: [
					'type',
					'items',
					'prefixItems',
				],
			}[UniqueItems_mode],
		}[SpecifiedMode],
	}[ArrayMode],
	ObjectOfSchemas & array_schema_properties<
		ArrayMode,
		SpecifiedMode,
		UniqueItems_mode,
		Items,
		PrefixItems
	>
>;

class ArrayType<
	ArrayMode extends array_mode = array_mode,
	SpecifiedMode extends specified_mode = specified_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
	MinItems_mode extends MinItemsType_mode = MinItemsType_mode,
	Items extends SchemaObject = SchemaObject,
	PrefixItems extends [
		SchemaObject,
		...SchemaObject[],
	] = [
		SchemaObject,
		...SchemaObject[],
	],
	T1 extends {
		items: unknown[],
		prefixItems: [unknown, ...unknown[]],
	}[ArrayMode] = {
		items: unknown[],
		prefixItems: [unknown, ...unknown[]],
	}[ArrayMode],
	T2 extends TypeNode = TypeNode,
	T3 extends [T2, ...T2[]] = [T2, ...T2[]],
	T4 extends Expression = Expression,
	T5 extends {
		items: {
			with: [T4, ...T4[]],
			optional: T4[],
		}[MinItems_mode],
		prefixItems: [T4, ...T4[]],
	}[ArrayMode] = {
		items: {
			with: [T4, ...T4[]],
			optional: T4[],
		}[MinItems_mode],
		prefixItems: [T4, ...T4[]],
	}[ArrayMode],
> extends
	Type<
		T1,
		array_type<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>,
		array_options<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>,
		array_schema<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode
		>,
		array_options<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>,
		{
			items: {
				with: TupleTypeNode<T2, T3>,
				optional: ArrayTypeNode<T2>,
			}[MinItems_mode],
			prefixItems: TupleTypeNode<T2, T3>,
		}[ArrayMode],
		ArrayLiteralExpression<T4, T5, true>
	> {
	#expression_at_index_verifier: ExpressionAtIndexVerifier<T1, T4, T5>;

	constructor(
		options: SchemalessTypeOptions,
		{
			array_options,
			// eslint-disable-next-line @stylistic/max-len
			expression_at_index_verifier = expression_at_index_verifier_default<
				T1,
				ArrayMode,
				MinItems_mode,
				T4,
				T5
			>,
		}: {
			array_options: array_options<
				ArrayMode,
				SpecifiedMode,
				UniqueItems_mode,
				MinItems_mode,
				Items,
				PrefixItems
			>,
			expression_at_index_verifier?: ExpressionAtIndexVerifier<
				T1,
				T4,
				T5
			>,
		},
	) {
		super({
			...options,
			type_definition: array_options,
			schema_definition: array_options,
		});

		this.#expression_at_index_verifier = expression_at_index_verifier;
	}

	generate_typescript_data(
		data: T1,
		schema_parser: SchemaParser,
		schema: array_type<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>,
	): ArrayLiteralExpression<T4, T5, true> {
		if (!(this.check_type(data))) {
			throw new TypeError('data does not pass type check!');
		}

		return factory.createArrayLiteralExpression(
			data.map((value, i): T4 => {
				const index = PositiveIntegerOrZeroGuard(i);
				const element = ArrayType.#convert(
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
			}),
			true,
		);
	}

	generate_typescript_type({
		data,
		schema,
		schema_parser,
	}: {
		data: T1,
		schema: array_type<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>,
		schema_parser: SchemaParser,
	}): Promise<{
		items: {
			with: TupleTypeNode<T2, T3>,
			optional: ArrayTypeNode<T2>,
		}[MinItems_mode],
		prefixItems: TupleTypeNode<T2, T3>,
	}[ArrayMode]> {
		let result: Promise<{
			items: {
				with: TupleTypeNode<T2, T3>,
				optional: ArrayTypeNode<T2>,
			}[MinItems_mode],
			prefixItems: TupleTypeNode<T2, T3>,
		}[ArrayMode]>;

		if (!ArrayType.#is_items_type_schema(schema)) {
			const sanity_check: Promise<
				TupleTypeNode<T2, T3>
			> = ArrayType.#generate_typescript_type_has_prefixItems(
				data,
				schema as array_type<
					'prefixItems',
					'specified'
				>,
				schema_parser,
			);

			result = sanity_check as typeof result;
		} else {
			const sanity_check: Promise<{
				items: {
					with: TupleTypeNode<T2, T3>,
					optional: ArrayTypeNode<T2>,
				}[MinItems_mode],
				prefixItems: TupleTypeNode<T2, T3>,
			}[ArrayMode]> = ArrayType.#generate_typescript_type_has_items(
				data,
				schema,
				schema_parser,
			);

			result = sanity_check as unknown as typeof result;
		}

		return result;
	}

	static generate_schema_definition<
		ArrayMode extends array_mode,
		SpecifiedMode extends specified_mode,
		UniqueItems_mode extends unique_items_mode,
		MinItems_mode extends MinItemsType_mode,
		Items extends SchemaObject,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[],
		],
	>(
		options: array_options<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>,
	): Readonly<array_schema<
		ArrayMode,
		SpecifiedMode,
		UniqueItems_mode,
		MinItems_mode,
		Items,
		PrefixItems
	>> {
		const required: array_schema<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>['required'] = this.#generate_schema_definition_required(
			options,
		);

		const properties: array_schema<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>['properties'] = this.#generate_schema_definition_properties(
			options,
		);

		const result: array_schema<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		> = {
			type: 'object',
			additionalProperties: false,
			required,
			properties,
		};

		if (options.$defs) {
			result.$defs = options.$defs;
		}

		return Object.freeze(result);
	}

	static generate_type_definition<
		ArrayMode extends array_mode,
		SpecifiedMode extends specified_mode,
		UniqueItems_mode extends unique_items_mode,
		MinItems_mode extends MinItemsType_mode,
		Items extends SchemaObject,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[],
		],
	>(
		options: array_options<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>,
	): Readonly<array_type<
		ArrayMode,
		SpecifiedMode,
		UniqueItems_mode,
		MinItems_mode,
		Items,
		PrefixItems
	>> {
		let result: array_type<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>;

		if ('items' === options.array_mode) {
			if (options.items) {
				const sanity_check: array_type<
					'items',
					'specified',
					unique_items_mode,
					'optional',
					Items,
					[SchemaObject, ...SchemaObject[]]
				> = {
					type: 'array',
					items: options.items,
					uniqueItems: 'yes' === options.unique_items_mode,
				};

				if ('number' === typeof options.minItems) {
					sanity_check.minItems = options.minItems;
				}

				if ('number' === typeof options.maxItems) {
					sanity_check.maxItems = options.maxItems;
				}

				result = sanity_check as typeof result;
			} else {
				const sanity_check: array_type<
					'items',
					'unspecified',
					unique_items_mode,
					'optional',
					Items,
					[SchemaObject, ...SchemaObject[]]
				> = {
					type: 'array',
					items: {},
					uniqueItems: 'yes' === options.unique_items_mode,
				};

				if ('number' === typeof options.minItems) {
					sanity_check.minItems = options.minItems;
				}

				if ('number' === typeof options.maxItems) {
					sanity_check.maxItems = options.maxItems;
				}

				result = sanity_check as typeof result;
			}
		} else {
			let uniqueItems: array_type<
				'prefixItems',
				specified_mode,
				UniqueItems_mode,
				MinItemsType_mode,
				SchemaObject,
				PrefixItems
			>['uniqueItems'];

			if ('yes' === options.unique_items_mode) {
				const sanity_check: array_type<
					'prefixItems',
					specified_mode,
					'yes',
					MinItemsType_mode,
					SchemaObject,
					PrefixItems
				>['uniqueItems'] = true;

				uniqueItems = sanity_check as typeof uniqueItems;
			} else {
				const sanity_check: array_type<
					'prefixItems',
					specified_mode,
					'no',
					MinItemsType_mode,
					SchemaObject,
					PrefixItems
				>['uniqueItems'] = false;

				uniqueItems = sanity_check as typeof uniqueItems;
			}


			if (this.#is_specified_prefixItems_options(options)) {
				const sanity_check: array_type<
					'prefixItems',
					'specified',
					UniqueItems_mode,
					MinItemsType_mode,
					SchemaObject,
					PrefixItems
				> = {
					type: 'array',
					items: false,
					prefixItems: options.prefixItems,
					minItems: PositiveIntegerGuard(options.prefixItems.length),
					uniqueItems,
				};

				result = sanity_check as unknown as typeof result;
			} else {
				const sanity_check: array_type<
					'prefixItems',
					'unspecified',
					unique_items_mode,
					'optional',
					SchemaObject,
					PrefixItems
				> = {
					type: 'array',
					uniqueItems: 'yes' === options.unique_items_mode,
					items: {},
					minItems: PositiveIntegerGuard(1),
				};

				if (options.minItems) {
					sanity_check.minItems = options.minItems;
				}

				if ('number' === typeof options.maxItems) {
					sanity_check.maxItems = options.maxItems;
				}

				result = sanity_check as typeof result;
			}
		}

		if (options.$defs) {
			result.$defs = options.$defs;
		}

		return Object.freeze<array_type<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>>(result);
	}

	static #convert<
		ArrayMode extends array_mode,
		SpecifiedMode extends specified_mode,
		UniqueItems_mode extends unique_items_mode,
		MinItems_mode extends MinItemsType_mode,
		Items extends SchemaObject,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[],
		],
		N extends number = number,
	>(
		value: unknown,
		index: ReturnType<typeof PositiveIntegerOrZeroGuard<N>>,
		schema: array_type<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>,
		schema_parser: SchemaParser,
	): Expression {
		const sub_schema = ArrayType.maybe_add_$defs(
			schema,
			this.#sub_schema_for_value(
				index,
				schema,
			),
		);
		const ajv = schema_parser.share_ajv((ajv) => ajv);
		const validator = ajv.compile(sub_schema);

		const validates = validator(value);

		if (!validates) {
			throw new SchemaValidationError(
				'Supplied value not supported by index!',
				validator,
			);
		}

		const matched_type = Object.keys(sub_schema).length > 0
			? schema_parser.parse(
				sub_schema,
			)
			: schema_parser.parse_by_type(value);

		return matched_type.generate_typescript_data(
			value,
			schema_parser,
			sub_schema,
		);
	}

	static #generate_schema_definition_properties<
		ArrayMode extends array_mode,
		SpecifiedMode extends specified_mode,
		UniqueItems_mode extends unique_items_mode,
		MinItems_mode extends MinItemsType_mode,
		Items extends SchemaObject,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[],
		],
	>(
		options: array_options<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>,
	): array_schema<
		ArrayMode,
		SpecifiedMode,
		UniqueItems_mode,
		MinItems_mode,
		Items,
		PrefixItems
	>['properties'] {
		let result: array_schema<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>['properties'];

		if ('items' === options.array_mode) {
			const sanity_check: array_schema<
				'items',
				SpecifiedMode,
				UniqueItems_mode,
				MinItems_mode,
				Items,
				[SchemaObject, ...SchemaObject[]]
			>[
				'properties'
			] = this.#generate_schema_definition_properties_items(
				options as array_options<
					'items',
					SpecifiedMode,
					UniqueItems_mode,
					MinItems_mode,
					Items,
					[SchemaObject, ...SchemaObject[]]
				>,
			);

			result = sanity_check as typeof result;
		} else {
			const sanity_check: array_schema<
				'prefixItems',
				SpecifiedMode,
				UniqueItems_mode,
				MinItems_mode,
				Items,
				[SchemaObject, ...SchemaObject[]]
			>[
				'properties'
			] = this.#generate_schema_definition_properties_prefixItems(
				options as array_options<
					'prefixItems',
					SpecifiedMode,
					UniqueItems_mode,
					MinItems_mode,
					Items,
					[SchemaObject, ...SchemaObject[]]
				>,
			);

			result = sanity_check as typeof result;
		}

		return result;
	}

	static #generate_schema_definition_properties_base<
		UniqueItems_mode extends unique_items_mode,
	>(
		options: array_options<
			array_mode,
			specified_mode,
			UniqueItems_mode,
			MinItemsType_mode
		>,
	): Pick<
		array_schema<
			array_mode,
			specified_mode,
			UniqueItems_mode,
			MinItemsType_mode
		>['properties'],
		(
			| '$schema'
			| '$id'
			| '$defs'
			| 'type'
			| 'uniqueItems'
		)
	> {
		let base: Pick<
			array_schema<
				array_mode,
				specified_mode,
				UniqueItems_mode,
				MinItemsType_mode
			>['properties'],
			(
				| '$schema'
				| '$id'
				| '$defs'
				| 'type'
				| 'uniqueItems'
			)
		>;

		if ('yes' === options.unique_items_mode) {
			const sanity_check: Pick<
				array_schema<
					array_mode,
					specified_mode,
					'yes',
					MinItemsType_mode
				>['properties'],
				(
					| '$schema'
					| '$id'
					| 'type'
					| 'uniqueItems'
				)
			> = {
				$schema: {
					type: 'string',
					enum: [
						'https://json-schema.org/draft/2020-12/schema',
					],
				},
				$id: {
					type: 'string',
					minLength: 1,
				},
				type: {
					type: 'string',
					const: 'array',
				},
				uniqueItems: {
					type: 'boolean',
					const: true,
				},
			};

			base = sanity_check as typeof base;
		} else {
			const sanity_check: Pick<
				array_schema<
					array_mode,
					specified_mode,
					'no',
					MinItemsType_mode
				>['properties'],
				(
					| '$schema'
					| '$id'
					| 'type'
					| 'uniqueItems'
				)
			> = {
				$schema: {
					type: 'string',
					enum: [
						'https://json-schema.org/draft/2020-12/schema',
					],
				},
				$id: {
					type: 'string',
					minLength: 1,
				},
				type: {
					type: 'string',
					const: 'array',
				},
				uniqueItems: {
					type: 'boolean',
					const: false,
				},
			};

			base = sanity_check as typeof base;
		}

		if (options.$defs) {
			base.$defs = {
				type: 'object',
				const: {
					...options.$defs,
				},
			};
		} else {
			base.$defs = $defs_schema.properties.$defs;
		}

		return base;
	}

	static #generate_schema_definition_properties_items<
		SpecifiedMode extends specified_mode,
		UniqueItems_mode extends unique_items_mode,
		MinItems_mode extends MinItemsType_mode,
		Items extends SchemaObject,
	>(
		options: array_options<
			'items',
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			[SchemaObject, ...SchemaObject[]]
		>,
	): Readonly<array_schema<
		'items',
		SpecifiedMode,
		UniqueItems_mode,
		MinItems_mode,
		Items,
		[SchemaObject, ...SchemaObject[]]
	>['properties']> {
		let result: array_schema<
			'items',
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			[SchemaObject, ...SchemaObject[]]
		>['properties'];

		const base = {
			...this.#generate_schema_definition_properties_base(options),
			minItems: {
				type: 'integer',
				minimum: 0,
			} as const,
			maxItems: {
				type: 'integer',
				minimum: 0,
			} as const,
		};

		if (options.items) {
			const sanity_check: array_schema<
				'items',
				'specified',
				UniqueItems_mode,
				MinItems_mode,
				Items,
				[SchemaObject, ...SchemaObject[]]
			>['properties'] = {
				...base,
				items: options.items,
			};

			result = sanity_check as typeof result;
		} else {
			const sanity_check: array_schema<
				'items',
				'unspecified',
				UniqueItems_mode,
				MinItems_mode,
				Items,
				[SchemaObject, ...SchemaObject[]]
			>['properties'] = {
				...base,
				items: {
					type: 'object',
					minProperties: 0,
				},
			};

			result = sanity_check as typeof result;
		}

		return Object.freeze(result);
	}

	static #generate_schema_definition_properties_prefixItems<
		SpecifiedMode extends specified_mode,
		UniqueItems_mode extends unique_items_mode,
		MinItems_mode extends MinItemsType_mode,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[],
		],
	>(
		options: array_options<
			'prefixItems',
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			SchemaObject,
			PrefixItems
		>,
	): array_schema<
		'prefixItems',
		SpecifiedMode,
		UniqueItems_mode,
		MinItems_mode,
		SchemaObject,
		PrefixItems
	>['properties'] {
		let result: array_schema<
			'prefixItems',
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			SchemaObject,
			PrefixItems
		>['properties'];

		const base = {
			...this.#generate_schema_definition_properties_base(options),
			minItems: {
				type: 'integer',
				minimum: 0,
			} as const,
			maxItems: {
				type: 'integer',
				minimum: 1,
			} as const,
		};

		if ('prefixItems' in options) {
			const sanity_check: array_schema<
				'prefixItems',
				'specified',
				UniqueItems_mode,
				MinItems_mode,
				SchemaObject,
				PrefixItems
			>['properties'] = {
				...base,
				items: {
					type: 'boolean',
					const: false,
				},
				prefixItems: {
					type: 'array',
					const: options.prefixItems,
				},
			};

			result = sanity_check as typeof result;
		} else {
			const sanity_check: array_schema<
				'prefixItems',
				'unspecified',
				UniqueItems_mode,
				MinItems_mode,
				SchemaObject & {},
				[SchemaObject, ...SchemaObject[]]
			>['properties'] = {
				...base,
				items: {
					type: 'boolean',
					const: false,
				},
				prefixItems: {
					type: 'array',
					minItems: 1,
					items: {
						type: 'object',
						minProperties: 1,
					},
				},
			};

			result = sanity_check as typeof result;
		}

		return result;
	}

	static #generate_schema_definition_required<
		ArrayMode extends array_mode,
		SpecifiedMode extends specified_mode,
		UniqueItems_mode extends unique_items_mode,
		MinItems_mode extends MinItemsType_mode,
		Items extends SchemaObject,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[],
		],
	>(
		options: array_options<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>,
	): array_schema<
		ArrayMode,
		SpecifiedMode,
		UniqueItems_mode,
		MinItems_mode,
		Items,
		PrefixItems
	>['required'] {
		let result: array_schema<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>['required'];

		if (this.#is_any_items_options(options)) {
			const sanity_check: array_schema<
				'items',
				SpecifiedMode
			>['required'] = this.#generate_schema_definition_required_items(
				options,
			);

			result = sanity_check as typeof result;
		} else {
			const sanity_check: array_schema<
				'prefixItems',
				SpecifiedMode
			>[
				'required'
			] = this.#generate_schema_definition_required_prefixItems<
				SpecifiedMode
			>(
				options as array_options<'prefixItems', SpecifiedMode>,
			);

			result = sanity_check as typeof result;
		}

		return result;
	}

	static #generate_schema_definition_required_items<
		SpecifiedMode extends specified_mode,
	>(
		options: array_options<
			'items'
		>,
	): array_schema<
		'items'
	>['required'] {
		let required: array_schema<
			'items',
			SpecifiedMode
		>['required'];

		if ('with' === options.min_items_mode) {
			if ('yes' === options.unique_items_mode) {
				const sanity_check: array_schema<
					'items',
					specified_mode,
					'yes',
					'with'
				>['required'] = [
					'type',
					'items',
					'minItems',
					'uniqueItems',
				];

				required = sanity_check as typeof required;
			} else {
				const sanity_check: array_schema<
					'items',
					specified_mode,
					'no',
					'with'
				>['required'] = [
					'type',
					'items',
					'minItems',
				];

				required = sanity_check as typeof required;
			}
		} else {
			if ('yes' === options.unique_items_mode) {
				const sanity_check: array_schema<
					'items',
					specified_mode,
					'yes',
					'optional'
				>['required'] = [
					'type',
					'items',
					'uniqueItems',
				];

				required = sanity_check as typeof required;
			} else {
				const sanity_check: array_schema<
					'items',
					specified_mode,
					'no',
					'optional'
				>['required'] = [
					'type',
					'items',
				];

				required = sanity_check as typeof required;
			}
		}

		return required;
	}

	static #generate_schema_definition_required_prefixItems<
		SpecifiedMode extends specified_mode,
	>(
		options: array_options<
			'prefixItems',
			SpecifiedMode
		>,
	): array_schema<
		'prefixItems',
		SpecifiedMode
	>['required'] {
		let required: array_schema<
			'prefixItems',
			SpecifiedMode
		>['required'];

		if ('specified' === options.specified_mode) {
			if ('yes' === options.unique_items_mode) {
				const sanity_check: array_schema<
					'prefixItems',
					'specified',
					'yes',
					MinItemsType_mode
				>['required'] = [
					'type',
					'items',
					'prefixItems',
					'uniqueItems',
				];

				required = sanity_check as typeof required;
			} else {
				const sanity_check: array_schema<
					'prefixItems',
					'specified',
					'no',
					MinItemsType_mode
				>['required'] = [
					'type',
					'items',
					'prefixItems',
				];

				required = sanity_check as typeof required;
			}
		} else {
			if ('yes' === options.unique_items_mode) {
				const sanity_check: array_schema<
					'prefixItems',
					'unspecified',
					'yes',
					MinItemsType_mode
				>['required'] = [
					'type',
					'items',
					'prefixItems',
					'uniqueItems',
				];

				required = sanity_check as typeof required;
			} else {
				const sanity_check: array_schema<
					'prefixItems',
					'unspecified',
					'no',
					MinItemsType_mode
				>['required'] = [
					'type',
					'items',
					'prefixItems',
				];

				required = sanity_check as typeof required;
			}
		}

		return required;
	}

	static async #generate_typescript_type_has_items<
		T1 extends unknown[],
		T2 extends TypeNode,
		T3 extends [T2, ...T2[]],
		ArrayMode extends array_mode,
		MinItems_mode extends MinItemsType_mode,
	>(
		data: T1,
		schema: (
			| array_type<
				'items'
			>
			| array_type<
				'prefixItems',
				'unspecified'
			>
		),
		schema_parser: SchemaParser,
	): Promise<{
		items: {
			with: TupleTypeNode<T2, T3>,
			optional: ArrayTypeNode<T2>,
		}[MinItems_mode],
		prefixItems: TupleTypeNode<T2, T3>,
	}[ArrayMode]> {
		let result = Promise<{
			items: {
				with: TupleTypeNode<T2, T3>,
				optional: ArrayTypeNode<T2>,
			}[MinItems_mode],
			prefixItems: TupleTypeNode<T2, T3>,
		}[ArrayMode]>;

		if (this.#is_type_with_minItems(schema)) {
			const sanity_check: Promise<
				TupleTypeNode<T2, T3>
			> = this.#generate_typescript_type_has_items_and_minItems(
				data,
				schema,
				schema_parser,
			);

			result = sanity_check as unknown as typeof result;
		} else {
			const sanity_check: Promise<
				ArrayTypeNode<T2>
			> = this.#generate_typescript_type_has_items_only(
				data,
				schema,
				schema_parser,
			);

			result = sanity_check as unknown as typeof result;
		}

		return result as unknown as Promise<{
			items: {
				with: TupleTypeNode<T2, T3>,
				optional: ArrayTypeNode<T2>,
			}[MinItems_mode],
			prefixItems: TupleTypeNode<T2, T3>,
		}[ArrayMode]>;
	}

	static async #generate_typescript_type_has_items_and_minItems<
		T1 extends unknown[],
		T2 extends TypeNode,
		T3 extends [T2, ...T2[]],
		SpecifiedMode extends specified_mode,
		UniqueItems_mode extends unique_items_mode,
		Items extends SchemaObject,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[],
		] = [
			SchemaObject,
			...SchemaObject[],
		],
	>(
		data: T1,
		schema: array_type<
			'items',
			SpecifiedMode,
			UniqueItems_mode,
			'with',
			Items,
			PrefixItems
		>,
		schema_parser: SchemaParser,
	): Promise<TupleTypeNode<T2, T3>> {
		const tuple_members: TypeNode[] = [];
		const sub_type = schema_parser.parse(ArrayType.maybe_add_$defs(
			schema,
			schema.items,
		));

		let i = 0;
		while (tuple_members.length < schema.minItems && i < data?.length) {
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
			factory.createArrayTypeNode(
				await sub_type.generate_typescript_type({
					data: schema.items,
					schema: schema.items,
					schema_parser,
				}),
			),
		));

		return factory.createTupleTypeNode<T2, T3>(tuple_members as T3);
	}

	static async #generate_typescript_type_has_items_only<
		T1 extends unknown[],
		T2 extends TypeNode,
		SpecifiedMode extends specified_mode,
		UniqueItems_mode extends unique_items_mode,
		Items extends SchemaObject,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[],
		] = [
			SchemaObject,
			...SchemaObject[],
		],
	>(
		data: T1,
		schema: array_type<
			'items',
			SpecifiedMode,
			UniqueItems_mode,
			'optional',
			Items,
			PrefixItems
		>,
		schema_parser: SchemaParser,
	): Promise<ArrayTypeNode<T2>> {
		if (0 === Object.keys(schema?.items || {}).length) {
			if (data.length < 0) {
				return factory.createArrayTypeNode(
					factory.createKeywordTypeNode(
						SyntaxKind.NeverKeyword,
					) as T2,
				);
			}

			return factory.createArrayTypeNode(
				factory.createUnionTypeNode(
					await Promise.all(
						data.map(
							(sub_data) => schema_parser
								.parse_by_type(sub_data)
								.generate_typescript_type({
									data: sub_data,
									schema: {},
									schema_parser,
								}),
						),
					),
				) as unknown as T2,
			);
		}

		const sub_type = schema_parser.parse(ArrayType.maybe_add_$defs(
			schema,
			schema.items,
		));

		return factory.createArrayTypeNode(
			await sub_type.generate_typescript_type({
				data: data,
				schema: schema.items,
				schema_parser,
			}) as T2,
		);
	}

	static async #generate_typescript_type_has_prefixItems<
		T1 extends unknown[],
		T2 extends TypeNode,
		T3 extends [T2, ...T2[]],
	>(
		data: T1|undefined,
		schema: array_type<
			'prefixItems',
			'specified'
		>,
		schema_parser: SchemaParser,
	): Promise<TupleTypeNode<T2, T3>> {
		if (undefined !== data && data.length !== schema.prefixItems.length) {
			throw new TypeError('Data does not match schema length!');
		}

		const tuple_members: TypeNode[] = [];

		let i = 0;
		for (const sub_schema of schema.prefixItems) {
			const maybe_modified = ArrayType.maybe_add_$defs(
				schema,
				sub_schema,
			);
			const sub_type = await schema_parser.parse(
				maybe_modified,
			).generate_typescript_type({
				data: undefined === data ? undefined : data[i],
				schema: maybe_modified,
				schema_parser,
			});

			++i;

			tuple_members.push(sub_type);
		}

		return factory.createTupleTypeNode<T2, T3>(tuple_members as T3);
	}

	static #is_any_items_options(
		options: array_options,
	): options is array_options<
		'items'
	> {
		return 'items' === options.array_mode;
	}

	static #is_type_with_minItems<
		SpecifiedMode extends specified_mode,
		UniqueItems_mode extends unique_items_mode,
		Items extends SchemaObject,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[],
		] = [
			SchemaObject,
			...SchemaObject[],
		],
	>(
		schema: array_type<
			'items',
			SpecifiedMode,
			UniqueItems_mode,
			MinItemsType_mode,
			Items,
			PrefixItems
		>,
	): schema is array_type<
		'items',
		SpecifiedMode,
		UniqueItems_mode,
		'with',
		Items,
		PrefixItems
	> {
		return 'minItems' in schema;
	}

	static #is_specified_prefixItems_options<
		UniqueItems_mode extends unique_items_mode,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[],
		],
	>(options: array_options<
		array_mode,
		specified_mode,
		UniqueItems_mode,
		MinItemsType_mode,
		SchemaObject,
		PrefixItems
	>): options is array_options<
		'prefixItems',
		'specified',
		UniqueItems_mode,
		MinItemsType_mode,
		SchemaObject,
		PrefixItems
	> {
		return (
			'prefixItems' === options.array_mode
			&& 'specified' === options.specified_mode
		);
	}

	static #is_items_type_schema(schema: array_type<
		array_mode,
		specified_mode
	>): schema is (
		| array_type<'items'>
		| array_type<'prefixItems', 'unspecified'>
	) {
		return !('prefixItems' in schema);
	}

	static #sub_schema_for_value<
		ArrayMode extends array_mode,
		SpecifiedMode extends specified_mode,
		UniqueItems_mode extends unique_items_mode,
		MinItems_mode extends MinItemsType_mode,
		Items extends SchemaObject,
		PrefixItems extends [
			SchemaObject,
			...SchemaObject[],
		],
		N extends number,
	>(
		index: ReturnType<typeof PositiveIntegerOrZeroGuard<N>>,
		schema: array_type<
			ArrayMode,
			SpecifiedMode,
			UniqueItems_mode,
			MinItems_mode,
			Items,
			PrefixItems
		>,
	): SchemaObject {
		if (
			'prefixItems' in schema
			&& undefined !== schema.prefixItems
			&& index < schema.prefixItems.length
		) {
			return schema.prefixItems[index];
		} else if (false !== schema.items) {
			return schema.items;
		}

		throw new TypeError('Invalid schema detected!');
	}
}

export type {
	array_mode,
	specified_mode,
	unique_items_mode,
	MinItemsType_mode,
	array_options,
	array_type,
	array_schema,
};

export {
	ArrayType,
};
