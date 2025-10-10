import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import Ajv from 'ajv';

import {
	KeywordType,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../src/Ajv/index.ts';

void describe('KeywordType::ajv_keyword()', () => {
	void it('throws', () => {
		assert.throws(() => KeywordType.ajv_keyword(new Ajv()));
	});
});
