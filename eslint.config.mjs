import {
	typescript,
} from '@signpostmarv/eslint-config';

// eslint-disable-next-line imports/no-unresolved
import parser from '@typescript-eslint/parser';

const config = [
	{
		languageOptions: {
			parser,
			parserOptions: {
				project: ['./tsconfig.eslint.json'],
			},
		},
	},
	...typescript,
	{
		files: ['**/*.ts'],
		ignores: ['**/*.d.ts', '**/*.js', '**/*.mjs'],
	},
	{
		rules: {
			'@stylistic/type-annotation-spacing': ['error', {
				before: false,
				after: true,
				overrides: {
					arrow: {
						before: true,
						after: true,
					},
				},
			}],
		},
	},
];

// eslint-disable-next-line imports/no-default-export
export default config;
