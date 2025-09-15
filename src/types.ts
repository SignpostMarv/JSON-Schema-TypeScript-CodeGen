import type {
	BooleanLiteral,
	LiteralExpression,
	NamedTupleMember,
	NodeArray,
	NullLiteral,
	PrefixUnaryExpression,
	ArrayTypeNode as TSArrayTypeNode,
	IntersectionTypeNode as TSIntersectionTypeNode,
	LiteralTypeNode as TSLiteralTypeNode,
	TupleTypeNode as TSTupleTypeNode,
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

export type ArrayTypeNode<
	T extends TypeNode = TypeNode,
> = (
	& TSArrayTypeNode
	& {
		readonly elementType: T,
	}
);

export type TupleTypeNode<
	T1 extends (
		| TypeNode
		| NamedTupleMember
	) = (
		| TypeNode
		| NamedTupleMember
	),
	T2 extends [T1, ...T1[]] = [T1, ...T1[]],
> = (
	& TSTupleTypeNode
	& {
		readonly elements: (
			& TSTupleTypeNode['elements']
			& T2
		),
	}
);

// @see https://stackoverflow.com/a/64034671/1498831
export type OmitFromTupleish<
	T1 extends unknown[],
	T2
> = (
	T1 extends []
		? []
		: (
			T1 extends [infer T3, ...infer T4]
				? (
					T3 extends T2
						? OmitFromTupleish<T4, T2>
						: [T3, ...OmitFromTupleish<T4, T2>]
				)
				: T1
		)
);
