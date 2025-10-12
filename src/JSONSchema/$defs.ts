import type {
	PropertySignature,
} from 'typescript';

import type {
	SchemaDefinitionDefinition,
	SchemalessTypeOptions,
} from './Type.ts';
import {
	Type,
} from './Type.ts';

import type {
	ObjectLiteralExpression,
	TypeLiteralNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/types.ts';

import {
	factory,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/factory.ts';

import type {
	ObjectOfSchemas,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../types.ts';

import type {
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../SchemaParser.ts';


type $defs_type = {
	$schema?: 'https://json-schema.org/draft/2020-12/schema',
	$id?: Exclude<string, ''>,
	$defs: ObjectOfSchemas,
};

const $defs_schema = Object.freeze({
	type: 'object',
	additionalProperties: false,
	required: ['$defs'],
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
				type: 'object',
				required: ['type'],
				properties: {
					type: {
						type: 'string',
						minLength: 1,
					},
				},
			},
		},
	},
} as const);

type $defs_schema = SchemaDefinitionDefinition<
	typeof $defs_schema['required'],
	typeof $defs_schema['properties']
>;

export class $defs extends Type<
	unknown,
	$defs_type,
	$defs_type,
	$defs_schema,
	Record<string, never>,
	TypeLiteralNode<PropertySignature>,
	ObjectLiteralExpression<[]>
> {
	constructor(options: SchemalessTypeOptions, $defs: ObjectOfSchemas) {
		super({
			...options,
			schema_definition: {},
			type_definition: {
				$defs,
			},
		});
	}

	generate_typescript_data(): ObjectLiteralExpression<[]> {
		return factory.createObjectLiteralExpression([]);
	}

	async generate_typescript_type({
		schema: {
			$defs,
		},
		schema_parser,
	}: {
		schema: $defs_type,
		schema_parser: SchemaParser,
	}): Promise<TypeLiteralNode<PropertySignature>> {
		const types = await Promise.all(Object.entries($defs).map(
			async ([name, sub_schema]) => {
				const sub_type = await schema_parser.parse(
					sub_schema,
				).generate_typescript_type({
					schema: sub_schema,
					schema_parser,
				});

				return factory.createPropertySignature(
					undefined,
					name,
					undefined,
					sub_type,
				);
			},
		));

		return factory.createTypeLiteralNode(types);
	}

	static generate_schema_definition() {
		return $defs_schema;
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
