import {
	object_has_property,
	property_exists_on_object,
	value_is_non_array_object,
} from '@satisfactory-dev/predicates.ts';

import type {
	SchemaDefinitionDefinition,
	SchemalessTypeOptions,
	Type,
} from './Type.ts';
import {
	ConversionlessType,
} from './Type.ts';

import type {
	adjust_name_callback,
} from '../coercions.ts';
import {
	adjust_name_default,
	adjust_name_finisher,
	type_reference_node,
} from '../coercions.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

import type {
	ObjectOfSchemas,
	SchemaObject,
	TypeReferenceNode,
} from '../types.ts';

export type $ref_mode = 'either'|'external'|'local';

export type $ref_value_by_mode<
	RefMode extends $ref_mode,
> = {
	either: (ExternalRef|LocalRef),
	external: ExternalRef,
	local: LocalRef,
}[RefMode];

export type $def = (
	& string
	& {
		_$def_guard: never,
	}
);

export type LocalRef<T extends $def = $def> = `#/$defs/${T}`;

export type ExternalRef<
	$ID extends $def = $def,
	Local extends $def = $def,
> = `${$ID}${LocalRef<Local>}`;

type ref_identifier = '([a-zA-Z0-9][a-zA-Z0-9._-]*)';

type pattern<
	RefMode extends $ref_mode,
> = {
	either: pattern_either,
	external: pattern_external,
	local: pattern_local,
}[RefMode];
type pattern_either = `^${ref_identifier}?#\\/\\$defs\\/${ref_identifier}$`;
type pattern_external = `^${ref_identifier}#\\/\\$defs\\/${ref_identifier}$`;
type pattern_local = `^#\\/\\$defs\\/${ref_identifier}$`;
const sub_pattern: `^${ref_identifier}$` = '^([a-zA-Z0-9][a-zA-Z0-9._-]*)$';
const pattern_either: pattern_either = (
	'^([a-zA-Z0-9][a-zA-Z0-9._-]*)?#\\/\\$defs\\/([a-zA-Z0-9][a-zA-Z0-9._-]*)$'
);
const pattern_external: pattern_external = (
	'^([a-zA-Z0-9][a-zA-Z0-9._-]*)#\\/\\$defs\\/([a-zA-Z0-9][a-zA-Z0-9._-]*)$'
);
const pattern_local: pattern_local = (
	'^#\\/\\$defs\\/([a-zA-Z0-9][a-zA-Z0-9._-]*)$'
);
const regexp_sub = new RegExp(sub_pattern);
const regexp_either = new RegExp(pattern_either);
const regexp_external = new RegExp(pattern_external);
const regexp_local = new RegExp(pattern_local);

type $ref_type<
	RefMode extends $ref_mode,
> = {
	type: 'object',
	additionalProperties: false,
	required: ['$ref'],
	properties: {
		$ref: (
			| {
				type: 'string',
				pattern: pattern<RefMode>,
			}
			| {
				type: 'string',
				const: $ref_value_by_mode<RefMode>,
			}
		),
		$defs: {
			type: 'object',
			additionalProperties: {
				type: 'object',
			},
		},
	},
};

type $ref_schema<
	RefMode extends $ref_mode,
> = SchemaDefinitionDefinition<
	['type', 'additionalProperties', 'required', 'properties'],
	{
		type: {
			type: 'string',
			const: 'object',
		},
		additionalProperties: {
			type: 'boolean',
			const: false,
		},
		required: {
			type: 'array',
			const: ['$ref'],
		},
		properties: {
			type: 'object',
			required: ['$ref'],
			additionalProperties: false,
			properties: {
				$ref: {
					oneOf: [
						{
							type: 'object',
							const: {
								type: 'string',
								pattern: pattern<RefMode>,
							},
						},
						{
							type: 'object',
							required: ['type', 'const'],
							additionalProperties: false,
							properties: {
								type: {
									type: 'string',
									const: 'string',
								},
								const: {
									type: 'string',
									pattern: pattern<RefMode>,
								},
							},
						},
					],
				},
			},
		},
	}
>;

export class $ref<
	RefMode extends $ref_mode = 'either',
	Value extends $ref_value_by_mode<RefMode> = $ref_value_by_mode<RefMode>,
	T extends (
		{$ref: Value, $defs?: ObjectOfSchemas}
	) = (
		{$ref: Value, $defs?: ObjectOfSchemas}
	),
