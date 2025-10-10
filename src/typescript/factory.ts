import type {
	EntityName,
	Expression,
	LeftHandSideExpression,
	NamedTupleMember,
	ObjectLiteralElementLike,
	LiteralTypeNode as TSLiteralTypeNode,
	NodeFactory as TSNodeFactory,
	TypeElement,
	TypeNode,
} from 'typescript';

import {
	factory as TSfactory,
} from 'typescript';

import type{
	ArrayLiteralExpression,
	ArrayTypeNode,
	CallExpression,
	Identifier,
	IntersectionTypeNode,
	LiteralTypeNode,
	ObjectLiteralExpression,
	StringLiteral,
	TupleTypeNode,
	TypeLiteralNode,
	TypeReferenceNode,
	UnionTypeNode,
} from './types.ts';

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

	createStringLiteral<
		T extends string,
	>(value: T): StringLiteral<T>;

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
		T1 extends string,
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

function createArrayLiteralExpression<
	T1 extends Expression,
	T2 extends T1[],
	T3 extends boolean,
>(
	this: void,
	elements?: readonly Expression[],
	multiLine?: boolean,
): ArrayLiteralExpression<T1, T2, T3> {
	return TSfactory.createArrayLiteralExpression(
		elements,
		multiLine,
	) as ArrayLiteralExpression<T1, T2, T3>;
}

function createArrayTypeNode<
	T1 extends TypeNode,
>(value: T1): ArrayTypeNode<T1> {
	return TSfactory.createArrayTypeNode(value) as ArrayTypeNode<T1>;
}

function createCallExpression<
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
> {
	return TSfactory.createCallExpression(
		expression,
		typeArguments,
		args,
	) as CallExpression<
		T1,
		'no',
		TypeArguments,
		Arguments
	>;
}

function createIdentifier<T extends string>(value: T): Identifier<T> {
	return TSfactory.createIdentifier(value) as Identifier<T>;
}

function createIntersectionTypeNode<
	T extends [TypeNode, ...TypeNode[]],
>(
	value: T,
): IntersectionTypeNode<T> {
	return TSfactory.createIntersectionTypeNode(
		value,
	) as IntersectionTypeNode<T>;
}

function createLiteralTypeNode<
	T extends TSLiteralTypeNode['literal'],
>(value: T): LiteralTypeNode<T> {
	return TSfactory.createLiteralTypeNode(value) as LiteralTypeNode<T>;
}

function createObjectLiteralExpression<
	T1 extends undefined|(readonly ObjectLiteralElementLike []),
	T2 extends undefined|boolean,
>(
	properties?: T1,
	multiLine?: T2,
): ObjectLiteralExpression<T1, T2> {
	return TSfactory.createObjectLiteralExpression(
		properties,
		multiLine,
	) as ObjectLiteralExpression<T1, T2>;
}

function createStringLiteral<
	T extends string,
>(value: T): StringLiteral<T> {
	return TSfactory.createStringLiteral(value) as StringLiteral<T>;
}

function createTupleTypeNode<
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
): TupleTypeNode<T1, T2> {
	return TSfactory.createTupleTypeNode(value) as TupleTypeNode<T1, T2>;
}

function createTypeLiteralNode<
	T extends TypeElement,
>(
	value: T[],
): TypeLiteralNode<T> {
	return TSfactory.createTypeLiteralNode(value) as TypeLiteralNode<T>;
}

function createTypeReferenceNode<
	T1 extends string,
	T2 extends [TypeNode, ...TypeNode[]],
>(
	name: string,
	type_arguments: [TypeNode, ...TypeNode[]],
): TypeReferenceNode<T1, T2>;
function createTypeReferenceNode<
	T1 extends string,
>(
	name: string,
): TypeReferenceNode<T1, never[]>;
function createTypeReferenceNode<
	T1 extends string|EntityName,
	T2 extends never[]|[TypeNode, ...TypeNode[]],
>(
	name: T1,
	type_arguments?: [TypeNode, ...TypeNode[]],
): TypeReferenceNode<T1, T2> {
	return TSfactory.createTypeReferenceNode(
		name,
		type_arguments ? type_arguments : undefined,
	) as TypeReferenceNode<T1, T2>;
}

function createUnionTypeNode<
	T extends [TypeNode, TypeNode, ...TypeNode[]],
>(value: T): UnionTypeNode<T> {
	return TSfactory.createUnionTypeNode(value) as UnionTypeNode<T>;
}

const factory: NodeFactory = {
	...TSfactory,
	createArrayLiteralExpression,
	createArrayTypeNode,
	createCallExpression,
	createIdentifier,
	createIntersectionTypeNode,
	createLiteralTypeNode,
	createObjectLiteralExpression,
	createStringLiteral,
	createTupleTypeNode,
	createTypeLiteralNode,
	createTypeReferenceNode,
	createUnionTypeNode,
};

export type {
	NodeFactory,
};

export {
	factory,
};
