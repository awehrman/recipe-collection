/* eslint-disable camelcase */
import { fromJS, Map as ImmutableMap, List as ImmutableList } from 'immutable';
import { defaultListActions, defaultProperties } from '../form/constants';

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
		references: fromJS(ing.references) || ImmutableList(),
	});
}

export const reducer = (state, action) => {
	const { ingredient, listActions, reset } = state;
	const { payload, type } = action || {};
	const {
		data,
		fieldName,
		listAction = null,
		saveIngredientMutation,
		value,
	} = payload || {};
	// eslint-disable-next-line object-curly-newline
	// console.log('*** reducer', { state, action });

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
		const loaded = loadIngredient(reset.toJS());

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
		// console.log('updateIngredient', { fieldName, listAction, value });

		const updatedIngredient = state.ingredient.toJS();
		const updatedInputFields = state.inputFields;
		const updatedListActions = state.listActions;

		if (fieldName === 'properties') {
			const key = Object.keys(value)[0];
			const val = Object.values(value)[0];
			updatedIngredient[fieldName][key] = val;
		} else if (listAction === 'add') {
			// add this to the appropriate create or connect list actions
			const listActionPrefix = ((fieldName === 'alternateNames') || (value && !value.id))
				? 'create'
				: 'connect';

			const temp = updatedListActions[`${ listActionPrefix }_${ fieldName }`].toJS().flat();
			const addEntry = { name: value.name || value };
			if (value && value.id) {
				addEntry.id = value.id;
			}
			const index = temp.findIndex((i) => i.name === addEntry.name);
			if (index === -1) {
				temp.push(addEntry);
				// if (updatedInputFields[fieldName] === (value.name || value)) {
				updatedInputFields[fieldName] = '';
			}
			updatedListActions[`${ listActionPrefix }_${ fieldName }`] = fromJS(temp);

			// add the value to the fieldName list
			updatedIngredient[fieldName].push(addEntry);
			// if this value matches a value in this field's inputFields, then clear out the input
		} else if (listAction === 'remove') {
			// remove the value from the fieldName
			updatedIngredient[fieldName] = [ ...updatedIngredient[fieldName] ]
				.filter((i) => i.name !== value);

			const listRemoveActionPrefix = ((fieldName === 'alternateNames') || (value && !value.id))
				? 'delete'
				: 'remove';

			// TODO we only have to really do this if its a known value
			const temp = updatedListActions[`${ listRemoveActionPrefix }_${ fieldName }`].toJS().flat();
			const removeEntry = { name: value.name || value };
			if (value && value.id) {
				removeEntry.id = value.id;
			}
			const index = temp.findIndex((i) => i.name === removeEntry.name);
			if (index < 0) {
				temp.push(removeEntry);
			}
			updatedListActions[`${ listRemoveActionPrefix }_${ fieldName }`] = fromJS(temp);
		} else if (fieldName.includes('input')) {
			const field = fieldName.split('_')[0];
			// update input field
			updatedInputFields[field] = value;
		} else {
			updatedIngredient[fieldName] = value;
		}

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
		// console.log('   *** saveIngredient', { ingredient: ingredient.toJS() });
		const ing = ingredient.toJS();

		const properties = { ...ing.properties };
		delete properties.id;
		delete properties.__typename;

		const mutationData = {
			name: ing.name,
			plural: ing.plural || null,
			isComposedIngredient: Boolean(ing.isComposedIngredient),
			isValidated: true,
			properties: { update: { ...properties } },
			alternateNames: {},
			relatedIngredients: {},
			substitutes: {},
		};

		const {
			create_alternateNames,
			delete_alternateNames,

			connect_relatedIngredients,
			create_relatedIngredients,
			disconnect_relatedIngredients,
			delete_relatedIngredients,

			connect_substitutes,
			create_substitutes,
			disconnect_substitutes,
			delete_substitutes,
		} = listActions;

		const createAlternativeNames = create_alternateNames.toJS().flat();
		const deleteAlternativeNames = delete_alternateNames.toJS().flat();

		const createRelatedIngredients = create_relatedIngredients.toJS().flat();
		const connectRelatedIngredients = connect_relatedIngredients.toJS().flat();
		const deleteRelatedIngredients = delete_relatedIngredients.toJS().flat();
		const disconnectRelatedIngredients = disconnect_relatedIngredients.toJS().flat();

		const createSubstitutes = create_substitutes.toJS().flat();
		const connectSubstitutes = connect_substitutes.toJS().flat();
		const deleteSubstitutes = delete_substitutes.toJS().flat();
		const disconnectSubstitutes = disconnect_substitutes.toJS().flat();

		if (createAlternativeNames.length > 0) {
			mutationData.alternateNames = { create: createAlternativeNames };
		}
		if (deleteAlternativeNames.length > 0) {
			mutationData.alternateNames = { delete: deleteAlternativeNames };
		}

		if (connectRelatedIngredients.length > 0) {
			mutationData.relatedIngredients = { connect: connectRelatedIngredients.map((i) => ({ id: i.id })) };
		}
		if (disconnectRelatedIngredients.length > 0) {
			mutationData.relatedIngredients = { disconnect: disconnectRelatedIngredients.map((i) => ({ id: i.id })) };
		}
		if (createRelatedIngredients.length > 0) {
			mutationData.relatedIngredients = { create: createRelatedIngredients.map((i) => ({ id: i.id })) };
		}
		if (deleteRelatedIngredients.length > 0) {
			mutationData.relatedIngredients = { delete: deleteRelatedIngredients.map((i) => ({ id: i.id })) };
		}

		if (connectSubstitutes.length > 0) {
			mutationData.substitutes = { connect: connectSubstitutes.map((i) => ({ id: i.id })) };
		}
		if (disconnectSubstitutes.length > 0) {
			mutationData.substitutes = { disconnect: disconnectSubstitutes.map((i) => ({ id: i.id })) };
		}
		if (createSubstitutes.length > 0) {
			mutationData.substitutes = { create: createSubstitutes.map((i) => ({ id: i.id })) };
		}
		if (deleteSubstitutes.length > 0) {
			mutationData.substitutes = { delete: deleteSubstitutes.map((i) => ({ id: i.id })) };
		}

		saveIngredientMutation({
			variables: {
				data: mutationData,
				where: { id: ing.id },
			},
		});
	}

	return state;
};

export default reducer;
