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
		[
			Parameters<Printer['parse']>[0],
			Parameters<Printer['parse']>[1],
		],
		(schema_parser: SchemaParser) => void,
		[ParseExpectation, ...ParseExpectation[]],
	];
	type DataSet = [
		ConstructorParameters<typeof Printer>,
		[DataSubSet, ...DataSubSet[]],
	];

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
					(schema_parser) => {
						const additional_types = schema_parser.share_ajv(
							(ajv) => [
								new TemplatedString({ajv}),
							],
						);

						schema_parser.types.push(...additional_types);
					},
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

				const promise = printer.parse(...parse_params, schema_parser);

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
