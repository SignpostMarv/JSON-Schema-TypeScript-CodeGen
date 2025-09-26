import {
	spec,
} from 'node:test/reporters';
import {
	run,
} from 'node:test';
import {
	glob as _glob,
} from 'node:fs';
import {
	promisify,
} from 'node:util';

const glob: (spec: string) => Promise<string[]> = promisify(_glob);

const ac = new AbortController();

let already_stopped = false;

run({
	files: await glob('./tests/**/*.spec.ts'),
	concurrency: true,
	signal: ac.signal,
})
	.on('test:fail', (e) => {
		ac.abort();
		if (!already_stopped) {
			console.error(e);
		}
		already_stopped = true;
		process.exitCode = 1;
	})
	.compose(spec)
	.pipe(process.stdout);
