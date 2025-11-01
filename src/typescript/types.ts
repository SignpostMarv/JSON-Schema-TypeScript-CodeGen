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
	NodeFactory as TSNodeFactory,
	ObjectLiteralExpression as TSObjectLiteralExpression,
	RestTypeNode as TSRestTypeNode,
	StringLiteral as TSStringLiteral,
	TupleTypeNode as TSTupleTypeNode,
	TypeLiteralNode as TSTypeLiteralNode,
	TypeReferenceNode as TSTypeReferenceNode,
	UnionTypeNode as TSUnionTypeNode,
	TypeElement,
	TypeNode,
} from 'typescript';

type ArrayLiteralExpression<
	T1 extends Expression,
	T2 extends T1[],
	T3 extends boolean,
> = (
	& TSArrayLiteralExpression
	& {
		readonly multiLine?: T3,
		readonly elements: (
			& TSArrayLiteralExpression['elements']
			& T2
		),
	}
);

type ArrayTypeNode<
	T extends TypeNode = TypeNode,
> = (
	& TSArrayTypeNode
	& {
		readonly elementType: T,
	}
);

type AsExpression<
	T1 extends Expression,
	T2 extends TypeNode,
> = (
	& TSAsExpression
	& {
		readonly expression: T1,
		readonly type: T2,
	}
);

type CallExpression<
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

type Identifier<
	Name extends string,
> = (
	& TSIdentifier
	& {
		readonly text: Name,
	}
);

type IntersectionTypeNode<
	T extends [TypeNode, ...TypeNode[]],
> = (
	& TSIntersectionTypeNode
	& {
		readonly types: T,
	}
);

type LiteralTypeNode<
	T extends (
		| NullLiteral
		| BooleanLiteral
		| LiteralExpression
		| PrefixUnaryExpression
	),
> = TSLiteralTypeNode & {literal: T};

type ObjectLiteralExpression<
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
		readonly multiLine?: MultiLine,
	}
);

type StringLiteral<
	Value extends string = string,
> = (
	& TSStringLiteral
	& {
		readonly text: Value,
	}
);

type EmptyTupleTypeNode = (
	& TSTupleTypeNode
	& {
		readonly elements: (
			& TSTupleTypeNode['elements']
			& never[]
		),
	}
);

type RestTypeNode<
	T1 extends TypeNode,
> = (
	& TSRestTypeNode
	& {
		readonly type: T1,
	}
);

type RestedTupleTypeNode<
	T1 extends TypeNode,
> = (
	& TSTupleTypeNode
	& {
		readonly elements: (
			& TSTupleTypeNode['elements']
			& [
				T1,
				RestTypeNode<ArrayTypeNode<T1>>,
			]
		),
	}
);

type TupleTypeNode<
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

type TypeLiteralNode<
	T extends TypeElement,
> = (
	& TSTypeLiteralNode
	& {
		readonly members: NodeArray<T>,
	}
);

type TypeReferenceNode<
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

type UnionTypeNode<
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

interface NodeFactory extends TSNodeFactory {
	createArrayLiteralExpression<
		T1 extends Expression,
		T2 extends T1[],
		T3 extends boolean,
	>(
		elements?: readonly Expression[],
		multiLine?: boolean,
	): ArrayLiteralExpression<T1, T2, T3>;

	createArrayTypeNode<
		T1 extends TypeNode,
	>(
		value: T1,
	): ArrayTypeNode<T1>;

	createCallExpression<
		T1 extends LeftHandSideExpression,
		TypeArguments extends (
			| never[]
			| [TypeNode, ...TypeNode[]]
		) = never[],
		Arguments extends (
			| never[]
			| [Expression, ...Expression[]]
		) = never[],
	>(
		expression: T1,
		typeArguments: TypeArguments,
		args: Arguments,
	): CallExpression<
		T1,
		'no',
		TypeArguments,
		Arguments
	>;

	createIdentifier<T extends string>(value: T): Identifier<T>;

	createIntersectionTypeNode<
		T extends [TypeNode, ...TypeNode[]],
	>(
		value: T,
	): IntersectionTypeNode<T>;

	createLiteralTypeNode<
		T extends TSLiteralTypeNode['literal'],
	>(value: T): LiteralTypeNode<T>;

	createObjectLiteralExpression<
		T1 extends undefined|(readonly ObjectLiteralElementLike []),
		T2 extends undefined|boolean,
	>(
		properties?: T1,
		multiLine?: T2,
	): ObjectLiteralExpression<T1, T2>;

	createRestTypeNode<T1 extends TypeNode>(node: T1): RestTypeNode<T1>;

	createStringLiteral<
		T extends string,
	>(value: T): StringLiteral<T>;

	createTupleTypeNode(value: never[]): EmptyTupleTypeNode;
	createTupleTypeNode<
		T1 extends (
			| TypeNode
			| NamedTupleMember
		) = (
			| TypeNode
			| NamedTupleMember
		),
		T2 extends [
			T1,
			RestTypeNode<ArrayTypeNode<T1>>,
		] = [
			T1,
			RestTypeNode<ArrayTypeNode<T1>>,
		],
	>(
		value: T2,
	): RestedTupleTypeNode<T1>;
	createTupleTypeNode<
		T1 extends (
			| TypeNode
			| NamedTupleMember
		) = (
			| TypeNode
			| NamedTupleMember
		),
		T2 extends [T1, ...T1[]] = [T1, ...T1[]],
	>(
		value: T2,
	): TupleTypeNode<T1, T2>;

	createTypeLiteralNode<
		T extends TypeElement,
	>(
		value: T[],
	): TypeLiteralNode<T>;

	createTypeReferenceNode<
		T1 extends string|EntityName,
		T2 extends [TypeNode, ...TypeNode[]],
	>(
		name: string,
		type_arguments: [TypeNode, ...TypeNode[]],
	): TypeReferenceNode<T1, T2>;
	createTypeReferenceNode<
		T1 extends string,
	>(
		name: string,
	): TypeReferenceNode<T1, never[]>;
	createTypeReferenceNode<
		T1 extends string,
		T2 extends never[]|[TypeNode, ...TypeNode[]],
	>(
		name: string,
		type_arguments?: [TypeNode, ...TypeNode[]],
	): TypeReferenceNode<T1, T2>;

	createUnionTypeNode<
		T extends [TypeNode, TypeNode, ...TypeNode[]],
	>(value: T): UnionTypeNode<T>;
}

export type {
	ArrayLiteralExpression,
	ArrayTypeNode,
	AsExpression,
	CallExpression,
	Identifier,
	IntersectionTypeNode,
	LiteralTypeNode,
	NodeFactory,
	ObjectLiteralExpression,
	StringLiteral,
	RestedTupleTypeNode,
	EmptyTupleTypeNode,
	TupleTypeNode,
	TypeLiteralNode,
	TypeReferenceNode,
	UnionTypeNode,
};
