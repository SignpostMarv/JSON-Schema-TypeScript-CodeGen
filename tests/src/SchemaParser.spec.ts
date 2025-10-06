import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import {
	SyntaxKind,
} from 'typescript';

import {
	not_undefined,
} from '@satisfactory-dev/custom-assert';

import ts_assert from '@signpostmarv/ts-assert';

import {
	bool_throw,
} from '../assertions.ts';

import type {
	share_ajv_callback,
} from '../../index.ts';
import {
	$ref,
	OneOf,
	SchemaParser,
	StringStartsWith,
	TemplatedString,
} from '../../index.ts';

void describe('SchemaParser', () => {
	void describe('::parse()', () => {
		void it('fails with {}', () => {
			const parser = new SchemaParser();

			assert.throws(() => parser.parse({}));
		});

		void it(
			'fails when requiring conversion with non-convertible types',
			() => {
				const ajv = new Ajv({
					strict: true,
				});
				const instance = new $ref({$ref_mode: 'either'}, {ajv});
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
							// eslint-disable-next-line @stylistic/max-len
							pattern: '^([a-zA-Z0-9][a-zA-Z0-9._-]*)?#\\/\\$defs\\/([a-zA-Z0-9][a-zA-Z0-9._-]*)$',
						},
					},
				};
				assert.ok(instance.can_handle_schema(type_schema));
				assert.doesNotThrow(() => parser.parse(type_schema));
				assert.throws(() => parser.parse(type_schema, 'yes'));
			},
		);

		void describe('::generate_typescript_type()', () => {
			void it(
				'gives String and StringStartsWith when expected',
				async () => {
					const schema = {
						type: 'object',
						required: ['foo', 'bar'],
						properties: {
							foo: {
								type: 'string',
							},
							bar: {
								type: 'string',
								starts_with: 'bar',
							},
						},
					};
					const ajv = new Ajv({strict: true});
					const schema_parser = new SchemaParser({ajv});
					schema_parser.types.push(
						new StringStartsWith('bar', {ajv}),
					);
					const instance = schema_parser.parse(schema);

					const type_promise = instance.generate_typescript_type({
						schema,
						schema_parser,
					});

					await assert.doesNotReject(() => type_promise);

					const type = await type_promise;

					ts_assert.isTypeLiteralNode(type);

					assert.equal(type.members.length, 2);
					assert.ok(type.members.every(
						(maybe) => bool_throw(
							maybe,
							ts_assert.isPropertySignature,
						),
					));

					ts_assert.isIdentifier(type.members[0].name);
					assert.equal(type.members[0].name.text, 'foo');

					ts_assert.isIdentifier(type.members[1].name);
					assert.equal(type.members[1].name.text, 'bar');

					not_undefined(type.members[0].type);
					not_undefined(type.members[1].type);

					ts_assert.isTokenWithExpectedKind(
						type.members[0].type,
						SyntaxKind.StringKeyword,
					);
					ts_assert.isTemplateLiteralTypeNode(
						type.members[1].type,
					);

					assert.equal(
						type.members[1].type.head.text,
						'',
					);

					assert.equal(
						type.members[1].type.templateSpans.length,
						2,
					);

					ts_assert.isTemplateMiddle(
						type.members[1].type.templateSpans[0].literal,
					);

					ts_assert.isTemplateTail(
						type.members[1].type.templateSpans[1].literal,
					);

					ts_assert.isLiteralTypeNode(
						type.members[1].type.templateSpans[0].type,
					);
					ts_assert.isStringLiteral(
						type.members[1].type.templateSpans[0].type.literal,
					);
					assert.equal(
						type.members[1]
							.type.templateSpans[0].type.literal.text,
						'bar',
					);

					ts_assert.isTokenWithExpectedKind(
						type.members[1].type.templateSpans[1].type,
						SyntaxKind.StringKeyword,
					);
				},
			);
		});
	});

	void describe('::parse_by_type()', () => {
		void it('fails as expected', () => {
			const parser = new SchemaParser();
			const ajv = new Ajv({strict: true});
			assert.ok(!OneOf.is_a(new $ref({$ref_mode: 'either'}, {ajv})));
			assert.throws(() => parser.parse_by_type(
				{$ref: '#/$defs/foo'},
				(maybe) => TemplatedString.is_a(maybe),
			));
		});
	});

	void describe('::share_ajv()', () => {
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
		});
	});
});
