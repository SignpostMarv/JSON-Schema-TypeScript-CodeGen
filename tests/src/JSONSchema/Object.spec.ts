import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';

import {
	Ajv2020 as Ajv,
} from 'ajv/dist/2020.js';

import type {
	Node,
	ObjectLiteralElementLike,
	PropertyAssignment,
} from 'typescript';
import {
	SyntaxKind,
} from 'typescript';

import {
	is_instanceof,
	not_undefined,
// eslint-disable-next-line imports/no-unresolved
} from '@satisfactory-dev/custom-assert';

// eslint-disable-next-line imports/no-unresolved
import ts_assert from '@signpostmarv/ts-assert';

import type {
	ts_asserter,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../index.ts';

import type {
	Identifier,
	IntersectionTypeNode,
	ObjectLiteralExpression,
	StringLiteral,
	TypeReferenceNode,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../src/typescript/index.ts';

import type {
	object_properties_mode,
	object_schema,
	object_type,
	object_TypeLiteralNode,
	ObjectOfSchemas,
	OmitIf,
	SchemaObject,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';
import {
	$defs_schema,
	$ref,
	ObjectUnspecified,
	PositiveIntegerOrZeroGuard,
	SchemaParser,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../../../index.ts';

void describe('ObjectUnspecified', () => {
	void describe('::generate_schema_definition()', () => {
		type DataSet<
			PropertiesMode extends (
				object_properties_mode
			) = (
				object_properties_mode
			),
		> = [
			PropertiesMode,
		];

		const full_schema_properties: Readonly<object_schema<
			'both'
		>['properties']> = Object.freeze({
			...$defs_schema.properties,
			type: {type: 'string', const: 'object'},
			$ref: {
				type: 'string',
				pattern: '^(.+)?#\\/\\$defs\\/(.+)$',
			},
			additionalProperties: {
				type: 'boolean',
			},
			unevaluatedProperties: {
				type: 'boolean',
			},
			required: {
				type: 'array',
				minItems: 1,
				items: {
					type: 'string',
					minLength: 1,
				},
			},
			properties: {
				type: 'object',
				minProperties: 1,
				additionalProperties: {
					type: 'object',
				},
			},
			patternProperties: {
				type: 'object',
				minProperties: 1,
				additionalProperties: {
					type: 'object',
				},
			},
		});

		const expected_require_sets: Record<
			object_properties_mode,
			object_schema<
				object_properties_mode
			>['required']
		> = {
			neither: ['type'],
			both: ['type', 'properties', 'patternProperties'],
			properties: ['type', 'properties'],
			pattern: ['type', 'patternProperties'],
		};

		const property_sets: Readonly<Record<
			object_properties_mode,
			object_schema<
				object_properties_mode
			>['properties']
		>> = {
			neither: {
				...$defs_schema.properties,
				type: full_schema_properties.type,
				$defs: full_schema_properties.$defs,
				$ref: {
					type: 'string',
					pattern: '^(.+)?#\\/\\$defs\\/(.+)$',
				},
				unevaluatedProperties: {
					type: 'boolean',
				},
				required: full_schema_properties.required,
				additionalProperties: {
					type: 'boolean',
					const: false,
				},
				maxProperties: {
					type: 'integer',
					const: 0,
				},
			},
			both: {
				...$defs_schema.properties,
				type: full_schema_properties.type,
				$defs: full_schema_properties.$defs,
				$ref: {
					type: 'string',
					pattern: '^(.+)?#\\/\\$defs\\/(.+)$',
				},
				additionalProperties: {
					type: 'boolean',
				},
				unevaluatedProperties: {
					type: 'boolean',
				},
				required: full_schema_properties.required,
				properties: full_schema_properties.properties,
				patternProperties: (
					full_schema_properties.patternProperties
				),
			},
			properties: {
				...$defs_schema.properties,
				type: full_schema_properties.type,
				$defs: full_schema_properties.$defs,
				$ref: {
					type: 'string',
					pattern: '^(.+)?#\\/\\$defs\\/(.+)$',
				},
				additionalProperties: {
					type: 'boolean',
				},
				unevaluatedProperties: {
					type: 'boolean',
				},
				required: full_schema_properties.required,
				properties: full_schema_properties.properties,
			},
			pattern: {
				...$defs_schema.properties,
				type: full_schema_properties.type,
				$defs: full_schema_properties.$defs,
				$ref: {
					type: 'string',
					pattern: '^(.+)?#\\/\\$defs\\/(.+)$',
				},
				additionalProperties: {
					type: 'boolean',
				},
				unevaluatedProperties: {
					type: 'boolean',
				},
				required: full_schema_properties.required,
				patternProperties: (
					full_schema_properties.patternProperties
				),
			},
		};

		const data_sets: DataSet[] = [];

		const properties_modes: [
			object_properties_mode,
			object_properties_mode,
			object_properties_mode,
			object_properties_mode,
		] = [
			'neither',
			'both',
			'properties',
			'pattern',
		];

		for (const properties_mode of properties_modes) {
			data_sets.push([
				properties_mode,
			]);
		}

		data_sets.forEach(([
			properties_mode,
		], i) => {
			void it(
				`behaves with data_sets[${
					i
				}] (object_schema<${
					properties_mode
				}>)`,
				() => {
					const schema = ObjectUnspecified
						.generate_schema_definition({
							properties_mode,
						});

					const required = expected_require_sets[
						properties_mode
					];

					const properties = property_sets[properties_mode];

					const expected_schema = {
						type: 'object',
						required,
						additionalProperties: false,
						properties,
					};

					assert.deepEqual(schema, expected_schema);
				},
			);
		});
	});

	void describe('::#generate_default_type_definition()', () => {
		type DataSet = [
			ObjectOfSchemas,
			[string, ...string[]],

			// expectation of both
			[
				ObjectOfSchemas,
				[string, ...string[]],
				ObjectOfSchemas,
				ObjectOfSchemas,
			],

			// expectation of $defs only
			[
				ObjectOfSchemas,
				undefined,
				ObjectOfSchemas,
				ObjectOfSchemas,
			],

			// expectation of required only
			[
				undefined,
				[string, ...string[]],
				ObjectOfSchemas,
				ObjectOfSchemas,
			],

			// expectation of neither
			[
				undefined,
				undefined,
				ObjectOfSchemas,
				ObjectOfSchemas,
			],
		];

		const foo = class extends ObjectUnspecified<
			{[key: string]: unknown},
			object_properties_mode,
			SchemaObject,
			readonly [string, ...string[]],
			ObjectOfSchemas,
			ObjectOfSchemas
		> {
			get schema_def() {
				return this.schema_definition;
			}

			get type_def() {
				return this.type_definition;
			}

			static generate_schema_definition<
				PropertiesMode extends object_properties_mode,
			>({
				properties_mode,
			}: {
				properties_mode: PropertiesMode,
			}): Readonly<object_schema<
				PropertiesMode
			>> {
				return ObjectUnspecified.generate_schema_definition({
					properties_mode,
				});
			}
		};

		const data_sets: [DataSet, ...DataSet[]] = [
			[
				{
					foo: {
						type: 'string',
					},
				},
				['foo', 'bar', 'baz'],
				[
					{
						foo: {
							type: 'string',
						},
					},
					['foo', 'bar', 'baz'],
					{
						foo: {
							$ref: '#/$defs/foo',
						},
						bar: {
							$ref: '#/$defs/foo',
						},
						baz: {
							$ref: '#/$defs/foo',
						},
					},
					{
						'^foo.+$': {
							$ref: '#/$defs/foo',
						},
					},
				],
				[
					{
						foo: {
							type: 'string',
						},
					},
					undefined,
					{
						foo: {
							$ref: '#/$defs/foo',
						},
						bar: {
							$ref: '#/$defs/foo',
						},
						baz: {
							$ref: '#/$defs/foo',
						},
					},
					{
						'^foo.+$': {
							$ref: '#/$defs/foo',
						},
					},
				],
				[
					undefined,
					['foo', 'bar', 'baz'],
					{
						foo: {
							type: 'string',
						},
						bar: {
							type: 'string',
						},
						baz: {
							type: 'string',
						},
					},
					{
						'^foo.+$': {
							type: 'string',
						},
					},
				],
				[
					undefined,
					undefined,
					{
						foo: {
							type: 'string',
						},
						bar: {
							type: 'string',
						},
						baz: {
							type: 'string',
						},
					},
					{
						'^foo.+$': {
							type: 'string',
						},
					},
				],
			],
		];

		data_sets.forEach(([
			$defs,
			required,
			...expectations
		], i) => {
			for (const properties_mode of [
				'both',
				'neither',
				'pattern',
				'properties',
			] as const) {
				const messages = [
					`behaves with data_sets[${
						i
					}], property mode "${
						properties_mode
					}" and both $defs & required`,
					`behaves with data_sets[${
						i
					}], property mode "${
						properties_mode
					}" and only $defs`,
					`behaves with data_sets[${
						i
					}], property mode "${
						properties_mode
					}" and only required`,
					`behaves with data_sets[${
						i
					}], property mode "${
						properties_mode
					}" and neither $defs nor required`,
				];
				expectations.forEach(([
					expected_$defs,
					expected_required,
					properties,
					patternProperties,
				], j) => {
					if (
						'neither' === properties_mode
						|| 'pattern' === properties_mode
					) {
						expected_required = undefined;
					}

					void it(messages[j], () => {
						const specific_options = {
							properties_mode,
							...(
								undefined === expected_$defs
									? {}
									: {$defs}
							),
							...(
								(
									undefined === expected_required
								)
									? {}
									: {required}
							),
							...(
								undefined !== properties
									? {properties}
									: {}
							),
							...(
								undefined !== patternProperties
									? {patternProperties}
									: {}
							),
						};
						const instance = new foo(
							specific_options,
							{
								ajv: new Ajv({strict: true}),
							},
						);

						assert.deepEqual(
							instance.type_def.$defs,
							expected_$defs,
						);
						assert.deepEqual(
							instance.type_def.required,
							expected_required,
						);
					});
				});
			}
		});
	});

	type DataSet<
		T extends {[key: string]: unknown} = {[key: string]: unknown},
		DefsMode extends 'optional' = 'optional',
		PropertiesMode extends object_properties_mode = object_properties_mode,
		Defs extends SchemaObject = SchemaObject,
		Required extends (
			readonly [string, ...string[]]
		) = (
			readonly [string, ...string[]]
		),
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
		DataAssertProperties extends (
			undefined| (readonly ObjectLiteralElementLike[])
		) = (
			undefined | (readonly ObjectLiteralElementLike[])
		),
	> = [
		(
			& {
				properties_mode: PropertiesMode,
			}
			& OmitIf<
				{
					$defs: Defs,
				},
				'$defs',
				DefsMode
			>
		),
		T,
		object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
		ts_asserter<ObjectLiteralExpression<DataAssertProperties>>,
		ts_asserter<(
			| object_TypeLiteralNode<PropertiesMode>
			| IntersectionTypeNode<[
				TypeReferenceNode,
				object_TypeLiteralNode<PropertiesMode>,
			]>
		)>,
	];

	function type_schema_for_data_set<
		PropertiesMode extends object_properties_mode = object_properties_mode,
		Defs extends SchemaObject = SchemaObject,
		Required extends (
			readonly [string, ...string[]]
		) = (
			readonly [string, ...string[]]
		),
		Properties extends ObjectOfSchemas = ObjectOfSchemas,
		PatternProperties extends ObjectOfSchemas = ObjectOfSchemas,
	>(
		type_schema: object_type<
			PropertiesMode,
			Defs,
			Required,
			Properties,
			PatternProperties
		>,
	) {
		return type_schema;
	}

	function object_literal_expression_asserter(
		from: {[key: string]: string|{[key: string]: string}},
	): (
		value: Node,
		message?: string|Error,
	) => asserts value is ObjectLiteralExpression<[
		PropertyAssignment,
		...PropertyAssignment[],
	]> {
		function do_assertions(
			value: Node,
			entries: [string, string| {[key: string]: string}][],
			message?: string|Error,
		): asserts value is ObjectLiteralExpression<[
			PropertyAssignment,
			...PropertyAssignment[],
		]> {
			ts_assert.isObjectLiteralExpression(value, message);
			not_undefined(value.properties, message);
			assert.equal(value.properties.length, entries.length, message);
			value.properties.forEach((property, i) => {
				ts_assert.isPropertyAssignment(property, message);
				ts_assert.isIdentifier(property.name, message);
				assert.equal(property.name.text, entries[i][0], message);
				if ('string' === typeof entries[i][1]) {
				ts_assert.isStringLiteral(property.initializer, message);
				assert.equal(
					property.initializer.text,
					entries[i][1],
					message,
				);
				} else {
					do_assertions(
						property.initializer,
						Object.entries(entries[i][1]),
						message,
					);
				}
			});
		}

		return (
			value: Node,
			message?: string|Error,
		): asserts value is ObjectLiteralExpression<[
			PropertyAssignment,
			...PropertyAssignment[],
		]> => {
			do_assertions(value, Object.entries(from), message);
		};
	}

	const data_sets: [DataSet, ...DataSet[]] = [
		[
			{
				properties_mode: 'properties',
			},
			{foo: 'bar'},
			type_schema_for_data_set<
				'properties'
			>({
				type: 'object',
				required: ['foo'],
				properties: {
					foo: {
						type: 'string',
						minLength: 1,
					},
				},
			}),
			object_literal_expression_asserter({foo: 'bar'}),
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(1, value.members.length, message);
				value.members.forEach((member) => {
					ts_assert.isPropertySignature(member, message);
					ts_assert.isIdentifier(member.name, message);
					assert.equal(member.questionToken, undefined);
					assert.equal(member.name.text, 'foo', message);
					not_undefined(member.type, message);
					ts_assert.isTypeReferenceNode(member.type, message);
					ts_assert.isIdentifier(member.type.typeName, message);
					assert.equal(
						member.type.typeName.text,
						'Exclude',
						message,
					);
					not_undefined(member.type.typeArguments, message);
					assert.equal(member.type.typeArguments.length, 2);
					ts_assert.isTokenWithExpectedKind(
						member.type.typeArguments[0],
						SyntaxKind.StringKeyword,
						message,
					);
					ts_assert.isLiteralTypeNode(
						member.type.typeArguments[1],
						message,
					);
					ts_assert.isStringLiteral(
						member.type.typeArguments[1].literal,
						message,
					);
					assert.equal(
						member.type.typeArguments[1].literal.text,
						'',
					);
				});
			},
		],
		[
			{
				properties_mode: 'properties',
			},
			{foo: 'bar'},
			type_schema_for_data_set<
				'properties'
			>({
				type: 'object',
				$ref: $ref.ensure_is_$ref_value('#/$defs/some_other_type'),
				required: ['foo'],
				properties: {
					foo: {
						type: 'string',
						minLength: 1,
					},
				},
			}),
			object_literal_expression_asserter({foo: 'bar'}),
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is IntersectionTypeNode<[
				TypeReferenceNode,
				object_TypeLiteralNode<PropertyMode>,
			]> => {
				ts_assert.isIntersectionTypeNode(value, message);
				assert.equal(value.types.length, 2);

				ts_assert.isTypeReferenceNode(value.types[0], message);
				ts_assert.isIdentifier(value.types[0].typeName, message);
				assert.equal(value.types[0].typeName.text, 'some_other_type');

				ts_assert.isTypeLiteralNode(value.types[1], message);
				assert.equal(1, value.types[1].members.length, message);
				value.types[1].members.forEach((member) => {
					ts_assert.isPropertySignature(member, message);
					ts_assert.isIdentifier(member.name, message);
					assert.equal(member.questionToken, undefined);
					assert.equal(member.name.text, 'foo', message);
					not_undefined(member.type, message);
					ts_assert.isTypeReferenceNode(member.type, message);
					ts_assert.isIdentifier(member.type.typeName, message);
					assert.equal(
						member.type.typeName.text,
						'Exclude',
						message,
					);
					not_undefined(member.type.typeArguments, message);
					assert.equal(member.type.typeArguments.length, 2);
					ts_assert.isTokenWithExpectedKind(
						member.type.typeArguments[0],
						SyntaxKind.StringKeyword,
						message,
					);
					ts_assert.isLiteralTypeNode(
						member.type.typeArguments[1],
						message,
					);
					ts_assert.isStringLiteral(
						member.type.typeArguments[1].literal,
						message,
					);
					assert.equal(
						member.type.typeArguments[1].literal.text,
						'',
					);
				});
			},
		],
		[
			{
				properties_mode: 'properties',
			},
			{'f o o': 'bar'},
			type_schema_for_data_set<
				'properties'
			>({
				type: 'object',
				required: ['f o o'],
				properties: {
					'f o o': {
						type: 'string',
						minLength: 1,
					},
				},
			}),
			(
				value: Node,
				message?: string|Error,
			): asserts value is ObjectLiteralExpression<[
				PropertyAssignment,
			]> => {
				ts_assert.isObjectLiteralExpression(value, message);
				not_undefined(value.properties);
				assert.equal(value.properties.length, 1);
				value.properties.forEach((property) => {
					ts_assert.isPropertyAssignment(property, message);
					ts_assert.isIdentifier(property.name, message);
					assert.equal(
						property.name.text,
						'f o o',
						message,
					);
					ts_assert.isStringLiteral(property.initializer, message);
					assert.equal(property.initializer.text, 'bar');
				});
			},
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(1, value.members.length, message);
				value.members.forEach((member) => {
					ts_assert.isPropertySignature(member, message);
					ts_assert.isComputedPropertyName(member.name, message);
					ts_assert.isStringLiteral(member.name.expression);
					assert.equal(
						member.name.expression.text,
						'f o o',
						message,
					);
					assert.equal(member.questionToken, undefined);
					not_undefined(member.type, message);
					ts_assert.isTypeReferenceNode(member.type, message);
					ts_assert.isIdentifier(member.type.typeName, message);
					assert.equal(
						member.type.typeName.text,
						'Exclude',
						message,
					);
					not_undefined(member.type.typeArguments, message);
					assert.equal(member.type.typeArguments.length, 2);
					ts_assert.isTokenWithExpectedKind(
						member.type.typeArguments[0],
						SyntaxKind.StringKeyword,
						message,
					);
					ts_assert.isLiteralTypeNode(
						member.type.typeArguments[1],
						message,
					);
					ts_assert.isStringLiteral(
						member.type.typeArguments[1].literal,
						message,
					);
					assert.equal(
						member.type.typeArguments[1].literal.text,
						'',
					);
				});
			},
		],
		[
			{
				properties_mode: 'properties',
			},
			{foo: 'bar'},
			type_schema_for_data_set<
				'properties'
			>({
				type: 'object',
				properties: {
					foo: {
						type: 'string',
						minLength: 1,
					},
				},
			}),
			object_literal_expression_asserter({foo: 'bar'}),
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(1, value.members.length, message);
				value.members.forEach((member) => {
					ts_assert.isPropertySignature(member, message);
					ts_assert.isIdentifier(member.name, message);
					not_undefined(member.questionToken);
					assert.equal(member.name.text, 'foo', message);
					not_undefined(member.type, message);
					ts_assert.isTypeReferenceNode(member.type, message);
					ts_assert.isIdentifier(member.type.typeName, message);
					assert.equal(
						member.type.typeName.text,
						'Exclude',
						message,
					);
					not_undefined(member.type.typeArguments, message);
					assert.equal(member.type.typeArguments.length, 2);
					ts_assert.isTokenWithExpectedKind(
						member.type.typeArguments[0],
						SyntaxKind.StringKeyword,
						message,
					);
					ts_assert.isLiteralTypeNode(
						member.type.typeArguments[1],
						message,
					);
					ts_assert.isStringLiteral(
						member.type.typeArguments[1].literal,
						message,
					);
					assert.equal(
						member.type.typeArguments[1].literal.text,
						'',
					);
				});
			},
		],
		[
			{
				properties_mode: 'properties',
			},
			{foo: 'bar'},
			type_schema_for_data_set<
				'properties'
			>({
				type: 'object',
				required: ['foo'],
				$defs: {
					foo: {
						type: 'string',
						minLength: 1,
					},
				},
				properties: {
					foo: {
						$ref: '#/$defs/foo',
					},
				},
			}),
			object_literal_expression_asserter({foo: 'bar'}),
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(1, value.members.length, message);
				value.members.forEach((member) => {
					ts_assert.isPropertySignature(member, message);
					ts_assert.isIdentifier(member.name, message);
					assert.equal(member.name.text, 'foo', message);
					not_undefined(member.type, message);
					ts_assert.isTypeReferenceNode(member.type, message);
					ts_assert.isIdentifier(member.type.typeName, message);
					assert.equal(
						member.type.typeName.text,
						'foo',
						message,
					);
				});
			},
		],
		[
			{
				properties_mode: 'properties',
			},
			{foo: 'bar'},
			type_schema_for_data_set<
				'properties'
			>({
				type: 'object',
				required: ['foo'],
				$defs: {
					['1']: {
						type: 'string',
						minLength: 1,
					},
				},
				properties: {
					foo: {
						$ref: '#/$defs/1',
					},
				},
			}),
			object_literal_expression_asserter({foo: 'bar'}),
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(1, value.members.length, message);
				value.members.forEach((member) => {
					ts_assert.isPropertySignature(member, message);
					ts_assert.isIdentifier(member.name, message);
					assert.equal(member.name.text, 'foo', message);
					not_undefined(member.type, message);
					ts_assert.isTypeReferenceNode(member.type, message);
					ts_assert.isIdentifier(member.type.typeName, message);
					assert.equal(
						member.type.typeName.text,
						'_1',
						message,
					);
				});
			},
		],
		[
			{
				properties_mode: 'properties',
			},
			{foo: 'bar'},
			type_schema_for_data_set<
				'properties'
			>({
				type: 'object',
				required: ['foo'],
				$defs: {
					['1.1']: {
						type: 'string',
						minLength: 1,
					},
				},
				properties: {
					foo: {
						$ref: '#/$defs/1.1',
					},
				},
			}),
			object_literal_expression_asserter({foo: 'bar'}),
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(1, value.members.length, message);
				value.members.forEach((member) => {
					ts_assert.isPropertySignature(member, message);
					ts_assert.isIdentifier(member.name, message);
					assert.equal(member.name.text, 'foo', message);
					not_undefined(member.type, message);
					ts_assert.isTypeReferenceNode(member.type, message);
					ts_assert.isIdentifier(member.type.typeName, message);
					assert.equal(
						member.type.typeName.text,
						'v1_1',
						message,
					);
				});
			},
		],
		[
			{
				properties_mode: 'properties',
			},
			{foo: 'bar'},
			type_schema_for_data_set<
				'properties'
			>({
				type: 'object',
				required: ['foo'],
				$defs: {
					class: {
						type: 'string',
						minLength: 1,
					},
				},
				properties: {
					foo: {
						$ref: '#/$defs/class',
					},
				},
			}),
			object_literal_expression_asserter({foo: 'bar'}),
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(1, value.members.length, message);
				value.members.forEach((member) => {
					ts_assert.isPropertySignature(member, message);
					ts_assert.isIdentifier(member.name, message);
					assert.equal(member.name.text, 'foo', message);
					not_undefined(member.type, message);
					ts_assert.isTypeReferenceNode(member.type, message);
					ts_assert.isIdentifier(member.type.typeName, message);
					assert.equal(
						member.type.typeName.text,
						'__class',
						message,
					);
				});
			},
		],
		[
			{
				properties_mode: 'pattern',
			},
			{foo: 'bar'},
			type_schema_for_data_set<
				'pattern'
			>({
				type: 'object',
				required: ['foo'],
				$defs: {
					foo: {
						type: 'string',
						minLength: 1,
					},
				},
				patternProperties: {
					'^.+$': {
						$ref: '#/$defs/foo',
					},
				},
			}),
			object_literal_expression_asserter({foo: 'bar'}),
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(1, value.members.length, message);
				value.members.forEach((member) => {
					ts_assert.isIndexSignatureDeclaration(member, message);
					not_undefined(member.type, message);
					ts_assert.isTypeReferenceNode(member.type, message);
					ts_assert.isIdentifier(member.type.typeName, message);
					assert.equal(
						member.type.typeName.text,
						'foo',
						message,
					);
				});
			},
		],
		[
			{
				properties_mode: 'pattern',
			},
			{
				foo: 'bar',
				foo1: 'some',
				foo2: 'valid',
				foo3: 'string',
				bar: 'bar',
				bar1: 'bar',
				bar2: 'bar',
				bar3: 'bar',
			},
			type_schema_for_data_set<
				'pattern'
			>({
				type: 'object',
				required: ['foo'],
				$defs: {
					foo: {
						type: 'string',
						minLength: 1,
					},
					bar: {
						type: 'string',
						const: 'bar',
					},
				},
				patternProperties: {
					'^foo.*$': {
						$ref: '#/$defs/foo',
					},
					'^bar.*$': {
						$ref: '#/$defs/bar',
					},
				},
			}),
			(
				value: Node,
				message?: string|Error,
			): asserts value is ObjectLiteralExpression<[
				PropertyAssignment,
			]> => {
				ts_assert.isObjectLiteralExpression(value, message);
				not_undefined(value.properties);
				assert.equal(value.properties.length, 8);
				value.properties.forEach((property, i) => {
					ts_assert.isPropertyAssignment(property, message);
					ts_assert.isIdentifier(property.name, message);
					assert.equal(
						property.name.text,
						[
							'foo',
							'foo1',
							'foo2',
							'foo3',
							'bar',
							'bar1',
							'bar2',
							'bar3',
						][i],
						message,
					);
					ts_assert.isStringLiteral(property.initializer, message);
					assert.equal(
						property.initializer.text,
						[
							'bar',
							'some',
							'valid',
							'string',
							'bar',
							'bar',
							'bar',
							'bar',
						][i],
						message,
					);
				});
			},
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(1, value.members.length, message);
				value.members.forEach((member) => {
					ts_assert.isIndexSignatureDeclaration(member, message);
					not_undefined(member.type, message);
					ts_assert.isUnionTypeNode(member.type, message);
					assert.equal(2, member.type.types.length);
					for (let i = 0; i < member.type.types.length; ++i) {
						const sub_type: Node = member.type.types[i];
						ts_assert.isTypeReferenceNode(sub_type, message);
						ts_assert.isIdentifier(sub_type.typeName, message);
						assert.equal(
							sub_type.typeName.text,
							0 === i ? 'foo' : 'bar',
							message,
						);
					}
				});
			},
		],
		[
			{
				properties_mode: 'both',
			},
			{
				foo: 'bar',
				foo1: 'some',
				foo2: 'valid',
				foo3: 'string',
				bar: 'bar',
				bar1: 'bar',
				bar2: 'bar',
				bar3: 'bar',
			},
			type_schema_for_data_set<
				'both'
			>({
				type: 'object',
				required: ['foo'],
				$defs: {
					foo: {
						type: 'string',
						minLength: 1,
					},
					bar: {
						type: 'string',
						const: 'bar',
					},
				},
				properties: {
					foo: {
						$ref: '#/$defs/foo',
					},
				},
				patternProperties: {
					'^foo.*$': {
						$ref: '#/$defs/foo',
					},
					'^bar.*$': {
						$ref: '#/$defs/bar',
					},
				},
			}),
			(
				value: Node,
				message?: string|Error,
			): asserts value is ObjectLiteralExpression<[
				PropertyAssignment,
			]> => {
				ts_assert.isObjectLiteralExpression(value, message);
				not_undefined(value.properties);
				assert.equal(value.properties.length, 8);
				value.properties.forEach((property, i) => {
					ts_assert.isPropertyAssignment(property, message);
					ts_assert.isIdentifier(property.name, message);
					assert.equal(
						property.name.text,
						[
							'foo',
							'foo1',
							'foo2',
							'foo3',
							'bar',
							'bar1',
							'bar2',
							'bar3',
						][i],
						message,
					);
					ts_assert.isStringLiteral(property.initializer, message);
					assert.equal(
						property.initializer.text,
						[
							'bar',
							'some',
							'valid',
							'string',
							'bar',
							'bar',
							'bar',
							'bar',
						][i],
						message,
					);
				});
			},
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isIntersectionTypeNode(value, message);
				assert.equal(value.types.length, 2, message);


				ts_assert.isTypeLiteralNode(value.types[0], message);
				assert.equal(1, value.types[0].members.length, message);
				value.types[0].members.forEach((member) => {
					ts_assert.isPropertySignature(member, message);
					ts_assert.isIdentifier(member.name, message);
					assert.equal(member.questionToken, undefined);
					assert.equal(member.name.text, 'foo', message);
					not_undefined(member.type, message);
					ts_assert.isTypeReferenceNode(member.type, message);
					ts_assert.isIdentifier(member.type.typeName, message);
					assert.equal(
						member.type.typeName.text,
						'foo',
						message,
					);
					assert.equal(member.type.typeArguments, undefined);
				});

				ts_assert.isTypeLiteralNode(value.types[1], message);
				assert.equal(1, value.types[1].members.length, message);
				value.types[1].members.forEach((member) => {
					ts_assert.isIndexSignatureDeclaration(member, message);
					not_undefined(member.type, message);
					ts_assert.isUnionTypeNode(member.type, message);
					assert.equal(2, member.type.types.length);
					for (let i = 0; i < member.type.types.length; ++i) {
						const sub_type: Node = member.type.types[i];
						ts_assert.isTypeReferenceNode(sub_type, message);
						ts_assert.isIdentifier(sub_type.typeName, message);
						assert.equal(
							sub_type.typeName.text,
							0 === i ? 'foo' : 'bar',
							message,
						);
					}
				});
			},
		],
		[
			{
				properties_mode: 'neither',
			},
			{foo: 'bar'},
			type_schema_for_data_set<
				'neither'
			>({
				type: 'object',
				required: ['foo'],
			}),
			object_literal_expression_asserter({foo: 'bar'}),
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(1, value.members.length, message);
				value.members.forEach((member) => {
					ts_assert.isIndexSignatureDeclaration(member, message);
					not_undefined(member.type, message);
					ts_assert.isTokenWithExpectedKind(
						member.type,
						SyntaxKind.UnknownKeyword,
						message,
					);
				});
			},
		],
		[
			{
				properties_mode: 'properties',
			},
			{
				foo: 'bar',
				bar: 'baz',
				baz: {
					foo: 'foobar',
					bar: 'barbaz',
				},
			},
			type_schema_for_data_set<
				'properties'
			>({
				$defs: {
					foo: {
						type: 'object',
						required: ['foo'],
						properties: {
							foo: {
								type: 'string',
							},
						},
					},
					bar: {
						type: 'object',
						required: ['bar'],
						properties: {
							bar: {
								type: 'string',
							},
						},
					},
					baz: {
						allOf: [
							{$ref: '#/$defs/foo'},
							{$ref: '#/$defs/bar'},
						],
					},
				},
				type: 'object',
				required: [
					'foo',
					'bar',
					'baz',
				],
				properties: {
					foo: {
						type: 'string',
					},
					bar: {
						type: 'string',
					},
					baz: {
						$ref: '#/$defs/baz',
					},
				},
			}),
			object_literal_expression_asserter({
				foo: 'bar',
				bar: 'baz',
				baz: {
					foo: 'foobar',
					bar: 'barbaz',
				},
			}),
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(3, value.members.length, message);
				value.members.forEach((member, i) => {
					ts_assert.isPropertySignature(member, message);
					ts_assert.isIdentifier(member.name, message);
					assert.equal(member.questionToken, undefined);
					assert.equal(member.name.text, [
						'foo',
						'bar',
						'baz',
					][i], message);
					not_undefined(member.type, message);
					if (i < 2) {
						ts_assert.isTokenWithExpectedKind(
							member.type,
							SyntaxKind.StringKeyword,
							message,
						);
					} else {
						ts_assert.isTypeReferenceNode(
							member.type,
							message,
						);
						ts_assert.isIdentifier(
							member.type.typeName,
							message,
						);
						assert.equal(
							member.type.typeName.text,
							'baz',
						);
					}
				});
			},
		],
		[
			{
				properties_mode: 'properties',
			},
			{
				foo: 'bar',
				bar: 'baz',
				baz: {
					foo: 'foobar',
					bar: 'barbaz',
				},
			},
			type_schema_for_data_set<
				'properties'
			>({
				$defs: {
					foo: {
						type: 'object',
						required: ['foo'],
						properties: {
							foo: {
								type: 'string',
							},
						},
					},
					bar: {
						type: 'object',
						required: ['bar'],
						properties: {
							bar: {
								type: 'string',
							},
						},
					},
					baz: {
						allOf: [
							{$ref: '#/$defs/foo'},
							{$ref: '#/$defs/bar'},
						],
					},
					has_baz: {
						type: 'object',
						required: [
							'baz',
						],
						properties: {
							baz: {
								$ref: '#/$defs/baz',
							},
						},
					},
				},
				type: 'object',
				$ref: '#/$defs/has_baz',
				required: [
					'foo',
					'bar',
				],
				properties: {
					foo: {
						type: 'string',
					},
					bar: {
						type: 'string',
					},
				},
			}),
			object_literal_expression_asserter({
				foo: 'bar',
				bar: 'baz',
				baz: {
					foo: 'foobar',
					bar: 'barbaz',
				},
			}),
			<PropertyMode extends object_properties_mode>(
				value: Node,
				message?: string|Error,
			): asserts value is object_TypeLiteralNode<PropertyMode> => {
				ts_assert.isIntersectionTypeNode(value, message);
				assert.equal(value.types.length, 2, message);
				ts_assert.isTypeReferenceNode(value.types[0], message);
				ts_assert.isIdentifier(value.types[0].typeName, message);
				assert.equal(
					value.types[0].typeName.text,
					'has_baz',
				);

				value = value.types[1];
				ts_assert.isTypeLiteralNode(value, message);
				assert.equal(2, value.members.length, message);
				value.members.forEach((member, i) => {
					ts_assert.isPropertySignature(member, message);
					ts_assert.isIdentifier(member.name, message);
					assert.equal(member.questionToken, undefined);
					assert.equal(member.name.text, [
						'foo',
						'bar',
					][i], message);
					not_undefined(member.type, message);
					ts_assert.isTokenWithExpectedKind(
						member.type,
						SyntaxKind.StringKeyword,
						message,
					);
				});
			},
		],
	];

	void describe('::generate_typescript_data()', () => {
		data_sets.forEach(([
			specific_options,
			input,
			type_schema,
			data_asserter,
		], i) => {
			const ajv = new Ajv({strict: true});
			function do_test(
				instance: ObjectUnspecified<
					typeof input,
					typeof specific_options['properties_mode']
				>,
				schema_parser: SchemaParser,
			) {
				assert.ok(instance.check_type(type_schema));
				const data = instance.generate_typescript_data(
					input,
					schema_parser,
					type_schema,
				);
				const foo: ts_asserter<ObjectLiteralExpression<[
					PropertyAssignment,
				]>> = data_asserter;
				foo(data);

				assert.throws(() => instance.generate_typescript_data(
					Object.fromEntries(
						Object.keys(input).map(
							(property) => [property, null],
						),
					),
					schema_parser,
					type_schema,
				));
			}
			void it(`behaves directly with data_sets[${i}]`, () => {
				const instance = new ObjectUnspecified(
					specific_options,
					{ajv},
				);

				do_test(instance, new SchemaParser());
			});
			void it(`behaves from schema parser with data_sets[${i}]`, () => {
				const schema_parser = new SchemaParser();
				const instance = schema_parser.parse(type_schema);
				is_instanceof<
					ObjectUnspecified<typeof input, object_properties_mode>
				>(instance, ObjectUnspecified);
				assert.equal(
					instance.properties_mode,
					specific_options.properties_mode,
				);

				do_test(instance, schema_parser);
			});
		});

		void it('fails when expected', () => {
			const ajv = new Ajv({strict: true});
			const instance = new ObjectUnspecified(
				{
					properties_mode: 'properties',
				},
				{
					ajv,
				},
			);

			assert.throws(() => instance.generate_typescript_data(
				{
					foo: 'bar',
				},
				new SchemaParser({ajv}),
				{
					type: 'object',
					required: ['bar'],
					properties: {
						bar: {
							type: 'string',
						},
					},
				},
			));
		});

		void describe(' with external schemas', () => {
			const parser = new SchemaParser();

			parser.add_schema({
				$id: 'foo',
				$defs: {
					foobar: {
						type: 'string',
						const: 'foobar',
					},
					thing: {
						type: 'object',
						properties: {
							foo: {
								type: 'string',
								const: 'foo',
							},
							foobar: {
								$ref: '#/$defs/foobar',
							},
						},
					},
				},
			});

			parser.add_schema({
				$id: 'bar',
				$defs: {
					barbar: {
						type: 'string',
						const: 'barbar',
					},
					thing: {
						type: 'object',
						$ref: 'foo#/$defs/thing',
						properties: {
							bar: {
								type: 'string',
								const: 'bar',
							},
							barbar: {
								$ref: '#/$defs/barbar',
							},
						},
					},
				},
			});

			parser.add_schema({
				$id: 'baz',
				$defs: {
					bazbar: {
						type: 'string',
						const: 'bazbar',
					},
					thing: {
						type: 'object',
						$ref: 'bar#/$defs/thing',
						properties: {
							baz: {
								type: 'string',
								const: 'baz',
							},
							bazbar: {
								$ref: '#/$defs/bazbar',
							},
						},
					},
				},
			});

			void it('behaves with nested external $ref', () => {
				const schema = Object.freeze({
					type: 'object',
					$ref: '#/$defs/thing',
					$defs: {
						bazbar: {
							type: 'string',
							const: 'bazbar',
						},
						thing: {
							type: 'object',
							$ref: 'bar#/$defs/thing',
							properties: {
								baz: {
									type: 'string',
									const: 'baz',
								},
								bazbar: {
									$ref: '#/$defs/bazbar',
								},
							},
						},
					},
					properties: {
						baz: {
							type: 'string',
							const: 'baz',
						},
						bazbar: {
							$ref: '#/$defs/bazbar',
						},
					},
				});
				const instance = parser.parse_by_type(schema);

				is_instanceof<
					ObjectUnspecified<
						{[key: string]: unknown},
						'properties'
					>
				>(
					instance,
					ObjectUnspecified,
				);

				const call = () => instance.generate_typescript_data(
					{
						foo: 'foo',
						bar: 'bar',
						baz: 'baz',
						foobar: 'foobar',
						barbar: 'barbar',
						bazbar: 'bazbar',
					},
					parser,
					schema,
				);

				assert.doesNotThrow(call);

				const generated = call();

				assert.equal(generated.properties.length, 6);

				type property_assignment = (
					& PropertyAssignment
					& {
						name: Identifier<string>,
						initializer: StringLiteral,
					}
				);

				assert.ok(generated.properties.every(
					(maybe): maybe is property_assignment => {
						ts_assert.isPropertyAssignment(maybe);
						ts_assert.isIdentifier(maybe.name);
						ts_assert.isStringLiteral(maybe.initializer);

						return true;
					},
				));

				const properties = generated.properties as unknown as [
					property_assignment,
					property_assignment,
					property_assignment,
					property_assignment,
					property_assignment,
					property_assignment,
				];

				assert.equal(properties[0].name.text, 'foo');
				assert.equal(properties[1].name.text, 'bar');
				assert.equal(properties[2].name.text, 'baz');
				assert.equal(properties[3].name.text, 'foobar');
				assert.equal(properties[4].name.text, 'barbar');
				assert.equal(properties[5].name.text, 'bazbar');

				assert.equal(properties[0].initializer.text, 'foo');
				assert.equal(properties[1].initializer.text, 'bar');
				assert.equal(properties[2].initializer.text, 'baz');
				assert.equal(properties[3].initializer.text, 'foobar');
				assert.equal(properties[4].initializer.text, 'barbar');
				assert.equal(properties[5].initializer.text, 'bazbar');
			});

			void it('behaves with nested internal $ref', () => {
				const schema = Object.freeze({
					type: 'object',
					$ref: '#/$defs/thing',
					$defs: {
						bazbar: {
							type: 'string',
							const: 'bazbar',
						},
						barbar: {
							type: 'string',
							const: 'barbar',
						},
						foobar: {
							type: 'string',
							const: 'foobar',
						},
						foothing: {
							type: 'object',
							properties: {
								foo: {
									type: 'string',
									const: 'foo',
								},
								foobar: {
									$ref: '#/$defs/foobar',
								},
							},
						},
						barthing: {
							type: 'object',
							$ref: '#/$defs/foothing',
							properties: {
								bar: {
									type: 'string',
									const: 'bar',
								},
								barbar: {
									$ref: '#/$defs/barbar',
								},
							},
						},
						thing: {
							type: 'object',
							$ref: '#/$defs/barthing',
							properties: {
								baz: {
									type: 'string',
									const: 'baz',
								},
								bazbar: {
									$ref: '#/$defs/bazbar',
								},
							},
						},
					},
					properties: {
						baz: {
							type: 'string',
							const: 'baz',
						},
						bazbar: {
							$ref: '#/$defs/bazbar',
						},
					},
				});
				const instance = parser.parse_by_type(schema);

				is_instanceof<
					ObjectUnspecified<
						{[key: string]: unknown},
						'properties'
					>
				>(
					instance,
					ObjectUnspecified,
				);

				const call = () => instance.generate_typescript_data(
					{
						foo: 'foo',
						bar: 'bar',
						baz: 'baz',
						foobar: 'foobar',
						barbar: 'barbar',
						bazbar: 'bazbar',
					},
					parser,
					schema,
				);

				assert.doesNotThrow(call);

				const generated = call();

				assert.equal(generated.properties.length, 6);

				type property_assignment = (
					& PropertyAssignment
					& {
						name: Identifier<string>,
						initializer: StringLiteral,
					}
				);

				assert.ok(generated.properties.every(
					(maybe): maybe is property_assignment => {
						ts_assert.isPropertyAssignment(maybe);
						ts_assert.isIdentifier(maybe.name);
						ts_assert.isStringLiteral(maybe.initializer);

						return true;
					},
				));

				const properties = generated.properties as unknown as [
					property_assignment,
					property_assignment,
					property_assignment,
					property_assignment,
					property_assignment,
					property_assignment,
				];

				assert.equal(properties[0].name.text, 'foo');
				assert.equal(properties[1].name.text, 'bar');
				assert.equal(properties[2].name.text, 'baz');
				assert.equal(properties[3].name.text, 'foobar');
				assert.equal(properties[4].name.text, 'barbar');
				assert.equal(properties[5].name.text, 'bazbar');

				assert.equal(properties[0].initializer.text, 'foo');
				assert.equal(properties[1].initializer.text, 'bar');
				assert.equal(properties[2].initializer.text, 'baz');
				assert.equal(properties[3].initializer.text, 'foobar');
				assert.equal(properties[4].initializer.text, 'barbar');
				assert.equal(properties[5].initializer.text, 'bazbar');
			});

			void it('behaves with missing nested external $ref', () => {
				const schema = Object.freeze({
					type: 'object',
					$ref: 'lolwhut#/$defs/thing',
					properties: {
						baz: {
							type: 'string',
							const: 'baz',
						},
					},
				});
				const instance = parser.parse_by_type(schema);

				is_instanceof<
					ObjectUnspecified<
						{[key: string]: unknown},
						'properties'
					>
				>(
					instance,
					ObjectUnspecified,
				);

				const call = () => instance.generate_typescript_data(
					{
						foo: 'foo',
						bar: 'bar',
						baz: 'baz',
						foobar: 'foobar',
						barbar: 'barbar',
						bazbar: 'bazbar',
					},
					parser,
					schema,
				);

				assert.throws(call);
			});

			void it('behaves with missing nested internal $ref', () => {
				const schema = Object.freeze({
					type: 'object',
					$ref: '#/$defs/lolwhut',
					properties: {
						baz: {
							type: 'string',
							const: 'baz',
						},
					},
				});
				const instance = parser.parse_by_type(schema);

				is_instanceof<
					ObjectUnspecified<
						{[key: string]: unknown},
						'properties'
					>
				>(
					instance,
					ObjectUnspecified,
				);

				const call = () => instance.generate_typescript_data(
					{
						foo: 'foo',
						bar: 'bar',
						baz: 'baz',
						foobar: 'foobar',
						barbar: 'barbar',
						bazbar: 'bazbar',
					},
					parser,
					schema,
				);

				assert.throws(call);
			});
		});
	});

	void describe('::generate_typescript_type()', () => {
		data_sets.forEach(([
			specific_options,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			input,
			type_schema,
			,
			type_asserter,
		], i) => {
			const ajv = new Ajv({strict: true});
			async function do_test(
				instance: ObjectUnspecified<
					typeof input,
					typeof specific_options['properties_mode']
				>,
				schema_parser: SchemaParser,
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				index: ReturnType<typeof PositiveIntegerOrZeroGuard>,
			) {
				assert.ok(instance.check_type(type_schema));
				const result = await instance.generate_typescript_type({
					schema: type_schema,
					schema_parser,
				});
				const foo: ts_asserter<object_TypeLiteralNode<
					typeof specific_options['properties_mode']
				>> = type_asserter;
				foo(result);
			}
			void it(`behaves directly with data_sets[${i}]`, async () => {
				const instance = new ObjectUnspecified(
					specific_options,
					{ajv},
				);

				await do_test(
					instance,
					new SchemaParser(),
					PositiveIntegerOrZeroGuard(i),
				);
			});
			void it(
				`behaves from schema parser with data_sets[${i}]`,
				async () => {
					const schema_parser = new SchemaParser();
					const instance = schema_parser.parse(type_schema);
					is_instanceof<
						ObjectUnspecified<typeof input, object_properties_mode>
					>(instance, ObjectUnspecified);
					assert.equal(
						instance.properties_mode,
						specific_options.properties_mode,
					);

					await do_test(
						instance,
						schema_parser,
						PositiveIntegerOrZeroGuard(i),
					);
				},
			);
		});
	});
});
