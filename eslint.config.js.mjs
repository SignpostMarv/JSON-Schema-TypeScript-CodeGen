import {
	javascript,
} from '@signpostmarv/eslint-config';

const config = [
	...javascript,
	{
		files: ['**/*.mjs'],
		ignores: ['**/*.js'],
	},
];

// eslint-disable-next-line imports/no-default-export
export default config;
