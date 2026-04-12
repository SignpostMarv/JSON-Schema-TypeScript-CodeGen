import {
	describe,
	it,
} from 'node:test';

import {
	isArrayLiteralExpression,
} from '@signpostmarv/ts-assert';

import {
	factory,
} from '../../../src/typescript/index.ts';

void describe('ts.factory.createArrayLiteralExpression()', () => {
	void it('behave as expected', () => {
		isArrayLiteralExpression(
			factory.createArrayLiteralExpression([]),
		);
	});
});
