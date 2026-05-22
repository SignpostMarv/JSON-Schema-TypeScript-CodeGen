import {
	describe,
	it,
} from 'node:test';

import {
	isArrayLiteralExpression,
} from '@signpostmarv/ts-assert';

import {
	factory,
} from 'typescript';

import {
	coerce_factory,
} from '../../../src/typescript/index.ts';

void describe('ts.factory.createArrayLiteralExpression()', () => {
	void it('behave as expected', () => {
		isArrayLiteralExpression(
			coerce_factory(factory).createArrayLiteralExpression([]),
		);
	});
});
