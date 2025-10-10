import assert from 'node:assert/strict';

import type {
	Expression,
	NamedTupleMember,
	Node,
	TypeElement,
	TypeNode,
} from 'typescript';

import {
	not_undefined,
// eslint-disable-next-line imports/no-unresolved
} from '@satisfactory-dev/custom-assert';

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import type {
	ts_asserter,
} from './types.ts';

import type {
	ArrayLiteralExpression,
	ArrayTypeNode,
	TupleTypeNode,
	TypeLiteralNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../src/typescript/index.ts';
import {
	PositiveIntegerOrZeroGuard,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../index.ts';

function is_Error<
	T extends Error = Error,
>(
	actual: unknown,
	expected: new () => T,
	expected_message?: string,
	message: undefined|string = undefined,
): asserts actual is T {
	assert.ok(
		actual instanceof expected,
		(
			message
			|| `Expecting instance of ${
				expected.name
			}, receieved ${
				actual instanceof Error
					? actual.constructor.name
					: typeof actual
			}`
		),
	);
	if (undefined !== expected_message) {
		assert.equal(
			actual.message,
			expected_message,
			(
				message
				|| `Expecting error message to be "${
					expected_message
				}", received "${
					actual.message
				}"`
			),
		);
	}
}

function throws_Error(
	callback: () => unknown,
	expected: new () => Error,
	expected_message?: string,
	message: undefined|string = undefined,
) {
	try {
		const result = callback();
		assert.fail(
			(
				message
				|| `No ${
					expected.name
				} thrown, found ${
					(result instanceof Function)
						? `instance of ${result.name}`
						: `type ${typeof result}`
				}`
			),
		);
	} catch (e) {
		is_Error(e, expected, expected_message, message);
	}
}

function bool_throw<
	T extends Node = Node,
	Context extends {[key: string]: unknown} = {[key: string]: unknown},
>(
	value: Node,
	callback: ts_asserter<T, Context>,
	context?: Context,
): value is T {
	try {
		callback(value, undefined, context);

		return true;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_) {
		return false;
	}
}

function is_TypeLiteralNode<
	T extends TypeElement,
>(
	value: Node,
	predicate: ts_asserter<T>,
	message?: string|Error,
): asserts value is TypeLiteralNode<T> {
	ts_assert.isTypeLiteralNode(value, message);
	assert.ok(
		value.members.every((maybe) => bool_throw(
			maybe,
			predicate,
		)),
		message,
	);
}

function is_TupleTypeNode<
	T1 extends (TypeNode | NamedTupleMember),
	T2 extends [T1, ...T1[]],
>(
	value: Node,
	predicate: ts_asserter<
		T1,
		{
			index: ReturnType<typeof PositiveIntegerOrZeroGuard<number>>,
			is_last: boolean,
		}
	>,
	message?: string|Error,
): asserts value is TupleTypeNode<T1, T2>;
function is_TupleTypeNode<
	T1 extends (TypeNode | NamedTupleMember),
	T2 extends [T1, ...T1[]],
>(
	value: Node,
	predicate: ts_asserter<
		T1,
		{
			index: ReturnType<typeof PositiveIntegerOrZeroGuard<number>>,
			is_last: boolean,
		}
	>,
	last_is_rest: boolean,
	message?: string|Error,
): asserts value is TupleTypeNode<T1, T2>;
function is_TupleTypeNode<
	T1 extends (TypeNode | NamedTupleMember),
	T2 extends [T1, ...T1[]],
>(
	value: Node,
	predicate: ts_asserter<
		T1,
		{
			index: ReturnType<typeof PositiveIntegerOrZeroGuard<number>>,
			is_last: boolean,
		}
	>,
	last_is_rest: boolean|undefined|string|Error = true,
	message?: string|Error,
): asserts value is TupleTypeNode<T1, T2> {
	if (undefined === last_is_rest) {
		last_is_rest = true;
	}
	if ('boolean' !== typeof last_is_rest) {
		message = last_is_rest;
		last_is_rest = true;
	}
	ts_assert.isTupleTypeNode(value, message);
	const elements = [...value.elements];
	let last: TypeNode|NamedTupleMember|undefined;
	if (last_is_rest) {
		last = elements.pop();
	}
	assert.ok(
		elements.every((maybe, i) => bool_throw(
			maybe,
			predicate,
			{
				index: PositiveIntegerOrZeroGuard(i),
				is_last: i === (value.elements.length - 1),
			},
		)),
		message,
	);

	if (last_is_rest) {
		not_undefined(last);
		ts_assert.isRestTypeNode(last, message);
		const last_type = last.type;
		ts_assert.isArrayTypeNode(last_type, message);
		assert.doesNotThrow(() => predicate(last_type.elementType, message, {
			index: PositiveIntegerOrZeroGuard(value.elements.length - 1),
			is_last: true,
		}));
	}
}

function is_ArrayTypeNode<
	T extends TypeNode,
>(
	value: Node,
	predicate: ts_asserter<T>,
	message?: string|Error,
): asserts value is ArrayTypeNode<T> {
	ts_assert.isArrayTypeNode(value, message);
	predicate(value.elementType, message);
}

function is_ArrayLiteralExpression<
	T1 extends Expression,
	T2 extends T1[],
>(
	value: Node,
	element_asserter: ts_asserter<T1>,
	expected_length: ReturnType<typeof PositiveIntegerOrZeroGuard<number>>,
	message?: string|Error,
): asserts value is ArrayLiteralExpression<T1, T2, boolean> {
	ts_assert.isArrayLiteralExpression(value, message);

	if (value.elements.length !== expected_length) {
		throw new RangeError(
			`value was an ArrayLiteralExpression, but expected ${
				expected_length
			} elements, found ${
				value.elements.length
			}`,
		);
	}

	for (let i = 0; i < value.elements.length; ++i) {
		element_asserter(value.elements[i], message);
	}
}

export {
	is_Error,
	throws_Error,
	bool_throw,
	is_TypeLiteralNode,
	is_TupleTypeNode,
	is_ArrayTypeNode,
	is_ArrayLiteralExpression,
};
