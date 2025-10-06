import type {
	KeywordTypeNode,
	TemplateHead,
	TemplateLiteralTypeNode,
	TemplateLiteralTypeSpan,
} from 'typescript';
import ts, {
	factory,
	SyntaxKind,
} from 'typescript';

import type {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	SchemaDefinitionDefinition,
	SchemalessTypeOptions,
	TypeDefinitionSchema,
} from '../JSONSchema/Type.ts';

import {
	KeywordType,
} from './Keyword.ts';

import type {
	LiteralTypeNode,
	StringLiteral,
	UnionTypeNode,
} from '../typescript/types.ts';
import {
	object_has_property,
} from '@satisfactory-dev/predicates.ts';

import type {
	ObjectOfSchemas,
} from '../types.ts';

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

export type TemplatedStringParts = [
	TemplatedStringPart,
	...TemplatedStringPart[],
];

export type templated_string_type<
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

export class TemplatedString<
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

	static #ajv_check: WeakSet<Ajv> = new WeakSet();

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
			type_definition: {
				parts: specified,
			},
			schema_definition: {},
		});

		this.#regex = TemplatedString.#to_regex(specified);
	}

	#template_spans(
		schema: templated_string_type,
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

		if ('string' === typeof schema.templated_string[0]) {
			[, ...span_parts] = schema.templated_string;
			specific_head = schema.templated_string[0];
		} else {
			span_parts = [...schema.templated_string];
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
					ts.isLiteralTypeNode(part)
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
				ts.isLiteralTypeNode(tail_part_type)
					? tail_part_type.literal.text
					: '',
			),
		);

		return [head, middle, tail];
	}

	#template_span_types<
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
				? factory.createLiteralTypeNode(
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
								? this.#generate_typescript_type(
									part,
								) as template_spans_return_type<T2>
								: factory.createKeywordTypeNode(
									SyntaxKind.StringKeyword,
								) as template_spans_return_type<T2>
						)
				)
		));
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

	#generate_typescript_type(
		schema: (
			| templated_string_type<PartsOrDefault<Parts>>
			| templated_string_type
		),
		data?: T,
	): TemplateLiteralTypeNode {
		if (undefined !== data && !this.#regex.test(data)) {
			throw new TypeError(
				'Specified data did not match expected regex!',
			);
		}

		const [
			head,
			middle,
			tail,
		] = this.#template_spans(schema);
		const result = factory.createTemplateLiteralType(
			head,
			[
				...middle,
				tail,
			],
		);

		return result;
	}

	async generate_typescript_type({
		data,
		schema,
	}: {
		data?: T,
		schema: templated_string_type<PartsOrDefault<Parts>>,
	}): Promise<TemplateLiteralTypeNode> {
		return Promise.resolve(this.#generate_typescript_type(
			schema,
			data,
		));
	}

	static ajv_keyword(ajv: Ajv): void {
		if (TemplatedString.#ajv_check.has(ajv)) {
			return;
		}

		ajv.addKeyword({
			keyword: 'templated_string',
			type: 'string',
			macro: (parts: TemplatedStringParts) => (
				{
					pattern: this.#to_regex_string(parts),
				}
			),
		});

		TemplatedString.#ajv_check.add(ajv);
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