> extends
	ConversionlessType<
		T,
		$ref_type<RefMode>,
		$ref_schema<RefMode>,
		TypeReferenceNode
	> {
	readonly #adjust_name: adjust_name_callback;

	readonly $ref_mode: RefMode;

	readonly remote_defs: (
		| {[key: string]: {[key: $def]: SchemaObject}}
		| Record<string, never>
	) = {};

	constructor(
		{
			adjust_name,
			$ref_mode,
		}: {
			$ref_mode: RefMode,
			adjust_name?: adjust_name_callback,
		},
		options: SchemalessTypeOptions,
	) {
		super({
			...options,
			schema_definition: $ref.generate_default_schema_definition({
				$ref_mode,
			}),
			type_definition: $ref.#type_definition($ref_mode),
		});

		this.$ref_mode = $ref_mode;
		this.#adjust_name = adjust_name || adjust_name_default;
	}

	generate_typescript_type(
		{
			data: {
				$ref,
			},
		}: {
			data: T,
		},
	): Promise<TypeReferenceNode> {
		return Promise.resolve(type_reference_node(
			adjust_name_finisher(
				$ref.replace(
					/^#\/\$defs\//,
					'',
				).replace(
					'#/$defs/',
					'_',
				),
				this.#adjust_name,
			),
		));
	}

	resolve_def(
		{
			$ref,
		}: { $ref: Value },
		local_$defs: {[key: $def]: SchemaObject},
	) {
		let external_id: string|undefined;
		let local_$def: string;

		type match<Ref extends $ref_mode> = {
			either: (
				| [string, undefined|$def, $def]
				| [string, $def, $def]
			),
			external: [string, $def, $def],
			local: [string, $def],
		}[Ref];

		let match: null|match<RefMode>;

		if ('either' === this.$ref_mode) {
			match = regexp_either.exec($ref) as (
				| null
				| match<RefMode>
			);
		} else if ('external' === this.$ref_mode) {
			match = regexp_external.exec($ref) as (
				| null
				| match<RefMode>
			);
		} else {
			match = regexp_local.exec($ref) as (
				| null
				| match<RefMode>
			);
		}

		if (null === match) {
			throw new TypeError(`Unsupported ref found: ${$ref}`);
		}

		if ('either' === this.$ref_mode) {
			[, external_id, local_$def] = match as match<'either'>;
		} else if ('external' === this.$ref_mode) {
			[, external_id, local_$def] = match as match<'external'>;
		} else {
			[, local_$def] = match as match<'local'>;
		}

		let $defs: {[key: $def]: SchemaObject} = local_$defs;

		if (undefined !== external_id) {
			if (
				!this.remote_defs
				|| !property_exists_on_object(this.remote_defs, external_id)
			) {
				throw new TypeError(
					`Could not find ${external_id} in this.remote_$defs`,
				);
			}

			$defs = this.remote_defs[external_id];
		}

		if (!property_exists_on_object($defs, local_$def)) {
			throw new TypeError(
				`Could not find ${local_$def} in local_$defs`,
			);
		}

		return $defs[local_$def];
	}

	resolve_ref<
		T extends 'yes'|'no',
	>(
		has_$ref: { $ref: Value },
		local_$defs: {[key: $def]: SchemaObject},
		schema_parser: SchemaParser,
		require_conversion?: T,
	): {
		yes: Type<unknown>,
		no: ConversionlessType<unknown>,
	}[T] {
		return schema_parser.parse<T>(
			this.resolve_def(
				has_$ref,
				local_$defs,
			),
			require_conversion,
		);
	}

	static generate_default_schema_definition<
		RefMode extends $ref_mode,
	>({
		$ref_mode,
	}: {
		$ref_mode: RefMode,
	}): Readonly<$ref_schema<RefMode>> {
		const schema: $ref_schema<RefMode> = {
			type: 'object',
			required: [
				'type',
				'additionalProperties',
				'required',
				'properties',
			],
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'object',
				},
				additionalProperties: {
					type: 'boolean',
					const: false,
				},
				required: {
					type: 'array',
					const: ['$ref'],
				},
				properties: {
					type: 'object',
					required: ['$ref'],
					additionalProperties: false,
					properties: {
						$ref: {
							oneOf: [
								{
									type: 'object',
									const: {
										type: 'string',
										pattern: {
											either: pattern_either,
											external: pattern_external,
											local: pattern_local,
										}[$ref_mode],
									},
								},
								{
									type: 'object',
									required: [
										'type',
										'const',
									],
									additionalProperties: false,
									properties: {
										type: {
											type: 'string',
											const: 'string',
										},
										const: {
											type: 'string',
											pattern: {
												either: pattern_either,
												external: pattern_external,
												local: pattern_local,
											}[$ref_mode],
										},
									},
								},
							],
						},
					},
				},
			},
		};

		return Object.freeze(schema);
	}

	static get_defs(
		schema: (
			& SchemaObject
			& {
				$defs?: ObjectOfSchemas,
			}
		),
		sub_schema: SchemaObject,
	): {[key: $def]: SchemaObject} {
		let $defs: {[key: $def]: SchemaObject} = {};

		if (
			'$ref' in sub_schema
			&& '$defs' in schema
			&& schema.$defs
			&& !('$defs' in sub_schema)
		) {
			$defs = sub_schema.$defs = schema.$defs;
		} else if (
			property_exists_on_object(sub_schema, '$defs')
			&& undefined !== sub_schema.$defs
			&& $ref.is_supported_$defs(sub_schema.$defs)
		) {
			$defs = sub_schema.$defs;
		}

		return $defs;
	}

	static intercept_$ref<
		RequireConversion extends 'yes'|'$ref allowed',
	>(
		$defs: {[key: $def]: SchemaObject},
		sub_schema: SchemaObject,
		schema_parser: SchemaParser,
		require_conversion: RequireConversion & 'yes',
	): Type<unknown>;
	static intercept_$ref<
		RequireConversion extends 'yes'|'$ref allowed',
	>(
		$defs: {[key: $def]: SchemaObject},
		sub_schema: SchemaObject,
		schema_parser: SchemaParser,
		require_conversion: Exclude<RequireConversion, 'yes'>,
	): ConversionlessType<unknown>;
	static intercept_$ref<
		RequireConversion extends 'yes'|'$ref allowed',
	>(
		$defs: {[key: $def]: SchemaObject},
		sub_schema: SchemaObject,
		schema_parser: SchemaParser,
		require_conversion: RequireConversion,
	): ConversionlessType<unknown> {
		const maybe_$ref: (
			| undefined
			| ConversionlessType<unknown>
		) = schema_parser.maybe_parse_by_type<
			ConversionlessType<unknown>
		>(
			sub_schema,
			(
				maybe: unknown,
			): maybe is ConversionlessType<unknown> => {
				return $ref.is_a(maybe);
			},
		);

		if (maybe_$ref && '$ref allowed' === require_conversion) {
			return maybe_$ref;
		}

		const expect_convertible: {
			yes: 'yes',
			no: 'no',
			'$ref allowed': 'no',
		}[RequireConversion] = Object.freeze({
			yes: 'yes',
			no: 'no',
			'$ref allowed': 'no',
		})[require_conversion];

		return this.#intercept_$ref_early_exit_failed<
			typeof expect_convertible
		>(
			$defs,
			sub_schema,
			schema_parser,
			expect_convertible,
			maybe_$ref,
		);
	}

	static #intercept_$ref_early_exit_failed<
		RequireConversion extends 'yes'|'no',
	>(
		$defs: {[key: $def]: SchemaObject},
		sub_schema: SchemaObject,
		schema_parser: SchemaParser,
		require_conversion: RequireConversion,
		maybe_$ref: (
			| undefined
			| ConversionlessType<unknown>
		),
	) {
		let converter: (
			| undefined
			| ConversionlessType<unknown>
			| {
				yes: Type<unknown>,
				no: ConversionlessType<unknown>,
			}[RequireConversion]
		) = maybe_$ref;

		if (require_conversion) {
			if ($ref.is_a(maybe_$ref)) {
				converter = maybe_$ref.resolve_ref(
					sub_schema as {$ref: $ref_value_by_mode<$ref_mode>},
					$defs,
					schema_parser,
					'yes',
				);
			} else {
				maybe_$ref = undefined;
			}
		}

		if (undefined === converter) {
			// if we reach here either:
			// * we didn't get a $ref
			// * or we require conversion
			// if we require conversion, this won't be $ref
			// if we don't require conversion,
			//    this should've been caught by intercept_$ref
			converter = schema_parser.parse<RequireConversion>(
				sub_schema,
				require_conversion,
			);
		}

		return converter;
	}

	static is_a(maybe: unknown): maybe is $ref<$ref_mode> {
		return super.is_a(maybe);
	}

	static is_supported_$defs(
		maybe: {[key: string]: SchemaObject},
	): maybe is {[key: $def]: SchemaObject} {
		return Object.keys(maybe).every(
			(k) => regexp_sub.test(k),
		);
	}

	static is_supported_$ref<
		RefMode extends $ref_mode = 'either',
	>(
		maybe: unknown,
		$ref_mode?: RefMode,
	): maybe is {$ref: $ref_value_by_mode<RefMode>} {
		return (
			value_is_non_array_object(maybe)
			&& object_has_property(maybe, '$ref')
			&& 'string' === typeof maybe.$ref
			&& {
				either: regexp_either,
				external: regexp_external,
				local: regexp_local,
			}[$ref_mode || 'either'].test(maybe.$ref)
		);
	}

	static #type_definition<
		RefMode extends $ref_mode,
	>(
		$ref_mode: RefMode,
	): Readonly<$ref_type<RefMode>> {
		const schema: $ref_type<RefMode> = {
			type: 'object',
			additionalProperties: false,
			required: ['$ref'],
			properties: {
				$ref: {
					type: 'string',
					pattern: {
						either: pattern_either,
						external: pattern_external,
						local: pattern_local,
					}[$ref_mode],
				},
				$defs: {
					type: 'object',
					additionalProperties: {
						type: 'object',
					},
				},
			},
		};

		return Object.freeze(schema);
	}
}
