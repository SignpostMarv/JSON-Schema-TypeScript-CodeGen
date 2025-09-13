import type {
	TypeReferenceNode,
} from 'typescript';
import {
	factory,
} from 'typescript';

import type {
	SchemalessTypeOptions,
	TypeDefinitionSchema,
} from './Type.ts';

import {
	ConversionlessType,
} from './Type.ts';

import type {
	adjust_name_callback,
} from '../coercions.ts';
import {
	adjust_name_finisher,
} from '../coercions.ts';
import {
	adjust_name_default,
} from '../coercions.ts';

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

export type pattern<
	T extends (ExternalRef | LocalRef) = ExternalRef | LocalRef,
> = (
	T extends (ExternalRef | LocalRef)
		? pattern_either
		: (
			T extends ExternalRef
				? pattern_external
				: pattern_local
		)
);
export type pattern_either = `^${ref_identifier}?#\\/\\$defs\\/${ref_identifier}$`;
export type pattern_external = `^${ref_identifier}#\\/\\$defs\\/${ref_identifier}$`;
export type pattern_local = `^#\\/\\$defs\\/${ref_identifier}$`;
export const sub_pattern:`^${ref_identifier}$` = '^([a-zA-Z0-9][a-zA-Z0-9._-]*)$';
export const pattern_either:pattern_either = (
	'^([a-zA-Z0-9][a-zA-Z0-9._-]*)?#\\/\\$defs\\/([a-zA-Z0-9][a-zA-Z0-9._-]*)$'
);
export const pattern_external:pattern_external = (
	'^([a-zA-Z0-9][a-zA-Z0-9._-]*)#\\/\\$defs\\/([a-zA-Z0-9][a-zA-Z0-9._-]*)$'
);
export const pattern_local:pattern_local = (
	'^#\\/\\$defs\\/([a-zA-Z0-9][a-zA-Z0-9._-]*)$'
);
export const regexp_either = new RegExp(pattern_either);
export const regexp_external = new RegExp(pattern_external);
export const regexp_local = new RegExp(pattern_local);

export type $ref_mode_options = 'either'|'external'|'local';
type $specific_mode_options = 'neither'|Exclude<$ref_mode_options, 'either'>;

export type $ref_mode<
	RefType extends (ExternalRef | LocalRef) = ExternalRef | LocalRef,
> = (
	RefType extends (ExternalRef | LocalRef)
		? 'either'
		: (
			RefType extends ExternalRef
				? 'external'
				: 'local'
		)
);

type $ref_type_by_mode<
	RefMode extends $ref_mode_options
> = (
	RefMode extends 'either'
		? (ExternalRef | LocalRef)
		: (
			RefMode extends 'external'
				? ExternalRef
				: LocalRef
		)
);

type $ref_type<
	RefType extends (ExternalRef | LocalRef) = ExternalRef | LocalRef,
> = {
	type: 'object',
	required: ['$ref'],
	additionalProperties: false,
	properties: {
		$ref: {
			type: 'string',
			pattern: pattern<RefType>,
		},
	},
};

type $ref_schema<
	RefType extends (ExternalRef | LocalRef) = ExternalRef | LocalRef,
> = TypeDefinitionSchema<{
	type: 'object',
	required: [
		'type',
		'required',
		'additionalProperties',
		'properties',
	],
	additionalProperties: false,
	properties: {
		type: {
			type: 'string',
			const: 'object',
		},
		required: {
			type: 'array',
			const: ['$ref'],
		},
		additionalProperties: {
			type: 'boolean',
			const: false,
		},
		properties: {
			type: 'object',
			required: ['$ref'],
			additionalProperties: false,
			properties: {
				$ref: {
					type: 'object',
					required: ['type', 'pattern'],
					additionalProperties: false,
					properties: {
						type: {
							type: 'string',
							const: 'string',
						},
						pattern: {
							type: 'string',
							const: pattern<RefType>,
						},
					},
				}
			}
		}
	}
}>;

export class $ref<
	SpecificMode extends $specific_mode_options,
	RefMode extends (
		SpecificMode extends 'neither'
			? 'either'
			: SpecificMode
	) = (
		SpecificMode extends 'neither'
			? 'either'
			: SpecificMode
	),
> extends ConversionlessType<
	{$ref: $ref_type_by_mode<RefMode>},
	$ref_type<$ref_type_by_mode<RefMode>>,
	$ref_schema<$ref_type_by_mode<RefMode>>,
	TypeReferenceNode
