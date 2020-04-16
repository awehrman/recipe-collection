import { fromJS, Map as ImmutableMap, List as ImmutableList } from 'immutable';
import validate from '../components/ingredients/form/validator';

export const actions = {
	loadIngredient: 'LOAD_INGREDIENT',
	updateIngredient: 'UPDATE_INGREDIENT',
	resetIngredient: 'RESET_INGREDIENT',
	resetValidation: 'RESET_VALIDATION',
	saveIngredient: 'SAVE_INGREDIENT',
	validateIngredient: 'VALIDATE_INGREDIENT',
};

// TODO move these into a constants file
const defaultProperties = ImmutableMap({
	meat: false,
	poultry: false,
	fish: false,
	dairy: false,
	soy: false,
	gluten: false,
});

const defaultWarnings = () => ImmutableMap({
	errors: ImmutableMap(),
	warnings: ImmutableMap(),
});

export const getInitialState = (ing) => ({
	// ingredient form fields
	ingredient: ImmutableMap({
		alternateNames: ing.alternateNames || new ImmutableList(),
		id: ing.id,
		isComposedIngredient: ing.isComposedIngredient || false,
		isValidated: ing.isValidated || false,
		name: ing.name || '',
		parent: ing.parent || null,
		plural: ing.plural || null,
		properties: ing.properties || defaultProperties,
		references: ing.references || new ImmutableList(),
	}),
	// reset values
	reset: ImmutableMap({
		alternateNames: ing.alternateNames || new ImmutableList(),
		id: ing.id,
		isComposedIngredient: ing.isComposedIngredient || false,
		isValidated: ing.isValidated || false,
		name: ing.name || '',
		parent: ing.parent || null,
		plural: ing.plural || null,
		properties: ing.properties || defaultProperties,
		references: ing.references || new ImmutableList(),
	}),
	// validation warnings
	validationWarnings: defaultWarnings(),
});

const noChangesDetected = (state) => {
	const currentState = { ...state };
	delete currentState.reset;

	return (JSON.stringify(currentState) === JSON.stringify(state.reset));
};

export const reducer = (state, action) => {
	if (!action) return state;
	const { ingredient, reset, validationWarnings } = state;
	const { payload, type } = action || {};
	const { ingredients = [], fieldName, value } = payload || {};
	console.log('>>> reducer', type);
	const updatedState = {};

	// load ingredient
	if (type === actions.loadIngredient) {
		const initialLoadedState = getInitialState(payload);
		// console.log('LOAD', { loaded: initialLoadedState.ingredient.toJS() });

		return initialLoadedState;
	}

	// on input change
	if (type === actions.updateIngredient) {
		updatedState.reset = reset;
		updatedState.validationWarnings = validationWarnings;
		const updatedIngredient = ingredient.toJS();
		updatedIngredient[fieldName] = value;
		updatedState.ingredient = fromJS(updatedIngredient);

		// console.log('UPDATED', { state: state.ingredient.toJS().plural, updatedState: updatedState.ingredient.toJS() });
		return updatedState;
	}

	// reset ingredient form
	if (type === actions.resetIngredient) {
		// if we haven't made any adjustments to the state, and these are considered equal by value,
		// just return the original object
		if (noChangesDetected(state)) return state;
		updatedState.ingredient = reset;
		updatedState.validationWarnings = defaultWarnings();
		console.log('RESET INGREDIENT FORM');
		return updatedState;
	}

	// save ingredient
	if (type === actions.saveIngredient) {
		// TODO useMutation
		// update reset fields
	}

	// on validation
	if (type === actions.validateIngredient) {
		updatedState.ingredient = ingredient;
		updatedState.reset = reset;
		console.log(`VALIDATE ${ fieldName } ${ value }`);

		updatedState.validationWarnings = ImmutableMap({ ...validate(fieldName, value, ingredient, ingredients) });

		return updatedState;
	}

	// on reset validation
	if (type === actions.resetValidation) {
		updatedState.ingredient = ingredient;
		updatedState.reset = reset;
		updatedState.validationWarnings = defaultWarnings();
		console.log('RESET WARNINGS');
		return updatedState;
	}

	return state;
};

export default reducer;
