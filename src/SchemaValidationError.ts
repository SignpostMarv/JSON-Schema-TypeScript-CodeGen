import type {
	Is,
} from './MaybeCacheCompile.ts';

export class SchemaValidationError extends TypeError {
	readonly validator;

	constructor(message: string, validator: Is) {
		super(message);
		this.validator = validator;
	}
}
