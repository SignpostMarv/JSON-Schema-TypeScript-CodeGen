export function object_keys<
	T extends string
>(
	value: {[key in T]: unknown},
): T[] {
	return Object.keys(value) as T[];
}
