import type {
	StringPassesRegex,
} from '../types.ts';

export {};

declare global {
	interface Array<T> {
		map<U>(
			callbackfn: (value: T, index: number, array: [T, ...T[]]) => U,
			thisArg?: unknown,
		): [U, ...U[]];
		map<U>(
			callbackfn: (value: T, index: number, array: T[]) => U,
			thisArg?: unknown,
		): U[];
	}

	interface ObjectConstructor {
		entries<
			K extends string,
			V,
		>(
			o: {[key in K]: V},
		): [keyof typeof o, (typeof o)[keyof typeof o]][];
		entries<T>(o: { [s: string]: T } | ArrayLike<T>): [string, T][];

		keys<
			T extends Exclude<{[key: string]: unknown}, Record<string, never>>,
			K = (keyof T & string),
		>(o: T): [K, ...K[]];
		keys<
			T extends {[key: string]: unknown},
			K = (keyof T & string),
		>(o: T): K[];
		keys(o: object): string[];
	}

	interface RegExp
	{
		test<T extends string>(string: T): string is StringPassesRegex<
			this,
			T
		>;
	}
}
