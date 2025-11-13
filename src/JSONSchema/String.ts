import type {
	KeywordTypeNode,
} from 'typescript';

import {
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
	CallExpression,
	Identifier,
	LiteralTypeNode,
	StringLiteral,
	TypeReferenceNode,
	UnionTypeNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/types.ts';

import {
	PositiveIntegerGuard,
	PositiveIntegerOrZeroGuard,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../guarded.ts';

import {
	StringTupleToLiteralTypeNodeTuple,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/coercions.ts';

import {
	factory,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/factory.ts';

import type {
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../SchemaParser.ts';

type string_mode = 'basic'|'enum'|'pattern'|'non-empty'|'const';

type MinLength_type<
	T extends number = number,
> = ReturnType<typeof PositiveIntegerGuard<T>>;

type MinLengthOrZero_type<
	T extends number = number,
> = ReturnType<typeof PositiveIntegerOrZeroGuard<T>>;

type string_options<
	StringMode extends string_mode = string_mode,
	Enum extends [string, string, ...string[]]|never[] = never[],
	Pattern extends string|undefined = undefined,
	MinLength extends MinLength_type = MinLength_type<1>,
	Const extends string|undefined = string|undefined,
> = {
	basic: {
		string_mode: 'basic',
		minLength?: MinLengthOrZero_type<0>|MinLength,
	},
	enum: {
		string_mode: 'enum',
		enum: Enum,
	},
	pattern: {
		string_mode: 'pattern',
		pattern: Pattern,
	},
	'non-empty': {
		string_mode: 'non-empty',
		minLength: MinLength,
	},
	const: {
		string_mode: 'const',
		const: Const,
	},
}[StringMode];

type string_type<
	StringMode extends string_mode,
	Enum extends (
		| [string, string, ...string[]]
		| never[]
	) = (
		| [string, string, ...string[]]
		| never[]
	),
	Pattern extends string|undefined = undefined,
	MinLength extends MinLength_type = MinLength_type<1>,
	Const extends string|undefined = string|undefined,
> = {
	basic: {
		type: 'string',
		minLength?: MinLengthOrZero_type<0>|MinLength,
	},
	enum: Enum extends [string, string, ...string[]]
		? {
			type: 'string',
			enum: Enum,
		}
		: {
			type: 'string',
		},
	pattern: Pattern extends string
		? {
			type: 'string',
			pattern: Pattern,
		}
		: {
			type: 'string',
		},
	'non-empty': {
		type: 'string',
		minLength: MinLength,
	},
	const: Const extends undefined
		? {
			type: 'string',
		}
		: {
			type: 'string',
			const: Const,
		},
}[StringMode];

type basic_string_schema = SchemaDefinitionDefinition<
	['type'],
	{
		$defs: {
			type: 'object',
			additionalProperties: {
				type: 'object',
			},
		},
		type: {
			type: 'string',
			const: 'string',
		},
		minLength: {
			type: 'integer',
			const: ReturnType<typeof PositiveIntegerOrZeroGuard<0>>,
		},
	}
>;

type enum_string_schema<
	Enum extends [string, string, ...string[]]|never[] = never[],
> = SchemaDefinitionDefinition<
	['type', 'enum'],
	{
		$defs: {
			type: 'object',
			additionalProperties: {
				type: 'object',
			},
		},
		type: {
			type: 'string',
			const: 'string',
		},
		enum: (
			Enum extends [string, string, ...string[]]
				? {
					type: 'array',
					const: Enum,
				}
				: {
					type: 'array',
					minItems: 1,
					uniqueItems: true,
					items: {
						type: 'string',
					},
				}
		),
	}
>;

type pattern_string_schema<
	Pattern extends string|undefined = undefined,
> = SchemaDefinitionDefinition<
	['type', 'pattern'],
	{
		$defs: {
			type: 'object',
			additionalProperties: {
				type: 'object',
			},
		},
		type: {
			type: 'string',
			const: 'string',
		},
		pattern: (
			Pattern extends undefined
				? {
					type: 'string',
				}
				: {
					type: 'string',
					const: Pattern,
				}
		),
	}
>;

type non_empty_string_schema<
	MinLength extends MinLength_type = MinLength_type<1>,
> = SchemaDefinitionDefinition<
	['type', 'minLength'],
	{
		$defs: {
			type: 'object',
			additionalProperties: {
				type: 'object',
			},
		},
		type: {
			type: 'string',
			const: 'string',
		},
		minLength: {
			type: 'integer',
			const: MinLength,
		},
	}
>;

type const_string_schema<
	Const extends string|undefined = undefined,
> = SchemaDefinitionDefinition<
	['type'],
	{
		$defs: {
			type: 'object',
			additionalProperties: {
				type: 'object',
			},
		},
		type: {
			type: 'string',
			const: 'string',
		},
		const: (
			Const extends undefined
				? {
					type: 'string',
				}
				: {
					type: 'string',
					const: Const,
				}
		),
	}
>;

type base_string_schema<
	StringMode extends string_mode,
	Enum extends [string, string, ...string[]]|never[] = never[],
	Pattern extends string|undefined = undefined,
	MinLength extends MinLength_type = MinLength_type<1>,
	Const extends string|undefined = undefined,
> = {
	basic: basic_string_schema,
	enum: enum_string_schema<Enum>,
	pattern: pattern_string_schema<Pattern>,
	'non-empty': non_empty_string_schema<MinLength>,
	const: const_string_schema<Const>,
}[StringMode];

class BaseString<
	T extends string = string,
	StringMode extends string_mode = string_mode,
	Enum extends [string, string, ...string[]]|never[] = never[],
	Pattern extends string|undefined = undefined,
	MinLength extends MinLength_type = MinLength_type<1>,
	Const extends string|undefined = string|undefined,
> extends
	Type<
		T,
		string_type<
			StringMode,
			Enum,
			Pattern,
			MinLength,
			Const
		>,
		string_options<
			StringMode,
			Enum,
			Pattern,
			MinLength,
			Const
		>,
		base_string_schema<
			StringMode,
			Enum,
			Pattern,
			MinLength,
			Const
		>,
		string_options<
			StringMode,
			Enum,
			Pattern,
			MinLength,
			Const
		>,
		{
			basic: KeywordTypeNode<SyntaxKind.StringKeyword>,
			enum: Enum extends [string, string, ...string[]]
				? UnionTypeNode<
					StringTupleToLiteralTypeNodeTuple<
						Exclude<Enum, never[]>
					>
				>
				: KeywordTypeNode<SyntaxKind.StringKeyword>,
			pattern: TypeReferenceNode<
				'StringPassesRegex',
				[LiteralTypeNode<StringLiteral>]
			>,
			'non-empty': TypeReferenceNode<
				'Exclude',
				[
					KeywordTypeNode,
					LiteralTypeNode<StringLiteral>,
				]
			>,
			const: (
				Const extends undefined
					? KeywordTypeNode<SyntaxKind.StringKeyword>
					: LiteralTypeNode<StringLiteral<Exclude<Const, undefined>>>
			),
		}[StringMode],
		{
			basic: StringLiteral,
			enum: StringLiteral,
			pattern: (
				Pattern extends string
					? CallExpression<
						Identifier<'StringPassesRegexGuard'>,
						'no',
						never[],
						[
							StringLiteral,
							StringLiteral<Exclude<Pattern, undefined>>,
						]
					>
					: StringLiteral
			),
			'non-empty': StringLiteral,
			const: StringLiteral,
		}[StringMode]
	> {
	generate_typescript_data(
		data: T,
		schema_parser: SchemaParser,
		schema: string_type<
			StringMode,
			Enum,
			Pattern,
			MinLength,
			Const
		>,
	): {
		basic: StringLiteral<T>,
		enum: StringLiteral<T>,
		pattern: (
			Pattern extends string
				? CallExpression<
					Identifier<'StringPassesRegexGuard'>,
					'no',
					never[],
					[
						StringLiteral<T>,
						StringLiteral<Exclude<Pattern, undefined>>,
					]
				>
				: StringLiteral<T>
		),
		'non-empty': StringLiteral<T>,
		const: StringLiteral<T>,
	}[StringMode] {
		const validator = schema_parser.share_ajv(
			(ajv) => ajv.compile(schema),
		);

		if (!validator(data)) {
			throw new TypeError('Data does not match schema!');
		}

		let result: {
			basic: StringLiteral<T>,
			enum: StringLiteral<T>,
			pattern: (
				Pattern extends string
					? CallExpression<
						Identifier<'StringPassesRegexGuard'>,
						'no',
						never[],
						[
							StringLiteral<T>,
							StringLiteral<Exclude<Pattern, undefined>>,
						]
					>
					: StringLiteral<T>
			),
			'non-empty': StringLiteral<T>,
			const: StringLiteral<T>,
		}[StringMode];

		if (!('pattern' in schema)) {
			const sanity_check: StringLiteral<
				T
			> = factory.createStringLiteral(data);

			result = sanity_check as typeof result;
		} else {
			const sanity_check: CallExpression<
				Identifier<'StringPassesRegexGuard'>,
				'no',
				never[],
				[
					StringLiteral<T>,
					StringLiteral<Exclude<Pattern, undefined>>,
				]
			> = factory.createCallExpression<
				Identifier<'StringPassesRegexGuard'>,
				never[],
				[
					StringLiteral<T>,
					StringLiteral<Exclude<Pattern, undefined>>,
				]
			>(
				factory.createIdentifier('StringPassesRegexGuard'),
				[],
				[
					factory.createStringLiteral(data),
					factory.createStringLiteral(
						schema.pattern as Exclude<Pattern, undefined>,
					),
				],
			);

			result = sanity_check as typeof result;

			schema_parser.needs_import_from_module('StringPassesRegexGuard');
		}

		return result;
	}

	generate_typescript_type(
		{
			schema,
			schema_parser,
		}: {
			schema: string_type<
				StringMode,
				Enum,
				Pattern,
				MinLength,
				Const
			>,
			schema_parser: SchemaParser,
		},
	): Promise<{
		basic: KeywordTypeNode<SyntaxKind.StringKeyword>,
		enum: Enum extends [string, string, ...string[]]
			? UnionTypeNode<
				StringTupleToLiteralTypeNodeTuple<
					Exclude<Enum, never[]>
				>
			>
			: KeywordTypeNode<SyntaxKind.StringKeyword>,
		pattern: TypeReferenceNode<
			'StringPassesRegex',
			[LiteralTypeNode<StringLiteral>]
		>,
		'non-empty': TypeReferenceNode<
			'Exclude',
			[
				KeywordTypeNode,
				LiteralTypeNode<StringLiteral>,
			]
		>,
		const: (
			Const extends undefined
				? KeywordTypeNode<SyntaxKind.StringKeyword>
				: LiteralTypeNode<StringLiteral<Exclude<Const, undefined>>>
		),
	}[StringMode]> {
		let result: {
			basic: KeywordTypeNode<SyntaxKind.StringKeyword>,
			enum: Enum extends [string, string, ...string[]]
				? UnionTypeNode<
					StringTupleToLiteralTypeNodeTuple<
						Exclude<Enum, never[]>
					>
				>
				: KeywordTypeNode<SyntaxKind.StringKeyword>,
			pattern: TypeReferenceNode<
				'StringPassesRegex',
				[LiteralTypeNode<StringLiteral>]
			>,
			'non-empty': TypeReferenceNode<
				'Exclude',
				[
					KeywordTypeNode,
					LiteralTypeNode<StringLiteral>,
				]
			>,
			const: (
				Const extends undefined
					? KeywordTypeNode<SyntaxKind.StringKeyword>
					: LiteralTypeNode<StringLiteral<Exclude<Const, undefined>>>
			),
		}[StringMode];

		if ('enum' in schema) {
			const sanity_check = factory.createUnionTypeNode(
				StringTupleToLiteralTypeNodeTuple(
					schema.enum,
				),
			);

			result = sanity_check as typeof result;
		} else if ('pattern' in schema) {
			const sanity_check: TypeReferenceNode<
				'StringPassesRegex',
				[LiteralTypeNode<StringLiteral>]
			> = factory.createTypeReferenceNode(
				'StringPassesRegex',
				[
					factory.createLiteralTypeNode(
						factory.createStringLiteral(schema.pattern),
					),
				],
			);

			result = sanity_check as typeof result;

			schema_parser.needs_import_from_module('StringPassesRegex');
		} else if ('const' in schema) {
			let double_sanity_check: (
				Const extends undefined
					? KeywordTypeNode<SyntaxKind.StringKeyword>
					: LiteralTypeNode<StringLiteral<Exclude<Const, undefined>>>
			);

			if (undefined === schema.const) {
				const sanity_check: KeywordTypeNode<
					SyntaxKind.StringKeyword
				> = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);

				double_sanity_check = sanity_check as (
					typeof double_sanity_check
				);
			} else {
				const sanity_check: LiteralTypeNode<
					StringLiteral<Exclude<Const, undefined>>
				> = factory.createLiteralTypeNode(
					factory.createStringLiteral(
						schema.const as Exclude<Const, undefined>,
					),
				);

				double_sanity_check = sanity_check as (
					typeof double_sanity_check
				);
			}

			result = double_sanity_check as typeof result;
		} else if (
			'minLength' in schema
			&& undefined !== schema.minLength
			&& schema.minLength > 0
		) {
			const sanity_check: TypeReferenceNode<
				'Exclude',
				[
					KeywordTypeNode,
					LiteralTypeNode<StringLiteral>,
				]
			> = factory.createTypeReferenceNode(
				'Exclude',
				[
					factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
					factory.createLiteralTypeNode(
						factory.createStringLiteral(''),
					),
				],
			);

			result = sanity_check as typeof result;
		} else {
			const sanity_check: KeywordTypeNode<
				SyntaxKind.StringKeyword
			> = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);

			result = sanity_check as typeof result;
		}

		return Promise.resolve(result);
	}

	static generate_schema_definition<
		StringMode extends string_mode = string_mode,
		Enum extends [string, string, ...string[]]|never[] = never[],
		Pattern extends string|undefined = undefined,
		MinLength extends MinLength_type = MinLength_type<1>,
		Const extends string|undefined = undefined,
	>(
		options: string_options<
			StringMode,
			Enum,
			Pattern,
			MinLength,
			Const
		>,
	): Readonly<SchemaDefinitionDefinition> {
		let result: base_string_schema<
			StringMode,
			Enum,
			Pattern,
			MinLength,
			Const
		>;

		if ('basic' === options.string_mode) {
			const sanity_check: base_string_schema<
				StringMode & 'basic',
				[],
				undefined,
				MinLength,
				undefined
			> = {
				type: 'object',
				additionalProperties: false,
				required: ['type'],
				properties: {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					type: {
						type: 'string',
						const: 'string',
					},
					minLength: {
						type: 'integer',
						const: 0,
					},
				},
			};

			result = sanity_check as typeof result;
		} else if ('enum' === options.string_mode) {
			let double_sanity_check: base_string_schema<
				StringMode & 'enum',
				Enum,
				Pattern,
				MinLength,
				Const
			>['properties']['enum'];

			if (options.enum.length < 2) {
				const triple_sanity_check: base_string_schema<
					StringMode & 'enum',
					never[],
					Pattern,
					MinLength,
					Const
				>['properties']['enum'] = {
					type: 'array',
					minItems: 1,
					uniqueItems: true,
					items: {
						type: 'string',
					},
				};

				double_sanity_check = triple_sanity_check as (
					typeof double_sanity_check
				);
			} else {
				const triple_sanity_check: base_string_schema<
					StringMode & 'enum',
					[string, string, ...string[]],
					Pattern,
					MinLength,
					Const
				>['properties']['enum'] = {
					type: 'array',
					const: options.enum as [string, string, ...string[]],
				};

				double_sanity_check = triple_sanity_check as (
					typeof double_sanity_check
				);
			}

			const sanity_check: base_string_schema<
				StringMode & 'enum',
				Enum,
				Pattern,
				MinLength,
				Const
			> = {
				type: 'object',
				additionalProperties: false,
				required: ['type', 'enum'],
				properties: {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					type: {
						type: 'string',
						const: 'string',
					},
					enum: double_sanity_check,
				},
			};

			result = sanity_check;
		} else if ('pattern' === options.string_mode) {
			let double_sanity_check: base_string_schema<
				StringMode & 'pattern',
				Enum,
				Pattern,
				MinLength,
				Const
			>['properties'];

			if (undefined === options.pattern) {
				const triple_sanity_check: base_string_schema<
					StringMode & 'pattern',
					Enum,
					undefined,
					MinLength,
					Const
				>['properties'] = {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					type: {
						type: 'string',
						const: 'string',
					},
					pattern: {
						type: 'string',
					},
				};

				double_sanity_check = (
					triple_sanity_check as base_string_schema<
						StringMode & 'pattern',
						Enum,
						Pattern,
						MinLength,
						Const
					>['properties']
				);
			} else {
				const triple_sanity_check: base_string_schema<
					StringMode & 'pattern',
					Enum,
					string,
					MinLength,
					Const
				>['properties'] = {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					type: {
						type: 'string',
						const: 'string',
					},
					pattern: {
						type: 'string',
						const: options.pattern,
					},
				};

				double_sanity_check = (
					triple_sanity_check as base_string_schema<
						StringMode & 'pattern',
						Enum,
						Pattern,
						MinLength,
						Const
					>['properties']
				);
			}

			const sanity_check: base_string_schema<
				StringMode & 'pattern',
				Enum,
				Pattern,
				MinLength,
				Const
			> = {
				type: 'object',
				additionalProperties: false,
				required: ['type', 'pattern'],
				properties: double_sanity_check,
			};

			result = sanity_check;
		} else if ('non-empty' === options.string_mode) {
			const sanity_check: base_string_schema<
				StringMode & 'non-empty',
				Enum,
				Pattern,
				MinLength,
				Const
			> = {
				type: 'object',
				additionalProperties: false,
				required: ['type', 'minLength'],
				properties: {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					type: {
						type: 'string',
						const: 'string',
					},
					minLength: {
						type: 'integer',
						const: options.minLength,
					},
				},
			};

			result = sanity_check;
		} else {
			let double_sanity_check: base_string_schema<
				StringMode & 'const',
				Enum,
				Pattern,
				MinLength,
				Const
			>['properties']['const'];

			if (undefined === options.const) {
				const triple_sanity_check: base_string_schema<
					StringMode & 'const',
					Enum,
					Pattern,
					MinLength,
					undefined
				>['properties']['const'] = {
					type: 'string',
				};

				double_sanity_check = triple_sanity_check as (
					typeof double_sanity_check
				);
			} else {
				const triple_sanity_check: base_string_schema<
					StringMode & 'const',
					Enum,
					Pattern,
					MinLength,
					string
				>['properties']['const'] = {
					type: 'string',
					const: options.const,
				};

				double_sanity_check = triple_sanity_check as (
					typeof double_sanity_check
				);
			}

			const sanity_check: base_string_schema<
				StringMode & 'const',
				Enum,
				Pattern,
				MinLength,
				Const
			> = {
				type: 'object',
				additionalProperties: false,
				required: ['type'],
				properties: {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					type: {
						type: 'string',
						const: 'string',
					},
					const: double_sanity_check,
				},
			};

			result = sanity_check;
		}

		return Object.freeze(result);
	}

	static generate_type_definition<
		StringMode extends string_mode = string_mode,
		Enum extends (
			| [string, string, ...string[]]
			| never[]
		) = (
			| [string, string, ...string[]]
			| never[]
		),
		Pattern extends string = string,
		MinLength extends MinLength_type = MinLength_type<1>,
		Const extends string|undefined = string|undefined,
	>(
		options: string_options<
			StringMode,
			Enum,
			Pattern,
			MinLength,
			Const
		>,
	): Readonly<string_type<
		StringMode,
		Enum,
		Pattern,
		MinLength,
		Const
	>> {
		let result: string_type<
			StringMode,
			Enum,
			Pattern,
			MinLength,
			Const
		>;

		if ('basic' === options.string_mode) {
			const sanity_check: string_type<
				StringMode & 'basic',
				Enum,
				undefined,
				MinLength,
				undefined
			> = {
				type: 'string',
			};

			if (undefined !== options.minLength) {
				sanity_check.minLength = options.minLength;
			}

			result = sanity_check as typeof result;
		} else if ('enum' === options.string_mode) {
			let sanity_check: string_type<
				StringMode & 'enum',
				Enum,
				undefined,
				MinLength,
				undefined
			>;

			if (options.enum.length < 2) {
				const double_sanity_check: string_type<
					StringMode & 'enum',
					never[],
					undefined,
					MinLength,
					undefined
				> = {
					type: 'string',
				};

				sanity_check = double_sanity_check as typeof sanity_check;
			} else {
				const double_sanity_check: string_type<
					StringMode & 'enum',
					[string, string, ...string[]],
					undefined,
					MinLength,
					undefined
				> = {
					type: 'string',
					enum: options.enum as Exclude<Enum, never[]>,
				};

				sanity_check = double_sanity_check as typeof sanity_check;
			}

			result = sanity_check as typeof result;
		} else if ('pattern' === options.string_mode) {
			let sanity_check: string_type<
				StringMode & 'pattern',
				never[],
				Pattern,
				MinLength,
				undefined
			>;

			if (undefined === options.pattern) {
				const double_sanity_check: string_type<
					StringMode & 'pattern',
					never[],
					undefined,
					MinLength,
					undefined
				> = {
					type: 'string',
				};

				sanity_check = double_sanity_check as typeof sanity_check;
			} else {
				const double_sanity_check: string_type<
					StringMode & 'pattern',
					never[],
					string,
					MinLength,
					undefined
				> = {
					type: 'string',
					pattern: options.pattern,
				};

				sanity_check = double_sanity_check as typeof sanity_check;
			}

			result = sanity_check as typeof result;
		} else if ('non-empty' === options.string_mode) {
			const sanity_check: string_type<
				StringMode & 'non-empty',
				never[],
				undefined,
				MinLength,
				undefined
			> = {
				type: 'string',
				minLength: options.minLength,
			};

			result = sanity_check as typeof result;
		} else if (undefined !== options.const) {
			const sanity_check: string_type<
				StringMode & 'const',
				Enum,
				undefined,
				MinLength,
				string
			> = {
				type: 'string',
				const: options.const,
			};

			result = sanity_check as typeof result;
		} else {
			const sanity_check: string_type<
				StringMode & 'const',
				never[],
				undefined,
				MinLength,
				undefined
			> = {
				type: 'string',
			};

			result = sanity_check as typeof result;
		}

		return Object.freeze(result);
	}
}

type basic_string_type = string_type<
	'basic',
	never[],
	string,
	MinLength_type<1>,
	string
>;

class String<
	T extends string = string,
> extends
	BaseString<
		T,
		'basic',
		never[],
		undefined,
		MinLength_type<1>,
		string
	> {
	constructor(options: SchemalessTypeOptions) {
		const specific_options = Object.freeze({
			string_mode: 'basic',
			minLength: PositiveIntegerOrZeroGuard(0),
		});

		super({
			...options,
			type_definition: specific_options,
			schema_definition: specific_options,
			add_to_$defs_excluded: true,
		});
	}
}

type enum_string_type<
	Enum extends (
		| [string, string, ...string[]]
		| never[]
	) = (
		| [string, string, ...string[]]
		| never[]
	),
> = string_type<
	'enum',
	Enum,
	undefined,
	MinLength_type<1>,
	undefined
>;

class EnumString<
	T extends string = string,
	Enum extends (
		| [string, string, ...string[]]
		| never[]
	) = (
		| [string, string, ...string[]]
		| never[]
	),
> extends
	BaseString<
		T,
		'enum',
		Enum,
		undefined,
		MinLength_type<1>,
		undefined
	> {
	constructor(permissible: Enum, options: SchemalessTypeOptions) {
		const specific_options = Object.freeze({
			string_mode: 'enum',
			enum: permissible,
		});

		super({
			...options,
			type_definition: specific_options,
			schema_definition: specific_options,
			add_to_$defs_excluded: true,
		});
	}
}

type pattern_string_type<
	Pattern extends string|undefined = undefined,
> = string_type<
	'pattern',
	never[],
	Pattern,
	MinLength_type<1>,
	undefined
>;

class PatternString<
	T extends string = string,
	Pattern extends string|undefined = undefined,
> extends
	BaseString<
		T,
		'pattern',
		never[],
		Pattern,
		MinLength_type<1>,
		undefined
	> {
	constructor(pattern: Pattern, options: SchemalessTypeOptions) {
		const specific_options = Object.freeze({
			string_mode: 'pattern',
			pattern,
		});

		super({
			...options,
			type_definition: specific_options,
			schema_definition: specific_options,
			add_to_$defs_excluded: true,
		});
	}
}

type non_empty_string_type<
	MinLength extends MinLength_type = MinLength_type<1>,
> = string_type<
	'non-empty',
	never[],
	undefined,
	MinLength,
	undefined
>;

class NonEmptyString<
	T extends Exclude<string, ''> = Exclude<string, ''>,
> extends
	BaseString<
		T,
		'non-empty',
		never[],
		undefined,
		MinLength_type<1>,
		string
	> {
	constructor(options: SchemalessTypeOptions) {
		const specific_options = Object.freeze({
			string_mode: 'non-empty',
			minLength: PositiveIntegerGuard(1),
		});

		super({
			...options,
			type_definition: specific_options,
			schema_definition: specific_options,
			add_to_$defs_excluded: true,
		});
	}
}

type const_string_type<
	Const extends string|undefined = string|undefined,
> = string_type<
	'const',
	never[],
	undefined,
	MinLength_type<1>,
	Const
>;

class ConstString<
	T extends string|undefined = string|undefined,
> extends
	BaseString<
		string,
		'const',
		never[],
		undefined,
		MinLength_type<1>,
		T
	> {
	constructor(
		specific: T,
		options: SchemalessTypeOptions,
	) {
		const specific_options: string_options<
			'const',
			never[],
			undefined,
			MinLength_type<1>,
			T
		> = {
			string_mode: 'const',
			const: specific,
		};

		super({
			...options,
			type_definition: specific_options,
			schema_definition: specific_options,
			add_to_$defs_excluded: true,
		});
	}
}

export type {
	basic_string_schema,
	basic_string_type,
	enum_string_type,
	pattern_string_type,
	non_empty_string_type,
	const_string_type,
	const_string_schema,
};

export {
	String,
	EnumString,
	PatternString,
	NonEmptyString,
	ConstString,
};
