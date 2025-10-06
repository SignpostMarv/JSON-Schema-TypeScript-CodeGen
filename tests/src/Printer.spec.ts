import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Printer,
	SchemaParser,
	TemplatedString,
} from '../../index.ts';

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
						},
					],
					load_TemplatedString,
					[
						[
							'./index.ts',
							`export const bar: foo = [${
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
							}];`,
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
							`export const bar: foo = [${
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
							}];`,
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
							`export const bar: foo = [${
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
							`export const bar: foobar = [${
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
							}];`,
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
});
