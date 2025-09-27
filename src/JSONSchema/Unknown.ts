import type {
	Expression,
	KeywordTypeNode,
} from 'typescript';
import {
	factory,
	SyntaxKind,
} from 'typescript';

import type {
	SchemaDefinitionDefinition,
	SchemalessTypeOptions,
} from './Type.ts';
import {
	Type,
} from './Type.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

export type unknown_type = {
	type: 'object',
	additionalProperties: false,
	maxProperties: 0,
};

type unknown_schema = SchemaDefinitionDefinition<
	readonly ['type', 'additionalProperties', 'maxProperties'],
	{
		type: {
			type: 'string',
			const: 'object',
		},
		additionalProperties: {
			type: 'boolean',
			const: false,
		},
		maxProperties: {
			type: 'integer',
			const: 0,
		},
	}
>;

export class Unknown extends Type<
	unknown,
	unknown_type,
	unknown_schema,
	KeywordTypeNode<SyntaxKind.UnknownKeyword>,
	Expression
> {
	constructor(options: SchemalessTypeOptions) {
		super({
			...options,
			schema_definition: Unknown.generate_default_schema_definition(),
			type_definition: Object.freeze({
				type: 'object',
				additionalProperties: false,
				maxProperties: 0,
			}),
		});
	}

	generate_typescript_data(
		data: unknown,
		schema_parser: SchemaParser,
		schema: unknown_type,
	): Expression {
		const maybe = schema_parser.parse_by_type<
			Exclude<Type<unknown>, Unknown>
		>(
			data,
			(maybe: unknown) => Type.is_a(maybe) && !Unknown.is_a(maybe),
		);

		return maybe.generate_typescript_data(data, schema_parser, schema);
	}

	generate_typescript_type() {
		return Promise.resolve(
			factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
		);
	}

	static generate_default_schema_definition() {
		return Object.freeze({
			type: 'object',
			required: ['type', 'additionalProperties', 'maxProperties'],
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
				maxProperties: {
					type: 'integer',
					const: 0,
				},
			},
		} as const);
	}
}
