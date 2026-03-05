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

export default config;
