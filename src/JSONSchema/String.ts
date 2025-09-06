import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
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
	Matches extends string_schema<
		['type'] | ['type', ...string[]]
	>,
	GeneratesFrom extends (
		& SchemaObject
		& {
			type: 'string',
		}
	),
	T extends string = string,
> extends Type<
	T,
	Matches,
	GeneratesFrom,
	TSType,
	StringLiteral
> {

}

export class String extends BaseString<
	KeywordTypeNode<SyntaxKind.StringKeyword>,
	string_schema<['type'], undefined>,
	{type: 'string'},
	string
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

export class ConstString<
	T extends string|undefined = undefined
> extends BaseString<
	LiteralTypeNode<StringLiteral>,
	T extends string ? specified_const_schema<T> : unspecified_const_schema,
	(
		T extends string
			? {type: 'string', const: T}
			: {type: 'string', const: string}
	),
	Exclude<T, undefined>
> {
	constructor(
		literal: T,
		options: SchemalessTypeOptions,
	) {
		super({
			...options,
			schema_definition: ConstString.schema_definition({
				literal,
			}),
		});
	}

	convert(data: string) {
		return factory.createStringLiteral(data);
	}

	generate_type(
		schema: (
			T extends string
				? {type: 'string', const: T}
				: {type: 'string', const: string}
		),
	): LiteralTypeNode<StringLiteral> {
		return factory.createLiteralTypeNode(
			factory.createStringLiteral(schema.const),
		) as LiteralTypeNode<StringLiteral>;
	}

	static schema_definition<
		T extends string|undefined = undefined
	>({literal}: {literal: T}): Readonly<
		T extends string
			? specified_const_schema<T & string>
			: unspecified_const_schema
	> {
		if ('string' === typeof literal) {
			const _const:T & string = literal;
			return Object.freeze<specified_const_schema<T & string>>({
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
						const: _const,
					},
				},
			}) as Readonly<
				T extends string
					? specified_const_schema<T & string>
					: unspecified_const_schema
			>;
		}

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
		}) as Readonly<
			T extends string
				? specified_const_schema<T & string>
				: unspecified_const_schema
		>;
	}
}

export class NonEmptyString<
	MinLength extends PositiveInteger = PositiveInteger,
	T extends Exclude<string, ''> = Exclude<string, ''>
> extends BaseString<
	TypeReferenceNode,
	non_empty_string_schema<MinLength>,
	{type: 'string', minLength: MinLength},
	T
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
