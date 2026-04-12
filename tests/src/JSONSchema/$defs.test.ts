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
} from '@satisfactory-dev/custom-assert';

import {
	isIdentifier,
	isNamedExports,
	isObjectLiteralExpression,
} from '@signpostmarv/ts-assert';

import type {
	PropertySignature,
} from 'typescript';

import type {
	ts_asserter,
} from '../../types.ts';

import {
	$defs,
	SchemaParser,
} from '../../../index.ts';

import type {
	TypeLiteralNode,
} from '../../../src/typescript/index.ts';

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
				isNamedExports(maybe);

				assert.equal(maybe.elements.length, 1);

				not_undefined(maybe.elements[0].name);
				const {name} = maybe.elements[0];
				isIdentifier(name);
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

				isObjectLiteralExpression(result);
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
