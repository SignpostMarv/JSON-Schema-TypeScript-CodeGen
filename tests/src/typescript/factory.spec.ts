import {
	describe,
	it,
} from 'node:test';

import ts_assert from '@signpostmarv/ts-assert';

import {
	factory,
} from '../../../src/typescript/index.ts';

void describe('ts.factory.createArrayLiteralExpression()', () => {
	void it('behave as expected', () => {
		ts_assert.isArrayLiteralExpression(
			factory.createArrayLiteralExpression([]),
		);
	});
});
