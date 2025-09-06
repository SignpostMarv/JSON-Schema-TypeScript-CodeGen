import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';
import {
	SchemaParser,
} from '../../src/SchemaParser.ts';

void describe('SchemaParser', () => {
	void describe('.parse()', () => {
		void it('fails', () => {
			const parser = new SchemaParser();

			assert.throws(() => parser.parse({}));
		})
	})
})
