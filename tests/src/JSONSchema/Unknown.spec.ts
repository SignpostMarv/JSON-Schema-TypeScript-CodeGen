import {
	describe,
	it,
} from 'node:test';

import Ajv from 'ajv';

import {
	SyntaxKind,
} from 'typescript';

import ts_assert from '@signpostmarv/ts-assert';

import {
	is_instanceof,
} from '@satisfactory-dev/custom-assert';

import {
	SchemaParser,
	Unknown,
} from '../../../index.ts';

void describe('Unknown', () => {
	void it('comes out of SchemaParser as expected', () => {
		const parser = new SchemaParser({ajv_options: {}});

		const instance = parser.maybe_parse_by_type(
			{},
			(maybe: unknown) => Unknown.is_a(maybe),
		);

		is_instanceof(instance, Unknown);
	});

	void describe('::generate_typescript_type()', () => {
		void it('resolves to Unknown Keyword', async () => {
			const instance = new Unknown({ajv: new Ajv({strict: true})});

			ts_assert.isTokenWithExpectedKind(
				await instance.generate_typescript_type(),
				SyntaxKind.UnknownKeyword,
			);
		});
	});
});
