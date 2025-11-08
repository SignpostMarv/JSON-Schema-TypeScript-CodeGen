import {
	basename,
	dirname,
	relative,
} from 'node:path';

import type {
	ExportDeclaration,
	TypeAliasDeclaration,
} from 'typescript';
import {
	createPrinter,
	createSourceFile,
	EmitHint,
	factory,
	NewLineKind,
	NodeFlags,
	ScriptKind,
	ScriptTarget,
	SyntaxKind,
} from 'typescript';

import {
	is_non_empty_array,
} from '@satisfactory-dev/predicates.ts';

// eslint-disable-next-line @stylistic/max-len
// eslint-disable-next-line imports/no-unassigned-import, imports/no-empty-named-blocks
import {
} from './typescript/factory.ts';

import type {
	SchemaParser,
} from './SchemaParser.ts';

import type {
	SchemaObject,
} from './types.ts';

import type {
	adjust_name_callback,
} from './coercions.ts';
import {
	adjust_name_default,
	adjust_name_finisher,
} from './coercions.ts';

import {
	Type,
} from './JSONSchema/Type.ts';

import type {
	$defs_type,
} from './JSONSchema/$defs.ts';
import {
	$defs as $defs_type_handler,
} from './JSONSchema/$defs.ts';

type name_to_filename_callback = (name: string) => `./${string}.ts`;

function data_name_to_filename_default(): './index.ts' {
	return './index.ts';
}

function type_name_to_filename_default(): './types.ts' {
	return './types.ts';
}

class PrinterResult {
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

class Printer {
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

		let type_node: TypeAliasDeclaration|ExportDeclaration;

		if (!(type_for_schema instanceof $defs_type_handler)) {
			type_node = factory.createTypeAliasDeclaration(
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
		} else {
			let type_result = await type_for_schema
				.generate_typescript_type({
					schema: schema as $defs_type,
					schema_parser,
				});

			type_result = factory.updateNamedExports(
				type_result,
				type_result.elements
					.map((element) => factory.updateExportSpecifier(
						element,
						false,
						element.propertyName,
						element.name,
					)),
			);

			type_node = factory.createExportDeclaration(
				undefined,
				true,
				type_result,
			);
		}

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
					factory.createStringLiteral(
						`./${
							relative(
								dirname(data_filename),
								dirname(type_filename),
							)
						}/${
							basename(type_filename)
						}`.replace(/^\.\/\//, './'),
					),
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

			const $def_schema_with_$defs: SchemaObject = Type.maybe_add_$defs(
				$defs,
				$def_schema,
			);

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
					data,
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

		const import_values = [...schema_parser.imports.values()];

		const imports_unfiltered = (import_values)
			.map((name) => adjust_name_finisher(
				name,
				this.#adjust_name_callback,
			))
			.map((name) => [
				name,
				this.#type_filename_callback(name),
			] as const);

		const imports = imports_unfiltered
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

		const import_code_for_data: string[] = [];

		const import_types_from_modules: {
			[key in (
				'@signpostmarv/json-schema-typescript-codegen'
			)]: string[]
		} = {
			'@signpostmarv/json-schema-typescript-codegen': [],
		};

		const imports_from_modules: {
			[key in (
				'@signpostmarv/json-schema-typescript-codegen'
			)]: string[]
		} = {
			'@signpostmarv/json-schema-typescript-codegen': [],
		};

		for (const type_to_import of [
			'StringPassesRegex',
		] as const) {
			if (schema_parser.imports_from_module.has(type_to_import)) {
				import_types_from_modules[
					'@signpostmarv/json-schema-typescript-codegen'
				].push(
					type_to_import,
				);
			}
		}

		for (const thing_to_import of [
			'StringPassesRegexGuard',
		] as const) {
			if (schema_parser.imports_from_module.has(thing_to_import)) {
				imports_from_modules[
					'@signpostmarv/json-schema-typescript-codegen'
				].push(
					thing_to_import,
				);
			}
		}

		const filtered_module_type_imports = Object.entries(
			import_types_from_modules,
		).filter(([,maybe]) => maybe.length > 0);

		const filtered_module_imports = Object.entries(
			imports_from_modules,
		).filter(([,maybe]) => maybe.length > 0);

		for (const [
			module_string,
			imports_from_module,
		] of filtered_module_type_imports) {
			import_code.push(printer.printNode(
				EmitHint.Unspecified,
				factory.createImportDeclaration(
					undefined,
					factory.createImportClause(
						SyntaxKind.TypeKeyword,
						undefined,
						factory.createNamedImports(imports_from_module.map(
							(name) => factory.createImportSpecifier(
								false,
								undefined,
								factory.createIdentifier(name),
							),
						)),
					),
					factory.createStringLiteral(
						module_string,
					),
				),
				source_file,
			));
		}

		for (const [
			module_string,
			imports_from_module,
		] of filtered_module_imports) {
			import_code_for_data.push(printer.printNode(
				EmitHint.Unspecified,
				factory.createImportDeclaration(
					undefined,
					factory.createImportClause(
						undefined,
						undefined,
						factory.createNamedImports(imports_from_module.map(
							(name) => factory.createImportSpecifier(
								false,
								undefined,
								factory.createIdentifier(name),
							),
						)),
					),
					factory.createStringLiteral(
						module_string,
					),
				),
				source_file,
			));
		}

		if (import_code.length > 0) {
			if (!(type_filename in outputs)) {
				outputs[type_filename] = import_code;
			} else {
				outputs[type_filename] = [
					...import_code,
					...outputs[type_filename],
				];
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

		if (is_non_empty_array<string>(import_code_for_data)) {
			outputs[data_filename] = [
				...import_code_for_data,
				...outputs[data_filename],
			];
		}

		if ($defs_type_handler.is_a(type_for_schema)) {
			delete outputs[data_filename];
		}

		return Object.entries(outputs)
			.map(([filename, code]) => new PrinterResult(
				code.join('\n\n'),
				filename,
			));
	}
}

export {
	Printer,
};
