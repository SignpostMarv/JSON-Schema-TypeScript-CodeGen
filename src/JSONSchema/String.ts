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

type string_schema<
	Required extends [string, ...string[]] = (
		| ['type']
		| ['type', ...string[]]
	)
> = (
	& SchemaDefinition<'string', Required>
	& {
		properties: {
			type: (
				& SchemaDefinition['properties']['type']
				& {
					const: 'string',
				}
			),
		},
	}
);

type const_schema<T extends string|undefined = undefined> = (
	& string_schema<['type', 'const']>
	& {
		properties: {
			type: string_schema['properties']['type'],
			const: ( T extends undefined ? {
				type: 'string',
			} : {
				type: 'string',
				const: T,
			}),
		},
	}
);

type non_empty_string_schema<
	MinLength extends PositiveInteger = PositiveInteger,
> = (
	& string_schema<['type', 'minLength']>
	& {
		properties: {
			type: string_schema['properties']['type'],
			minLength: {
				type: 'integer',
				const: MinLength,
				minimum: 1,
			},
		}
	}
);

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
	string_schema<['type']>,
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
		return Object.freeze<string_schema<['type']>>({
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

export class ConstString<
	T extends string|undefined = undefined,
> extends BaseString<
	(
		| KeywordTypeNode<SyntaxKind.StringKeyword>
		| LiteralTypeNode<StringLiteral>
	),
	Exclude<T, undefined>,
	const_schema<T>
> {
	constructor(
		options: SchemalessTypeOptions,
		literal?: T,
	) {
		super({
			...options,
			schema_definition: ConstString.schema_definition<T>({literal}),
		});
	}

	convert(data: Exclude<T, undefined>) {
		return factory.createStringLiteral(data);
	}

	generate_type(schema: const_schema<T>|Readonly<const_schema<T>>) {
		if ('const' in schema.properties.const) {
			return factory.createLiteralTypeNode(
				factory.createStringLiteral(schema.properties.const.const),
			) as LiteralTypeNode<StringLiteral>;
		}

		return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
	}

	static schema_definition<T extends undefined|string>({
		literal,
	}: {
		literal?: T,
	}) {
		const _const = (
			undefined === literal
				? {type: 'string'}
				: {type: 'string', const: literal}
		) as const_schema<T>['properties']['const'];

		return Object.freeze<const_schema<T>>({
			type: 'object',
			required: ['type', 'const'],
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'string',
				},
				const: _const,
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
