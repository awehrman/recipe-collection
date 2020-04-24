import { fromJS, Map as ImmutableMap, List as ImmutableList } from 'immutable';
// import validate from '../components/ingredients/form/validator';

export const actions = {
	loadIngredient: 'LOAD_INGREDIENT',
	saveIngredient: 'SAVE_INGREDIENT',
	updateIngredient: 'UPDATE_INGREDIENT',
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

function loadIngredient(ing) {
	return ImmutableMap({
		alternateNames: fromJS(ing.alternateNames) || ImmutableList(),
		id: ing.id || null,
		isComposedIngredient: Boolean(ing.isComposedIngredient),
		isValidated: Boolean(ing.isValidated),
		name: ing.name || '',
		parent: ing.parent || null,
		plural: ing.plural || '',
		properties: (ing.properties) ? ImmutableMap({ ...ing.properties }) : defaultProperties,
		substitutes: fromJS(ing.substitutes) || ImmutableList(),
		relatedIngredients: fromJS(ing.relatedIngredients) || ImmutableList(),
		references: ImmutableList(),
	});
}

export const reducer = (state, action) => {
	// TODO can i use context here? or should things like isEditMode be submitted via payload?
	const { ingredient, reset } = state;
	const { payload, type } = action || {};
	const { data, fieldName, value /* , updateIngredientMutation */ } = payload || {};
	// eslint-disable-next-line object-curly-newline
	console.log('*** reducer', { state, action });

	// load ingredient data
	if (type === actions.loadIngredient) {
		console.log('   *** Loading ingredient data!');
		const loaded = loadIngredient(data.ingredient);

		return {
			...state,
			ingredient: loaded,
			reset: loaded,
		};
	}

	// update ingredient data
	if (type === actions.updateIngredient) {
		console.log('updateIngredient', value);

		const updatedIngredient = state.ingredient.toJS();
		updatedIngredient[fieldName] = value;

		return {
			...state,
			ingredient: fromJS(updatedIngredient),
		};
	}

	// save ingredient
	if (type === actions.saveIngredient) {
		// eslint-disable-next-line object-curly-newline
		console.log('   *** TODO saveIngredient', { ingredient, reset });
		// TODO re-validate ingredient
		// TODO call save mutation (which i can setup in the IngredientForm and pass via payload)
	}


	return state;
};

export default reducer;
