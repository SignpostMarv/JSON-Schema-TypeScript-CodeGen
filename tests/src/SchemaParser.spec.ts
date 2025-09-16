import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	share_ajv_callback,
} from '../../src/SchemaParser.ts';
import {
	SchemaParser,
} from '../../src/SchemaParser.ts';

import {
	$ref,
} from '../../src/JSONSchema/Ref.ts';

void describe('SchemaParser', () => {
	void describe('.parse()', () => {
		void it('fails with {}', () => {
			const parser = new SchemaParser();

			assert.throws(() => parser.parse({}));
		})

		void it(
			'fails when requiring conversion with non-convertible types',
			() => {
				const ajv = new Ajv({
					strict: true,
				});
				const instance = new $ref({mode: 'either'}, {ajv});
				const parser = new SchemaParser({
					ajv,
					types: [
						instance,
					],
				});
				const type_schema = {
					type: 'object',
					required: ['$ref'],
					additionalProperties: false,
					properties: {
						$ref: {
							type: 'string',
							// eslint-disable-next-line max-len
							pattern: '^([a-zA-Z0-9][a-zA-Z0-9._-]*)?#\\/\\$defs\\/([a-zA-Z0-9][a-zA-Z0-9._-]*)$',
						},
					},
				};
				assert.ok(instance.can_handle_schema(type_schema));
				assert.doesNotThrow(() => parser.parse(type_schema));
				assert.throws(() => parser.parse(type_schema, true));
			},
		);
	})

	void describe('.share_ajv()', () => {
		// intended to return the same instance as input
		type DataSetSameReturn<T> = [
			share_ajv_callback<T>,
			// considered a pass or a fail if it returns the same input
			boolean,
		];
		type DataSet<T = unknown> = (
			| DataSetSameReturn<T>
			| [ // intended to return something else
				...DataSetSameReturn<T>,
				unknown,
			]
		);

		const data_sets: [DataSet, ...DataSet[]] = [
			[(ajv: Ajv) => ajv, true],
			[(ajv: Ajv) => new Ajv(ajv.opts), false],
			[() => 1, false, 1],
		];

		data_sets.forEach((
			data_set,
			i,
		) => {
			const ajv = new Ajv({strict: true});
			const parser = new SchemaParser({ajv});

			void it(`behaves with data_sets[${i}]`, () => {
				const result_direct = data_set[0](ajv);
				const result_invoked = parser.share_ajv(data_set[0]);

				if (2 === data_set.length) {
					assert.equal(
						ajv === result_direct,
						data_set[1],
					);
					assert.equal(
						ajv === result_invoked,
						data_set[1],
					);
				} else {
					if (!data_set[1]) {
						assert.notEqual(result_direct, ajv);
						assert.notEqual(result_invoked, ajv);
					}
					assert.equal(result_direct, data_set[2]);
					assert.equal(result_invoked, data_set[2]);
				}
			});
		})
	})
})
