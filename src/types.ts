import type {
	BooleanLiteral,
	LiteralExpression,
	NullLiteral,
	PrefixUnaryExpression,
	LiteralTypeNode as TSLiteralTypeNode,
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
