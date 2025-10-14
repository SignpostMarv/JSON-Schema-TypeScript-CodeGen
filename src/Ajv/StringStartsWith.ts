import type {
	TemplateExpression,
	TemplateLiteralTypeNode,
} from 'typescript';
import {
	SyntaxKind,
} from 'typescript';

// eslint-disable-next-line @stylistic/max-len
// eslint-disable-next-line imports/no-empty-named-blocks, imports/no-unassigned-import
import type {
} from 'regexp.escape/auto';

import {
	KeywordType,
} from './Keyword.ts';

import type {
	SchemaDefinitionDefinition,
	SchemalessTypeOptions,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../JSONSchema/Type.ts';

import {
	factory,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/factory.ts';

type string_starts_with_type<
	StartsWith extends Exclude<string, ''> = Exclude<string, ''>,
> = {
	type: 'string',
	starts_with: StartsWith,
};

type string_starts_with_schema = SchemaDefinitionDefinition<
	['type', 'starts_with'],
	{
		type: {
			type: 'string',
			const: 'string',
		},
		starts_with: {
			type: 'string',
			minLength: 1,
		},
	}
>;

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
	constructor(prefix: StartsWith, options: SchemalessTypeOptions) {
		super({
			...options,
			ajv_keyword: {
				keyword: 'starts_with',
				type: 'string',
				macro: (
					starts_with: string,
				) => StringStartsWith.ajv_macro(starts_with),
			},
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

	static generate_schema_definition(): Readonly<string_starts_with_schema> {
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

	protected static ajv_macro(starts_with: string) {
		return {
			pattern: `^${RegExp.escape(starts_with)}.+$`,
		};
	}
}
