import type {
	Expression,
	KeywordTypeNode,
	PropertyAssignment,
	SyntaxKind,
	TypeNode,
} from 'typescript';
import {
	isObjectLiteralExpression,
	isPropertyAssignment,
} from 'typescript';

import {
	object_has_property,
} from '@satisfactory-dev/predicates.ts';

import type {
	SchemaDefinitionDefinition,
	SchemaDefinitionDefinitionWithNoSpecifiedProperties,
} from './Type.ts';
import {
	Type,
} from './Type.ts';

import type {
	$ref_type,
} from './Ref.ts';
import {
	$ref,
} from './Ref.ts';

import {
	$defs,
} from './$defs.ts';

import type {
	ObjectOfSchemas,
	SchemaObject,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../types.ts';

import type {
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../SchemaParser.ts';

import type {
	IntersectionTypeNode,
	UnionTypeNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/types.ts';

import {
	factory,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../typescript/factory.ts';

import {
	SchemaValidationError,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../SchemaValidationError.ts';

type type_choices = [SchemaObject, SchemaObject, ...SchemaObject[]];

type something_of_kind = 'oneOf'|'anyOf'|'allOf';
type something_of_mode = 'specified'|'unspecified';

type something_of_type<
	Kind extends something_of_kind,
	Mode extends something_of_mode = something_of_mode,
	Choices extends type_choices = type_choices,
	Defs extends ObjectOfSchemas = ObjectOfSchemas,
> = {
	oneOf: {
		specified: {
			$defs?: Defs,
			oneOf: Choices,
		},
		unspecified: Record<string, never>,
	}[Mode],
	anyOf: {
		specified: {
			$defs?: Defs,
			anyOf: Choices,
		},
		unspecified: Record<string, never>,
	}[Mode],
	allOf: {
		specified: {
			$defs?: Defs,
			allOf: Choices,
		},
		unspecified: Record<string, never>,
	}[Mode],
}[Kind];

type something_of_type_options<
	Kind extends something_of_kind,
	Mode extends something_of_mode = something_of_mode,
	Choices extends type_choices = type_choices,
	Defs extends ObjectOfSchemas = ObjectOfSchemas,
> = {
	specified: {
		kind: Kind,
		mode: Mode,
		choices: Choices,
		$defs?: Defs,
	},
	unspecified: {
		kind: Kind,
		mode: Mode,
		choices?: never[],
	},
}[Mode];

type schema_choices = [
	SchemaDefinitionDefinition,
	SchemaDefinitionDefinition,
	...SchemaDefinitionDefinition[],
];

type something_of_schema_options<
	Kind extends something_of_kind,
	Mode extends something_of_mode = something_of_mode,
	Choices extends schema_choices = schema_choices,
> = {
	specified: {
		kind: Kind,
		mode: Mode,
		choices: Choices,
	},
	unspecified: {
		kind: Kind,
		mode: Mode,
		choices?: never[],
	},
}[Mode];

type something_of_schema<
	Kind extends something_of_kind,
	Mode extends something_of_mode = something_of_mode,
	Choices extends schema_choices = schema_choices,
> = {
	specified: SchemaDefinitionDefinition<
		[Kind],
		{
			oneOf: {
				$defs: {
					type: 'object',
					additionalProperties: {
						type: 'object',
					},
				},
				oneOf: {
					type: 'array',
					const: Choices,
				},
			},
			anyOf: {
				$defs: {
					type: 'object',
					additionalProperties: {
						type: 'object',
					},
				},
				anyOf: {
					type: 'array',
					const: Choices,
				},
			},
			allOf: {
				$defs: {
					type: 'object',
					additionalProperties: {
						type: 'object',
					},
				},
				allOf: {
					type: 'array',
					const: Choices,
				},
			},
		}[Kind]
	>,
	unspecified: SchemaDefinitionDefinition<
		[Kind],
		{
			oneOf: {
				$defs: {
					type: 'object',
					additionalProperties: {
						type: 'object',
					},
				},
				oneOf: {
					type: 'array',
					minItems: 2,
					items: SchemaDefinitionDefinitionWithNoSpecifiedProperties,
				},
			},
			anyOf: {
				$defs: {
					type: 'object',
					additionalProperties: {
						type: 'object',
					},
				},
				anyOf: {
					type: 'array',
					minItems: 2,
					items: SchemaDefinitionDefinitionWithNoSpecifiedProperties,
				},
			},
			allOf: {
				$defs: {
					type: 'object',
					additionalProperties: {
						type: 'object',
					},
				},
				allOf: {
					type: 'array',
					minItems: 2,
					items: SchemaDefinitionDefinitionWithNoSpecifiedProperties,
				},
			},
		}[Kind]
	>,
}[Mode];

abstract class SomethingOf<
	T,
	Kind extends something_of_kind,
	Mode extends something_of_mode = something_of_mode,
	TypeChoices extends type_choices = type_choices,
	SchemaChoices extends schema_choices = schema_choices,
	Defs extends ObjectOfSchemas = ObjectOfSchemas,
> extends
	Type<
		T,
		something_of_type<Kind, Mode, TypeChoices, Defs>,
		something_of_type_options<Kind, Mode, TypeChoices, Defs>,
		something_of_schema<Kind, Mode, SchemaChoices>,
		something_of_schema_options<Kind, Mode, SchemaChoices>,
		{
			oneOf: KeywordTypeNode<SyntaxKind.UnknownKeyword> | UnionTypeNode,
			anyOf: KeywordTypeNode<SyntaxKind.UnknownKeyword> | UnionTypeNode,
			allOf: (
				| KeywordTypeNode<SyntaxKind.UnknownKeyword>
				| IntersectionTypeNode<[TypeNode, ...TypeNode[]]>
			),
		}[Kind],
		Expression
	> {
	generate_typescript_data(
		data: T,
		schema_parser: SchemaParser,
		schema: something_of_type<Kind, Mode, TypeChoices, Defs>,
	) {
		if (SomethingOf.#is_allOf(schema)) {
			return this.#merge_subschema_for_data(
				data,
				schema,
				schema_parser,
			);
		}

		const [
			sub_schema,
			matched_type,
		] = this.#sub_schema_handler(
			data,
			schema as something_of_type<
				Exclude<Kind, 'allOf'>,
				Mode,
				TypeChoices,
				Defs
			>,
			schema_parser,
		);

		return matched_type.generate_typescript_data(
			data,
			schema_parser,
			sub_schema,
		);
	}

	async generate_typescript_type(
		{
			data,
			schema,
			schema_parser,
		}: {
			data: T,
			schema: Record<string, never>,
			schema_parser: SchemaParser,
		},
	): Promise<TypeNode>;
	async generate_typescript_type(
		{
			data,
			schema,
			schema_parser,
		}: {
			data: T,
			schema: something_of_type<Kind, Mode, TypeChoices, Defs>,
			schema_parser: SchemaParser,
		},
	): Promise<{
		oneOf: UnionTypeNode,
		anyOf: UnionTypeNode,
		allOf: IntersectionTypeNode<[TypeNode, ...TypeNode[]]>,
	}[Kind]>;
	async generate_typescript_type(
		{
			data,
			schema,
			schema_parser,
		}: {
			data: T,
			schema: (
				| something_of_type<Kind, Mode, TypeChoices, Defs>
				| Record<string, never>
			),
			schema_parser: SchemaParser,
		},
	): Promise<{
		oneOf: TypeNode | UnionTypeNode,
		anyOf: TypeNode | UnionTypeNode,
		allOf: (
			| TypeNode
			| IntersectionTypeNode<[TypeNode, ...TypeNode[]]>
		),
	}[Kind]> {
		if (!SomethingOf.#is_non_empty_schema(schema)) {
			return schema_parser.parse_by_type(
				data,
				undefined,
			).generate_typescript_type({
				data,
				schema,
				schema_parser,
			});
		}

		const choices = 'oneOf' in schema
			? schema.oneOf
			: ('allOf' in schema ? schema.allOf : schema.anyOf);

		const sub_types = await Promise.all(
			choices.map((
				sub_schema,
			) => SomethingOf.maybe_add_$defs(
				schema,
				sub_schema,
			)).map((sub_schema) => {
				return schema_parser.parse(
					SomethingOf.maybe_add_$defs(
						schema,
						sub_schema,
					),
				).generate_typescript_type({
					data: data,
					schema: sub_schema,
					schema_parser,
				});
			}),
		);

		let result: {
			oneOf: UnionTypeNode,
			anyOf: UnionTypeNode,
			allOf: IntersectionTypeNode<[TypeNode, ...TypeNode[]]>,
		}[Kind];

		if (SomethingOf.#is_allOf_schema(schema)) {
			const sanity_check: IntersectionTypeNode<
				[TypeNode, ...TypeNode[]]
			> = factory.createIntersectionTypeNode(sub_types);

			result = sanity_check as typeof result;
		} else {
			const sanity_check: UnionTypeNode = factory.createUnionTypeNode(
				sub_types,
			);

			result = sanity_check as typeof result;
		}

		return result;
	}

	static #is_allOf<
		Mode extends something_of_mode = something_of_mode,
		Choices extends type_choices = type_choices,
		Defs extends ObjectOfSchemas = ObjectOfSchemas,
	>(
		schema: something_of_type<something_of_kind, Mode, Choices, Defs>,
	): schema is something_of_type<'allOf', Mode, Choices, Defs> {
		return 'allOf' in schema;
	}

	#merge_subschema_for_data(
		data: T,
		schema: something_of_type<'allOf', Mode, TypeChoices, Defs>,
		schema_parser: SchemaParser,
	): Expression {
		const properties: PropertyAssignment[] = [];

		const choices = schema.allOf.map((sub_schema) => {
			if ('$ref' in sub_schema) {
				const $ref_type = schema_parser.types
					.find((maybe) => maybe instanceof $ref);

				if (undefined === $ref_type) {
					throw new TypeError(
						'$ref schema found but could not get parser type!',
					);
				}

				return $ref_type.resolve_def(
					sub_schema as $ref_type,
					schema.$defs || {},
				);
			}

			return sub_schema;
		});

		const has_const = choices.find((maybe) => 'const' in maybe);

		if (has_const) {
			return schema_parser.parse(has_const).generate_typescript_data(
				data,
				schema_parser,
				has_const,
			);
		}

		if (
			'object' !== typeof data
			|| null === data
			|| Array.isArray(data)
		) {
			throw new TypeError('Only object data supported here!');
		}

		const expected_properties = Object.keys(data);
		const found_properties: string[] = [];

		for (const unmodified of choices) {
			const resolved = SomethingOf.maybe_add_$defs(schema, unmodified);

			if ('object' !== resolved.type) {
				throw new TypeError('Only object types supported here!');
			} else if ('patternProperties' in resolved) {
				throw new TypeError('patternProperties not yet supported!');
			} else if (!('properties' in resolved)) {
				throw new TypeError('properties not present in schema!');
			}

			const sub_data: {[key: string]: unknown} = {};

			for (const property of Object.keys(resolved.properties)) {
				if (found_properties.includes(property)) {
					throw new TypeError(
						`Schema contains multiple references to ${property}`,
					);
				}

				if (!object_has_property(data, property)) {
					throw new TypeError(
						`Data does not have property ${property}`,
					);
				}

				sub_data[property] = data[property];

				found_properties.push(property);
			}

			if ('$ref' in resolved) {
				throw new Error('nested $ref not implemented!');
			}

			const sub_type = schema_parser.parse(resolved);

			const resolved_data = sub_type.generate_typescript_data(
				sub_data,
				schema_parser,
				resolved,
			);

			if (!isObjectLiteralExpression(resolved_data)) {
				throw new TypeError('Was expecting ObjectLiteralExpression!');
			}

			for (const property of resolved_data.properties) {
				if (!isPropertyAssignment(property)) {
					throw new TypeError('Was expecting PropertyAssignment!');
				}

				properties.push(property);
			}
		}

		const missing = expected_properties
			.filter((maybe) => !found_properties.includes(maybe));

		if (missing.length > 0) {
			throw new TypeError(
				`Schema is missing definition for some properties: ${
					missing.join(', ')
				}`,
			);
		}

		return factory.createObjectLiteralExpression(
			properties,
			true,
		);
	}

	#sub_schema_handler(
		data: T,
		schema: something_of_type<
			Exclude<Kind, 'allOf'>,
			Mode,
			TypeChoices,
			Defs
		>,
		schema_parser: SchemaParser,
	): [SchemaObject, Type<unknown>] {
		const ajv = schema_parser.share_ajv((ajv) => ajv);
		const validator = ajv.compile(schema);

		if (!validator(data)) {
			throw new SchemaValidationError('Data was not valid!', validator);
		}

		if (0 === Object.keys(schema).length) {
			return [{}, schema_parser.parse_by_type<
				Type<unknown>
			>(
				data,
				(maybe): maybe is Type<unknown> => {
					return Type.is_a(maybe) && (
						!(maybe instanceof SomethingOf)
						&& !(maybe instanceof $defs)
					);
				},
			)];
		}

		const choices = 'oneOf' in schema
			? schema.oneOf
			: schema.anyOf;

		const sub_schema = choices.map((
			sub_schema,
		) => SomethingOf.maybe_add_$defs(schema, sub_schema)).find((maybe) => {
			const ajv = schema_parser.share_ajv((ajv) => ajv);
			const validator = ajv.compile(maybe);

			return validator(data);
		}) as SchemaObject;

		const modified = SomethingOf.maybe_add_$defs(
			schema,
			sub_schema,
		);

		const result = schema_parser.maybe_parse<Type<unknown>>(
			modified,
			Type,
		);

		if (result) {
			return [modified, result];
		}

		return [modified, schema_parser.parse(modified)];
	}

	static generate_schema_definition<
		Kind extends something_of_kind,
		Mode extends something_of_mode = something_of_mode,
		Choices extends schema_choices = schema_choices,
	>(
		{
			kind,
			choices,
		}: something_of_schema_options<Kind, Mode, Choices>,
	): Readonly<something_of_schema<Kind, Mode, Choices>> {
		let result: something_of_schema<Kind, Mode, Choices>;

		if (
			undefined === choices
			|| !SomethingOf.#is_const_schema_choices(choices)
		) {
			let properties: something_of_schema<
				Kind,
				'unspecified',
				Choices
			>['properties'];

			if (kind === 'oneOf') {
				const sanity_check: something_of_schema<
					'oneOf',
					'unspecified',
					Choices
				>['properties'] = {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					oneOf: {
						type: 'array',
						minItems: 2,
						items: {
							type: 'object',
							minProperties: 1,
							additionalProperties: {},
						},
					},
				};

				properties = sanity_check as typeof properties;
			} else if ('allOf' === kind) {
				const sanity_check: something_of_schema<
					'allOf',
					'unspecified',
					Choices
				>['properties'] = {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					allOf: {
						type: 'array',
						minItems: 2,
						items: {
							type: 'object',
							minProperties: 1,
							additionalProperties: {},
						},
					},
				};

				properties = sanity_check as typeof properties;
			} else {
				const sanity_check: something_of_schema<
					'anyOf',
					'unspecified',
					Choices
				>['properties'] = {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					anyOf: {
						type: 'array',
						minItems: 2,
						items: {
							type: 'object',
							minProperties: 1,
							additionalProperties: {},
						},
					},
				};

				properties = sanity_check as typeof properties;
			}

			const sanity_check: something_of_schema<
				Kind,
				'unspecified',
				Choices
			> = {
				type: 'object',
				additionalProperties: false,
				required: [kind],
				properties,
			};

			result = sanity_check as typeof result;
		} else {
			let properties: something_of_schema<
				Kind,
				'specified',
				Choices
			>['properties'];

			if (kind === 'oneOf') {
				const sanity_check: something_of_schema<
					'oneOf',
					'specified',
					Choices
				>['properties'] = {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					oneOf: {
						type: 'array',
						const: choices,
					},
				};

				properties = sanity_check as typeof properties;
			} else if ('allOf' === kind) {
				const sanity_check: something_of_schema<
					'allOf',
					'specified',
					Choices
				>['properties'] = {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					allOf: {
						type: 'array',
						const: choices,
					},
				};

				properties = sanity_check as typeof properties;
			} else {
				const sanity_check: something_of_schema<
					'anyOf',
					'specified',
					Choices
				>['properties'] = {
					$defs: {
						type: 'object',
						additionalProperties: {
							type: 'object',
						},
					},
					anyOf: {
						type: 'array',
						const: choices,
					},
				};

				properties = sanity_check as typeof properties;
			}

			const sanity_check: something_of_schema<
				Kind,
				'specified',
				schema_choices
			> = {
				type: 'object',
				additionalProperties: false,
				required: [kind],
				properties,
			};

			result = sanity_check as typeof result;
		}

		return Object.freeze(result);
	}

	static generate_type_definition<
		Kind extends something_of_kind,
		Mode extends something_of_mode = something_of_mode,
		Choices extends type_choices = type_choices,
		Defs extends ObjectOfSchemas = ObjectOfSchemas,
	>(
		options: something_of_type_options<Kind, Mode, Choices, Defs>,
	): Readonly<something_of_type<Kind, Mode, Choices, Defs>> {
		let result: something_of_type<Kind, Mode, Choices, Defs>;
		const {
			kind,
			choices,
		} = options;

		if ((choices || []).length < 2) {
			const sanity_check: something_of_type<Kind, 'unspecified'> = {};

			result = sanity_check as typeof result;
		} else {
			if ('oneOf' === kind) {
				const sanity_check: something_of_type<
					'oneOf',
					'specified',
					Choices,
					Defs
				> = {oneOf: choices as Choices};

				result = sanity_check as typeof result;
			} else if ('allOf' === kind) {
				const sanity_check: something_of_type<
					'allOf',
					'specified',
					Choices,
					Defs
				> = {allOf: choices as Choices};

				result = sanity_check as typeof result;
			} else {
				const sanity_check: something_of_type<
					'anyOf',
					'specified',
					Choices,
					Defs
				> = {anyOf: choices as Choices};

				result = sanity_check as typeof result;
			}

			if ('$defs' in options) {
				result.$defs = options.$defs;
			}
		}

		return Object.freeze(result);
	}

	static #is_allOf_schema(
		maybe: something_of_type<something_of_kind>,
	): maybe is something_of_type<'allOf'> {
		return 'allOf' in maybe;
	}

	static #is_const_schema_choices<
		Choices extends schema_choices,
	>(
		maybe: never[]|Choices,
	): maybe is Choices {
		return maybe.length >= 2;
	}

	static #is_non_empty_schema(
		maybe: something_of_type<something_of_kind>|Record<string, never>,
	): maybe is something_of_type<something_of_kind> {
		return 0 !== Object.keys(maybe).length;
	}
}

export type {
	type_choices,
	something_of_kind,
	something_of_mode,
	something_of_type,
	something_of_type_options,
	schema_choices,
	something_of_schema_options,
};

export {
	SomethingOf,
};
