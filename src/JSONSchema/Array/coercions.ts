import type {
	unique_items_mode,
	UniqueItemsType_by_mode,
} from './types.ts';

export function UniqueItemsType_by_mode<
	T extends unique_items_mode
>(value: T): UniqueItemsType_by_mode<T> {
	return ('yes' === value) as UniqueItemsType_by_mode<T>;
}
