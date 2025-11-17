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
	is_instanceof,
	not_undefined,
// eslint-disable-next-line imports/no-unresolved
} from '@satisfactory-dev/custom-assert';

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import {
	bool_throw,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../index.ts';

import type {
	share_ajv_callback,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../index.ts';
import {
	$ref,
	ConstString,
	ObjectUnspecified,
	OneOf,
	SchemaParser,
	Type,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../index.ts';

import {
	StringStartsWith,
	TemplatedString,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../src/Ajv/index.ts';

void describe('SchemaParser', () => {
	void describe('::clear_imports()', () => {
		void it('behaves as expected', () => {
			const parser = new SchemaParser();

			assert.equal(
				parser.imports.size,
				0,
			);
			assert.equal(
				parser.imports_from_module.size,
				0,
			);

			const $ref_instance = parser.types
				.find((maybe) => maybe instanceof $ref);

			not_undefined($ref_instance);

			$ref_instance.needs_import.add('foo');

			assert.equal(
				parser.imports.size,
				1,
			);
			assert.equal(
				parser.imports_from_module.size,
				0,
			);

			$ref_instance.needs_import_from_module.add('StringPassesRegex');

			assert.equal(
				parser.imports.size,
				1,
			);
			assert.equal(
				parser.imports_from_module.size,
				1,
			);

			parser.clear_imports();

			assert.equal(
				parser.imports.size,
				0,
			);
			assert.equal(
				parser.imports_from_module.size,
				0,
			);
		});
	});

	void describe('::get_schema()', () => {
		const parser = new SchemaParser();

		parser.add_schema({
			$id: 'foo',
		});

		void it('behaves when schema exists', () => {
			not_undefined(parser.get_schema('foo'));
		});
		void it('behaves when schema does not exist', () => {
			assert.equal(parser.get_schema('bar'), undefined);
		});
	});

	void describe('::maybe_parse()', () => {
		void it('behaves when type exists', () => {
			const parser = new SchemaParser();

			const ajv = parser.share_ajv((ajv) => ajv);

			class Foo extends ConstString {
				constructor() {
					super(undefined, {ajv});
				}

				can_handle_schema(): this {
					return this;
				}
			}

			parser.types = [new Foo(), ...parser.types];

			const actual = parser.maybe_parse<
				ConstString
			>(
				{},
				Type,
			);

			is_instanceof(actual, Foo);
		});

		void it('behave when type exists but excluded', () => {
			const parser = new SchemaParser();

			let actual = parser.maybe_parse(
				{type: 'string', const: 'foo'},
				Type,
			);

			is_instanceof(actual, ConstString);

			actual = parser.maybe_parse(
				{type: 'string', const: 'foo'},
				ObjectUnspecified as unknown as typeof Type<unknown>,
			);

			assert.equal(actual, undefined);
		});
	});

	void describe('::parse()', () => {
		void it('fails with {}', () => {
			const parser = new SchemaParser();

			assert.throws(() => parser.parse({}));
		});

		void it('fails with an unrecognised type', () => {
			const parser = new SchemaParser();

			assert.throws(() => parser.parse({type: 'whut'}));
		});

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
						'bar',
					);

					assert.equal(
						type.members[1].type.templateSpans.length,
						1,
					);

					ts_assert.isTemplateTail(
						type.members[1].type.templateSpans[0].literal,
					);

					ts_assert.isTokenWithExpectedKind(
						type.members[1].type.templateSpans[0].type,
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
			assert.ok(!OneOf.is_a(new $ref({}, {ajv})));
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
