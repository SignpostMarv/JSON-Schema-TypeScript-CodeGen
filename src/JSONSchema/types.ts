import type {
	SchemaObject,
} from 'ajv/dist/2020.js';

export type $defs_mode = 'optional'|'without'|'with';

export type DefsType_by_mode<
	Defs extends SchemaObject = SchemaObject,
> = {
	without: undefined,
	with: Defs,
	optional: DefsType_by_mode<Defs>['with'],
};

export type $defs_schema = {
	$defs: {
		type: 'object',
		additionalProperties: {
			type: 'object',
		},
	},
};
