import type {
	BooleanLiteral,
	Expression,
	LiteralExpression,
	NamedTupleMember,
	NodeArray,
	NullLiteral,
	ObjectLiteralElementLike,
	PrefixUnaryExpression,
	ArrayLiteralExpression as TSArrayLiteralExpression,
	ArrayTypeNode as TSArrayTypeNode,
	Identifier as TSIdentifier,
	IntersectionTypeNode as TSIntersectionTypeNode,
	LiteralTypeNode as TSLiteralTypeNode,
	ObjectLiteralExpression as TSObjectLiteralExpression,
	TupleTypeNode as TSTupleTypeNode,
	TypeLiteralNode as TSTypeLiteralNode,
	TypeReferenceNode as TSTypeReferenceNode,
	TypeElement,
	TypeNode,
} from 'typescript';


export type LiteralTypeNode<
	T extends (
		| NullLiteral
		| BooleanLiteral
		| LiteralExpression
		| PrefixUnaryExpression
	),
> = TSLiteralTypeNode & {literal: T};

export type TypeLiteralNode<
	T extends TypeElement,
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
	T3 extends boolean,
> = (
	& TSArrayLiteralExpression
	& {
		readonly __guard_multiLine: T3,
		readonly elements: (
			& TSArrayLiteralExpression['elements']
			& T2
		),
	}
);

export type ObjectLiteralExpression<
	Properties extends (
		undefined|(readonly ObjectLiteralElementLike [])
	) = (
		undefined|(readonly ObjectLiteralElementLike [])
	),
	MultiLine extends undefined|boolean = undefined|boolean,
> = (
	& TSObjectLiteralExpression
	& {
		readonly properties: Properties,
		readonly __guard_multiLine: MultiLine,
	}
);

export type Identifier<
	Name extends string,
> = (
	& TSIdentifier
	& {
		readonly text: Name,
	}
);

export type TypeReferenceNode<
	Name extends string = string,
	Arguments extends (
		| never[]
		| [TypeNode, ...TypeNode[]]
	) = never[],
> = (
	& TSTypeReferenceNode
	& {
		readonly typeName: Identifier<Name>,
	}
	& (
		Arguments extends [TypeNode, ...TypeNode[]]
			? {
				readonly typeArguments: Arguments,
			}
			: {
				readonly typeArguments: undefined,
			}
	)
);
