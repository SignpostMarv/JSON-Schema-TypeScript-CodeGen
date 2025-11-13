import {
	describe,
	it,
} from 'node:test';

import Ajv from 'ajv';

import {
	SyntaxKind,
} from 'typescript';

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import {
	is_instanceof,
// eslint-disable-next-line imports/no-unresolved
} from '@satisfactory-dev/custom-assert';

import {
	SchemaParser,
	Unknown,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';

void describe('Unknown', () => {
	void it('comes out of SchemaParser as expected', () => {
		const parser = new SchemaParser({ajv_options: {}});
		parser.types = parser.share_ajv((ajv) => [
			new Unknown({ajv}),
			...parser.types,
		]);

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
