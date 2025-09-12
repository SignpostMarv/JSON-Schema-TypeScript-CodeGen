import assert from 'node:assert/strict';

import type {
	Node,
	TypeElement,
} from 'typescript';

import ts_assert from '@signpostmarv/ts-assert';

import type {
	TypeLiteralNode,
} from '../src/types';

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
	predicate: (value: Node, message?:string|Error) => asserts value is T,
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
