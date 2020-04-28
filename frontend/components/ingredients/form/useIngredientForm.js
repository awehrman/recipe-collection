import { Map as ImmutableMap, List as ImmutableList } from 'immutable';
import { useCallback, useReducer } from 'react';

import useValidation from './useValidation';
import { reducer as ingredientReducer, actions } from '../../../reducers/ingredient';

// TODO move these into a constants file
const defaultProperties = ImmutableMap({
	meat: false,
	poultry: false,
	fish: false,
	dairy: false,
	soy: false,
	gluten: false,
});

function useIngredientForm({ id }) {
	// console.log('>> >> >> useIngredientForm');
	const initialState = () => {
		const ingredient = ImmutableMap({
			alternateNames: ImmutableList(),
			id,
			isComposedIngredient: false,
			isValidated: false,
			name: null,
			parent: null,
			plural: null,
			properties: defaultProperties,
			references: ImmutableList(),
		});

		return {
			ingredient,
			reset: ingredient,
		};
	};

	// setup form reducer calls
	const [ values, dispatch ] = useReducer(ingredientReducer, initialState());

	// setup form validation
	const {
		clearValidation,
		validation,
		validationMessages,
	} = useValidation({
		currentIngredientState: values.ingredient,
		values,
	});

	function handleFormLoad({ ingredient }) {
		console.log('  >> handleFormLoad', ingredient);
		dispatch({
			type: actions.loadIngredient,
			payload: { data: { ingredient } },
		});
	}

	const handleIngredientChange = useCallback((e, passedFieldName = null, passedValue = null) => {
		e.persist();
		const { target: { value, name: fieldName } } = e;

		dispatch({
			type: actions.updateIngredient,
			payload: {
				fieldName: (passedFieldName || fieldName),
				value: (passedValue || value),
			},
		});
	}, [ 'dispatch' ]);

	function handleIngredientSave() {
		console.log('  >> handleIngredientSave');

		dispatch({ type: actions.saveIngredient });
	}

	function handleQueryError() {
		console.log('  >> handleQueryError');
		// TODO
	}

	return {
		clearValidation,
		handleFormLoad,
		handleIngredientChange,
		handleIngredientSave,
		handleQueryError,
		// TODO i get duplicate re-renders on empty errors
		validation, // form specific errors
		validationMessages, // list of current warning messages
		values, // form values
	};
}

export default useIngredientForm;
