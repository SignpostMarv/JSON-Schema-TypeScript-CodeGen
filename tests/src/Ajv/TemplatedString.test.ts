import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	Node,
	TemplateExpression,
	TypeNode,
} from 'typescript';
import {
	SyntaxKind,
} from 'typescript';

import {
	is_instanceof,
	not_undefined,
} from '@satisfactory-dev/custom-assert';

import {
	isIdentifier,
	isLiteralTypeNode,
	isStringLiteral,
	isTemplateLiteralTypeNode,
	isTemplateMiddle,
	isTemplateTail,
	isTokenWithExpectedKind,
	isTypeReferenceNode,
	isUnionTypeNode,
} from '@signpostmarv/ts-assert';

import {
	SchemaParser,
	String,
} from '../../../index.ts';

import type {
	templated_string_type,
	TemplatedStringParts,
} from '../../../src/Ajv/index.ts';
import {
	TemplatedString,
} from '../../../src/Ajv/index.ts';

import type {
	ts_asserter,
} from '../../index.ts';

function is_unspecified_data(
	maybe: Node,
): asserts maybe is TemplateExpression {
	isStringLiteral(maybe);
}

function is_unspecified_type(
	maybe: Node,
): asserts maybe is TemplateExpression {
	isTemplateLiteralTypeNode(maybe);
	assert.equal(maybe.head.text, '');

	const spans = [...maybe.templateSpans];

	const tail = spans.pop();

	not_undefined(tail);

	for (const middle of spans) {
		isTemplateTail(middle.literal);

		isTokenWithExpectedKind(
			middle.type,
			SyntaxKind.StringKeyword,
		);
	}

	isTemplateTail(tail.literal);
	isTokenWithExpectedKind(
		tail.type,
		SyntaxKind.StringKeyword,
	);
}

