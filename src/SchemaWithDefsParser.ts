import type {
	Ajv2020 as Ajv,
	SchemaObject,
} from 'ajv/dist/2020.js';

import type {
	Expression,
	PropertySignature,
	TypeLiteralNode,
	TypeNode,
} from 'typescript';
import {
	factory,
	SyntaxKind,
} from 'typescript';

import type {
	SchemaParserOptions,
} from './SchemaParser.ts';
import {
	SchemaParser,
} from './SchemaParser.ts';

import type {
	$def,
} from './JSONSchema/Ref.ts';
import {
	$ref,
} from './JSONSchema/Ref.ts';
import type {
	pattern_object_schema,
	simple_object_schema,
} from './JSONSchema/Object.ts';

type SchemaWithDefsParserOptions = (
	& (
		| {
			schema_parser: SchemaParser|SchemaParserOptions,
		}
	)
);

type supported_object_schema = (
	| simple_object_schema
	| pattern_object_schema
);

type simple_array_schema = {
	type: 'array',
	items: SchemaObject,
};

type prefix_items_schema = {
	type: 'array',
	prefixItems: [SchemaObject, ...SchemaObject[]],
	items: false,
	unevaluatedItems: false,
};

type supported_array_schema = (
	| simple_array_schema
	| prefix_items_schema
);

type schema<
	Id extends string|undefined,
	$defs extends {[key: $def]: SchemaObject}|undefined,
> = (
	& SchemaObject
	& (Id extends string ? {$id: Id} : {$id?: Exclude<Id, undefined>})
	& (
		$defs extends undefined
			? {$defs?: Exclude<$defs, undefined>}
			: {$defs: $defs}
	)
	& (
		| supported_object_schema
		| supported_array_schema
	)
);

type schema_with_defs<
	Id extends string|undefined,
	$defs extends {[key: $def]: SchemaObject}
> = schema<Id, $defs>;

export class SchemaWithDefsParser
{
	#ajv: Ajv;
	#schema_parser: SchemaParser;

