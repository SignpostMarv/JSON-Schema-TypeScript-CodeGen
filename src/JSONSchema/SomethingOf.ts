import type {
	Expression,
	TypeNode,
} from 'typescript';
import {
	factory,
} from 'typescript';

import type {
	ObjectOfSchemas,
	SchemaObject,
} from '../types.ts';

import type {
	SchemaDefinitionDefinition,
	SchemaObjectDefinition,
} from './Type.ts';
import {
	Type,
} from './Type.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

import {
	$ref,
} from './Ref.ts';

export type type_choices = [SchemaObject, SchemaObject, ...SchemaObject[]];

export type something_of_kind = 'oneOf'|'anyOf';
export type something_of_mode = 'specified'|'unspecified';

export type something_of_type<
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
}[Kind];

export type something_of_type_options<
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

export type schema_choices = [
	SchemaDefinitionDefinition,
	SchemaDefinitionDefinition,
	...SchemaDefinitionDefinition[],
];

export type something_of_schema_options<
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
		}[Kind],
		'yes'
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
					items: SchemaObjectDefinition,
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
					items: SchemaObjectDefinition,
				},
			},
		}[Kind],
		'yes'
	>,
}[Mode];

export abstract class SomethingOf<
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
		TypeNode,
		Expression
	> {
	generate_typescript_data(
		data: T,
		schema_parser: SchemaParser,
		schema: something_of_type<Kind, Mode, TypeChoices, Defs>,
	) {
		return this.#sub_schema_handler(
			data,
			schema,
			schema_parser,
		).generate_typescript_data(
			data,
			schema_parser,
			schema,
		);
	}

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
	) {
		if (0 === Object.keys(schema).length) {
			return schema_parser.parse_by_type(
				data,
				undefined,
			).generate_typescript_type({
				data,
				schema,
				schema_parser,
			});
		}

		const choices = 'oneOf' in schema ? schema.oneOf : schema.anyOf;

		return factory.createUnionTypeNode(await Promise.all(
			choices.map((
				sub_schema,
			) => this.#maybe_add_$defs(
				schema,
				sub_schema,
			)).map((sub_schema) => {
				return $ref.intercept_$ref(
					this.#maybe_add_$defs(schema, sub_schema)['$defs'] || {},
					sub_schema,
					schema_parser,
					'$ref allowed',
				).generate_typescript_type({
					data: sub_schema,
					schema: sub_schema,
					schema_parser,
				});
			}),
		));
	}

	#maybe_add_$defs(
		schema: SchemaObject,
		sub_schema: SchemaObject,
	): SchemaObject {
		if ('$defs' in schema) {
			return {
				$defs: schema.$defs,
				...sub_schema,
			};
		}

		return sub_schema;
	}

	#sub_schema_handler(
		data: T,
		schema: something_of_type<Kind, Mode, TypeChoices, Defs>,
		schema_parser: SchemaParser,
	): Type<unknown> {
		const ajv = schema_parser.share_ajv((ajv) => ajv);
		const validator = ajv.compile(schema);

		if (!validator(data)) {
			throw new TypeError('Data was not valid!');
		}

		if (0 === Object.keys(schema).length) {
			return schema_parser.parse_by_type<
				Type<unknown>
			>(
				data,
				(maybe): maybe is Type<unknown> => {
					return Type.is_a(maybe);
				},
			);
		}

		const choices = 'oneOf' in schema ? schema.oneOf : schema.anyOf;

		const sub_schema = choices.map((
			sub_schema,
		) => this.#maybe_add_$defs(schema, sub_schema)).find((maybe) => {
			const ajv = schema_parser.share_ajv((ajv) => ajv);
			const validator = ajv.compile(maybe);

			return validator(data);
		}) as SchemaObject;

		return $ref.intercept_$ref(
			sub_schema.$defs || {},
			sub_schema,
			schema_parser,
			'yes',
		);
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

	static #is_const_schema_choices<
		Choices extends schema_choices,
	>(
		maybe: never[]|Choices,
	): maybe is Choices {
		return maybe.length >= 2;
	}
}
