import type {
	ValidateFunction,
} from 'ajv/dist/2020.js';

export class SchemaValidationError extends TypeError {
	readonly validator;

	constructor(message: string, validator: ValidateFunction) {
		super(message);
		this.validator = validator;
	}
}
