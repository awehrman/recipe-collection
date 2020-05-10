import { Map as ImmutableMap, List as ImmutableList } from 'immutable';

export const defaultListActions = {
	// create
	create_alternateNames: ImmutableList.of([]),
	create_relatedIngredients: ImmutableList.of([]),
	create_substitutes: ImmutableList.of([]),

	// delete
	delete_alternateNames: ImmutableList.of([]),
	delete_relatedIngredients: ImmutableList.of([]),
	delete_substitutes: ImmutableList.of([]),

	// connect
	connect_relatedIngredients: ImmutableList.of([]),
	connect_substitutes: ImmutableList.of([]),

	// disconnect
	disconnect_relatedIngredients: ImmutableList.of([]),
	disconnect_substitutes: ImmutableList.of([]),
};

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
	defaultListActions,
	defaultProperties,
	noValidationMessages,
	noValidationWarnings,
};
