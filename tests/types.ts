import type {
	Node,
} from 'typescript';

export type ts_asserter<
	T extends Node = Node,
> = (
	value:Node,
	message:string|Error
) => asserts value is T;
