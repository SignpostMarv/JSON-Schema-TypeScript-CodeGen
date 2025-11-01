export class RegexpFailureError extends TypeError {
	readonly pattern: string;

	readonly value: string;

	constructor(message: string, regex: RegExp, value: string) {
		super(message);
		this.pattern = regex.toString();
		this.value = value;
	}
}
