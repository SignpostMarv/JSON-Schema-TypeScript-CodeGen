import type {
	TypeElement,
	TypeNode,
} from 'typescript';
import {
	factory,
} from 'typescript';
import type {
	IntersectionTypeNode,
	TypeLiteralNode,
} from './types.ts';

export function object_keys<
	T extends string
>(
	value: {[key in T]: unknown},
): T[] {
	return Object.keys(value) as T[];
}

export function adjust_name_default(value: string): string
{
	if ('boolean' === value) {
		return '__boolean';
	}

	if ('class' === value) {
		return '__class';
	}

	if (value.match(/^\d+(\.\d+)+$/)) {
		value = `v${value}`;
	}

	return value;
}

export type adjust_name_callback = Required<
	Parameters<typeof adjust_name_finisher>
>['1'];

export function adjust_name_finisher(
	value: string,
	callback: (value: string) => string = adjust_name_default,
): string {
	return callback(value).replace(/[^A-Za-z_\d ]/g, '_');
}

export function type_literal_node<
	T extends TypeElement
>(
	value: T[],
): TypeLiteralNode<T> {
	return factory.createTypeLiteralNode(value) as TypeLiteralNode<T>;
}

export function intersection_type_node<
	T extends [TypeNode, ...TypeNode[]],
>(
	value: T,
): IntersectionTypeNode<T> {
	return factory.createIntersectionTypeNode(
		value,
	) as IntersectionTypeNode<T>;
}
