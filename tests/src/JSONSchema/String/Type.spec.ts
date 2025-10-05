import {
	describe,
	it,
} from 'node:test';

import {
	throws_Error,
} from '../../../assertions.ts';

import {
	Type,
} from '../../../../index.ts';

void describe('Type.generate_schema_definition()', () => {
	void it('will always fail', () => {
		throws_Error(
			() => Type.generate_schema_definition({}),
			Error,
			'Not implemented!',
		);
	});
});

void describe('Type.generate_type_definition()', () => {
	void it('will always fail', () => {
		throws_Error(
			() => Type.generate_type_definition({}),
			Error,
			'Not implemented!',
		);
	});
});
