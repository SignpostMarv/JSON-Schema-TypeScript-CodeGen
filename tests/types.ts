import type {
	Node,
} from '@typescript/typescript6';

export type ts_asserter<
	T extends Node = Node,
	Context extends {[key: string]: unknown} = {[key: string]: unknown},
> = (
	value: Node,
	message?: string|Error,
	context?: Context,
) => asserts value is T;
