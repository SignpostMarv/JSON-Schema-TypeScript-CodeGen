import {
	describe,
	it,
} from 'node:test';
import {
	throws_Error,
} from '../../../assertions.ts';
import {
	Type,
} from '../../../../src/JSONSchema/Type.ts';

void describe('Type.schema_definition()', () => {
	void it('will always fail', () => {
		throws_Error(
			() => Type.schema_definition({}),
			Error,
			'Not implemented!',
		);
	})
})
