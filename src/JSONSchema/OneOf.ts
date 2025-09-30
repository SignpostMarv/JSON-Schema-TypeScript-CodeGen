import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	TypeNode,
} from 'typescript';
import {
	factory,
} from 'typescript';

import type {
	SchemaObject,
} from '../types.ts';

import type {
	ConversionlessType,
	SchemaDefinitionDefinition,
	SchemaObjectDefinition,
} from './Type.ts';
import {
	Type,
} from './Type.ts';

import type {
	SchemaParser,
} from '../SchemaParser.ts';

type type_choices = [SchemaObject, SchemaObject, ...SchemaObject[]];

type one_of_mode = 'specified'|'unspecified';

type one_of_type<
	Mode extends one_of_mode = one_of_mode,
	Choices extends type_choices = type_choices,
> = {
	specified: {oneOf: Choices},
	unspecified: Record<string, never>,
}[Mode];

type one_of_type_options<
	Mode extends one_of_mode = one_of_mode,
	Choices extends type_choices = type_choices,
> = {
	specified: {
		mode: Mode,
		choices: Choices,
	},
	unspecified: {
		mode: Mode,
		choices?: never[],
	},
}[Mode];

type schema_choices = [
	SchemaObjectDefinition,
	SchemaObjectDefinition,
	...SchemaObjectDefinition[],
];

type one_of_schema_options<
	Mode extends one_of_mode = one_of_mode,
	Choices extends schema_choices = schema_choices,
> = {
	specified: {
		mode: Mode,
		choices: Choices,
	},
	unspecified: {
		mode: Mode,
		choices?: never[],
	},
}[Mode];

type one_of_schema<
	Mode extends one_of_mode = one_of_mode,
	Choices extends schema_choices = schema_choices,
> = {
	specified: SchemaDefinitionDefinition<
		['oneOf'],
		{
			oneOf: {
				type: 'array',
				items: false,
				prefixItems: Choices,
			},
		},
		'yes'
	>,
	unspecified: SchemaDefinitionDefinition<
		['oneOf'],
		{
			oneOf: {
				type: 'array',
				minItems: 2,
				items: SchemaObjectDefinition,
			},
		},
		'yes'
	>,
}[Mode];

export class OneOf<
	T,
	Mode extends one_of_mode = one_of_mode,
	TypeChoices extends type_choices = type_choices,
	SchemaChoices extends schema_choices = schema_choices,
> extends
	Type<
		T,
		one_of_type<Mode, TypeChoices>,
		one_of_type_options,
		one_of_schema<Mode, SchemaChoices>,
		one_of_schema_options<Mode, SchemaChoices>,
		TypeNode,
		Expression
	> {
	generate_typescript_data(
		data: T,
		schema_parser: SchemaParser,
		schema: one_of_type<Mode, TypeChoices>,
	) {
		return this.#sub_schema_handler(
			data,
			schema,
			schema_parser,
			'yes',
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
			data?: T | undefined,
			schema: one_of_type<Mode, TypeChoices>,
			schema_parser: SchemaParser,
		},
	) {
		if (undefined !== data) {
			return this.#sub_schema_handler(
				data,
				schema,
				schema_parser,
				'no',
			).generate_typescript_type({
				data,
				schema,
				schema_parser,
			});
		}

		const $defs = '$defs' in schema ? schema.$defs : {};

		return factory.createUnionTypeNode(await Promise.all(
			schema.oneOf.map((sub_schema) => {
				return schema_parser.parse({
					$defs,
					...sub_schema,
				}).generate_typescript_type({
					schema: {
						$defs,
						...sub_schema,
					},
					schema_parser,
				});
			}),
		));
	}

	#sub_schema_handler<
		RequireConversion extends 'yes'|'no',
	>(
		data: T,
		schema: one_of_type<Mode, TypeChoices>,
		schema_parser: SchemaParser,
		require_conversion: RequireConversion,
	): {
		yes: Type<unknown>,
		no: ConversionlessType<unknown>,
	}[RequireConversion] {
		const ajv = new Ajv({strict: true});
		const validator = ajv.compile(schema);

		if (!validator(data)) {
			throw new TypeError('Data was not valid!');
		}

		const $defs = '$defs' in schema ? schema.$defs : {};

		const sub_schema = schema.oneOf.find((maybe) => {
			const ajv = new Ajv({strict: true});
			const validator = ajv.compile({
				$defs,
				...maybe,
			});

			return validator(data);
		}) as SchemaObject;

		return schema_parser.parse(
			{
				$defs,
				...sub_schema,
			},
			require_conversion,
		);
	}

	static generate_schema_definition<
		Mode extends one_of_mode = one_of_mode,
		Choices extends schema_choices = schema_choices,
	>(
		{
			choices,
		}: one_of_schema_options<Mode, Choices>,
	): Readonly<one_of_schema<Mode, Choices>> {
		let result: one_of_schema<Mode, Choices>;

		if (
			undefined === choices
			|| !this.#is_PrefixItems_schema_choices(choices)
		) {
			const sanity_check: one_of_schema<
				'unspecified',
				Choices
			> = {
				type: 'object',
				additionalProperties: false,
				required: ['oneOf'],
				properties: {
					oneOf: {
						type: 'array',
						minItems: 2,
						items: {
							type: 'object',
							minProperties: 1,
							additionalProperties: {},
						},
					},
				},
			};

			result = sanity_check as typeof result;
		} else {
			const sanity_check: one_of_schema<
				'specified',
				schema_choices
			> = {
				type: 'object',
				additionalProperties: false,
				required: ['oneOf'],
				properties: {
					oneOf: {
						type: 'array',
						items: false,
						prefixItems: choices,
					},
				},
			};

			result = sanity_check as typeof result;
		}

		return Object.freeze(result);
	}

	static generate_type_definition<
		Mode extends one_of_mode = one_of_mode,
		Choices extends type_choices = type_choices,
	>(
		{
			choices,
		}: one_of_type_options<Mode, Choices>,
	): Readonly<one_of_type<Mode, Choices>> {
		let result: one_of_type<Mode, Choices>;

		if ((choices || []).length < 2) {
			const sanity_check: one_of_type<'unspecified'> = {};

			result = sanity_check as typeof result;
		} else {
			const sanity_check: one_of_type<
				'specified',
				Choices
			> = {oneOf: (choices as Choices)};

			result = sanity_check as typeof result;
		}

		return Object.freeze(result);
	}

	static #is_PrefixItems_schema_choices<
		Choices extends schema_choices,
	>(
		maybe: never[]|Choices,
	): maybe is Choices {
		return maybe.length >= 2;
	}
}
