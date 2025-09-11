import type {
	BooleanLiteral,
	LiteralExpression,
	NodeArray,
	NullLiteral,
	PrefixUnaryExpression,
	IntersectionTypeNode as TSIntersectionTypeNode,
	LiteralTypeNode as TSLiteralTypeNode,
	TypeLiteralNode as TSTypeLiteralNode,
	TypeElement,
	TypeNode,
} from 'typescript';

export type PositiveNumber<
	N extends Exclude<number, 0> = Exclude<number, 0>,
> = (
	& Exclude<number, 0>
	& (
		`${N}` extends `-${string}`
			? never
			: N
	)
);

export type Integer<N extends number = number> = (
	& (
		`${N}` extends `${string}.${string}`
			? never
			: N
	)
);

export type PositiveInteger<N extends number = number> = (
	& Integer<N>
	& PositiveNumber<N>
);

export type LiteralTypeNode<
	T extends (
		| NullLiteral
		| BooleanLiteral
		| LiteralExpression
		| PrefixUnaryExpression
	)
> = TSLiteralTypeNode & {literal: T};

export type TypeLiteralNode<
	T extends TypeElement
> = (
	& TSTypeLiteralNode
	& {
		readonly members: NodeArray<T>,
	}
);

export type IntersectionTypeNode<
	T extends [TypeNode, ...TypeNode[]],
> = (
	& TSIntersectionTypeNode
	& {
		readonly types: T,
	}
);
