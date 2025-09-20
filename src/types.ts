import type {
	BooleanLiteral,
	Expression,
	LiteralExpression,
	NamedTupleMember,
	NodeArray,
	NullLiteral,
	PrefixUnaryExpression,
	ArrayLiteralExpression as TSArrayLiteralExpression,
	ArrayTypeNode as TSArrayTypeNode,
	IntersectionTypeNode as TSIntersectionTypeNode,
	LiteralTypeNode as TSLiteralTypeNode,
	TupleTypeNode as TSTupleTypeNode,
	TypeLiteralNode as TSTypeLiteralNode,
	TypeElement,
	TypeNode,
} from 'typescript';

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

export type ArrayLiteralExpression<
	T1 extends Expression,
	T2 extends T1[],
	T3 extends boolean
> = (
	& TSArrayLiteralExpression
	& {
		readonly __guard_multiLine: T3,
		readonly elements: (
			& TSArrayLiteralExpression['elements']
			& T2
		)
	}
)

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

export type OmitFromTupleishIf<
	T1 extends unknown[],
	T2,
	If extends 'with'|'without'|'optional'
> = If extends 'without'
	? OmitFromTupleish<T1, T2>
	: (
		If extends 'with'
			? T1
			: OmitFromTupleish<T1, T2>
	);

export type PartialPick<
	T,
	K extends keyof T,
> = (
	& Omit<T, K>
	& Partial<Pick<T, K>>
);

export type OmitIf<
	T,
	K extends keyof T,
	If extends 'with'|'without'|'optional'
> = If extends 'without'
	? Omit<T, K>
	: (
		If extends 'optional'
			? PartialPick<T, K>
			: T
	);
