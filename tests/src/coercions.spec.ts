import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	StringPassesRegexGuard,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../index.ts';

void describe('StringPassesRegexGuard', () => {
	void it('passes', () => {
		assert.ok(StringPassesRegexGuard('foo', /^foo$/));
	});

	void it('fails', () => {
		assert.throws(() => StringPassesRegexGuard('bar', /^foo$/));
	});
});
