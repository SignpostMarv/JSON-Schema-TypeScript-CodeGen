import type {
	Expression,
	NamedTupleMember,
	ObjectLiteralElementLike,
	TypeElement,
	TypeNode,
} from 'typescript';
import {
	factory,
} from 'typescript';
import type {
	ArrayLiteralExpression,
	ArrayTypeNode,
	IntersectionTypeNode,
	ObjectLiteralExpression,
	TupleTypeNode,
	TypeLiteralNode,
} from './types.ts';

export function object_keys<
	T extends string,
>(
	value: {[key in T]: unknown},
): T[] {
	return Object.keys(value) as T[];
}

// eslint-disable-next-line @stylistic/max-len
// refer to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#keywords
const reserved_words = new Set([
	'break',
	'case',
	'catch',
	'class',
	'const',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'else',
	'export',
	'extends',
	'false',
	'finally',
	'for',
	'function',
	'if',
	'import',
	'in',
	'instanceof',
	'new',
	'null',
	'return',
	'super',
	'switch',
	'this',
	'throw',
	'true',
	'try',
	'typeof',
	'var',
	'void',
	'while',
	'with',
	'let',
	'static',
	'yield',
	'await',
	'enum',
	'implements',
	'interface',
	'package',
	'private',
	'protected',
	'public',
	'arguments',
	'as',
	'async',
	'eval',
	'from',
	'get',
	'of',
	'set',
]);

export function adjust_name_default(value: string): string {
	if (reserved_words.has(value)) {
		return `__${value}`;
	}

	if (value.match(/^\d+(\.\d+)+$/)) {
		value = `v${value}`;
	}

	return value;
}

export type adjust_name_callback = Required<
	Parameters<typeof adjust_name_finisher>
>['1'];

export function adjust_name_finisher(
	value: string,
	callback: (value: string) => string = adjust_name_default,
): string {
	const result = callback(value).replace(/[^A-Za-z_\d ]/g, '_');

	if (/^\d+/.test(result)) {
		return `_${result}`;
	}

	return result;
}

export function type_literal_node<
	T extends TypeElement,
>(
	value: T[],
): TypeLiteralNode<T> {
	return factory.createTypeLiteralNode(value) as TypeLiteralNode<T>;
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

export function array_type_node<
	T1 extends TypeNode,
>(
	value: T1,
): ArrayTypeNode<T1> {
	return factory.createArrayTypeNode(value) as ArrayTypeNode<T1>;
}

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
