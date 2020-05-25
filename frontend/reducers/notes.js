// import { defaultListActions, defaultProperties } from '../components/ingredients/form/constants';

export const actions = {
	convertNotes: 'CONVERT_NOTES',
	importNotes: 'IMPORT_NOTES',
	saveRecipes: 'SAVE_RECIPES',
};

export const reducer = (state, action) => {
	const { payload, type } = action || {};
	const { data } = payload || {};
	// eslint-disable-next-line object-curly-newline

	if (type === actions.importNotes) {
		return {
			...state,
			notes: data.notes,
		};
	}

	if (type === actions.convertNotes) {
		return {
			...state,
			converted: data.converted,
		};
	}

	if (type === actions.saveRecipes) {
		return {
			...state,
			converted: [],
		};
	}


	return state;
};

export default reducer;
