import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

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
})
