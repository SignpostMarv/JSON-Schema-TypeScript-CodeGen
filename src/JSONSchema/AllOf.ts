import type {
	ObjectOfSchemas,
} from '../types.ts';

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

export type all_of_type_options<
	Mode extends something_of_mode = something_of_mode,
	Choices extends type_choices = type_choices,
	Defs extends ObjectOfSchemas = ObjectOfSchemas,
> = something_of_type_options<
	'allOf',
	Mode,
	Choices,
	Defs
>;

export type all_of_schema_options<
	Mode extends something_of_mode = something_of_mode,
	Choices extends schema_choices = schema_choices,
> = something_of_schema_options<'allOf', Mode, Choices>;

export class AllOf<
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
