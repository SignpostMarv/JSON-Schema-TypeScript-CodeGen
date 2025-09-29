import type {
	Expression,
	LeftHandSideExpression,
	NamedTupleMember,
	ObjectLiteralElementLike,
	LiteralTypeNode as TSLiteralTypeNode,
	TypeElement,
	TypeNode,
} from 'typescript';
import {
	factory,
} from 'typescript';

import type {
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

export function array_literal_expression<
	T1 extends Expression,
	T2 extends T1[],
	T3 extends boolean,
>(elements: T2, multiLine: T3): ArrayLiteralExpression<T1, T2, T3> {
	return factory.createArrayLiteralExpression(
		elements,
		multiLine,
	) as ArrayLiteralExpression<T1, T2, T3>;
}

export function array_type_node<
	T1 extends TypeNode,
>(
	value: T1,
): ArrayTypeNode<T1> {
	return factory.createArrayTypeNode(value) as ArrayTypeNode<T1>;
}

export function call_expression<
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
	return factory.createCallExpression(
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

export function identifier<T extends string>(value: T): Identifier<T> {
	return factory.createIdentifier(value) as Identifier<T>;
}

export function intersection_type_node<
	T extends [TypeNode, ...TypeNode[]],
>(
	value: T,
): IntersectionTypeNode<T> {
	return factory.createIntersectionTypeNode(
		value,
	) as IntersectionTypeNode<T>;
}

export function literal_type_node<
	T extends TSLiteralTypeNode['literal'],
>(value: T): LiteralTypeNode<T> {
	return factory.createLiteralTypeNode(value) as LiteralTypeNode<T>;
}

export function object_literal_expression<
	T1 extends undefined|(readonly ObjectLiteralElementLike []),
	T2 extends undefined|boolean,
>(
	properties?: T1,
	multiLine?: T2,
): ObjectLiteralExpression<T1, T2> {
	return factory.createObjectLiteralExpression(
		properties,
		multiLine,
	) as ObjectLiteralExpression<T1, T2>;
}

export function string_literal<
	T extends string,
>(value: T): StringLiteral<T> {
	return factory.createStringLiteral(value) as StringLiteral<T>;
}

export function tuple_type_node<
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
	return factory.createTupleTypeNode(value) as TupleTypeNode<T1, T2>;
}

export function type_literal_node<
	T extends TypeElement,
>(
	value: T[],
): TypeLiteralNode<T> {
	return factory.createTypeLiteralNode(value) as TypeLiteralNode<T>;
}

export function type_reference_node<
	T1 extends string,
	T2 extends [TypeNode, ...TypeNode[]],
>(
	name: string,
	type_arguments: [TypeNode, ...TypeNode[]],
): TypeReferenceNode<T1, T2>;
export function type_reference_node<
	T1 extends string,
>(
	name: string,
): TypeReferenceNode<T1, never[]>;
export function type_reference_node<
	T1 extends string,
	T2 extends never[]|[TypeNode, ...TypeNode[]],
>(
	name: string,
	type_arguments?: [TypeNode, ...TypeNode[]],
): TypeReferenceNode<T1, T2> {
	return factory.createTypeReferenceNode(
		name,
		type_arguments ? type_arguments : undefined,
	) as TypeReferenceNode<T1, T2>;
}

export function union_type_node<
	T extends [TypeNode, TypeNode, ...TypeNode[]],
>(value: T): UnionTypeNode<T> {
	return factory.createUnionTypeNode(value) as UnionTypeNode<T>;
}
