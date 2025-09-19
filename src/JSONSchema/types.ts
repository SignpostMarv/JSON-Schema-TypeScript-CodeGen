export type $defs_mode = 'optional'|'without'|'with';

export type $defs_schema = {
	$defs: {
		type: 'object',
		additionalProperties: {
			type: 'object',
		},
	},
};
