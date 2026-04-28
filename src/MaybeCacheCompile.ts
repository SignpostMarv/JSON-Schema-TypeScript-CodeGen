import type {
	Ajv2020,
	SchemaObject,
	ValidateFunction,
} from 'ajv/dist/2020.js';

export type Is<T = unknown> = (
	| ValidateFunction<T>
	| {
		(
			data: unknown,
			dataCxt?: Parameters<ValidateFunction<T>>[1],
		): data is T,
		errors?: ValidateFunction<T>['errors'],
		evaluated?: ValidateFunction<T>['evaluated'],
	}
);

export class FailedToCompile extends Error {
	readonly ajv: Ajv2020;

	readonly schema: SchemaObject;

	constructor(
		ajv: Ajv2020,
		schema: SchemaObject,
		err: unknown,
	) {
		super('Failed to compile schema!', {cause: err});

		this.ajv = ajv;
		this.schema = schema;
	}
}

export interface MaybeCacheCompile {
	compile<T>(
		ajv: Ajv2020,
		schema: SchemaObject
	): Is<T>;
}

export class AlwaysFreshCompile implements MaybeCacheCompile {
	compile<T>(
		ajv: Ajv2020,
		schema: SchemaObject,
	) {
		try {
			return ajv.compile<T>(schema);
		} catch (err) {
			throw new FailedToCompile(ajv, schema, err);
		}
	}
}

export class StaticCompile implements MaybeCacheCompile {
	#cache: WeakMap<
		SchemaObject,
		Is
	> = new WeakMap();

	compile<T>(ajv: Ajv2020, schema: SchemaObject) {
		try {
			const existing = this.#cache.get(schema);

			if (existing) {
				return existing as Is<T>;
			}

			const compiled = ajv.compile<T>(schema);

			this.#cache.set(schema, compiled);

			return compiled;
		} catch (err) {
			throw new FailedToCompile(ajv, schema, err);
		}
	}
}

export class DynamicCompile implements MaybeCacheCompile {
	#cache: {[key: string]: (data: unknown) => boolean} = {};

	compile<T>(ajv: Ajv2020, schema: SchemaObject) {
		try {
			const key = JSON.stringify(schema);

			if (key in this.#cache) {
				return this.#cache[key] as Is<T>;
			}

			return this.#cache[key] = ajv.compile<T>(schema);
		} catch (err) {
			throw new FailedToCompile(ajv, schema, err);
		}
	}
}
