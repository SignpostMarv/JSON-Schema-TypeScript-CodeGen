import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

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
	SchemaDefinitionDefinition,
	SchemalessTypeOptions,
	TypeDefinitionSchema,
} from './Type.ts';

import {
	Type,
} from './Type.ts';

import type {
	LiteralTypeNode,
	PositiveInteger,
} from '../types.ts';

type string_schema<
	Schema extends SchemaObject = SchemaObject,
> = TypeDefinitionSchema<
	(
		& Schema
		& {
			type: 'object',
			required: ['type'],
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'string',
				},
			},
		}
	)
>

type const_type<
	T extends string|undefined = undefined
> = (
	T extends string
		? {
			type: 'string',
			const: T,
		}
		: {
			type: 'string',
		}
);

type const_schema<
	T extends string|undefined = undefined,
	Schema extends SchemaObject = SchemaObject,
> = TypeDefinitionSchema<
	(
		& Schema
		& {
			type: 'object',
			required: ['type', 'const'],
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'string',
				},
				const: (
					T extends Exclude<T, undefined>
						? {
							type: 'string',
							const: T,
						}
						: {
							type: 'string',
						}
				),
			}
		}
	)
>;

type const_generate_typescript_type<T extends string|undefined> = (
	T extends string
		? LiteralTypeNode<StringLiteral>
		: KeywordTypeNode<SyntaxKind.StringKeyword>
);

type non_empty_string_type<
	MinLength extends PositiveInteger|undefined = undefined
> = (
	MinLength extends PositiveInteger
		? {
			type: 'integer',
			const: MinLength,
		}
		: {
			type: 'integer',
			minimum: 1,
		}
);

type non_empty_string_schema<
	MinLength extends undefined|PositiveInteger = undefined|PositiveInteger,
	Schema extends SchemaObject = SchemaObject,
> = TypeDefinitionSchema<
	(
		& Schema
		& {
			type: 'object',
			required: ['type', 'minLength'],
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'string',
				},
				minLength: (
					MinLength extends number
						? {
							type: 'integer',
							const: MinLength,
						}
						: {
							type: 'integer',
							minimum: 1,
						}
				),
			}
		}
	)
>;

abstract class BaseString<
	T extends string = string,
	TypeDefinition extends TypeDefinitionSchema = TypeDefinitionSchema,
	SchemaDefinition extends (
		SchemaDefinitionDefinition
	) = SchemaDefinitionDefinition,
	SchemaTo extends TypeNode = TypeNode,
	DataTo extends Expression = Expression,
> extends Type<
	T,
	TypeDefinition,
	SchemaDefinition,
	SchemaTo,
	DataTo
> {
}

export class String<
	T extends string,
> extends BaseString<
	T,
	{type: 'string'},
	string_schema,
	KeywordTypeNode<SyntaxKind.StringKeyword>,
	StringLiteral
> {
	constructor(options: SchemalessTypeOptions) {
		super({
			...options,
			schema_definition: String.generate_default_schema_definition(),
			type_definition: Object.freeze({
				type: 'string',
			}),
		});
	}

	generate_typescript_data(data: string) {
		return factory.createStringLiteral(data);
	}

	generate_typescript_type() {
		return Promise.resolve(
			factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
		);
	}

	static generate_default_schema_definition() {
		return Object.freeze<string_schema>({
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
	T extends string ? T : string,
	const_type<T>,
	const_schema<T>,
	const_generate_typescript_type<T>,
	StringLiteral
> {
	constructor(
		literal: T,
		options: SchemalessTypeOptions,
	) {
		const type_definition:Partial<const_type<string>> = {
			type: 'string',
		};
		if ('string' === typeof literal) {
			type_definition.const = literal;
		}
		const coerced:const_type<T> = type_definition as const_type<T>;
		super({
			...options,
			schema_definition: ConstString.generate_default_schema_definition({
				literal,
			}),
			type_definition: Object.freeze(coerced),
		});
	}

	generate_typescript_data(data: string) {
		return factory.createStringLiteral(data);
	}

	generate_typescript_type({
		schema,
	}: {
		schema: const_type<T>,
	}): Promise<const_generate_typescript_type<T>> {
		if ('const' in schema) {
			return Promise.resolve(factory.createLiteralTypeNode(
				factory.createStringLiteral(schema.const),
			) as const_generate_typescript_type<T>);
		}

		return Promise.resolve(factory.createKeywordTypeNode(
			SyntaxKind.StringKeyword,
		) as const_generate_typescript_type<T>);
	}

	static generate_default_schema_definition<
		T extends string|undefined = undefined
	>({literal}: {literal: T}): Readonly<
		const_schema<T>
	> {
		const properties:(
			Partial<
				const_schema<
					| string
					| undefined
				>['properties']
			>
		) = {
			type: {
				type: 'string',
				const: 'string',
			},
		};
		if ('string' === typeof literal) {
			properties.const = {
				type: 'string',
				const: literal,
			};
		} else {
			properties.const = {
				type: 'string',
			};
		}

		const coerced = properties as const_schema<T>['properties'];

		return Object.freeze<const_schema<T>>({
			type: 'object',
			required: ['type', 'const'],
			additionalProperties: false,
			properties: coerced,
		});
	}
}

export class NonEmptyString<
	MinLength extends undefined|PositiveInteger = undefined|PositiveInteger,
	T extends Exclude<string, ''> = Exclude<string, ''>
> extends BaseString<
	T,
	non_empty_string_type<MinLength>,
	non_empty_string_schema<MinLength>,
	TypeReferenceNode,
	StringLiteral
> {
	constructor(
		minLength: MinLength,
		options: SchemalessTypeOptions,
	) {
		const type_definition:Partial<
			non_empty_string_type<undefined|PositiveInteger>
		> = {
			type: 'integer',
		};
		if (undefined !== minLength) {
			(
				type_definition as non_empty_string_type<PositiveInteger>
			).const = minLength;
		} else {
			(
				type_definition as non_empty_string_type<undefined>
			).minimum = 1;
		}
		super({
			...options,
			schema_definition: (
				NonEmptyString.generate_default_schema_definition<MinLength>({
					minLength,
				})
			),
			type_definition: (
				type_definition as non_empty_string_type<MinLength>
			),
		});
	}

	generate_typescript_data(data: string) {
		return factory.createStringLiteral(data);
	}

	generate_typescript_type(): Promise<TypeReferenceNode> {
		return Promise.resolve(factory.createTypeReferenceNode(
			'Exclude',
			[
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createLiteralTypeNode(factory.createStringLiteral('')),
			],
		));
	}

	static generate_default_schema_definition<
		MinLength extends undefined|PositiveInteger,
	> ({
		minLength,
	}: {
		minLength: MinLength,
	}) {
		const properties:(
			Partial<
				non_empty_string_schema<
					| PositiveInteger
					| undefined
				>['properties']
			>
		) = {
			type: {
				type: 'string',
				const: 'string',
			},
		};
		if (undefined !== minLength) {
			properties.minLength = {
				type: 'integer',
				const: minLength,
			};
		} else {
			properties.minLength = {
				type: 'integer',
				minimum: 1,
			};
		}

		const coerced = (
			properties as non_empty_string_schema<MinLength>['properties']
		);

		return Object.freeze<non_empty_string_schema<MinLength>>({
			type: 'object',
			required: ['type', 'minLength'],
			additionalProperties: false,
			properties: coerced,
		});
	}
}
