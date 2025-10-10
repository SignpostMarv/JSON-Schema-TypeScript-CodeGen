import type {
	schema_choices,
	something_of_mode,
	something_of_schema_options,
	something_of_type_options,
	type_choices,
} from './SomethingOf.ts';
import {
	SomethingOf,
} from './SomethingOf.ts';

import type {
	ObjectOfSchemas,
// eslint-disable-next-line imports/no-relative-parent-imports
} from '../types.ts';

type all_of_type_options<
	Mode extends something_of_mode = something_of_mode,
	Choices extends type_choices = type_choices,
	Defs extends ObjectOfSchemas = ObjectOfSchemas,
> = something_of_type_options<
	'allOf',
	Mode,
	Choices,
	Defs
>;

type all_of_schema_options<
	Mode extends something_of_mode = something_of_mode,
	Choices extends schema_choices = schema_choices,
> = something_of_schema_options<'allOf', Mode, Choices>;

class AllOf<
	T,
	Mode extends something_of_mode = something_of_mode,
	TypeChoices extends type_choices = type_choices,
	SchemaChoices extends schema_choices = schema_choices,
> extends
	SomethingOf<
		T,
		'allOf',
		Mode,
		TypeChoices,
		SchemaChoices
	> {
}

export type {
	all_of_type_options,
	all_of_schema_options,
};
export {
	AllOf,
};
