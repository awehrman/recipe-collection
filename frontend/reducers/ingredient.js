import { Map as ImmutableMap, List as ImmutableList } from 'immutable';

export const actions = {
	loadIngredient: 'LOAD_INGREDIENT',
	updateIngredient: 'UPDATE_INGREDIENT',
	resetIngredient: 'RESET_INGREDIENT',
	saveIngredient: 'SAVE_INGREDIENT',
};

export const initialState = (id, name = '') => ({
	alternateNames: [],
	id,
	isComposedIngredient: false,
	isValidated: false,
	name,
	parent: null,
	plural: null,
	properties: {
		meat: false,
		poultry: false,
		fish: false,
		dairy: false,
		soy: false,
		gluten: false,
	},
	references: [],
});

const noChangesDetected = (state) => {
	const currentState = { ...state };
	delete currentState.reset;

	return (JSON.stringify(currentState) === JSON.stringify(state.reset));
};

export const reducer = (state, action) => {
	// load ingredient
	if (action.type === actions.loadIngredient) {
		const initialLoadedState = {
			...action.payload,
			properties: new ImmutableMap(action.payload.properties),
			alternateNames: new ImmutableList(action.payload.alternateNames),
			relatedIngredients: new ImmutableList(action.payload.relatedIngredients),
			substitutes: new ImmutableList(action.payload.substitutes),
			references: new ImmutableList(action.payload.references),
			errors: new ImmutableList(),
		};

		return {
			...initialLoadedState,
			reset: { ...initialLoadedState },
		};
	}

	// on input change
	if (action.type === actions.updateIngredient) {
		const { fieldName, value } = action.payload;

		const updatedState = {
			...state,
			[fieldName]: value,
		};
		return updatedState;
	}

	// reset ingredient form
	if (action.type === actions.resetIngredient) {
		// if we haven't made any adjustments to the state, and these are considered equal by value,
		// just return the original object
		if (noChangesDetected(state)) return state;

		return {
			...state.reset,
			reset: state.reset,
		};
	}

	// save ingredient
	if (action.type === actions.saveIngredient) {
		// TODO useMutation
	}

	return state;
};

export default reducer;
