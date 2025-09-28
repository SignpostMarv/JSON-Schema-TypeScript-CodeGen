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
} from '../JSONSchema/Type.ts';
import {
	Type,
} from '../JSONSchema/Type.ts';

export abstract class KeywordType<
	T,
	TypeDefinition extends TypeDefinitionSchema = TypeDefinitionSchema,
	SchemaDefinition extends (
		SchemaDefinitionDefinition
	) = SchemaDefinitionDefinition,
	SchemaTo extends TypeNode = TypeNode,
	DataTo extends Expression = Expression,
>
	extends Type<
		T,
		TypeDefinition,
		SchemaDefinition,
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
