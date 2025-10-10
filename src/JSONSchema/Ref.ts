import type {
	Expression,
} from 'typescript';

import {
	object_has_property,
	property_exists_on_object,
	value_is_non_array_object,
} from '@satisfactory-dev/predicates.ts';

import type {
	SchemaDefinitionDefinition,
	SchemalessTypeOptions,
} from './Type.ts';
import {
	Type,
} from './Type.ts';

import type {
	$defs_schema,
} from './types';

import type {
	adjust_name_callback,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../coercions.ts';
import {
	adjust_name_default,
	adjust_name_finisher,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../coercions.ts';

import type {
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../SchemaParser.ts';

import type {
	ObjectOfSchemas,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../types.ts';

import {
	factory,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/factory.ts';

import type {
	TypeReferenceNode,
} from '../typescript/types';

type $ref_mode = 'either'|'external'|'local';

type $ref_value_by_mode<
	RefMode extends $ref_mode,
> = {
	either: (ExternalRef|LocalRef),
	external: ExternalRef,
	local: LocalRef,
}[RefMode];

type LocalRef<T extends string = string> = `#/$defs/${T}`;

type ExternalRef<
	$ID extends string = string,
	Local extends string = string,
> = `${$ID}${LocalRef<Local>}`;

type ref_identifier = '(.+)';

type pattern_either = `^${ref_identifier}?#\\/\\$defs\\/${ref_identifier}$`;
type pattern_external = `^${ref_identifier}#\\/\\$defs\\/${ref_identifier}$`;
type pattern_local = `^#\\/\\$defs\\/${ref_identifier}$`;
const pattern_either: pattern_either = (
	'^(.+)?#\\/\\$defs\\/(.+)$'
);
const pattern_external: pattern_external = (
	'^(.+)#\\/\\$defs\\/(.+)$'
);
const pattern_local: pattern_local = (
	'^#\\/\\$defs\\/(.+)$'
);
const regexp_either = new RegExp(pattern_either);

type $ref_type = {
	$defs?: ObjectOfSchemas,
	$ref: LocalRef|ExternalRef,
};

type $ref_schema = SchemaDefinitionDefinition<
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
				$defs: $defs_schema['$defs'],
				$ref: {
					oneOf: [
						{
							type: 'object',
							const: {
								type: 'string',
								pattern: pattern_either,
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
									pattern: pattern_either,
								},
							},
						},
					],
				},
			},
		},
	}
>;

class $ref extends
	Type<
		$ref_type,
		$ref_type,
		Record<string, unknown>,
		$ref_schema,
		Record<string, unknown>,
		TypeReferenceNode,
		Expression
	> {
	readonly #adjust_name: adjust_name_callback;

	readonly needs_import: Set<string>;

	readonly remote_defs: (
		| {[key: string]: ObjectOfSchemas}
		| Record<string, never>
	) = {};

	constructor(
		{
			adjust_name,
		}: {
			adjust_name?: adjust_name_callback,
		},
		options: SchemalessTypeOptions,
	) {
		super({
			...options,
			schema_definition: {},
			type_definition: {},
		});

		this.#adjust_name = adjust_name || adjust_name_default;
		this.needs_import = new Set();
	}

	generate_typescript_data(
		data: unknown,
		schema_parser: SchemaParser,
		schema: $ref_type,
	): Expression {
		if (
			!object_has_property(schema, '$defs')
			|| undefined === schema.$defs
		) {
			throw new TypeError('No $defs specified!');
		}

		return schema_parser.parse_by_type<Type<unknown>>(
			data,
			(maybe): maybe is Type<unknown> => Type.is_a(maybe),
		).generate_typescript_data(
			data,
			schema_parser,
			this.resolve_def(schema, schema.$defs),
		);
	}

	generate_typescript_type({
		schema: {
			$ref,
		},
	}: {
		schema: $ref_type,
	}): Promise<TypeReferenceNode> {
		const name = adjust_name_finisher(
			$ref.replace(
				/^#\/\$defs\//,
				'',
			).replace(
				'#/$defs/',
				'_',
			),
			this.#adjust_name,
		);

		this.needs_import.add(name);

		return Promise.resolve(factory.createTypeReferenceNode(
			name,
		));
	}

	resolve_def(
		{
			$ref,
		}: $ref_type,
		local_$defs: ObjectOfSchemas,
	) {
		const match = regexp_either.exec($ref) as (
			| null
			| (
				| [string, undefined|string, string]
				| [string, string, string]
			)
		);

		if (null === match) {
			throw new TypeError(`Unsupported ref found: ${$ref}`);
		}

		const [, external_id, local_$def] = match;

		let $defs: ObjectOfSchemas = local_$defs;

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

	static generate_schema_definition(): Readonly<$ref_schema> {
		const schema: $ref_schema = {
			type: 'object',
			additionalProperties: false,
			required: [
				'type',
				'additionalProperties',
				'required',
				'properties',
			],
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
						$defs: {
							type: 'object',
							additionalProperties: {
								type: 'object',
							},
						},
						$ref: {
							oneOf: [
								{
									type: 'object',
									const: {
										type: 'string',
										pattern: pattern_either,
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
											pattern: pattern_either,
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

	static generate_type_definition(): Readonly<$ref_type> {
		const schema = {
			type: 'object',
			required: ['$ref'],
			additionalProperties: false,
			properties: {
				$defs: {
					type: 'object',
					additionalProperties: {
						type: 'object',
					},
				},
				$ref: {
					type: 'string',
					pattern: pattern_either,
				},
			},
		};

		return Object.freeze(schema) as unknown as Readonly<$ref_type>;
	}

	static is_supported_$ref(
		maybe: unknown,
	): maybe is $ref_type {
		return (
			value_is_non_array_object(maybe)
			&& object_has_property(maybe, '$ref')
			&& 'string' === typeof maybe.$ref
			&& regexp_either.test(maybe.$ref)
		);
	}

	static is_supported_$ref_value(
		maybe: unknown,
	): maybe is $ref_type['$ref'] {
		return (
			'string' === typeof maybe
			&& regexp_either.test(maybe)
		);
	}
}

export type {
	$ref_mode,
	$ref_value_by_mode,
	LocalRef,
	ExternalRef,
	$ref_type,
};

export {
	$ref,
};
