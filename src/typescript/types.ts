import type {
	BooleanLiteral,
	EntityName,
	Expression,
	LeftHandSideExpression,
	LiteralExpression,
	NamedTupleMember,
	NodeArray,
	NullLiteral,
	ObjectLiteralElementLike,
	PrefixUnaryExpression,
	QuestionDotToken,
	ArrayLiteralExpression as TSArrayLiteralExpression,
	ArrayTypeNode as TSArrayTypeNode,
	AsExpression as TSAsExpression,
	CallExpression as TSCallExpression,
	Identifier as TSIdentifier,
	IntersectionTypeNode as TSIntersectionTypeNode,
	LiteralTypeNode as TSLiteralTypeNode,
	ObjectLiteralExpression as TSObjectLiteralExpression,
	StringLiteral as TSStringLiteral,
	TupleTypeNode as TSTupleTypeNode,
	TypeLiteralNode as TSTypeLiteralNode,
	TypeReferenceNode as TSTypeReferenceNode,
	UnionTypeNode as TSUnionTypeNode,
	TypeElement,
	TypeNode,
} from 'typescript';

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

export type ArrayTypeNode<
	T extends TypeNode = TypeNode,
> = (
	& TSArrayTypeNode
	& {
		readonly elementType: T,
	}
);

export type AsExpression<
	T1 extends Expression,
	T2 extends TypeNode,
> = (
	& TSAsExpression
	& {
		readonly expression: T1,
		readonly type: T2,
	}
);

export type CallExpression<
	T1 extends LeftHandSideExpression,
	HasQuestionDotToken extends 'yes'|'no',
	TypeArguments extends (
		| never[]
		| [TypeNode, ...TypeNode[]]
	) = never[],
	Arguments extends (
		| never[]
		| [Expression, ...Expression[]]
	) = never[],
> = (
	& TSCallExpression
	& {
		readonly expression: T1,
		readonly questionDotToken: {
			yes: QuestionDotToken,
			no: undefined,
		}[HasQuestionDotToken],
		readonly typeArguments: (
			TypeArguments extends Exclude<
				(
					| never[]
					| [TypeNode, ...TypeNode[]]
				),
				never[]
			>
				? TypeArguments
				: undefined
		),
		readonly arguments: (
			Arguments extends Exclude<
				(
					| never[]
					| [Expression, ...Expression[]]
				),
				never[]
			>
				? Arguments
				: undefined
		),
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

export type IntersectionTypeNode<
	T extends [TypeNode, ...TypeNode[]],
> = (
	& TSIntersectionTypeNode
	& {
		readonly types: T,
	}
);

export type LiteralTypeNode<
	T extends (
		| NullLiteral
		| BooleanLiteral
		| LiteralExpression
		| PrefixUnaryExpression
	),
> = TSLiteralTypeNode & {literal: T};

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

export type StringLiteral<
	Value extends string = string,
> = (
	& TSStringLiteral
	& {
		readonly text: Value,
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

export type TypeLiteralNode<
	T extends TypeElement,
> = (
	& TSTypeLiteralNode
	& {
		readonly members: NodeArray<T>,
	}
);

export type TypeReferenceNode<
	Name extends string|EntityName = string|EntityName,
	Arguments extends (
		| never[]
		| [TypeNode, ...TypeNode[]]
	) = never[],
> = (
	& TSTypeReferenceNode
	& {
		readonly typeName: Name extends string ? Identifier<Name> : Name,
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

export type UnionTypeNode<
	Types extends [
		TypeNode,
		TypeNode,
		...TypeNode[],
	] = [
		TypeNode,
		TypeNode,
		...TypeNode[],
	],
> = (
	& TSUnionTypeNode
	& {
		readonly types: Types,
	}
);
