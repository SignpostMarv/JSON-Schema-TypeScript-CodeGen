import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	StringPassesRegexGuard,
} from '../../index.ts';

void describe('StringPassesRegexGuard', () => {
	void it('passes', () => {
		assert.ok(StringPassesRegexGuard('foo', /^foo$/));
	});

	void it('fails', () => {
		assert.throws(() => StringPassesRegexGuard('bar', /^foo$/));
	});
});
