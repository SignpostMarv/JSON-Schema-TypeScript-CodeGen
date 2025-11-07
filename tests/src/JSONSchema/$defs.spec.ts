import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import {
	not_undefined,
// eslint-disable-next-line imports/no-unresolved
} from '@satisfactory-dev/custom-assert';

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import type {
	PropertySignature,
} from 'typescript';
import {
	isPropertySignature,
} from 'typescript';

import type {
	ts_asserter,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../types.ts';

import {
	$defs,
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';

import type {
	TypeLiteralNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../src/typescript/index.ts';

import {
	is_TypeLiteralNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../assertions.ts';

void describe('$defs', () => {
	type DataSet = [
		ConstructorParameters<typeof $defs>[1],
		ts_asserter<TypeLiteralNode<PropertySignature>>,
	];

	const data_sets: [DataSet, ...DataSet[]] = [
		[
			{
				foo: {
					type: 'string',
				},
			},
			(maybe) => {
				is_TypeLiteralNode(maybe, isPropertySignature);

				assert.equal(maybe.members.length, 1);

				not_undefined(maybe.members[0].name);
				const {name} = maybe.members[0];
				ts_assert.isIdentifier(name);
				assert.equal(name.text, 'foo');
			},
		],
	];

	void describe('::generate_typescript_data()', () => {
		data_sets.forEach(([specific_options], i) => {
			const ajv = new Ajv({strict: true});
			const instance = new $defs({ajv}, specific_options, {});

			void it(`behaves with data_sets[${i}]`, () => {
				const result = instance.generate_typescript_data();

				ts_assert.isObjectLiteralExpression(result);
				assert.equal(result.properties.length, 0);
			});
		});
	});

	void describe('::generate_typescript_type()', () => {
		data_sets.forEach(([specific_options, expectation], i) => {
			const ajv = new Ajv({strict: true});
			const schema_parser = new SchemaParser({ajv});
			const a = new $defs({ajv}, specific_options, {});
			const b = new $defs({ajv}, {}, {});

			void it(`behaves with data_sets[${i}]`, async () => {
				const foo: ts_asserter = expectation;

				foo(await a.generate_typescript_type({
					schema: {
						$defs: specific_options,
					},
					schema_parser,
				}));

				foo(await b.generate_typescript_type({
					schema: {
						$defs: specific_options,
					},
					schema_parser,
				}));
			});
		});
	});
});