	constructor(options: undefined|SchemaWithDefsParserOptions = undefined) {
		const {
			schema_parser,
		} = options || {};

		this.#schema_parser = (
			schema_parser instanceof SchemaParser
				? schema_parser
				: new SchemaParser(schema_parser)
		);
		this.#ajv = this.#schema_parser.share_ajv((ajv: Ajv) => ajv);
	}

	convert<
		Data extends {[key: string]: unknown}|unknown[],
		Schema extends schema_with_defs<
			string|undefined,
			{[key: $def]: SchemaObject}
		>,
		Return = (
			Schema extends supported_object_schema
				? Expression[]
				: {[key in keyof Data]: Expression}
		)
	>(
		data: (
			Schema extends supported_object_schema
				? Exclude<Data, unknown[]>
				: Exclude<Data, {[key: string]: unknown}>
		),
		schema: Schema,
	): Return {
		const validate = this.#ajv.compile<Data>(schema);

		if (!validate(data)) {
			throw new TypeError('Data does not match expected schema!');
		}

		if (Array.isArray(data)) {
			if (!SchemaWithDefsParser.#is_array_schema(schema)) {
				throw new TypeError(
					'Array data detected with non-array schema!',
				);
			}

			return this.#convert_array<
				Exclude<Data, {[key: string]: unknown}>,
				typeof schema
			>(
				data as Exclude<Data, {[key: string]: unknown}>,
				schema,
			) as Return;
		} else if (!SchemaWithDefsParser.#is_object_schema(schema)) {
			throw new TypeError(
				'Object data detected with non-object schema!',
			);
		}

		return this.#convert_object(
			data as Exclude<Data, unknown[]>,
			schema,
		) as Return;
	}

	generate_type<
		Id extends string|undefined,
		$defs extends {[key: $def]: SchemaObject}
	>(
		schema: schema_with_defs<Id, $defs>,
	): TypeNode {
		const $ref_instance = this.#schema_parser.share_ajv((ajv: Ajv) => {
			return new $ref(
				schema.$defs,
				{ajv},
			);
		});

		if (SchemaWithDefsParser.#is_object_schema<Id, $defs>(schema)) {
			return this.generate_type_for_object<Id, $defs>(
				schema,
				$ref_instance,
			);
		}

		return this.#generate_type_for_array<Id, $defs>(
			schema,
			$ref_instance,
		);
	}

	#convert_array<
		Data extends unknown[],
		Schema extends (
			& schema_with_defs<
				string|undefined,
				{[key: $def]: SchemaObject}
			>
			& supported_array_schema
		),
	>(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_data: Data,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_schema: Schema,
	): Expression[] {
		throw new Error('Not yet implemented!');
	}

	#convert_object<
		Data extends {[key: string]: unknown},
		Schema extends (
			& schema_with_defs<
				string|undefined,
				{[key: $def]: SchemaObject}
			>
			& supported_object_schema
		)
	>(
		data: Data,
		schema: Schema,
	) {
		if (SchemaWithDefsParser.#is_object_schema_simple(schema)) {
			return this.#convert_object_simple(data, schema);
		}

		return this.#convert_object_pattern(data, schema);
	}

	#convert_object_pattern<
		Data extends {[key: string]: unknown},
		Schema extends schema_with_defs<
			string|undefined,
			{[key: $def]: SchemaObject}
		> & pattern_object_schema
	>(
		data: Data,
		schema: Schema,
	) {
		const regexes: [string, RegExp][] = Object.keys(
			schema.patternProperties,
		).map((pattern) => [pattern, new RegExp(pattern)]);

		if (!(Object.keys(data).every(
			(property) => regexes.find(([, maybe]) => maybe.test(property)),
		))) {
			throw new TypeError(
				// eslint-disable-next-line max-len
				'Data has properties that do not pass RegExp.test() check on schema.patternProperties',
			);
		}

		return Object.fromEntries(Object.entries(data).map(([
			property,
			value,
		]) => {
			const [pattern] = regexes.find(
				([, maybe]) => maybe.test(property),
			) as [string, RegExp];

			const sub_schema = schema.patternProperties[pattern];

			return [
				property,
				this.#schema_parser.parse(sub_schema, true).convert(
					value,
					sub_schema,
					this.#schema_parser,
				),
			];
		}));
	}

	#convert_object_simple<
		Data extends {[key: string]: unknown},
		Schema extends schema_with_defs<
			string|undefined,
			{[key: $def]: SchemaObject}
		> & simple_object_schema
	>(
		data: Data,
		schema: Schema,
	) {
		return Object.fromEntries(Object.entries(schema.properties).map((
			[
				property,
				value,
			],
		) => [
			property,
			this.#schema_parser.parse(value, true).convert(
				data[property],
				value,
				this.#schema_parser,
			),
		]));
	}

	#generate_type_for_array<
		Id extends string|undefined,
		T$defs extends {[key: $def]: SchemaObject}
	>(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		schema: schema_with_defs<Id, T$defs> & supported_array_schema,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		$ref_instance: $ref,
	): TypeNode {
		throw new Error('Not yet implemented!');
	}

	generate_type_for_object<
		Id extends string|undefined,
		T$defs extends {[key: $def]: SchemaObject}
	>(
		schema: schema_with_defs<Id, T$defs> & supported_object_schema,
		$ref_instance: $ref,
	): TypeNode {
		if (SchemaWithDefsParser.#is_object_schema_simple(schema)) {
			return this.#generate_type_for_object_simple<Id, T$defs>(
				schema,
				$ref_instance,
			);
		}

		return this.#generate_type_for_object_pattern<Id, T$defs>(
			schema as Exclude<typeof schema, simple_object_schema>,
			$ref_instance,
		);
	}

	#generate_type_for_object_simple<
		Id extends string|undefined,
		T$defs extends {[key: $def]: SchemaObject}
	>(
		schema: schema_with_defs<Id, T$defs> & simple_object_schema,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		$ref_instance: $ref,
	): TypeLiteralNode {
		return factory.createTypeLiteralNode(
			Object.entries(
				schema.properties,
			).map(([
				property,
				value,
			]): PropertySignature => factory.createPropertySignature(
				undefined,
				(
					/[?[\] ]/.test(property)
						? factory.createComputedPropertyName(
							factory.createStringLiteral(property),
						)
						: property
				),
				(
					(schema.required || []).includes(property)
						? undefined
						: factory.createToken(SyntaxKind.QuestionToken)
				),
				this.#schema_parser.parse({
					...value,
					$defs: schema.$defs,
				}).generate_type(
					{
						...value,
						$defs: schema.$defs,
					},
					this.#schema_parser,
				),
			)),
		);
	}

	#generate_type_for_object_pattern<
		Id extends string|undefined,
		T$defs extends {[key: $def]: SchemaObject}
	>(
		schema: schema_with_defs<Id, T$defs> & pattern_object_schema,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		$ref_instance: $ref,
	): TypeNode {
		return factory.createUnionTypeNode(Object.values(
			schema.patternProperties,
		).map((sub_schema) => {
			return this.#schema_parser.parse(
				sub_schema,
			).generate_type(
				sub_schema,
				this.#schema_parser,
			);
		}));
	}

	static #is_array_schema<
		Id extends string|undefined,
		T$defs extends {[key: $def]: SchemaObject}
	>(
		value: schema_with_defs<Id, T$defs>,
	): value is schema_with_defs<Id, T$defs> & supported_array_schema {
		return 'array' === value.type;
	}

	static #is_object_schema<
		Id extends string|undefined,
		T$defs extends {[key: $def]: SchemaObject}
	>(
		value: schema_with_defs<Id, T$defs>,
	): value is schema_with_defs<Id, T$defs> & supported_object_schema {
		return 'object' === value.type;
	}

	static #is_object_schema_simple<
		Id extends string|undefined,
		T$defs extends {[key: $def]: SchemaObject}
	> (
		value: (
			| (schema_with_defs<Id, T$defs> & simple_object_schema)
			| (schema_with_defs<Id, T$defs> & pattern_object_schema)
		),
	): value is schema_with_defs<Id, T$defs> & simple_object_schema {
		return 'properties' in value;
	}
}