void describe('TemplatedString', () => {
	void it('comes out of SchemaParser', () => {
		const ajv = new Ajv({strict: true});
		const schema_parser = new SchemaParser({ajv});
		schema_parser.types = [
			new TemplatedString({ajv}, ['foo', {type: 'string'}, 'bar']),
			new TemplatedString({ajv}, ['foo', {type: 'string'}, 'baz']),
			...schema_parser.types,
		];

		const a = schema_parser.parse_by_type('foopretendthisisrandombar');
		const b = schema_parser.parse_by_type('barfoo');
		const c = schema_parser.parse_by_type('foobaz');
		const d = schema_parser.parse({
			type: 'string',
			templated_string: [
				'foo',
				{type: 'string'},
				'bar',
			],
		});

		is_instanceof(a, TemplatedString);
		is_instanceof(b, String);
		is_instanceof(c, TemplatedString);
		is_instanceof(d, TemplatedString);
	});

	void it('compiles to macro', () => {
		const ajv = new Ajv({strict: true});

		new TemplatedString({ajv});

		const validator = ajv.compile({
			type: 'string',
			templated_string: [
				'foo',
				{type: 'string'},
				'bar',
			],
		});

		const a = validator('foobazbar');
		assert.ok(a);

		const b = validator('barfoo');
		assert.ok(!b);
	});

	type GenerateSubSet = [
		string,
		ts_asserter<Expression>,
		ts_asserter<TypeNode>,
	];
	type TypeSubSet = [
		string,
		boolean,
	];
	type DataSet = [
		TemplatedStringParts|undefined,
		[TypeSubSet, ...TypeSubSet[]],
		[GenerateSubSet, ...GenerateSubSet[]],
	];

	const data_sets: [DataSet, ...DataSet[]] = [
		[
			undefined,
			[
				['foo', true],
				['oof', true],
				['foobar', true],
				['oofbar', true],
				['oofrab', true],
				['raboof', true],
				['barfoo', true],
				['baroof', true],
			],
			[
				[
					'foo',
					is_unspecified_data,
					is_unspecified_type,
				],
			],
		],
		[
			['foo', {type: 'string'}],
			[
				['foo', true],
				['oof', false],
				['foobar', true],
				['oofbar', false],
				['oofrab', false],
				['raboof', false],
				['barfoo', false],
				['baroof', false],
			],
			[
				[
					'foo',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'foo');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, 'foo');
						assert.equal(maybe.templateSpans.length, 1);

						const [tail] = maybe.templateSpans;

						isTemplateTail(tail.literal);
						isTokenWithExpectedKind(
							tail.type,
							SyntaxKind.StringKeyword,
						);
					},
				],
			],
		],
		[
			['foo', {type: 'string'}, 'bar'],
			[
				['foo', false],
				['oof', false],
				['foobar', true],
				['oofbar', false],
				['oofrab', false],
				['raboof', false],
				['barfoo', false],
				['baroof', false],
				['foopretendthisisrandombar', true],
			],
			[
				[
					'foopretendthisisrandombar',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'foopretendthisisrandombar');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, 'foo');
						assert.equal(maybe.templateSpans.length, 2);

						const [middle, tail] = maybe.templateSpans;

						isTemplateMiddle(middle.literal);
						isTokenWithExpectedKind(
							middle.type,
							SyntaxKind.StringKeyword,
						);

						isTemplateTail(tail.literal);
						isLiteralTypeNode(tail.type);
						isStringLiteral(tail.type.literal);
						assert.equal(tail.type.literal.text, 'bar');
					},
				],
			],
		],
		[
			['foo', 'pretendthisisrandom', 'bar'],
			[
				['foo', false],
				['oof', false],
				['foobar', false],
				['oofbar', false],
				['oofrab', false],
				['raboof', false],
				['barfoo', false],
				['baroof', false],
				['foopretendthisisrandombar', true],
			],
			[
				[
					'foopretendthisisrandombar',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'foopretendthisisrandombar');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, 'foo');
						assert.equal(maybe.templateSpans.length, 2);

						const [middle, tail] = maybe.templateSpans;

						isTemplateMiddle(middle.literal);
						isLiteralTypeNode(middle.type);
						isStringLiteral(middle.type.literal);
						assert.equal(
							middle.type.literal.text,
							'pretendthisisrandom',
						);

						isTemplateTail(tail.literal);
						isLiteralTypeNode(tail.type);
						isStringLiteral(tail.type.literal);
						assert.equal(tail.type.literal.text, 'bar');
					},
				],
			],
		],
		[
			[['foo', 'bar']],
			[
				['foo', true],
				['bar', true],
				['oof', false],
				['foobar', false],
				['oofbar', false],
				['oofrab', false],
				['raboof', false],
				['barfoo', false],
				['baroof', false],
				['foopretendthisisrandombar', false],
			],
			[
				[
					'foo',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'foo');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, '');
						assert.equal(maybe.templateSpans.length, 1);

						const [tail] = maybe.templateSpans;

						isTemplateTail(tail.literal);
						isUnionTypeNode(tail.type);
						assert.equal(tail.type.types.length, 2);
						isLiteralTypeNode(tail.type.types[0]);
						isLiteralTypeNode(tail.type.types[1]);
						isStringLiteral(tail.type.types[0].literal);
						isStringLiteral(tail.type.types[1].literal);
						assert.equal(tail.type.types[0].literal.text, 'foo');
						assert.equal(tail.type.types[1].literal.text, 'bar');
					},
				],
			],
		],
		[
			[['foo', {type: 'string'}]],
			[
				['foo', true],
				['bar', true],
				['oof', true],
				['foobar', true],
				['oofbar', true],
				['oofrab', true],
				['raboof', true],
				['barfoo', true],
				['baroof', true],
				['foopretendthisisrandombar', true],
			],
			[
				[
					'foo',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'foo');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, '');
						assert.equal(maybe.templateSpans.length, 1);

						const [tail] = maybe.templateSpans;

						isTemplateTail(tail.literal);
						isUnionTypeNode(tail.type);
						assert.equal(tail.type.types.length, 2);
						isLiteralTypeNode(tail.type.types[0]);
						isTokenWithExpectedKind(
							tail.type.types[1],
							SyntaxKind.StringKeyword,
						);
						isStringLiteral(tail.type.types[0].literal);
						assert.equal(tail.type.types[0].literal.text, 'foo');
					},
				],
				[
					'bar',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'bar');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, '');
						assert.equal(maybe.templateSpans.length, 1);

						const [tail] = maybe.templateSpans;

						isTemplateTail(tail.literal);
						isUnionTypeNode(tail.type);
						assert.equal(tail.type.types.length, 2);
						isLiteralTypeNode(tail.type.types[0]);
						isTokenWithExpectedKind(
							tail.type.types[1],
							SyntaxKind.StringKeyword,
						);
						isStringLiteral(tail.type.types[0].literal);
						assert.equal(tail.type.types[0].literal.text, 'foo');
					},
				],
				[
					'baz',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'baz');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, '');
						assert.equal(maybe.templateSpans.length, 1);

						const [tail] = maybe.templateSpans;

						isTemplateTail(tail.literal);
						isUnionTypeNode(tail.type);
						assert.equal(tail.type.types.length, 2);
						isLiteralTypeNode(tail.type.types[0]);
						isTokenWithExpectedKind(
							tail.type.types[1],
							SyntaxKind.StringKeyword,
						);
						isStringLiteral(tail.type.types[0].literal);
						assert.equal(tail.type.types[0].literal.text, 'foo');
					},
				],
			],
		],
		[
			[
				'foo',
				{
					type: 'string',
					templated_string: [
						'bar',
						{type: 'string'},
					],
				},
			],
			[
				['foo', false],
				['bar', false],
				['oof', false],
				['foobar', true],
				['oofbar', false],
				['oofrab', false],
				['raboof', false],
				['barfoo', false],
				['baroof', false],
				['foopretendthisisrandombar', false],
				['foobarpretendthisisrandom', true],
			],
			[
				[
					'foobar',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'foobar');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, 'foo');
						assert.equal(maybe.templateSpans.length, 1);

						const [tail] = maybe.templateSpans;

						isTemplateTail(tail.literal);
						isTemplateLiteralTypeNode(tail.type);
						assert.equal(
							tail.type.head.text,
							'bar',
						);
						assert.equal(tail.type.templateSpans.length, 1);

						const [tail_tail] = tail.type.templateSpans;

						isTemplateTail(tail_tail.literal);
						isTokenWithExpectedKind(
							tail_tail.type,
							SyntaxKind.StringKeyword,
						);
					},
				],
				[
					'foobarpretendthisisrandom',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'foobarpretendthisisrandom');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, 'foo');
						assert.equal(maybe.templateSpans.length, 1);

						const [tail] = maybe.templateSpans;

						isTemplateTail(tail.literal);
						isTemplateLiteralTypeNode(tail.type);
						assert.equal(
							tail.type.head.text,
							'bar',
						);
						assert.equal(tail.type.templateSpans.length, 1);

						const [tail_tail] = tail.type.templateSpans;

						isTemplateTail(tail_tail.literal);
						isTokenWithExpectedKind(
							tail_tail.type,
							SyntaxKind.StringKeyword,
						);
					},
				],
			],
		],
		[
			[
				'foo',
				{
					type: 'string',
					templated_string: [
						{type: 'string'},
						'bar',
					],
				},
			],
			[
				['foo', false],
				['bar', false],
				['oof', false],
				['foobar', true],
				['oofbar', false],
				['oofrab', false],
				['raboof', false],
				['barfoo', false],
				['baroof', false],
				['foopretendthisisrandombar', true],
				['foobarpretendthisisrandom', false],
			],
			[
				[
					'foobar',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'foobar');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, 'foo');
						assert.equal(maybe.templateSpans.length, 1);

						const [tail] = maybe.templateSpans;

						isTemplateTail(tail.literal);
						isTemplateLiteralTypeNode(tail.type);
						assert.equal(
							tail.type.head.text,
							'',
						);
						assert.equal(tail.type.templateSpans.length, 2);

						const [
							tail_middle,
							tail_tail,
						] = tail.type.templateSpans;

						isTemplateMiddle(tail_middle.literal);
						isTokenWithExpectedKind(
							tail_middle.type,
							SyntaxKind.StringKeyword,
						);

						isTemplateTail(tail_tail.literal);
						isLiteralTypeNode(tail_tail.type);
						isStringLiteral(tail_tail.type.literal);
						assert.equal(tail_tail.type.literal.text, 'bar');
					},
				],
				[
					'foopretendthisisrandombar',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'foopretendthisisrandombar');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, 'foo');
						assert.equal(maybe.templateSpans.length, 1);

						const [tail] = maybe.templateSpans;

						isTemplateTail(tail.literal);
						isTemplateLiteralTypeNode(tail.type);
						assert.equal(
							tail.type.head.text,
							'',
						);
						assert.equal(tail.type.templateSpans.length, 2);

						const [
							tail_middle,
							tail_tail,
						] = tail.type.templateSpans;

						isTemplateMiddle(tail_middle.literal);
						isTokenWithExpectedKind(
							tail_middle.type,
							SyntaxKind.StringKeyword,
						);

						isTemplateTail(tail_tail.literal);
						isLiteralTypeNode(tail_tail.type);
						isStringLiteral(tail_tail.type.literal);
						assert.equal(tail_tail.type.literal.text, 'bar');
					},
				],
			],
		],
		[
			['foo', {type: 'string'}],
			[
				['foo', true],
				['foob', true],
				['fo', false],
			],
			[
				[
					'foo',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'foo');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, 'foo');
						assert.equal(maybe.templateSpans.length, 1);

						const [tail] = maybe.templateSpans;

						isTemplateTail(tail.literal);
						isTokenWithExpectedKind(
							tail.type,
							SyntaxKind.StringKeyword,
						);
					},
				],
			],
		],
		[
			['foo', {type: 'string', minLength: 1}],
			[
				['foo', false],
				['foob', true],
				['fo', false],
			],
			[
				[
					'foob',
					(maybe) => {
						isStringLiteral(maybe);
						assert.equal(maybe.text, 'foob');
					},
					(maybe) => {
						isTemplateLiteralTypeNode(maybe);
						assert.equal(maybe.head.text, 'foo');
						assert.equal(maybe.templateSpans.length, 1);

						const [tail] = maybe.templateSpans;

						isTemplateTail(tail.literal);
						isTypeReferenceNode(tail.type);
						isIdentifier(tail.type.typeName);
						assert.equal(tail.type.typeName.text, 'Exclude');
						assert.equal(tail.type.typeArguments?.length, 2);
						isTokenWithExpectedKind(
							tail.type.typeArguments[0],
							SyntaxKind.StringKeyword,
						);
						isLiteralTypeNode(
							tail.type.typeArguments[1],
						);
						isStringLiteral(
							tail.type.typeArguments[1].literal,
						);
						assert.equal(
							'',
							tail.type.typeArguments[1].literal.text,
						);
					},
				],
			],
		],
	];

	void describe('::check_type()', () => {
		data_sets.forEach(([
			specified,
			subsets,
		], i) => {
			subsets.forEach(([
				value,
				expectation,
			], j) => {
				void it(`behaves with data_sets[${i}][2][${j}]`, () => {
					const ajv = new Ajv({strict: true});
					const instance = new TemplatedString({ajv}, specified);

					const actual = instance.check_type(value);

					assert.equal(
						actual,
						expectation,
						`Expected "${
							value
						}" to ${
							expectation ? 'pass' : 'fail'
						}`,
					);
				});
			});
		});
	});

	void describe('::generate_typescript_data()', () => {
		void it('fails as expected', () => {
			const ajv = new Ajv({strict: true});
			const instance = new TemplatedString({ajv}, ['foo']);
			assert.throws(() => instance.generate_typescript_data('bar'));
		});

		data_sets.forEach(([
			specified,
			,
			subsets,
		], i) => {
			subsets.forEach(([
				value,
				asserter,
			], j) => {
				void it(`behaves with data_sets[${i}][2][${j}]`, () => {
					const ajv = new Ajv({strict: true});
					const instance = new TemplatedString({ajv}, specified);

					const data = instance.generate_typescript_data(
						value,
					);

					const foo: ts_asserter<Expression> = asserter;

					foo(data);
				});
			});
		});
	});

	void describe('::generate_typescript_type()', () => {
		void it('fails as expected', async () => {
			const ajv = new Ajv({strict: true});
			const instance = new TemplatedString<
				string,
				['foo']
			>({ajv}, ['foo']);

			await assert.rejects(() => instance.generate_typescript_type({
				data: 'bar',
				schema: {
					type: 'string',
					templated_string: ['foo'],
				},
			}));
		});

		data_sets.forEach(([
			specified,
			,
			subsets,
		], i) => {
			subsets.forEach(([
				value,
				,
				asserter,
			], j) => {
				void it(`behaves with data_sets[${i}][2][${j}]`, async () => {
					const ajv = new Ajv({strict: true});
					const instance = new TemplatedString({ajv}, specified);

					const schema: templated_string_type = {
						type: 'string',
						templated_string: undefined === specified
							? [{type: 'string'}]
							: [...specified],
					};

					const promise = instance.generate_typescript_type({
						data: value,
						schema,
					});

					await assert.doesNotReject(() => promise);

					const data = await promise;

					const foo: ts_asserter<TypeNode> = asserter;

					foo(data);
				});
			});
		});
	});
});
