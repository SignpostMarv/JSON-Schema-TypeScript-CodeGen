import type {
	MacroKeywordDefinition,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	TypeNode,
} from 'typescript';

import type {
	SchemaDefinitionDefinition,
	TypeDefinitionSchema,
	TypeOptions,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../JSONSchema/Type.ts';
import {
	Type,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../JSONSchema/Type.ts';

type KeywordTypeOptions<
	SchemaDefinitionOptions extends {[key: string]: unknown},
	TypeDefinitionOptions extends {[key: string]: unknown},
> = (
	& TypeOptions<
		SchemaDefinitionOptions,
		TypeDefinitionOptions
	>
	& {
		ajv_keyword: (
			& MacroKeywordDefinition
			& {
				keyword: string,
			}
		),
	}
);

export abstract class KeywordType<
	T,
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
>
	extends Type<
		T,
		TypeDefinition,
		TypeDefinitionOptions,
		SchemaDefinition,
		SchemaDefinitionOptions,
		SchemaTo,
		DataTo
	> {
	constructor({
		ajv_keyword,
		...options
	}: KeywordTypeOptions<SchemaDefinitionOptions, TypeDefinitionOptions>) {
		if (false === options.ajv.getKeyword(ajv_keyword.keyword)) {
			options.ajv.addKeyword(ajv_keyword);
		}

		super(options);
	}
}
