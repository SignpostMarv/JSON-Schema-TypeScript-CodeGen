import type {
	PositiveInteger,
	PositiveIntegerOrZero,
	StringPassesRegex,
} from './types.ts';

export function PositiveIntegerGuard<
	T extends number,
>(
	value: (
		& (
			`${T}` extends `-${string}`
				? never
				: Exclude<
					`${T}` extends `${string}.${string}` ? never : T,
					0
				>
		)
	),
): PositiveInteger<T> {
	return value as number as PositiveInteger<T>;
}

export function PositiveIntegerOrZeroGuard<
	T extends number,
>(
	value: (
		& (
			`${T}` extends `-${string}`
				? never
				: `${T}` extends `${string}.${string}` ? never : T
		)
	),
): PositiveIntegerOrZero<T> {
	return value as PositiveIntegerOrZero<T>;
}

export function StringPassesRegexGuard<
	Regex extends RegExp|string,
	Value extends string,
>(
	value: Value,
	pattern: Regex,
): StringPassesRegex<Regex, Value> {
	if (!(new RegExp(pattern)).test(value)) {
		throw new TypeError('value did not pass the supplied pattern!');
	}

	return value as StringPassesRegex<Regex, Value>;
}
