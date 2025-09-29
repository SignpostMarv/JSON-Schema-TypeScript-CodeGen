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
	SchemaObject,
} from '../types.ts';

import type {
	LiteralTypeNode,
} from '../typescript-types.ts';

import {
	PositiveInteger,
} from '../guarded.ts';

import {
	type_reference_node,
} from '../coercions.ts';

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
>;

export type const_type<
	T extends string|undefined = undefined,
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
			},
		}
	)
>;

type const_generate_typescript_type<T extends string|undefined> = (
	T extends string
		? LiteralTypeNode<StringLiteral>
		: KeywordTypeNode<SyntaxKind.StringKeyword>
);

type MinLength_type<
	T extends number = number,
> = ReturnType<typeof PositiveInteger<T>>;

export type min_length_mode = 'required'|'optional';

export type non_empty_string_type<
	MinLength extends MinLength_type = MinLength_type,
> = {
	type: 'string',
	minLength: MinLength,
};

type non_empty_string_schema<
	Mode extends min_length_mode,
	MinLength extends MinLength_type = MinLength_type,
> = TypeDefinitionSchema<
	(
		& {
			type: 'object',
			required: ['type', 'minLength'],
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'string',
				},
				minLength: {
					required: {
						type: 'integer',
						const: MinLength,
					},
					optional: {
						type: 'integer',
						minimum: 1,
					},
				}[Mode],
			},
		}
	)
>;

abstract class BaseString<
	T extends string = string,
	TypeDefinition extends TypeDefinitionSchema = TypeDefinitionSchema,
	TypeDefinitionOptions extends (
		{[key: string]: unknown}
	) = (
		{[key: string]: unknown}
	),
	SchemaDefinition extends (
		SchemaDefinitionDefinition
	) = SchemaDefinitionDefinition,
	SchemaDefinitionOptions extends (
		{[key: string]: unknown}
	) = (
		{[key: string]: unknown}
	),
	SchemaTo extends TypeNode = TypeNode,
	DataTo extends Expression = Expression,
> extends
	Type<
		T,
		TypeDefinition,
		TypeDefinitionOptions,
		SchemaDefinition,
		SchemaDefinitionOptions,
		SchemaTo,
		DataTo
	> {
}

export class String<
	T extends string,
> extends
	BaseString<
		T,
		{type: 'string'},
		Record<string, never>,
		string_schema,
		Record<string, never>,
		KeywordTypeNode<SyntaxKind.StringKeyword>,
		StringLiteral
	> {
	constructor(options: SchemalessTypeOptions) {
		super({
			...options,
			schema_definition: {},
			type_definition: {},
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

	static generate_schema_definition() {
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

	static generate_type_definition(): Readonly<{type: 'string'}> {
		return Object.freeze({
			type: 'string',
		});
	}
}

export class ConstString<
	T extends string|undefined = undefined,
> extends
	BaseString<
		T extends string ? T : string,
		const_type<T>,
		{literal?: string},
		const_schema<T>,
		{literal?: string},
		const_generate_typescript_type<T>,
		StringLiteral
	> {
	constructor(
		literal: T,
		options: SchemalessTypeOptions,
	) {
		super({
			...options,
			schema_definition: {literal},
			type_definition: {literal},
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

	static generate_schema_definition<
		T extends string|undefined = undefined,
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

	static generate_type_definition<
		T extends string|undefined = undefined,
	>(
		{literal}: {literal?: string},
	): Readonly<const_type<T>> {
		const type_definition: Partial<const_type<string>> = {
			type: 'string',
		};
		if ('string' === typeof literal) {
			type_definition.const = literal;
		}
		const coerced: const_type<T> = type_definition as const_type<T>;

		return Object.freeze(coerced);
	}
}

export class NonEmptyString<
	Mode extends min_length_mode,
	T extends Exclude<string, ''> = Exclude<string, ''>,
> extends
	BaseString<
		T,
		non_empty_string_type<MinLength_type>,
		{
			required: {
				mode?: Mode,
				minLength: MinLength_type,
			},
			optional: {
				mode?: Mode,
			},
		}[Mode],
		non_empty_string_schema<Mode, MinLength_type>,
		{
			minLength?: MinLength_type,
		},
		TypeReferenceNode,
		StringLiteral
	> {
	constructor(
		specific_options: {
			required: {
				mode?: Mode,
				minLength: MinLength_type,
			},
			optional: {
				mode?: Mode,
			},
		}[Mode],
		options: SchemalessTypeOptions,
	) {
		const minLength = 'minLength' in specific_options
			? specific_options.minLength
			: undefined;

		super({
			...options,
			schema_definition: {minLength},
			type_definition: specific_options,
		});
	}

	generate_typescript_data(data: string) {
		return factory.createStringLiteral(data);
	}

	generate_typescript_type(): Promise<TypeReferenceNode> {
		return Promise.resolve(type_reference_node(
			'Exclude',
			[
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createLiteralTypeNode(factory.createStringLiteral('')),
			],
		));
	}

	static generate_schema_definition<
		Mode extends min_length_mode,
	>({
		minLength,
	}: {
		minLength?: MinLength_type,
	}) {
		const properties:(
			Partial<
				non_empty_string_schema<min_length_mode>['properties']
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
			properties as non_empty_string_schema<Mode>['properties']
		);

		return Object.freeze<non_empty_string_schema<Mode>>({
			type: 'object',
			required: ['type', 'minLength'],
			additionalProperties: false,
			properties: coerced,
		});
	}

	static generate_type_definition<
		Mode extends min_length_mode,
	>(
		specific_options: {
			required: {
				mode?: Mode,
				minLength: MinLength_type,
			},
			optional: {
				mode?: Mode,
			},
		}[Mode],
	): Readonly<non_empty_string_type<MinLength_type>> {
		const minLength = 'minLength' in specific_options
			? specific_options.minLength
			: undefined;
		const type_definition: non_empty_string_type<MinLength_type> = {
			type: 'string',
			minLength: minLength || PositiveInteger(1),
		};

		return Object.freeze(type_definition);
	}
}
