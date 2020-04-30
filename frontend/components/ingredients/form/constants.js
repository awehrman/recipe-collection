import { Map as ImmutableMap } from 'immutable';

export const noValidationWarnings = {
	errors: ImmutableMap({}),
	warnings: ImmutableMap({}),
};

export const noValidationMessages = [];

export const defaultProperties = ImmutableMap({
	meat: false,
	poultry: false,
	fish: false,
	dairy: false,
	soy: false,
	gluten: false,
});

export default {
	defaultProperties,
	noValidationMessages,
	noValidationWarnings,
};
