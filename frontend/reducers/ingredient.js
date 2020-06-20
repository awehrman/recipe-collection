import { fromJS, Map as ImmutableMap, List as ImmutableList } from 'immutable';
import { defaultListActions, defaultProperties } from '../components/ingredients/form/constants';

export const actions = {
	loadIngredient: 'LOAD_INGREDIENT',
	resetIngredient: 'RESET_INGREDIENT',
	saveIngredient: 'SAVE_INGREDIENT',
	updateIngredient: 'UPDATE_INGREDIENT',
};

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
	const { ingredient, reset } = state;
	const { payload, type } = action || {};
	const {
		data,
		fieldName,
		listAction = null,
		saveIngredientMutation,
		value,
	} = payload || {};
	// eslint-disable-next-line object-curly-newline
	console.log('*** reducer', { state, action });

	// load ingredient data
	if (type === actions.loadIngredient) {
		// console.log('   *** Loading ingredient data!');
		const loaded = loadIngredient(data.ingredient);

		return {
			...state,
			ingredient: loaded,
			reset: loaded,
		};
	}

	// reset ingredient data
	if (type === actions.resetIngredient) {
		console.log('   *** Resetting ingredient data!');
		const loaded = loadIngredient(reset.toJS());
		console.log({ loaded });

		return {
			...state,
			ingredient: loaded,
			listActions: { ...defaultListActions },
			reset: loaded,
		};
	}

	// update ingredient data
	if (type === actions.updateIngredient) {
		// eslint-disable-next-line object-curly-newline
		console.log('updateIngredient', { fieldName, listAction, value });

		const updatedIngredient = state.ingredient.toJS();
		const updatedInputFields = state.inputFields;
		const updatedListActions = state.listActions;

		if (fieldName === 'properties') {
			const key = Object.keys(value)[0];
			const val = Object.values(value)[0];
			updatedIngredient[fieldName][key] = val;
		} else if (listAction === 'add') {
			// add this to the appropriate create or connect list actions
			const listActionPrefix = (fieldName === 'alternateNames')
				? 'create'
				: 'connect';

			const temp = updatedListActions[`${ listActionPrefix }_${ fieldName }`].toJS().flat();
			temp.push({ name: value });
			updatedListActions[`${ listActionPrefix }_${ fieldName }`] = fromJS(temp);

			// add the value to the fieldName list
			updatedIngredient[fieldName].push({ name: value });
			// if this value matches a value in this field's inputFields, then clear out the input
			if (updatedInputFields[fieldName] === value) {
				updatedInputFields[fieldName] = '';
			}
		} else if (listAction === 'remove') {
			// remove the value from the fieldName
			updatedIngredient[fieldName] = [ ...updatedIngredient[fieldName] ]
				.filter((i) => i.name !== value);

			const listRemoveActionPrefix = (fieldName === 'alternateNames')
				? 'delete'
				: 'remove';

			// TODO we only have to really do this if its a known value
			const temp = updatedListActions[`${ listRemoveActionPrefix }_${ fieldName }`].toJS().flat();
			temp.push({ name: value });
			updatedListActions[`${ listRemoveActionPrefix }_${ fieldName }`] = fromJS(temp);
		} else if (fieldName.includes('input')) {
			const field = fieldName.split('_')[0];
			// update input field
			updatedInputFields[field] = value;
		} else {
			updatedIngredient[fieldName] = value;
		}

		console.log({
			...state,
			listActions: updatedListActions,
			inputFields: updatedInputFields,
			ingredient: fromJS(updatedIngredient),
		});

		return {
			...state,
			listActions: updatedListActions,
			inputFields: updatedInputFields,
			ingredient: fromJS(updatedIngredient),
		};
	}

	// save ingredient
	if (type === actions.saveIngredient) {
		// eslint-disable-next-line object-curly-newline
		console.log('   *** TODO saveIngredient', { ingredient: ingredient.toJS() });
		const ing = ingredient.toJS();

		const properties = { ...ing.properties };
		delete properties.id;
		delete properties.__typename;

		saveIngredientMutation({
			variables: {
				data: {
					name: ing.name,
					plural: ing.plural || null,
					isComposedIngredient: Boolean(ing.isComposedIngredient),
					isValidated: true,
					properties: { update: { ...properties } },
					alternateNames: {
						create: state.listActions.create_alternateNames.toJS().flat(),
						delete: state.listActions.delete_alternateNames.toJS().flat(),
					},
					relatedIngredients: {
						connect: state.listActions.connect_relatedIngredients.toJS().flat(),
						disconnect: state.listActions.disconnect_relatedIngredients.toJS().flat(),
					},
					substitutes: {
						connect: state.listActions.connect_substitutes.toJS().flat(),
						disconnect: state.listActions.disconnect_substitutes.toJS().flat(),
					},
				},
				where: { id: ing.id },
			},
		});
	}

	return state;
};

export default reducer;
