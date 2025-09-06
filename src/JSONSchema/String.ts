import type {
	Expression,
	KeywordTypeNode,
	StringLiteral,
	TypeNode,
	TypeReferenceNode,
} from 'typescript';

import {
	SyntaxKind,
} from 'typescript';

import {
	factory,
} from 'typescript';

import type {
	ObjectOfSchemas,
	SchemaDefinition,
	SchemalessTypeOptions,
} from './Type.ts';

import {
	Type,
} from './Type.ts';

import type {
	LiteralTypeNode,
	PositiveInteger,
} from '../types.ts';

type string_schema_properties = (
	& {
		type: {
			type: 'string',
			const: 'string',
		},
	}
)

type string_schema<
	Required extends [string, ...string[]] = (
		| ['type']
		| ['type', ...string[]]
	),
	AdditionalProperties extends (
		| ObjectOfSchemas
		| undefined
	) = ObjectOfSchemas,
> = SchemaDefinition<
	Required,
	(
		AdditionalProperties extends undefined
			? string_schema_properties
			: (
				& AdditionalProperties
				& string_schema_properties
			)
	)
>;

type unspecified_const_schema = string_schema<['type', 'const'], {
	const: {
		type: 'string',
	},
}>;
type specified_const_schema<
	T extends string
> = string_schema<['type', 'const'], {
	const: {
		type: 'string',
		const: T,
	},
}>;

type non_empty_string_schema<
	MinLength extends PositiveInteger = PositiveInteger,
> = string_schema<['type', 'minLength'], {
	minLength: {
		type: 'integer',
		const: MinLength,
		minimum: 1,
	},
}>;

abstract class BaseString<
	TSType extends TypeNode,
	T extends string = string,
	Definition extends string_schema<
		['type'] | ['type', ...string[]]
	> = string_schema<
		['type', ...string[]]
	>,
	TSExpression extends Expression = Expression
> extends Type<
	T,
	Definition,
	TSType,
	TSExpression
> {

}

export class String extends BaseString<
	KeywordTypeNode<SyntaxKind.StringKeyword>,
	string,
	string_schema<['type'], undefined>,
	StringLiteral
> {
	constructor(options: SchemalessTypeOptions) {
		super({
			...options,
			schema_definition: String.schema_definition(),
		});
	}

	convert(data: string) {
		return factory.createStringLiteral(data);
	}

	generate_type() {
		return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
	}

	static schema_definition() {
		return Object.freeze<string_schema<['type'], undefined>>({
			type: 'object',
			required: ['type'],
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'string',
				},
			},
		});
	}
}

export class UnspecifiedConstString extends BaseString<
	KeywordTypeNode<SyntaxKind.StringKeyword>,
	string,
	unspecified_const_schema
> {
	constructor(options: SchemalessTypeOptions)
	{
		super({
			...options,
			schema_definition: UnspecifiedConstString.schema_definition(),
		})
	}

	convert(data: string): Expression {
		return factory.createStringLiteral(data);
	}

	generate_type() {
		return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
	}

	static schema_definition() {
		return Object.freeze<unspecified_const_schema>({
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
				},
			},
		});
	}
}

export class SpecifiedConstString<
	T extends string
> extends BaseString<
	LiteralTypeNode<StringLiteral>,
	T,
	specified_const_schema<T>
> {
	constructor(
		literal: T,
		options: SchemalessTypeOptions,
	) {
		super({
			...options,
			schema_definition: SpecifiedConstString.schema_definition({
				literal,
			}),
		})
	}

	convert(data: string): Expression {
		return factory.createStringLiteral(data);
	}

	generate_type(
		schema: specified_const_schema<T>,
	): LiteralTypeNode<StringLiteral> {
		return factory.createLiteralTypeNode(
			factory.createStringLiteral(schema.properties.const.const),
		) as LiteralTypeNode<StringLiteral>;
	}

	static schema_definition<T extends string>({literal}: {literal: T}) {
		return Object.freeze<specified_const_schema<T>>({
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
					const: literal,
				},
			},
		});
	}
}

export class NonEmptyString<
	MinLength extends PositiveInteger = PositiveInteger,
	T extends Exclude<string, ''> = Exclude<string, ''>
> extends BaseString<
	TypeReferenceNode,
	T,
	non_empty_string_schema<MinLength>
> {
	constructor(
		minLength: MinLength,
		options: SchemalessTypeOptions,
	) {
		super({
			...options,
			schema_definition: NonEmptyString.schema_definition<MinLength>({
				minLength,
			}),
		});
	}

	convert(data: string) {
		return factory.createStringLiteral(data);
	}

	generate_type(): TypeReferenceNode {
		return factory.createTypeReferenceNode(
			'Exclude',
			[
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createLiteralTypeNode(factory.createStringLiteral('')),
			],
		);
	}

	static schema_definition<
		T extends PositiveInteger,
	> ({
		minLength,
	}: {
		minLength: T,
	}) {
		return Object.freeze<non_empty_string_schema<T>>({
			type: 'object',
			required: ['type', 'minLength'],
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'string',
				},
				minLength: {
					type: 'integer',
					const: minLength,
					minimum: 1,
				},
			},
		});
	}
}
