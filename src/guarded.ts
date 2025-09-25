type NonZero = (
	& number
	& {
		_guard_NonZero: never,
	}
);

type Positive<
	T extends number
> = (
	& NonZero
	& (
		`${T}` extends `-${string}`
			? never
			: T
	)
	& {
		_guard_Positive: never,
	}
);

type Integer<T extends number> = (
	& (
		`${T}` extends `${string}.${string}`
			? never
			: T
	)
	& {
		_guard_Integer: never,
	}
);

type PositiveInteger<T extends number> = (
	& Integer<T>
	& Positive<T>
);

type PositiveIntegerOrZero<T extends number> = (
	| 0
	| PositiveInteger<T>
);

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
