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
	type DataSet<
		T extends {[key: string]: unknown} = {[key: string]: unknown},
		DefsMode extends 'optional' = 'optional',
		RequiredMode extends 'optional' = 'optional',
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
			undefined|(readonly ObjectLiteralElementLike [])
		) =  (
			undefined|(readonly ObjectLiteralElementLike [])
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
			RequiredMode,
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
			'optional',
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
							(property) => [property, new Date()],
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
