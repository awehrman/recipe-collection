import { Map as ImmutableMap } from 'immutable';

export const noValidationWarnings = {
	errors: ImmutableMap({}),
	warnings: ImmutableMap({}),
};

export const noValidationMessages = [];

export default {
	noValidationMessages,
	noValidationWarnings,
};
