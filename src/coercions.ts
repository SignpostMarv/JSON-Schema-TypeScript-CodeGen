
import type {
	LiteralTypeNode,
	StringLiteral,
} from './typescript/types.ts';

import {
	literal_type_node,
	string_literal,
} from './typescript/coercions.ts';

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

export type StringTupleToLiteralTypeNodeTuple<
	T1 extends readonly string[],
> = T1 extends [string, ...string[]]
	? {
		[K in keyof T1]: T1[K] extends string
			? LiteralTypeNode<StringLiteral<T1[K]>>
			: never
	}
	: LiteralTypeNode<StringLiteral<T1[0]>>[];

export function StringTupleToLiteralTypeNodeTuple<
	T1 extends readonly string[],
>(value: T1): StringTupleToLiteralTypeNodeTuple<T1> {
	const enum_as_literal = value.map(
		(item) => literal_type_node(string_literal(item)),
	);

	return enum_as_literal as StringTupleToLiteralTypeNodeTuple<T1>;
}


