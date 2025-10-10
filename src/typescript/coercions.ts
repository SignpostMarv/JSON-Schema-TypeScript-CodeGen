import type {
	LiteralTypeNode,
	StringLiteral,
} from './types.ts';
import {
	factory,
} from './factory.ts';

export type StringTupleToLiteralTypeNodeTuple<
	T1 extends readonly string[],
> = T1 extends [string, ...string[]]
	? {
		[K in keyof T1]: T1[K] extends string
			? LiteralTypeNode<StringLiteral<T1[K]>>
			: never
	}
	: LiteralTypeNode<StringLiteral<T1[0]>>[];

export function StringTupleToLiteralTypeNodeTuple<
	T1 extends readonly string[],
>(value: T1): StringTupleToLiteralTypeNodeTuple<T1> {
	const enum_as_literal = value.map(
		(item) => factory.createLiteralTypeNode(
			factory.createStringLiteral(item),
		),
	);

	return enum_as_literal as StringTupleToLiteralTypeNodeTuple<T1>;
}
