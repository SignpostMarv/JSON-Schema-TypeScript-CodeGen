import {
	basename,
	dirname,
	relative,
} from 'path';

import type {
	createPrinter,
	createSourceFile,
	EmitHint,
	ExportDeclaration,
	NewLineKind,
	NodeFlags,
	ScriptKind,
	ScriptTarget,
	SyntaxKind,
	TypeAliasDeclaration,
} from 'typescript';

import {
	is_non_empty_array,
} from '@satisfactory-dev/predicates.ts';

import {
} from '@signpostmarv/js-types';

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

import type {
	ts as base_ts,
} from './typescript/types.ts';

type name_to_filename_callback = (name: string) => `./${string}.ts`;

type ts = (
	& base_ts
	& {
		createPrinter: typeof createPrinter,
		createSourceFile: typeof createSourceFile,
		EmitHint: typeof EmitHint,
		NewLineKind: typeof NewLineKind,
		NodeFlags: typeof NodeFlags,
		ScriptKind: typeof ScriptKind,
		ScriptTarget: typeof ScriptTarget,
		SyntaxKind: typeof SyntaxKind,
	}
);

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
		ts: ts,
		type_name: string = 'foo',
		data_name: string = 'bar',
		output_types: boolean = true,
		output_data: boolean = true,
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

		let type_node: TypeAliasDeclaration|ExportDeclaration;

		if (!(type_for_schema instanceof $defs_type_handler)) {
			type_node = ts.factory.createTypeAliasDeclaration(
				[
					ts.factory.createToken(ts.SyntaxKind.ExportKeyword),
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

			type_result = ts.factory.updateNamedExports(
				type_result,
				type_result.elements
					.map((element) => ts.factory.updateExportSpecifier(
						element,
						false,
						element.propertyName,
						element.name,
					)),
			);

			type_node = ts.factory.createExportDeclaration(
				undefined,
				true,
				type_result,
			);
		}

		const printer = ts.createPrinter({
			newLine: ts.NewLineKind.LineFeed,
			noEmitHelpers: true,
		});

		const data_filename = this.#data_filename_callback(adjusted_data_name);
		const type_filename = this.#type_filename_callback(adjusted_type_name);

		const outputs: {[key: `./${string}.ts`]: [string, ...string[]]} = {};

		const source_file = ts.createSourceFile(
			'index.ts',
			'',
			ts.ScriptTarget.Latest,
			false,
			ts.ScriptKind.TS,
		);

		if (output_data) {
			const data_node = ts.factory.createVariableStatement(
				[
					ts.factory.createToken(ts.SyntaxKind.ExportKeyword),
				],
				ts.factory.createVariableDeclarationList(
					[
						ts.factory.createVariableDeclaration(
							adjusted_data_name,
							undefined,
							ts.factory.createTypeReferenceNode(
								adjusted_type_name,
							),
							type_for_schema.generate_typescript_data(
								data,
								schema_parser,
								schema,
							),
						),
					],
					ts.NodeFlags.Const,
				),
			);

			outputs[data_filename] = [
				printer.printNode(
					ts.EmitHint.Unspecified,
					ts.factory.createImportDeclaration(
						undefined,
						ts.factory.createImportClause(
							ts.SyntaxKind.TypeKeyword,
							undefined,
							ts.factory.createNamedImports([
								ts.factory.createImportSpecifier(
									false,
									undefined,
									ts.factory.createIdentifier(
										adjusted_type_name,
									),
								),
							]),
						),
						ts.factory.createStringLiteral(
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
					ts.EmitHint.Unspecified,
					data_node,
					source_file,
				),
			];
		}

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

			const node = ts.factory.createTypeAliasDeclaration(
				(
					type_filename !== $def_filename
						? [
							ts.factory.createToken(
								ts.SyntaxKind.ExportKeyword,
							),
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

			if (output_types) {
				const code = printer.printNode(
					ts.EmitHint.Unspecified,
					node,
					source_file,
				);

				if (!($def_filename in outputs)) {
					outputs[$def_filename] = [code];
				} else {
					outputs[$def_filename].push(code);
				}
			}
		}

		const import_values = [...schema_parser.imports.values()];

		const imports_unfiltered = (import_values)
			.map((name): [string, string] => {
				if (/ as /.test(name)) {
					const [
						module_scope,
						...current_scope
					] = name.split(' as ');

					return [
						adjust_name_finisher(
							module_scope,
							this.#adjust_name_callback,
						),
						adjust_name_finisher(
							current_scope.join(' as '),
							this.#adjust_name_callback,
						),
					];
				} else {
					const adjusted = adjust_name_finisher(
						name,
						this.#adjust_name_callback,
					);

					return [adjusted, adjusted];
				}
			})
			.map(([
				module_scope,
				current_scope,
			]): [[string, string], `./${string}.ts`] => [
				[module_scope, current_scope],
				this.#type_filename_callback(current_scope),
			]);

		const imports = imports_unfiltered
			.filter(([, maybe]) => maybe !== type_filename)
			.reduce(
				(
					out,
					[name, filename],
				): {
					[key: `./${string}.ts`]: [
						[string, string],
						...([string, string])[],
					],
				} => {
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
				ts.EmitHint.Unspecified,
				ts.factory.createImportDeclaration(
					undefined,
					ts.factory.createImportClause(
						ts.SyntaxKind.TypeKeyword,
						undefined,
						ts.factory.createNamedImports(to_import.map(
							([
								module_scope,
								current_scope,
							]) => {
								if (module_scope === current_scope) {
									return ts.factory.createImportSpecifier(
										false,
										undefined,
										ts.factory.createIdentifier(
											module_scope,
										),
									);
								} else {
									return ts.factory.createImportSpecifier(
										false,
										ts.factory.createIdentifier(
											module_scope,
										),
										ts.factory.createIdentifier(
											current_scope,
										),
									);
								}
							},
						)),
					),
					ts.factory.createStringLiteral(
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
				ts.EmitHint.Unspecified,
				ts.factory.createImportDeclaration(
					undefined,
					ts.factory.createImportClause(
						ts.SyntaxKind.TypeKeyword,
						undefined,
						ts.factory.createNamedImports(imports_from_module.map(
							(name) => ts.factory.createImportSpecifier(
								false,
								undefined,
								ts.factory.createIdentifier(name),
							),
						)),
					),
					ts.factory.createStringLiteral(
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
				ts.EmitHint.Unspecified,
				ts.factory.createImportDeclaration(
					undefined,
					ts.factory.createImportClause(
						undefined,
						undefined,
						ts.factory.createNamedImports(imports_from_module.map(
							(name) => ts.factory.createImportSpecifier(
								false,
								undefined,
								ts.factory.createIdentifier(name),
							),
						)),
					),
					ts.factory.createStringLiteral(
						module_string,
					),
				),
				source_file,
			));
		}

		if (import_code.length > 0 && output_types) {
			if (!(type_filename in outputs)) {
				outputs[type_filename] = import_code;
			} else {
				outputs[type_filename] = [
					...import_code,
					...outputs[type_filename],
				];
			}
		}

		if (output_types) {
			const code = printer.printNode(
				ts.EmitHint.Unspecified,
				type_node,
				source_file,
			);

			if (!(type_filename in outputs)) {
				outputs[type_filename] = [code];
			} else {
				outputs[type_filename].push(code);
			}
		}

		if (
			!(type_for_schema instanceof $defs_type_handler)
			&& Object.keys($defs).length > 0
		) {
			const type_for_$defs = schema_parser.parse_require_$defs({
				$defs,
			});

			let type_result = await type_for_$defs
				.generate_typescript_type({
					schema: {
						$defs,
					},
					schema_parser,
				});
			type_result = ts.factory.updateNamedExports(
				type_result,
				type_result.elements
					.map((element) => ts.factory.updateExportSpecifier(
						element,
						false,
						element.propertyName,
						element.name,
					)),
			);
			if (output_types) {
				type_node = ts.factory.createExportDeclaration(
					undefined,
					true,
					type_result,
				);
				const code = printer.printNode(
					ts.EmitHint.Unspecified,
					type_node,
					source_file,
				);
				outputs[type_filename].push(code);
			}
		}

		if (
			is_non_empty_array<string>(import_code_for_data)
			&& output_data
		) {
			outputs[data_filename] = [
				...import_code_for_data,
				...outputs[data_filename],
			];
		}

		if ($defs_type_handler.is_a(type_for_schema)) {
			delete outputs[data_filename];
		}

		let result: PrinterResult[] = Object.entries(outputs)
			.map(([filename, code]) => new PrinterResult(
				code.join('\n\n'),
				filename,
			));

		if (!output_data) {
			result = result.filter(
				({filename: maybe}) => maybe !== data_filename,
			);
		}

		if (!output_types) {
			result = result.filter(
				({filename: maybe}) => (!(maybe !== data_filename)),
			);
		}

		result.sort(({filename: a}, {filename: b}) => a.localeCompare(b));

		return result;
	}
}

export {
	Printer,
};
