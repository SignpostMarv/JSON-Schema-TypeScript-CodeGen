import {
	typescript,
} from '@signpostmarv/eslint-config';

// eslint-disable-next-line imports/no-unresolved
import parser from '@typescript-eslint/parser';
import imports from 'eslint-plugin-import';

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
		plugins: {
			imports,
		},
		rules: {
			'imports/no-internal-modules': ['error', {
				allow: [
					'ajv/dist/2020.js',
					`${import.meta.dirname}/src/*.ts`,
					`${import.meta.dirname}/src/**/*.ts`,
				],
			}],
		},
	},
];

// eslint-disable-next-line imports/no-default-export
export default config;
