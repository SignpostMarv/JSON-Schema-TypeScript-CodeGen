import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	StringPassesRegex,
} from '../../src/coercions.ts';

void describe('StringPassesRegex', () => {
	void it('passes', () => {
		assert.ok(StringPassesRegex('foo', /^foo$/));
	});

	void it('fails', () => {
		assert.throws(() => StringPassesRegex('bar', /^foo$/));
	});
});
