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

type any_of_type_options<
	Mode extends something_of_mode = something_of_mode,
	Choices extends type_choices = type_choices,
	Defs extends ObjectOfSchemas = ObjectOfSchemas,
> = something_of_type_options<
	'anyOf',
	Mode,
	Choices,
	Defs
>;

type any_of_schema_options<
	Mode extends something_of_mode = something_of_mode,
	Choices extends schema_choices = schema_choices,
> = something_of_schema_options<'anyOf', Mode, Choices>;

class AnyOf<
	T,
	Mode extends something_of_mode = something_of_mode,
	TypeChoices extends type_choices = type_choices,
	SchemaChoices extends schema_choices = schema_choices,
> extends
	SomethingOf<
		T,
		'anyOf',
		Mode,
		TypeChoices,
		SchemaChoices
	> {
}

export type {
	any_of_type_options,
	any_of_schema_options,
};

export {
	AnyOf,
};
