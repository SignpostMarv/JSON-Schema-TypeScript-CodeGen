import type {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	TypeNode,
} from 'typescript';

import type {
	SchemaDefinitionDefinition,
	TypeDefinitionSchema,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../JSONSchema/Type.ts';
import {
	Type,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../JSONSchema/Type.ts';

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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static ajv_keyword(ajv: Ajv): void {
		throw new Error('Not implemented!');
	}

	static configure_ajv(ajv: Ajv): void {
		this.ajv_keyword(ajv);
	}
}
