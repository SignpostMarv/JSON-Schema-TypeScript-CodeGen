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

type one_of_type_options<
	Mode extends something_of_mode = something_of_mode,
	Choices extends type_choices = type_choices,
	Defs extends ObjectOfSchemas = ObjectOfSchemas,
> = something_of_type_options<
	'oneOf',
	Mode,
	Choices,
	Defs
>;

type one_of_schema_options<
	Mode extends something_of_mode = something_of_mode,
	Choices extends schema_choices = schema_choices,
> = something_of_schema_options<'oneOf', Mode, Choices>;

class OneOf<
	T,
	Mode extends something_of_mode = something_of_mode,
	TypeChoices extends type_choices = type_choices,
	SchemaChoices extends schema_choices = schema_choices,
> extends
	SomethingOf<
		T,
		'oneOf',
		Mode,
		TypeChoices,
		SchemaChoices
	> {
}

export type {
	one_of_type_options,
	one_of_schema_options,
};

export {
	OneOf,
};
