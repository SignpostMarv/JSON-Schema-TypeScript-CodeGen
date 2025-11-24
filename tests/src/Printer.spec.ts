import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Printer,
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../index.ts';

import {
	TemplatedString,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../src/Ajv/index.ts';

void describe('Printer', () => {
	type ParseExpectation = [
		`./${string}.ts`,
		string,
	];
	type DataSubSet = [
		(
			| [
				Parameters<Printer['parse']>[0],
				Parameters<Printer['parse']>[1],
			]
			| [
				Parameters<Printer['parse']>[0],
				Parameters<Printer['parse']>[1],
				Parameters<Printer['parse']>[3],
			]
			| [
				Parameters<Printer['parse']>[0],
				Parameters<Printer['parse']>[1],
				Parameters<Printer['parse']>[3],
				Parameters<Printer['parse']>[4],
			]
		),
		(schema_parser: SchemaParser) => void,
		[ParseExpectation, ...ParseExpectation[]],
	];
	type DataSet = [
		ConstructorParameters<typeof Printer>,
		[DataSubSet, ...DataSubSet[]],
	];

	function load_TemplatedString(schema_parser: SchemaParser) {
		const additional_types = schema_parser.share_ajv(
			(ajv) => [
				new TemplatedString({ajv}),
			],
		);

		schema_parser.types.push(...additional_types);
	}

	const data_sets: [DataSet, ...DataSet[]] = [
		[
			[],
			[
				[
					[
						['foobar'],
						{
							$defs: {
								item: {
									type: 'string',
									templated_string: [
										{type: 'string'},
										['bar', 'baz'],
									],
								},
							},
							type: 'array',
							minItems: 1,
							items: {
								$ref: '#/$defs/item',
							},
							uniqueItems: true,
						},
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foo } from "./types.ts";${
								'\n\n'
							}export const bar: foo = [${
								'\n'
							}    "foobar"${
								'\n'
							}];`,
						],
						[
							'./types.ts',
							`type item = \`\${string}\${"bar" | "baz"}\`;${
								'\n\n'
							}export type foo = [${
								'\n'
							}    item,${
								'\n'
							}    ...item[]${
								'\n'
							}];${
								'\n\n'
							}export type { item };`,
						],
					],
				],
				[
					[
						{},
						{
							// eslint-disable-next-line @stylistic/max-len
							$schema: 'https://json-schema.org/draft/2020-12/schema',
							$id: 'foobarbaz',
							$defs: {
								bar: {
									type: 'string',
									enum: [
										'foo',
										'bar',
										'baz',
									],
								},
								baz: {
									type: 'string',
									pattern: '^baz',
								},
							},
						},
					],
					() => {},
					[
						[
							'./types.ts',
							// eslint-disable-next-line @stylistic/max-len
							`import type { StringPassesRegex } from "@signpostmarv/json-schema-typescript-codegen";${
								'\n\n'
							}type bar = "foo" | "bar" | "baz";${
								'\n\n'
							}type baz = StringPassesRegex<"^baz">;${
								'\n\n'
							}export type { bar, baz };`,
						],
					],
				],
				[
					[
						{
							foo: 'bazbat',
						},
						{
							// eslint-disable-next-line @stylistic/max-len
							$schema: 'https://json-schema.org/draft/2020-12/schema',
							$id: 'foobarbaz',
							$defs: {
								baz: {
									type: 'string',
									pattern: '^baz',
								},
							},
							type: 'object',
							required: ['foo'],
							properties: {
								foo: {$ref: '#/$defs/baz'},
							},
						},
					],
					() => {},
					[
						[
							'./index.ts',
							// eslint-disable-next-line @stylistic/max-len
							`import { StringPassesRegexGuard } from "@signpostmarv/json-schema-typescript-codegen";${
								'\n\n'
							}import type { foo } from "./types.ts";${
								'\n\n'
							}export const bar: foo = {${
								'\n'
							// eslint-disable-next-line @stylistic/max-len
							}    foo: StringPassesRegexGuard("bazbat", "^baz")${
								'\n'
							}};`,
						],
						[
							'./types.ts',
							// eslint-disable-next-line @stylistic/max-len
							`import type { StringPassesRegex } from "@signpostmarv/json-schema-typescript-codegen";${
								'\n\n'
							}type baz = StringPassesRegex<"^baz">;${
								'\n\n'
							}export type foo = {${
								'\n'
							}    foo: baz;${
								'\n'
							}};${
								'\n\n'
							}export type { baz };`,
						],
					],
				],
				[
					[
						{},
						{
							type: 'object',
							$ref: '#/$defs/baz',
							properties: {
								bar: {
									type: 'string',
								},
							},
						},
					],
					() => {},
					[
						[
							'./index.ts',
							`import type { foo } from "./types.ts";${
								'\n\n'
							}export const bar: foo = {};`,
						],
						[
							'./types.ts',
							`export type foo = baz & {${
								'\n'
							}    bar?: string;${
								'\n'
							}};`,
						],
					],
				],
			],
		],
		[
			[{
				type_filename_callback: (name: string) => {
					if ('item' === name) {
						return './types/$defs.ts';
					}

					return './types/types.ts';
				},
			}],
			[
				[
					[
						['foobar'],
						{
							$defs: {
								item: {
									type: 'string',
									templated_string: [
										{type: 'string'},
										['bar', 'baz'],
									],
								},
							},
							type: 'array',
							minItems: 1,
							items: {
								$ref: '#/$defs/item',
							},
						},
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foo } from "./types/types.ts";${
								'\n\n'
							}export const bar: foo = [${
								'\n'
							}    "foobar"${
								'\n'
							}];`,
						],
						[
							'./types/$defs.ts',
							// eslint-disable-next-line @stylistic/max-len
							`export type item = \`\${string}\${"bar" | "baz"}\`;`,
						],
						[
							'./types/types.ts',
							`import type { item } from "./$defs.ts";${
								'\n\n'
							}export type foo = [${
								'\n'
							}    item,${
								'\n'
							}    ...item[]${
								'\n'
							}];${
								'\n\n'
							}export type { item };`,
						],
					],
				],
				[
					[
						['foobar'],
						{
							type: 'array',
							minItems: 1,
							items: {
								type: 'string',
								templated_string: [
									{type: 'string'},
									['bar', 'baz'],
								],
							},
						},
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foo } from "./types/types.ts";${
								'\n\n'
							}export const bar: foo = [${
								'\n'
							}    "foobar"${
								'\n'
							}];`,
						],
						[
							'./types/types.ts',
							`export type foo = [${
								'\n'
							}    \`\${string}\${"bar" | "baz"}\`,${
								'\n'
							}    ...\`\${string}\${"bar" | "baz"}\`[]${
								'\n'
							}];`,
						],
					],
				],
				[
					[
						['foobar', 'barbaz'],
						{
							$defs: {
								foo: {
									type: 'string',
									templated_string: [
										'foo',
										{type: 'string'},
									],
								},
								bar: {
									type: 'string',
									templated_string: [
										'bar',
										{type: 'string'},
									],
								},
							},
							type: 'array',
							minItems: 1,
							items: {
								oneOf: [
									{$ref: '#/$defs/foo'},
									{$ref: '#/$defs/bar'},
								],
							},
						},
						'foobar',
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foobar } from "./types/types.ts";${
								'\n\n'
							}export const bar: foobar = [${
								'\n'
							}    "foobar",${
								'\n'
							}    "barbaz"${
								'\n'
							}];`,
						],
						[
							'./types/types.ts',
							`type foo = \`foo\${string}\`;${
								'\n\n'
							}type bar = \`bar\${string}\`;${
								'\n\n'
							}export type foobar = [${
								'\n'
							}    foo | bar,${
								'\n'
							}    ...(foo | bar)[]${
								'\n'
							}];${
								'\n\n'
							}export type { foo, bar };`,
						],
					],
				],
				[
					[
						['foobar', 'barbaz'],
						{
							$defs: {
								foo: {
									type: 'string',
									templated_string: [
										'foo',
										{type: 'string'},
									],
								},
								bar: {
									type: 'string',
									templated_string: [
										'bar',
										{type: 'string'},
									],
								},
							},
							type: 'array',
							items: false,
							prefixItems: [
								{$ref: '#/$defs/foo'},
								{$ref: '#/$defs/bar'},
							],
						},
						'foobar',
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foobar } from "./types/types.ts";${
								'\n\n'
							}export const bar: foobar = [${
								'\n'
							}    "foobar",${
								'\n'
							}    "barbaz"${
								'\n'
							}];`,
						],
						[
							'./types/types.ts',
							`type foo = \`foo\${string}\`;${
								'\n\n'
							}type bar = \`bar\${string}\`;${
								'\n\n'
							}export type foobar = [${
								'\n'
							}    foo,${
								'\n'
							}    bar${
								'\n'
							}];${
								'\n\n'
							}export type { foo, bar };`,
						],
					],
				],
			],
		],
		[
			[{
				type_filename_callback: (name: string) => {
					return `./types/${name}.ts`;
				},
			}],
			[
				[
					[
						['foobar'],
						{
							$defs: {
								item: {
									type: 'string',
									templated_string: [
										{type: 'string'},
										['bar', 'baz'],
									],
								},
							},
							type: 'array',
							minItems: 1,
							items: {
								$ref: '#/$defs/item',
							},
						},
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foo } from "./types/foo.ts";${
								'\n\n'
							}export const bar: foo = [${
								'\n'
							}    "foobar"${
								'\n'
							}];`,
						],
						[
							'./types/item.ts',
							// eslint-disable-next-line @stylistic/max-len
							`export type item = \`\${string}\${"bar" | "baz"}\`;`,
						],
						[
							'./types/foo.ts',
							`import type { item } from "./item.ts";${
								'\n\n'
							}export type foo = [${
								'\n'
							}    item,${
								'\n'
							}    ...item[]${
								'\n'
							}];${
								'\n\n'
							}export type { item };`,
						],
					],
				],
				[
					[
						['foobar'],
						{
							type: 'array',
							minItems: 1,
							items: {
								type: 'string',
								templated_string: [
									{type: 'string'},
									['bar', 'baz'],
								],
							},
						},
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foo } from "./types/foo.ts";${
								'\n\n'
							}export const bar: foo = [${
								'\n'
							}    "foobar"${
								'\n'
							}];`,
						],
						[
							'./types/foo.ts',
							`export type foo = [${
								'\n'
							}    \`\${string}\${"bar" | "baz"}\`,${
								'\n'
							}    ...\`\${string}\${"bar" | "baz"}\`[]${
								'\n'
							}];`,
						],
					],
				],
				[
					[
						['foobar', 'barbaz'],
						{
							$defs: {
								foo: {
									type: 'string',
									templated_string: [
										'foo',
										{type: 'string'},
									],
								},
								bar: {
									type: 'string',
									templated_string: [
										'bar',
										{type: 'string'},
									],
								},
							},
							type: 'array',
							minItems: 1,
							items: {
								oneOf: [
									{$ref: '#/$defs/foo'},
									{$ref: '#/$defs/bar'},
								],
							},
						},
						'foobar',
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foobar } from "./types/foobar.ts";${
								'\n\n'
							}export const bar: foobar = [${
								'\n'
							}    "foobar",${
								'\n'
							}    "barbaz"${
								'\n'
							}];`,
						],
						[
							'./types/foo.ts',
							`export type foo = \`foo\${string}\`;`,
						],
						[
							'./types/bar.ts',
							`export type bar = \`bar\${string}\`;`,
						],
						[
							'./types/foobar.ts',
							`import type { foo } from "./foo.ts";${
								'\n\n'
							}import type { bar } from "./bar.ts";${
								'\n\n'
							}export type foobar = [${
								'\n'
							}    foo | bar,${
								'\n'
							}    ...(foo | bar)[]${
								'\n'
							}];${
								'\n\n'
							}export type { foo, bar };`,
						],
					],
				],
				[
					[
						['foobar', 'barbaz'],
						{
							$defs: {
								foo: {
									type: 'string',
									templated_string: [
										'foo',
										{type: 'string'},
									],
								},
								bar: {
									type: 'string',
									templated_string: [
										'bar',
										{type: 'string'},
									],
								},
							},
							type: 'array',
							items: false,
							prefixItems: [
								{$ref: '#/$defs/foo'},
								{$ref: '#/$defs/bar'},
							],
						},
						'foobar',
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foobar } from "./types/foobar.ts";${
								'\n\n'
							}export const bar: foobar = [${
								'\n'
							}    "foobar",${
								'\n'
							}    "barbaz"${
								'\n'
							}];`,
						],
						[
							'./types/foo.ts',
							`export type foo = \`foo\${string}\`;`,
						],
						[
							'./types/bar.ts',
							`export type bar = \`bar\${string}\`;`,
						],
						[
							'./types/foobar.ts',
							`import type { foo } from "./foo.ts";${
								'\n\n'
							}import type { bar } from "./bar.ts";${
								'\n\n'
							}export type foobar = [${
								'\n'
							}    foo,${
								'\n'
							}    bar${
								'\n'
							}];${
								'\n\n'
							}export type { foo, bar };`,
						],
					],
				],
				[
					[
						['foobar', 'barbaz'],
						{
							type: 'array',
							items: false,
							prefixItems: [
								{$ref: 'some-external-id#/$defs/foo'},
								{$ref: 'some-external-id#/$defs/bar'},
							],
						},
						'foobar',
					],
					(schema_parser: SchemaParser) => {
						load_TemplatedString(schema_parser);
						schema_parser.add_schema({
							$id: 'some-external-id',
							$defs: {
								foo: {
									type: 'string',
									templated_string: [
										'foo',
										{type: 'string'},
									],
								},
								bar: {
									type: 'string',
									templated_string: [
										'bar',
										{type: 'string'},
									],
								},
							},
						});
					},
					[
						[
							'./index.ts',
							`import type { foobar } from "./types/foobar.ts";${
								'\n\n'
							}export const bar: foobar = [${
								'\n'
							}    "foobar",${
								'\n'
							}    "barbaz"${
								'\n'
							}];`,
						],
						[
							'./types/foobar.ts',
							// eslint-disable-next-line @stylistic/max-len
							`import type { foo as some_external_id_foo } from "./some_external_id_foo.ts";${
								'\n\n'
							// eslint-disable-next-line @stylistic/max-len
							}import type { bar as some_external_id_bar } from "./some_external_id_bar.ts";${
								'\n\n'
							}export type foobar = [${
								'\n'
							}    some_external_id_foo,${
								'\n'
							}    some_external_id_bar${
								'\n'
							}];`,
						],
					],
				],
			],
		],
		[
			[{
				type_filename_callback: (name: string) => {
					return `./types/${name.substring(0, 3)}.ts`;
				},
			}],
			[
				[
					[
						['foobar'],
						{
							$defs: {
								item: {
									type: 'string',
									templated_string: [
										{type: 'string'},
										['bar', 'baz'],
									],
								},
							},
							type: 'array',
							minItems: 1,
							items: {
								$ref: '#/$defs/item',
							},
						},
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foo } from "./types/foo.ts";${
								'\n\n'
							}export const bar: foo = [${
								'\n'
							}    "foobar"${
								'\n'
							}];`,
						],
						[
							'./types/ite.ts',
							// eslint-disable-next-line @stylistic/max-len
							`export type item = \`\${string}\${"bar" | "baz"}\`;`,
						],
						[
							'./types/foo.ts',
							`import type { item } from "./ite.ts";${
								'\n\n'
							}export type foo = [${
								'\n'
							}    item,${
								'\n'
							}    ...item[]${
								'\n'
							}];${
								'\n\n'
							}export type { item };`,
						],
					],
				],
				[
					[
						['foobar'],
						{
							type: 'array',
							minItems: 1,
							items: {
								type: 'string',
								templated_string: [
									{type: 'string'},
									['bar', 'baz'],
								],
							},
						},
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foo } from "./types/foo.ts";${
								'\n\n'
							}export const bar: foo = [${
								'\n'
							}    "foobar"${
								'\n'
							}];`,
						],
						[
							'./types/foo.ts',
							`export type foo = [${
								'\n'
							}    \`\${string}\${"bar" | "baz"}\`,${
								'\n'
							}    ...\`\${string}\${"bar" | "baz"}\`[]${
								'\n'
							}];`,
						],
					],
				],
				[
					[
						['foobar', 'barbaz'],
						{
							$defs: {
								foo: {
									type: 'string',
									templated_string: [
										'foo',
										{type: 'string'},
									],
								},
								bar: {
									type: 'string',
									templated_string: [
										'bar',
										{type: 'string'},
									],
								},
							},
							type: 'array',
							minItems: 1,
							items: {
								oneOf: [
									{$ref: '#/$defs/foo'},
									{$ref: '#/$defs/bar'},
								],
							},
						},
						'foobar',
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foobar } from "./types/foo.ts";${
								'\n\n'
							}export const bar: foobar = [${
								'\n'
							}    "foobar",${
								'\n'
							}    "barbaz"${
								'\n'
							}];`,
						],
						[
							'./types/foo.ts',
							`import type { bar } from "./bar.ts";${
								'\n\n'
							}type foo = \`foo\${string}\`;${
								'\n\n'
							}export type foobar = [${
								'\n'
							}    foo | bar,${
								'\n'
							}    ...(foo | bar)[]${
								'\n'
							}];${
								'\n\n'
							}export type { foo, bar };`,
						],
						[
							'./types/bar.ts',
							`export type bar = \`bar\${string}\`;`,
						],
					],
				],
				[
					[
						['foobar', 'barbaz', 'barfoobaz'],
						{
							$defs: {
								foo: {
									type: 'string',
									templated_string: [
										'foo',
										{type: 'string'},
									],
								},
								bar: {
									type: 'string',
									templated_string: [
										'bar',
										{type: 'string'},
									],
								},
								barfoo: {
									type: 'string',
									templated_string: [
										'barfoo',
										{type: 'string'},
									],
								},
							},
							type: 'array',
							items: false,
							prefixItems: [
								{$ref: '#/$defs/foo'},
								{$ref: '#/$defs/bar'},
								{$ref: '#/$defs/barfoo'},
							],
						},
						'foobar',
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`import type { foobar } from "./types/foo.ts";${
								'\n\n'
							}export const bar: foobar = [${
								'\n'
							}    "foobar",${
								'\n'
							}    "barbaz",${
								'\n'
							}    "barfoobaz"${
								'\n'
							}];`,
						],
						[
							'./types/foo.ts',
							`import type { bar, barfoo } from "./bar.ts";${
								'\n\n'
							}type foo = \`foo\${string}\`;${
								'\n\n'
							}export type foobar = [${
								'\n'
							}    foo,${
								'\n'
							}    bar,${
								'\n'
							}    barfoo${
								'\n'
							}];${
								'\n\n'
							}export type { foo, bar, barfoo };`,
						],
						[
							'./types/bar.ts',
							`export type bar = \`bar\${string}\`;${
								'\n\n'
							}export type barfoo = \`barfoo\${string}\`;`,
						],
					],
				],
			],
		],
	];

	data_sets.forEach(([
		constructor_params,
		subsets,
	], i) => {
		subsets.forEach(([
			parse_params,
			modify_schema_parser,
			expectations,
		], j) => {
			void it(`behaves with data_sets[${i}][${j}]`, async () => {
				const schema_parser = new SchemaParser({ajv_options: {}});

				modify_schema_parser(schema_parser);

				const printer = new Printer(...constructor_params);

				const params: Parameters<Printer['parse']> = [
					parse_params[0],
					parse_params[1],
					schema_parser,
				];

				if (parse_params.length > 2) {
					params.push(parse_params[2]);
				}

				if (parse_params.length > 3) {
					params.push(parse_params[3]);
				}

				const promise = printer.parse(...params);

				await assert.doesNotReject(() => promise);

				const actual = await promise;

				assert.equal(actual.length, expectations.length);

				actual.forEach(({filename, code}, k) => {
					assert.equal(
						filename,
						expectations[k][0],
					);
					assert.equal(
						code,
						expectations[k][1],
					);
				});
			});
		});
	});

	void it('fails if data does not match type', async () => {
		const instance = new Printer();
		const schema_parser = new SchemaParser({ajv_options: {}});

		const promise = instance.parse(
			'foo',
			{
				type: 'array',
				items: {
					type: 'string',
				},
			},
			schema_parser,
		);

		await assert.rejects(() => promise);
	});

	void it('fails if $defs matches type name', async () => {
		const instance = new Printer();
		const schema_parser = new SchemaParser({ajv_options: {}});

		const promise = instance.parse(
			['foobar'],
			{
				$defs: {
					foo: {
						type: 'string',
						const: 'foobar',
					},
				},
				type: 'array',
				minItems: 1,
				items: {
					$ref: '#/$defs/foo',
				},
				uniqueItems: true,
			},
			schema_parser,
		);

		await assert.rejects(() => promise);
	});
});
