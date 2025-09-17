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

type Float<T extends number> = (
	& (
		`${T}` extends `${string}.${string}`
			? T
			: never
	)
	& {
		_guard_Float: never,
	}
);

export function NonZero<T extends number>(value: Exclude<T, 0>): NonZero
{
	return value as number as NonZero;
}

export function Positive<
	T extends number,
>(value: `${T}` extends `-${string}` ? never : Exclude<T, 0>): Positive<T>
{
	return NonZero(value) as Positive<T>;
}

export function Integer<
	T extends number,
>(
	value: `${T}` extends `${string}.${string}` ? never : T,
): Integer<T> {
	return value as Integer<T>;
}

export function Float<
	T extends number,
>(
	value: (
		`${T}` extends `${string}.${string}`
			? T
			: (
				`${T}` extends `${0}`
					? T
					: never
			)
	),
): Float<T> {
	return value as Float<T>;
}

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
