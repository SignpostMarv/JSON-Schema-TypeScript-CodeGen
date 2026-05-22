import type {
	NamedExports,
} from 'typescript';

import type {
	SchemaDefinitionDefinitionWith$defs,
	SchemalessTypeOptions,
} from './Type.ts';
import {
	Type,
} from './Type.ts';

import type {
	ObjectLiteralExpression,
} from '../typescript/types.ts';

import {
	factory,
} from '../typescript/factory.ts';

import type {
	ObjectOfSchemas,
} from '../types.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

import type {
	adjust_name_callback,
} from '../coercions.ts';
import {
	adjust_name_default,
	adjust_name_finisher,
} from '../coercions.ts';

import type {
	pattern_either,
} from './Ref.ts';


type $defs_type = {
	$schema?: 'https://json-schema.org/draft/2020-12/schema',
	$id?: Exclude<string, ''>,
	$defs: ObjectOfSchemas,
};

type $defs_schema_type_subtype = Readonly<{
	type: 'object',
	required: readonly ['type'],
	properties: {
		type: {
			type: 'string',
			minLength: 1,
		},
	},
}>;

type $defs_schema = Readonly<{
	type: 'object',
	additionalProperties: false,
	required: readonly ['$defs'],
	properties: {
		$schema: {
			type: 'string',
			enum: readonly [
				'https://json-schema.org/draft/2020-12/schema',
			],
		},
		$id: {
			type: 'string',
			minLength: 1,
		},
		$defs: (
			| {
				type: 'object',
				minProperties: 1,
				additionalProperties: {
					oneOf: readonly [
						$defs_schema_type_subtype,
						{
							type: 'object',
							additionalProperties: false,
							required: readonly ['allOf'],
							properties: {
								allOf: {
									type: 'array',
									minItems: 2,
									items: {
										oneOf: readonly [
											$defs_schema_type_subtype,
											{
												type: 'object',
												additionalProperties: false,
												required: readonly ['$ref'],
												properties: {
													$ref: {
														type: 'string',
														pattern: (
															pattern_either
														),
													},
												},
											},
										],
									},
								},
							},
						},
						{
							type: 'object',
							additionalProperties: false,
							required: readonly ['oneOf'],
							properties: {
								oneOf: {
									type: 'array',
									minItems: 2,
									items: {
										oneOf: readonly [
											$defs_schema_type_subtype,
											{
												type: 'object',
												additionalProperties: false,
												required: readonly ['$ref'],
												properties: {
													$ref: {
														type: 'string',
														pattern: (
															pattern_either
														),
													},
												},
											},
										],
									},
								},
							},
						},
					],
				},
			}
			| {
				type: 'object',
				const: ObjectOfSchemas,
			}
		),
	},
}>;

type $defs_schema_definition = SchemaDefinitionDefinitionWith$defs<
	$defs_schema['required'],
	Record<string, never>
>;

export type {
	$defs_schema,
	$defs_type,
};

export class $defs extends Type<
	unknown,
	$defs_type,
	$defs_type,
	$defs_schema_definition,
	Record<string, never>,
	NamedExports,
	ObjectLiteralExpression<[]>
> {
	readonly #adjust_name: adjust_name_callback;

	constructor(
		options: SchemalessTypeOptions,
		$defs: ObjectOfSchemas,
		{
			adjust_name,
		}: {
			adjust_name?: adjust_name_callback,
		},
	) {
		super({
			...options,
			schema_definition: {},
			type_definition: {
				$defs,
			},
		});

		this.#adjust_name = adjust_name || adjust_name_default;
	}

	generate_typescript_data(): ObjectLiteralExpression<[]> {
		return factory.createObjectLiteralExpression([]);
	}

	generate_typescript_type({
		schema: {
			$defs,
		},
	}: {
		schema: $defs_type,
		schema_parser: SchemaParser,
	}): Promise<NamedExports> {
		const types = Object.keys($defs).map(
			(name) => {
				return factory.createExportSpecifier(
					true,
					undefined,
					adjust_name_finisher(
						name,
						this.#adjust_name,
					),
				);
			},
		);

		return Promise.resolve(factory.createNamedExports(types));
	}

	static generate_schema_definition(): Readonly<$defs_schema> {
		const pattern_either_value = '^(.+)?#\\/\\$defs\\/(.+)$';

		const non_empty_string: $defs_schema_type_subtype = Object.freeze({
			type: 'object',
			required: ['type'] as const,
			properties: {
				type: Object.freeze({
					type: 'string',
					minLength: 1,
				}),
			},
		});

		const allOf = Object.freeze({
			type: 'object',
			additionalProperties: false,
			required: ['allOf'] as const,
			properties: {
				allOf: Object.freeze({
					type: 'array',
					minItems: 2,
					items: {
						oneOf: [
							{
								type: 'object',
								required: ['type'] as const,
								properties: {
									type: {
										type: 'string',
										minLength: 1,
									},
								},
							},
							{
								type: 'object',
								additionalProperties: false,
								required: ['$ref'] as const,
								properties: {
									$ref: {
										type: 'string',
										pattern: pattern_either_value,
									},
								},
							},
						] as const,
					},
				}),
			},
		});

		const oneOf = Object.freeze({
			type: 'object',
			additionalProperties: false,
			required: ['oneOf'] as const,
			properties: {
				oneOf: Object.freeze({
					type: 'array',
					minItems: 2,
					items: {
						oneOf: [
							{
								type: 'object',
								required: ['type'] as const,
								properties: {
									type: {
										type: 'string',
										minLength: 1,
									},
								},
							},
							{
								type: 'object',
								additionalProperties: false,
								required: ['$ref'] as const,
								properties: {
									$ref: {
										type: 'string',
										pattern: (
											pattern_either_value
										),
									},
								},
							},
						] as const,
					},
				}),
			},
		});

		const result: $defs_schema = {
			type: 'object',
			additionalProperties: false,
			required: ['$defs'] as const,
			properties: {
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
				$defs: {
					type: 'object',
					minProperties: 1,
					additionalProperties: {
						oneOf: [
							non_empty_string,
							allOf,
							oneOf,
						] as const,
					},
				},
			},
		};

		return Object.freeze(result);
	}

	static generate_type_definition({
		$defs,
	}: {
		$defs: ObjectOfSchemas,
	}): Readonly<$defs_type> {
		return Object.freeze({
			$defs,
		});
	}
}
