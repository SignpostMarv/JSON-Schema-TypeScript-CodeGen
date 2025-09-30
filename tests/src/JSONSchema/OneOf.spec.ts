import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import {
	OneOf,
} from '../../../src/JSONSchema/OneOf.ts';

import type {
	$ref_mode,
} from '../../../src/JSONSchema/Ref.ts';
import {
	$ref,
} from '../../../src/JSONSchema/Ref.ts';

void describe('OneOf', () => {
	void describe('::is_a()', () => {
		void it('behaves as expected', () => {
			const ajv = new Ajv({strict: true});

			assert.ok(OneOf.is_a(new OneOf<unknown, 'unspecified'>({
				ajv,
				type_definition: {
					mode: 'unspecified',
				},
				schema_definition: {
					mode: 'unspecified',
				},
			})));
			assert.ok(OneOf.is_a<$ref<$ref_mode>>(
				new OneOf<unknown, 'unspecified'>({
					ajv,
					type_definition: {
						mode: 'unspecified',
					},
					schema_definition: {
						mode: 'unspecified',
					},
				}),
			));
			assert.ok(!OneOf.is_a(new $ref({$ref_mode: 'either'}, {ajv})));
			assert.ok(!OneOf.is_a<OneOf<unknown>>(
				new $ref({$ref_mode: 'either'}, {ajv}),
			));
		});
	});
});
