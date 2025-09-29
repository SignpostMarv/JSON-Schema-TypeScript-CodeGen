import type {
	SchemaObject as AjvSchemaObject,
} from 'ajv/dist/2020.js';


export type SchemaObject = (
	& AjvSchemaObject
	& {
		$defs?: ObjectOfSchemas,
	}
);

export type SchemaObjectWith$id = (
	& SchemaObject
	& Required<PartialPick<SchemaObject, '$id'>>
);

export type ObjectOfSchemas = {[key: string]: SchemaObject};

// @see https://stackoverflow.com/a/64034671/1498831
export type OmitFromTupleish<
	T1 extends unknown[],
	T2,
> = (
	T1 extends []
		? []
		: (
			T1 extends [infer T3, ...infer T4]
				? (
					T3 extends T2
						? OmitFromTupleish<T4, T2>
						: [T3, ...OmitFromTupleish<T4, T2>]
				)
				: T1
		)
);

export type OmitFromTupleishIf<
	T1 extends unknown[],
	T2,
	If extends 'with'|'without'|'optional',
> = If extends 'without'
	? OmitFromTupleish<T1, T2>
	: (
		If extends 'with'
			? T1
			: OmitFromTupleish<T1, T2>
	);

export type PartialPick<
	T,
	K extends keyof T,
> = (
	& Omit<T, K>
	& Partial<Pick<T, K>>
);

export type OmitIf<
	T,
	K extends keyof T,
	If extends 'with'|'without'|'optional',
> = If extends 'without'
	? Omit<T, K>
	: (
		If extends 'optional'
			? PartialPick<T, K>
			: T
	);

export type NonZero = (
	& number
	& {
		_guard_NonZero: never,
	}
);

export type Positive<
	T extends number,
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

export type Integer<T extends number> = (
	& (
		`${T}` extends `${string}.${string}`
			? never
			: T
	)
	& {
		_guard_Integer: never,
	}
);

export type PositiveInteger<T extends number> = (
	& Integer<T>
	& Positive<T>
);

export type PositiveIntegerOrZero<T extends number> = (
	| 0
	| PositiveInteger<T>
);

export type StringPassesRegex<
	Regex extends string,
	Value extends string = string,
> = (
	& Value
	& {
		__guard_StringPassesRegex: never,
		__regex_StringPassesRegex: Regex,
	}
);
