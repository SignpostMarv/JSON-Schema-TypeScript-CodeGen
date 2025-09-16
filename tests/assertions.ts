import assert from 'node:assert/strict';

import type {
	NamedTupleMember,
	Node,
	TypeElement,
	TypeNode,
} from 'typescript';

import {
	not_undefined,
} from '@satisfactory-dev/custom-assert';

import ts_assert from '@signpostmarv/ts-assert';

import type {
	TupleTypeNode,
	TypeLiteralNode,
} from '../src/types.ts';

import type {
	ts_asserter,
} from './types.ts';

export function is_Error<
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

export function throws_Error(
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

export function bool_throw<T1, T2>(
	value: T1,
	callback: (value:T1|T2) => asserts value is T2,
): value is T1 & T2 {
	try {
		callback(value);
		return true;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_) {
		return false;
	}
}

export function is_TypeLiteralNode<
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

export function is_TupleTypeNode<
	T1 extends (TypeNode | NamedTupleMember),
	T2 extends [T1, ...T1[]],
>(
	value: Node,
	predicate: ts_asserter<T1>,
	message?: string|Error,
): asserts value is TupleTypeNode<T1, T2> {
	ts_assert.isTupleTypeNode(value, message);
	const elements = [...value.elements];
	const last = (elements as unknown as Node[]).pop();
	not_undefined(last);
	assert.ok(
		elements.every((maybe) => bool_throw(
			maybe,
			predicate,
		)),
		message,
	);
	ts_assert.isRestTypeNode(last, message);
	assert.doesNotThrow(() => predicate(last.type, message));
}
