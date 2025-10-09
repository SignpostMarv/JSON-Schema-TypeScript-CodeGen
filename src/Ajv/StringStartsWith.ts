import type {
	TemplateExpression,
	TemplateLiteralTypeNode,
} from 'typescript';
import {
	SyntaxKind,
} from 'typescript';

import type {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
} from 'regexp.escape/auto';

import type {
	SchemaDefinitionDefinition,
	SchemalessTypeOptions,
	TypeDefinitionSchema,
} from '../JSONSchema/Type.ts';

import {
	KeywordType,
} from './Keyword.ts';

import {
	factory,
} from '../typescript/factory.ts';

type string_starts_with_type<
	StartsWith extends Exclude<string, ''> = Exclude<string, ''>,
> = {
	type: 'string',
	starts_with: StartsWith,
};

type string_starts_with_schema = TypeDefinitionSchema<{
	type: 'object',
	required: ['type', 'starts_with'],
	additionalProperties: false,
	properties: {
		type: {
			type: 'string',
			const: 'string',
		},
		starts_with: {
			type: 'string',
			minLength: 1,
		},
	},
}>;

export class StringStartsWith<
	StartsWith extends Exclude<string, ''> = Exclude<string, ''>,
>
	extends KeywordType<
		StartsWith,
		string_starts_with_type<StartsWith>,
		{
			prefix: StartsWith,
		},
		string_starts_with_schema,
		Record<string, never>,
		TemplateLiteralTypeNode,
		TemplateExpression
	> {
	static #ajv_check: WeakSet<Ajv> = new WeakSet();

	constructor(prefix: StartsWith, options: SchemalessTypeOptions) {
		super({
			...options,
			type_definition: {
				prefix,
			},
			schema_definition: {},
		});
	}

	generate_typescript_data(
		data: StartsWith,
	): TemplateExpression {
		return factory.createTemplateExpression(
			factory.createTemplateHead(''),
			[
				factory.createTemplateSpan(
					factory.createStringLiteral(data),
					factory.createTemplateMiddle(''),
				),
				factory.createTemplateSpan(
					factory.createIdentifier('string'),
					factory.createTemplateTail(''),
				),
			],
		);
	}

	generate_typescript_type(
		{
			schema,
		}: (
			| { schema: string_starts_with_type<StartsWith> }
		),
	): Promise<TemplateLiteralTypeNode> {
		return Promise.resolve(factory.createTemplateLiteralType(
			factory.createTemplateHead(''),
			[
				factory.createTemplateLiteralTypeSpan(
					factory.createLiteralTypeNode(
						factory.createStringLiteral(schema.starts_with),
					),
					factory.createTemplateMiddle(''),
				),
				factory.createTemplateLiteralTypeSpan(
					factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
					factory.createTemplateTail(''),
				),
			],
		));
	}

	static ajv_keyword(ajv: Ajv): void {
		if (StringStartsWith.#ajv_check.has(ajv)) {
			return;
		}

		ajv.addKeyword({
			keyword: 'starts_with',
			type: 'string',
			macro: (starts_with: string) => (
				{
					pattern: `^${RegExp.escape(starts_with)}.+$`,
				}
			),
		});

		StringStartsWith.#ajv_check.add(ajv);
	}

	static generate_schema_definition(): Readonly<SchemaDefinitionDefinition> {
		const definition: string_starts_with_schema = {
			type: 'object',
			required: ['type', 'starts_with'],
			additionalProperties: false,
			properties: {
				type: {
					type: 'string',
					const: 'string',
				},
				starts_with: {
					type: 'string',
					minLength: 1,
				},
			},
		};

		return Object.freeze(definition);
	}

	static generate_type_definition<
		StartsWith extends Exclude<string, ''> = Exclude<string, ''>,
	>(
		{
			prefix,
		}: {
			prefix: StartsWith,
		},
	): Readonly<string_starts_with_type<StartsWith>> {
		return Object.freeze({
			type: 'string',
			starts_with: prefix,
		});
	}
}
