import type {
	ObjectOfSchemas,
} from './Type.ts';

export type $defs_mode<
	Defs extends DefsType = DefsType
> = (
	Defs extends Exclude<DefsType, ObjectOfSchemas>
		? 'without'
		: (
			Defs extends Exclude<DefsType, undefined>
				? 'with'
				: never
		)
);

export type $defs_schema = {
	$defs: {
		type: 'object',
		additionalProperties: {
			type: 'object',
		},
	},
};

export type DefsType = undefined|ObjectOfSchemas;

export type RequiredType = undefined|[string, ...string[]];
