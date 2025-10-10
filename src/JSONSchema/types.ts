type $defs_mode = 'optional'|'without'|'with';

type $defs_schema = {
	$defs: {
		type: 'object',
		additionalProperties: {
			type: 'object',
		},
	},
};

export type {
	$defs_mode,
	$defs_schema,
};
