import assert from 'node:assert/strict';

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
