import {
	describe,
	it,
} from 'node:test';

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import {
	factory,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../src/typescript/index.ts';

void describe('ts.factory.createArrayLiteralExpression()', () => {
	void it('behave as expected', () => {
		ts_assert.isArrayLiteralExpression(
			factory.createArrayLiteralExpression([]),
		);
	});
});