> {
	#adjust_name: adjust_name_callback;
	#required_as: (
		SpecificMode extends 'neither'
			? (undefined|$ref_type_by_mode<RefMode>)
			: $ref_type_by_mode<RefMode>
	);

	constructor(
		{
			mode,
			adjust_name,
			required_as,
		}: (
			SpecificMode extends 'neither'
				? {
					mode: RefMode,
					adjust_name?: adjust_name_callback,
					required_as?: undefined|$ref_type_by_mode<RefMode>,
				}
				: {
					mode: RefMode,
					adjust_name?: adjust_name_callback,
					required_as: $ref_type_by_mode<RefMode>,
				}
		),
		options: SchemalessTypeOptions,
	) {
		super({
			...options,
			schema_definition: $ref.generate_default_schema_definition({
				mode,
			}),
			type_definition: $ref.#type_definition(mode),
		});
		this.#adjust_name = adjust_name || adjust_name_default;

		this.#required_as = required_as as (
			SpecificMode extends 'neither'
				? undefined
				: $ref_type_by_mode<RefMode>
		);
	}

	generate_typescript_type(options?: (
		SpecificMode extends 'neither'
			? (
				| undefined
				| {
					data: {$ref: $ref_type_by_mode<RefMode>},
				}
			)
			: {
				data: {$ref: $ref_type_by_mode<RefMode>},
			}
	)): Promise<TypeReferenceNode> {
		const $ref = (
			options
				? options.data.$ref
				: this.#required_as as $ref_type_by_mode<RefMode>
		);

		return Promise.resolve(factory.createTypeReferenceNode(
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

	static generate_default_schema_definition<
		RefMode extends $ref_mode_options,
	>({mode}: {
		mode: RefMode,
	}): Readonly<$ref_schema<$ref_type_by_mode<RefMode>>> {
		return Object.freeze<$ref_schema<$ref_type_by_mode<RefMode>>>({
			type: 'object',
			required: [
				'type',
				'required',
				'additionalProperties',
				'properties',
			],
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'object',
				},
				required: {
					type: 'array',
					const: ['$ref'],
				},
				additionalProperties: {
					type: 'boolean',
					const: false,
				},
				properties: {
					type: 'object',
					required: ['$ref'],
					additionalProperties: false,
					properties: {
						$ref: {
							type: 'object',
							required: ['type', 'pattern'],
							additionalProperties: false,
							properties: {
								type: {
									type: 'string',
									const: 'string',
								},
								pattern: {
									type: 'string',
									const: this.#pattern(mode),
								},
							},
						},
					},
				},
			},
		});
	}

	static is_$ref<
		RefMode = 'either' | 'external' | 'local',
	>(
		value: unknown,
		mode: RefMode,
	): value is (
		RefMode extends 'either'
			? (ExternalRef | LocalRef)
			: (
				RefMode extends 'external'
					? ExternalRef
					: LocalRef
			)
	) {
		return (
			'string' === typeof value
			&& (
				'either' === mode
					? regexp_either.test(value)
					: (
						'external' === mode
							? regexp_external.test(value)
							: regexp_local.test(value)
					)
			)
		);
	}

	static require_ref(
		value: string,
		mode: (
			| undefined
			| $ref_mode
		) = undefined,
	): (
		typeof mode extends undefined|'either'
			? (ExternalRef | LocalRef)
			: (
				typeof mode extends 'external'
					? ExternalRef
					: LocalRef
			)
	) {
		if (!this.is_$ref(value, mode || 'either')) {
			throw new TypeError(`value "${value}" is not a supported $ref string!`);
		}

		return value;
	}

	static #pattern<
		RefMode extends $ref_mode_options,
	>(
		mode: RefMode,
	): pattern<$ref_type_by_mode<RefMode>> {
		if ('either' === mode) {
			return pattern_either as pattern<$ref_type_by_mode<RefMode>>;
		} else if ('external' === mode) {
			return pattern_external as pattern<$ref_type_by_mode<RefMode>>;
		} else {
			return pattern_local as pattern<$ref_type_by_mode<RefMode>>;
		}
	}

	static #type_definition<
		RefMode extends $ref_mode_options,
	>(
		mode: RefMode,
	): Readonly<$ref_type<$ref_type_by_mode<RefMode>>> {
		return Object.freeze<$ref_type<$ref_type_by_mode<RefMode>>>({
			type: 'object',
			required: ['$ref'],
			additionalProperties: false,
			properties: {
				$ref: {
					type: 'string',
					pattern: this.#pattern(mode),
				},
			},
		});
	}
}
