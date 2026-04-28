import {
	describe,
	it,
} from 'node:test';

import assert from 'node:assert/strict';

import {
	randomBytes,
} from 'node:crypto';

import type {
	SchemaObject,
} from 'ajv/dist/2020.js';
import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	MaybeCacheCompile,
} from '../../src/MaybeCacheCompile.ts';
import {
	AlwaysFreshCompile,
	DynamicCompile,
	StaticCompile,
} from '../../src/MaybeCacheCompile.ts';

type dataset = (
	| [
		() => SchemaObject,
		false, // compiles
	]
	| [
		() => SchemaObject,
		true, // compiles
		boolean, // same when static cache
		boolean, // same when dynamic cache
	]
);

const static_schema: SchemaObject = {
	type: 'string',
};

const decoder = new TextDecoder('UTF-8');

const data_sets: [dataset, ...dataset[]] = [
	[
		() => null as unknown as SchemaObject,
		false,
	],
	[
		() => static_schema,
		true,
		true,
		true,
	],
	[
		() => ({...static_schema}),
		true,
		false,
		true,
	],
	[
		() => ({
			type: 'string',
			const: decoder.decode(randomBytes(16)),
		}),
		true,
		false,
		false,
	],
];

function run_checks(against: MaybeCacheCompile) {
	for (let i = 0; i < data_sets.length; ++i) {
		void it(`behaves with data_sets[${i}]`, () => {
			if (!data_sets[i][1]) {
				assert.throws(
					() => against.compile(new Ajv(), data_sets[i][0]()),
				);
			} else {
				const [schema, , if_static, if_dynamic] = data_sets[i];

				const first = against.compile(new Ajv(), schema());
				const second = against.compile(new Ajv(), schema());

				let using: 'notEqual' | 'equal';

				if (against instanceof AlwaysFreshCompile) {
					using = 'notEqual';
				} else if (against instanceof StaticCompile) {
					using = if_static ? 'equal' : 'notEqual';
				} else {
					using = if_dynamic ? 'equal' : 'notEqual';
				}

				assert[using](first, second);
			}
		});
	}
}

for (const against of [
	AlwaysFreshCompile,
	StaticCompile,
	DynamicCompile,
]) {
	void describe(`${against.name}.prototype.compile()`, () => {
		run_checks(new against());
	});
}
