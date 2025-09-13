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
)

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
					type: 'string',
					pattern: pattern<RefType>,
				}
			}
		}
	}
}>;

export class $ref<
	Specific extends (undefined | ExternalRef | LocalRef),
	RefType extends (
		Specific extends undefined
			? (ExternalRef | LocalRef)
			: Exclude<Specific, undefined>
	) = (
		Specific extends undefined
			? (ExternalRef | LocalRef)
			: Exclude<Specific, undefined>
	),
> extends ConversionlessType<
	{$ref: RefType},
	$ref_type<RefType>,
	$ref_schema<RefType>,
	TypeReferenceNode
> {
	#adjust_name: adjust_name_callback;
	#required_as: (
		Specific extends undefined
			? undefined
			: Exclude<Specific, undefined>
	);

	constructor(
		{
			mode,
			adjust_name,
			required_as,
		}: (
			Specific extends undefined
				? {
					mode: $ref_mode<RefType>,
					adjust_name?: adjust_name_callback,
					required_as?: undefined,
				}
				: {
					mode: $ref_mode<RefType>,
					adjust_name?: adjust_name_callback,
					required_as: Exclude<Specific, undefined>,
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
			Specific extends undefined
				? undefined
				: Exclude<Specific, undefined>
		);
	}

	generate_typescript_type(options?: (
		Specific extends undefined
			? undefined
			: {
				data: {$ref: RefType},
			}
	)): Promise<TypeReferenceNode> {
		const $ref = (
			options
				? options.data.$ref
				: this.#required_as as Exclude<Specific, undefined>
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
		T extends (ExternalRef | LocalRef),
	>({mode}: {
		mode: (
			T extends (ExternalRef | LocalRef)
				? 'either'
				: (
					T extends ExternalRef
						? 'external'
						: 'local'
				)
		),
	}): Readonly<$ref_schema<T>> {
		return Object.freeze<$ref_schema<T>>({
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
							type: 'string',
							pattern: this.#pattern(mode),
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
		T extends (ExternalRef | LocalRef),
	>(
		mode: (
			T extends (ExternalRef | LocalRef)
				? 'either'
				: (
					T extends ExternalRef
						? 'external'
						: 'local'
				)
		),
	): pattern<T> {
		if ('either' === mode) {
			return pattern_either as pattern<T>;
		} else if ('external' === mode) {
			return pattern_external as pattern<T>;
		} else {
			return pattern_local as pattern<T>;
		}
	}

	static #type_definition<
		T extends (ExternalRef | LocalRef),
	>(
		mode: (
			T extends (ExternalRef | LocalRef)
				? 'either'
				: (
					T extends ExternalRef
						? 'external'
						: 'local'
				)
		),
	): Readonly<$ref_type<T>> {
		return Object.freeze<$ref_type<T>>({
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
