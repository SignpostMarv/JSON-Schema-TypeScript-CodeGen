import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
	OmitFromTupleish,
} from '../../types.ts';

import type {
	SchemaDefinitionDefinition,
	TypeDefinitionSchema,
	TypeOptions,
} from '../Type.ts';

import type {
	$defs_mode,
	$defs_schema,
	DefsType_by_mode,
} from '../types.ts';

import type {
	PositiveInteger,
	PositiveIntegerOrZero,
} from '../../guarded.ts';

export type ItemsType = undefined|SchemaObject;
export type PrefixItemsType = undefined|[SchemaObject, ...SchemaObject[]];

export type array_mode = 'both'|'items-only'|'prefix-only';

export type ItemsType_by_mode<
	T extends SchemaObject = SchemaObject,
> = {
	both: T,
	'items-only': T,
	'prefix-only': undefined|false,
};

export type PrefixItemsType_by_mode<
	T extends [
		SchemaObject,
		...SchemaObject[]
	] = [
		SchemaObject,
		...SchemaObject[]
	],
> = {
	both: T,
	'items-only': undefined,
	'prefix-only': T,
};

export type unique_items_mode = 'yes'|'no';
export type UniqueItemsType_by_mode<
	Mode extends unique_items_mode,
> = {
	yes: true,
	no: false,
}[Mode];

export type MinItemsType_by_mode = {
	required: ReturnType<typeof PositiveIntegerOrZero<number>>,
	optional: undefined|ReturnType<typeof PositiveIntegerOrZero<number>>,
	excluded: undefined,
};

export type MaxItemsType_by_mode = {
	required: ReturnType<typeof PositiveInteger<number>>,
	optional: undefined|ReturnType<typeof PositiveInteger<number>>,
	excluded: undefined,
};

export type MinItemsType_mode = 'required'|'optional'|'excluded';
export type MaxItemsType_mode = MinItemsType_mode;

export type array_type_alt<
	DefsMode extends $defs_mode,
	ArrayMode extends array_mode,
	MinItems_mode extends MinItemsType_mode,
	MaxItems_mode extends MaxItemsType_mode,
	UniqueItems_mode extends unique_items_mode = unique_items_mode,
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
> = (
	& {
		with: {
			$defs: Defs,
		},
		without: {
			$defs?: undefined,
		},
		optional: {
			$defs?: Defs,
		},
	}[DefsMode]
	& {
		type: 'array',
	}
	& {
		required: {
			minItems: MinItems,
		},
		excluded: {
			minItems?: undefined,
		},
		optional: {
			minItems?: MinItems,
		}
	}[MinItems_mode]
	& {
		required: {
			maxItems: MaxItems,
		},
		excluded: {
			maxItems?: undefined,
		},
		optional: {
			maxItems?: MaxItems,
		}
	}[MaxItems_mode]
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
			items: Items,
			prefixItems: PrefixItems,
		},
		'items-only': {
			items: Exclude<Items, false>,
			prefixItems?: undefined,
		},
		'prefix-only': {
			items?: false,
			prefixItems: PrefixItems,
		},
	}[ArrayMode]
);

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
		maxItems: {
			type: 'integer',
			minimum: 1,
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
	},
	optional: array_schema_structured['with'],
}

export type array_schema<
	DefsMode extends $defs_mode,
	MinItems_mode extends MinItemsType_mode,
	ArrayMode extends array_mode,
> = array_schema_structured[
	DefsMode
][
	ArrayMode
][
	MinItems_mode
];

export type ArrayUncertain_options<
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
