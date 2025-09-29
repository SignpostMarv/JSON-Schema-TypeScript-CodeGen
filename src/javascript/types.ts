export {};

declare global {
	interface ObjectConstructor {
		keys<
			T extends Exclude<{[key: string]: unknown}, Record<string, never>>,
			K = (keyof T & string),
		>(o: T): [K, ...K[]];
		keys<
			T extends {[key: string]: unknown},
			K = (keyof T & string),
		>(o: T): K[];
		keys(o: object): string[];
	}
}
