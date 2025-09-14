export type $defs_mode = (
	| 'with'
	| 'without'
);

export type $defs_schema = {
	$defs: {
		type: 'object',
		additionalProperties: {
			type: 'object',
		},
	},
};
