import type {
	PropertySignature,
} from 'typescript';

import type {
	$defs_schema_type,
	SchemaDefinitionDefinitionWith$defs,
	SchemalessTypeOptions,
} from './Type.ts';
import {
	$defs_schema,
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

type $defs_schema_definition = SchemaDefinitionDefinitionWith$defs<
	$defs_schema_type['required'],
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

	generate_typescript_type({
		schema: {
			$defs,
		},
	}: {
		schema: $defs_type,
		schema_parser: SchemaParser,
	}): Promise<TypeLiteralNode<PropertySignature>> {
		const types = Object.keys($defs).map(
			(name) => {
				return factory.createPropertySignature(
					undefined,
					name,
					undefined,
					undefined,
				);
			},
		);

		return Promise.resolve(factory.createTypeLiteralNode(types));
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
