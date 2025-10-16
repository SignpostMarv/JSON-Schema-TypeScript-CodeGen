import type {
	KeywordTypeNode,
	TemplateExpression,
	TemplateHead,
	TemplateLiteralTypeNode,
	TemplateLiteralTypeSpan,
} from 'typescript';
import {
	isLiteralTypeNode,
	SyntaxKind,
} from 'typescript';

import {
	object_has_property,
} from '@satisfactory-dev/predicates.ts';

import {
	KeywordType,
} from './Keyword.ts';

import type {
	ObjectOfSchemas,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../types.ts';

import type {
	SchemaDefinitionDefinition,
	SchemalessTypeOptions,
	TypeDefinitionSchema,
	TypeOptions,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../JSONSchema/Type.ts';

// eslint-disable-next-line @stylistic/max-len
// eslint-disable-next-line imports/no-empty-named-blocks, imports/no-unassigned-import
import type {
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../javascript/types.ts';

import type {
	LiteralTypeNode,
	StringLiteral,
	UnionTypeNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/types.ts';

import {
	factory,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/factory.ts';

type TemplatedStringPartBasic = (
	| string
	| {
		type: 'string',
	}
	| templated_string_type
);

type TemplatedStringPart = (
	| TemplatedStringPartBasic
	| [
		TemplatedStringPartBasic,
		TemplatedStringPartBasic,
		...TemplatedStringPartBasic[],
	]
);

type TemplatedStringParts = [
	TemplatedStringPart,
	...TemplatedStringPart[],
];

type templated_string_type<
	Parts extends TemplatedStringParts = TemplatedStringParts,
> = TypeDefinitionSchema<{
	$defs?: ObjectOfSchemas,
	type: 'string',
	templated_string: Parts,
}>;

const templated_string_schema = Object.freeze({
	type: 'object',
	required: ['type', 'templated_string'] as const,
	additionalProperties: false,
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
		templated_string: {
			type: 'array',
			minItems: 1,
			items: {
				oneOf: [
					{
						type: 'string',
						minLength: 1,
					},
					{
						type: 'object',
						const: {
							type: 'string',
						},
					},
					{
						type: 'array',
						minItems: 2,
						items: {
							oneOf: [
								{
									type: 'string',
									minLength: 1,
								},
								{
									type: 'object',
									const: {
										type: 'string',
									},
								},
							] as const,
						},
					},
					{
						$ref: '#',
					},
				] as const,
			},
		},
	},
});

type templated_string_schema = SchemaDefinitionDefinition<
	(typeof templated_string_schema)['required'],
	(typeof templated_string_schema)['properties']
>;

type PartsOrDefault<
	Parts extends undefined|TemplatedStringParts,
> = Parts extends Exclude<undefined|TemplatedStringParts, undefined>
	? Parts
	: [
		{
			type: 'string',
		},
	];

type template_spans_return_type<
	T extends (
		| string
		| {
			type: 'string',
		}
		| [
			TemplatedStringPartBasic,
			TemplatedStringPartBasic,
			...TemplatedStringPartBasic[],
		]
		| templated_string_type
	),
> = (
	T extends string
		? LiteralTypeNode<StringLiteral>
		: (
			T extends [
				TemplatedStringPartBasic,
				TemplatedStringPartBasic,
				...TemplatedStringPartBasic[],
			]
				? UnionTypeNode<[
					(
						| LiteralTypeNode<StringLiteral>
						| KeywordTypeNode<SyntaxKind.StringKeyword>
					),
					(
						| LiteralTypeNode<StringLiteral>
						| KeywordTypeNode<SyntaxKind.StringKeyword>
					),
					...(
						| LiteralTypeNode<StringLiteral>
						| KeywordTypeNode<SyntaxKind.StringKeyword>
					)[],
				]>
				: (
					T extends templated_string_type
						? TemplateLiteralTypeNode
						: KeywordTypeNode<SyntaxKind.StringKeyword>
				)
		)
);

class RegexpFailureError extends TypeError {
	readonly pattern: string;

	readonly value: string;

	constructor(message: string, regex: RegExp, value: string) {
		super(message);
		this.pattern = regex.toString();
		this.value = value;
	}
}

class TemplatedString<
	T extends Exclude<string, ''>,
	Parts extends undefined|TemplatedStringParts,
> extends
	KeywordType<
		`${T}`,
		templated_string_type<PartsOrDefault<Parts>>,
		{parts: PartsOrDefault<Parts>},
		templated_string_schema,
		Record<string, never>,
		TemplateLiteralTypeNode,
		StringLiteral
	> {
	#regex: RegExp;

	constructor(
		options: SchemalessTypeOptions,
		maybe_specified?: Parts,
	) {
		let specified: PartsOrDefault<Parts>;

		if (!TemplatedString.#parts_is_specified(maybe_specified)) {
			const sanity_check: TemplatedStringParts = [
				{
					type: 'string',
				},
			];

			specified = sanity_check as typeof specified;
		} else {
			specified = maybe_specified as typeof specified;
		}

		super({
			...options,
			ajv_keyword: {
				keyword: 'templated_string',
				type: 'string',
				macro: (
					parts: TemplatedStringParts,
				) => TemplatedString.ajv_macro(parts),
			},
			type_definition: {
				parts: specified,
			},
			schema_definition: {},
		});

		this.#regex = TemplatedString.#to_regex(specified);
	}

	generate_typescript_data(
		data: `${T}`,
	): StringLiteral {
		if (!this.#regex.test(data)) {
			throw new RegexpFailureError(
				'Value does not match expected regex!',
				this.#regex,
				data,
			);
		}

		return factory.createStringLiteral(data);
	}

	async generate_typescript_type({
		data,
		schema,
	}: {
		data?: T,
		schema: templated_string_type<PartsOrDefault<Parts>>,
	}): Promise<TemplateLiteralTypeNode> {
		if (data && !this.#regex.test(data)) {
			throw new TypeError(
				'Specified data did not match expected regex!',
			);
		}

		return Promise.resolve(TemplatedString.generate_typescript_type_from_parts(
			schema.templated_string,
		));
	}

	static ajv_macro(parts: TemplatedStringParts) {
		return {
			pattern: this.#to_regex_string(parts),
		};
	}

	static generate_schema_definition(): Readonly<SchemaDefinitionDefinition> {
		return templated_string_schema;
	}

	static generate_type_definition<
		Parts extends TemplatedStringParts = TemplatedStringParts,
	>({
		parts: templated_string,
	}: {
		parts: Parts,
	}): Readonly<templated_string_type<Parts>> {
		return Object.freeze({
			type: 'string',
			templated_string,
		});
	}

	static generate_typescript_type_from_parts(
		parts: TemplatedStringParts,
	): TemplateLiteralTypeNode {
		const [
			head,
			middle,
			tail,
		] = this.#template_spans(parts);
		const result = factory.createTemplateLiteralType(
			head,
			[
				...middle,
				tail,
			],
		);

		return result;
	}

	static #template_spans(
		parts: TemplatedStringParts,
	): [
		TemplateHead,
		[
			TemplateLiteralTypeSpan,
			...TemplateLiteralTypeSpan[],
		],
		TemplateLiteralTypeSpan,
	] {
		let span_parts: TemplatedStringPart[];

		let specific_head: undefined|string = undefined;

		if ('string' === typeof parts[0]) {
			[, ...span_parts] = parts;
			specific_head = parts[0];
		} else {
			span_parts = [...parts];
		}

		const tail_part = span_parts.pop();

		const head = factory.createTemplateHead(
			undefined === specific_head
				? ''
				: specific_head,
		);

		const middle: [
			TemplateLiteralTypeSpan,
			...TemplateLiteralTypeSpan[],
		] = this.#template_span_types(span_parts).map((part) => {
			return factory.createTemplateLiteralTypeSpan(
				part,
				factory.createTemplateMiddle(
					isLiteralTypeNode(part)
						? (part.literal as StringLiteral).text
						: '',
				),
			);
		});

		const [tail_part_type] = this.#template_span_types([
			tail_part as TemplatedStringPart,
		]);

		const tail = factory.createTemplateLiteralTypeSpan(
			tail_part_type,
			factory.createTemplateTail(
				isLiteralTypeNode(tail_part_type)
					? tail_part_type.literal.text
					: '',
			),
		);

		return [head, middle, tail];
	}

	static #template_span_types<
		T extends (
			| TemplatedStringPart[]
			| [
				TemplatedStringPartBasic,
				TemplatedStringPartBasic,
				...TemplatedStringPartBasic[],
			]
		),
	>(span_parts: T) {
		return span_parts.map(<
			T2 extends (
				| string
				| {
					type: 'string',
				}
				| [
					TemplatedStringPartBasic,
					TemplatedStringPartBasic,
					...TemplatedStringPartBasic[],
				] | templated_string_type
			),
		>(
			part: T2,
		): template_spans_return_type<T2> => (
			'string' === typeof part
				? factory.createLiteralTypeNode<StringLiteral>(
					factory.createStringLiteral(part),
				) as template_spans_return_type<T2>
				: (
					Array.isArray(part)
						? factory.createUnionTypeNode(
							this.#template_span_types(part),
						) as template_spans_return_type<T2>
						: (
							(
								object_has_property(part, 'templated_string')
							)
								? TemplatedString.generate_typescript_type_from_parts(
									part.templated_string,
								) as template_spans_return_type<T2>
								: factory.createKeywordTypeNode(
									SyntaxKind.StringKeyword,
								) as template_spans_return_type<T2>
						)
				)
		));
	}

	static #parts_is_specified(
		maybe: undefined|TemplatedStringParts,
	): maybe is PartsOrDefault<Exclude<typeof maybe, undefined>> {
		return undefined !== maybe;
	}

	static #to_regex_string(parts: TemplatedStringParts): string {
		return `^${this.#to_regex_string_inner(
			parts,
			true,
		)}$`;
	}

	static #to_regex_string_inner(
		parts: TemplatedStringParts,
		capture_groups: boolean,
	): string {
		const open = capture_groups ? '(' : '(?:';

		return `${open}${parts.map((part) => {
			if ('string' === typeof part) {
				return RegExp.escape(part);
			} else if (Array.isArray(part)) {
				return `(?:${part.map((sub_part) => {
					if ('string' === typeof sub_part) {
						return RegExp.escape(sub_part);
					}

					return '.*';
				}).join('|')})`;
			} else if ('templated_string' in part) {
				return this.#to_regex_string_inner(
					part.templated_string,
					false,
				);
			}

			return '.*';
		}).join(')(')})`;
	}

	static #to_regex(parts: TemplatedStringParts): RegExp {
		return new RegExp(this.#to_regex_string(parts));
	}
}

abstract class MacroToTemplatedString<
	T extends string,
	MacroSchema,
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
> extends
	KeywordType<
		T,
		TypeDefinition,
		TypeDefinitionOptions,
		SchemaDefinition,
		SchemaDefinitionOptions,
		TemplateLiteralTypeNode,
		TemplateExpression
	> {
	constructor(
		{
			keyword,
			macro,
		}: {
			keyword: Exclude<string, 'templated_string'>,
			macro: (schema: MacroSchema) => {
				templated_string: TemplatedStringParts,
			},
		},
		options: TypeOptions<SchemaDefinitionOptions, TypeDefinitionOptions>,
	) {
		if (false === options.ajv.getKeyword('templated_string')) {
			new TemplatedString({ajv: options.ajv});
		}

		super({
			...options,
			ajv_keyword: {
				keyword,
				type: 'string',
				macro,
			},
		});
	}
}

export type {
	TemplatedStringParts,
	templated_string_type,
};

export {
	TemplatedString,
	MacroToTemplatedString,
};
