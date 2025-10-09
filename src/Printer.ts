import {
	basename,
	dirname,
	relative,
} from 'path';

import {
	createPrinter,
	createSourceFile,
	EmitHint,
	NewLineKind,
	NodeFlags,
	ScriptKind,
	ScriptTarget,
	SyntaxKind,
} from 'typescript';

import type {
	SchemaParser,
} from './SchemaParser.ts';

import type {
	SchemaObject,
} from './types.ts';

import {
	factory,
} from './typescript/factory.ts';

import type {
	adjust_name_callback,
} from './coercions.ts';
import {
	adjust_name_default,
	adjust_name_finisher,
} from './coercions.ts';

import type {
} from './javascript/types.ts';

type name_to_filename_callback = (name: string) => `./${string}.ts`;

function data_name_to_filename_default(): './index.ts' {
	return './index.ts';
}

function type_name_to_filename_default(): './types.ts' {
	return './types.ts';
}

export class PrinterResult {
	readonly code: string;

	readonly filename: `./${string}.ts`;

	constructor(
		code: string,
		filename: `./${string}.ts`,
	) {
		this.code = code;
		this.filename = filename;
	}
}

export class Printer {
	#adjust_name_callback: adjust_name_callback;

	#data_filename_callback: name_to_filename_callback;

	#type_filename_callback: name_to_filename_callback;

	constructor({
		adjust_name_callback = adjust_name_default,
		data_filename_callback = data_name_to_filename_default,
		type_filename_callback = type_name_to_filename_default,
	}: {
		adjust_name_callback?: adjust_name_callback,
		data_filename_callback?: name_to_filename_callback,
		type_filename_callback?: name_to_filename_callback,
	} = {}) {
		this.#adjust_name_callback = adjust_name_callback;
		this.#data_filename_callback = data_filename_callback;
		this.#type_filename_callback = type_filename_callback;
	}

	async parse(
		data: unknown,
		schema: SchemaObject,
		schema_parser: SchemaParser,
		type_name: string = 'foo',
		data_name: string = 'bar',
	) {
		const adjusted_type_name = adjust_name_finisher(
			type_name,
			this.#adjust_name_callback,
		);

		const adjusted_data_name = adjust_name_finisher(
			data_name,
			this.#adjust_name_callback,
		);

		const type_for_schema = schema_parser.parse(schema);

		if (!type_for_schema.check_type(data)) {
			throw new TypeError('Data not of expected type for schema!');
		}

		const data_node = factory.createVariableStatement(
			[
				factory.createToken(SyntaxKind.ExportKeyword),
			],
			factory.createVariableDeclarationList(
				[
					factory.createVariableDeclaration(
						adjusted_data_name,
						undefined,
						factory.createTypeReferenceNode(adjusted_type_name),
						type_for_schema.generate_typescript_data(
							data,
							schema_parser,
							schema,
						),
					),
				],
				NodeFlags.Const,
			),
		);

		const type_node = factory.createTypeAliasDeclaration(
			[
				factory.createToken(SyntaxKind.ExportKeyword),
			],
			adjusted_type_name,
			undefined,
			await type_for_schema
				.generate_typescript_type({
					data,
					schema,
					schema_parser,
				}),
		);

		const printer = createPrinter({
			newLine: NewLineKind.LineFeed,
			noEmitHelpers: true,
		});

		const data_filename = this.#data_filename_callback(adjusted_data_name);
		const type_filename = this.#type_filename_callback(adjusted_type_name);

		const outputs: {[key: `./${string}.ts`]: [string, ...string[]]} = {};

		const source_file = createSourceFile(
			'index.ts',
			'',
			ScriptTarget.Latest,
			false,
			ScriptKind.TS,
		);

		outputs[data_filename] = [
			printer.printNode(
				EmitHint.Unspecified,
				factory.createImportDeclaration(
					undefined,
					factory.createImportClause(
						SyntaxKind.TypeKeyword,
						undefined,
						factory.createNamedImports([
							factory.createImportSpecifier(
								false,
								undefined,
								factory.createIdentifier(adjusted_type_name),
							),
						]),
					),
					factory.createStringLiteral(type_filename),
					undefined,
				),
				source_file,
			),
			printer.printNode(
				EmitHint.Unspecified,
				data_node,
				source_file,
			),
		];

		const $defs = schema.$defs || {};

		for (const [
			$def_name,
			$def_schema,
		] of Object.entries($defs)) {
			const name = adjust_name_finisher(
				$def_name,
				this.#adjust_name_callback,
			);

			if (name === adjusted_type_name) {
				throw new TypeError(
					'$defs found matching adjusted type name!',
				);
			}

			const $def_filename = this.#type_filename_callback(name);

			const $def_schema_with_$defs: SchemaObject = {
				$defs,
				...$def_schema,
			};

			const node = factory.createTypeAliasDeclaration(
				(
					type_filename !== $def_filename
						? [
							factory.createToken(SyntaxKind.ExportKeyword),
						]
						: undefined
				),
				name,
				undefined,
				await schema_parser.parse(
					$def_schema_with_$defs,
				).generate_typescript_type({
					schema: $def_schema_with_$defs,
					schema_parser,
				}),
			);

			const code = printer.printNode(
				EmitHint.Unspecified,
				node,
				source_file,
			);

			if (!($def_filename in outputs)) {
				outputs[$def_filename] = [code];
			} else {
				outputs[$def_filename].push(code);
			}
		}

		const imports = (schema_parser.imports.values())
			.map((name) => adjust_name_finisher(
				name,
				this.#adjust_name_callback,
			))
			.map((name) => [
				name,
				this.#type_filename_callback(name),
			] as const)
			.filter(([, maybe]) => maybe !== type_filename)
			.reduce(
				(
					out,
					[name, filename],
				): {[key: `./${string}.ts`]: [string, ...string[]]} => {
					if (!(filename in out)) {
						out[filename] = [name];
					} else {
						out[filename].push(name);
					}

					return out;
				},
				{},
			);

		const import_code = Object.entries(imports)
			.map(([import_filename, to_import]) => printer.printNode(
				EmitHint.Unspecified,
				factory.createImportDeclaration(
					undefined,
					factory.createImportClause(
						SyntaxKind.TypeKeyword,
						undefined,
						factory.createNamedImports(to_import.map(
							(name) => factory.createImportSpecifier(
								false,
								undefined,
								factory.createIdentifier(name),
							),
						)),
					),
					factory.createStringLiteral(
						`./${
							relative(
								dirname(type_filename),
								dirname(import_filename),
							)
						}/${
							basename(import_filename)
						}`.replace(/^\.\/\//, './'),
					),
				),
				source_file,
			));

		if (import_code.length > 0) {
			if (!(type_filename in outputs)) {
				outputs[type_filename] = import_code;
			} else {
				outputs[type_filename].push(...import_code);
			}
		}

		const code = printer.printNode(
			EmitHint.Unspecified,
			type_node,
			source_file,
		);

		if (!(type_filename in outputs)) {
			outputs[type_filename] = [code];
		} else {
			outputs[type_filename].push(code);
		}

		return Object.entries(outputs)
			.map(([filename, code]) => new PrinterResult(
				code.join('\n\n'),
				filename,
			));
	}
}
