import {
	factory as TSfactory,
} from 'typescript';

import type {
	NodeFactory,
} from './types.ts';

const factory = TSfactory as NodeFactory;

export {
	factory,
};
