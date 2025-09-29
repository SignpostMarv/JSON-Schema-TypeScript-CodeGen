import type {
	PositiveInteger,
	PositiveIntegerOrZero,
} from './types.ts';

export function PositiveInteger<
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

export function PositiveIntegerOrZero<
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
