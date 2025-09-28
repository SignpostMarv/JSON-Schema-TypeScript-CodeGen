import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import Ajv from 'ajv';

import {
	KeywordType,
} from '../../../src/Ajv/Keyword.ts';

void describe('KeywordType::ajv_keyword()', () => {
	void it('throws', () => {
		assert.throws(() => KeywordType.ajv_keyword(new Ajv()));
	});
});
