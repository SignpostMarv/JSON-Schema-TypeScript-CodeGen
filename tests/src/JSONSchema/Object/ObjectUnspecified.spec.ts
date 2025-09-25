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
} from '@satisfactory-dev/custom-assert';

import ts_assert from '@signpostmarv/ts-assert';

import type {
	object_properties_mode,
	object_schema,
	object_type,
	object_TypeLiteralNode,
} from '../../../../src/JSONSchema/Object.ts';
import {
	ObjectUnspecified,
} from '../../../../src/JSONSchema/Object.ts';

import {
	SchemaParser,
} from '../../../../src/SchemaParser.ts';

import type {
	ts_asserter,
} from '../../../types.ts';

import type {
	ObjectLiteralExpression,
	ObjectOfSchemas,
	OmitIf,
	SchemaObject,
} from '../../../../src/types.ts';
import {
	PositiveIntegerOrZero,
} from '../../../../src/guarded.ts';

void describe('ObjectUnspecified', () => {
	void describe('::generate_default_schema_definition()', () => {
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
			$defs: {
				type: 'object',
				additionalProperties: {
					type: 'object',
				},
			},
			type: {type: 'string', const: 'object'},
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
				type: full_schema_properties.type,
				$defs: full_schema_properties.$defs,
				required: full_schema_properties.required,
			},
			both: {
				type: full_schema_properties.type,
				$defs: full_schema_properties.$defs,
				required: full_schema_properties.required,
				properties: full_schema_properties.properties,
				patternProperties: (
					full_schema_properties.patternProperties
				),
			},
			properties: {
				type: full_schema_properties.type,
				$defs: full_schema_properties.$defs,
				required: full_schema_properties.required,
				properties: full_schema_properties.properties,
			},
			pattern: {
				type: full_schema_properties.type,
				$defs: full_schema_properties.$defs,
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
						.generate_default_schema_definition({
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
		})
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
			get schema_def()
			{
				return this.schema_definition;
			}

			get type_def()
			{
				return this.type_definition;
			}
		}

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
					})
				})
			}
		})
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
		ts_asserter<object_TypeLiteralNode<PropertiesMode>>,
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
			(
				value: Node,
				message?: string|Error,
			): asserts value is ObjectLiteralExpression<[
				PropertyAssignment
			]> => {
				ts_assert.isObjectLiteralExpression(value, message);
				not_undefined(value.properties);
				assert.equal(value.properties.length, 1);
				value.properties.forEach((property) => {
					ts_assert.isPropertyAssignment(property, message);
					ts_assert.isIdentifier(property.name, message);
					assert.equal('foo', property.name.text, message);
					ts_assert.isStringLiteral(property.initializer, message);
					assert.equal('bar', property.initializer.text);
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
				})
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
				PropertyAssignment
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
				})
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
			(
				value: Node,
				message?: string|Error,
			): asserts value is ObjectLiteralExpression<[
				PropertyAssignment
			]> => {
				ts_assert.isObjectLiteralExpression(value, message);
				not_undefined(value.properties);
				assert.equal(value.properties.length, 1);
				value.properties.forEach((property) => {
					ts_assert.isPropertyAssignment(property, message);
					ts_assert.isIdentifier(property.name, message);
					assert.equal('foo', property.name.text, message);
					ts_assert.isStringLiteral(property.initializer, message);
					assert.equal('bar', property.initializer.text);
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
				})
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
			(
				value: Node,
				message?: string|Error,
			): asserts value is ObjectLiteralExpression<[
				PropertyAssignment
			]> => {
				ts_assert.isObjectLiteralExpression(value, message);
				not_undefined(value.properties);
				assert.equal(value.properties.length, 1);
				value.properties.forEach((property) => {
					ts_assert.isPropertyAssignment(property, message);
					ts_assert.isIdentifier(property.name, message);
					assert.equal('foo', property.name.text, message);
					ts_assert.isStringLiteral(property.initializer, message);
					assert.equal('bar', property.initializer.text);
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
				})
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
			(
				value: Node,
				message?: string|Error,
			): asserts value is ObjectLiteralExpression<[
				PropertyAssignment
			]> => {
				ts_assert.isObjectLiteralExpression(value, message);
				not_undefined(value.properties);
				assert.equal(value.properties.length, 1);
				value.properties.forEach((property) => {
					ts_assert.isPropertyAssignment(property, message);
					ts_assert.isIdentifier(property.name, message);
					assert.equal('foo', property.name.text, message);
					ts_assert.isStringLiteral(property.initializer, message);
					assert.equal('bar', property.initializer.text);
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
					ts_assert.isTypeReferenceNode(member.type, message);
					ts_assert.isIdentifier(member.type.typeName, message);
					assert.equal(
						member.type.typeName.text,
						'foo',
						message,
					);
				})
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
				PropertyAssignment
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
						const sub_type:Node = member.type.types[i];
						ts_assert.isTypeReferenceNode(sub_type, message);
						ts_assert.isIdentifier(sub_type.typeName, message);
						assert.equal(
							sub_type.typeName.text,
							0 === i ? 'foo' : 'bar',
							message,
						);
					}
				})
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
			(
				value: Node,
				message?: string|Error,
			): asserts value is ObjectLiteralExpression<[
				PropertyAssignment
			]> => {
				ts_assert.isObjectLiteralExpression(value, message);
				not_undefined(value.properties);
				assert.equal(value.properties.length, 1);
				value.properties.forEach((property) => {
					ts_assert.isPropertyAssignment(property, message);
					ts_assert.isIdentifier(property.name, message);
					assert.equal('foo', property.name.text, message);
					ts_assert.isStringLiteral(property.initializer, message);
					assert.equal('bar', property.initializer.text);
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
					ts_assert.isTokenWithExpectedKind(
						member.type,
						SyntaxKind.UnknownKeyword,
						message,
					);
				})
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
					PropertyAssignment
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
			})
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
			})
		})
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
				index: ReturnType<typeof PositiveIntegerOrZero>,
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
					PositiveIntegerOrZero(i),
				);
			})
			void it(`behaves from schema parser with data_sets[${i}]`, async () => {
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
					PositiveIntegerOrZero(i),
				);
			})
		})
	})
})
