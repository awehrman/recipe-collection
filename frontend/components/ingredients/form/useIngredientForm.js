import { Map as ImmutableMap, List as ImmutableList } from 'immutable';
import { useCallback, useReducer } from 'react';

import useValidation from './useValidation';
import { defaultListActions, defaultProperties } from './constants';
import { reducer as ingredientReducer, actions } from '../../../reducers/ingredient';

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
			inputFields: {
				alternateNames: '',
				relatedIngredients: '',
				substitutes: '',
			},
			listActions: { ...defaultListActions },
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

	const { errors } = validation;

	function handleFormLoad({ ingredient }) {
		dispatch({
			type: actions.loadIngredient,
			payload: { data: { ingredient } },
		});
	}

	const handleIngredientChange = useCallback((e, passedFieldName = null, passedValue = null) => {
		const { target: { value, name: fieldName } } = e;
		e.stopPropagation();

		dispatch({
			type: actions.updateIngredient,
			payload: {
				fieldName: (passedFieldName || fieldName),
				value: ((passedValue !== null) ? passedValue : value),
			},
		});
	}, [ 'dispatch' ]);

	function handleIngredientSave(saveIngredientMutation) {
		// TODO since i have the validation throttled, it's theoretically possible to submit this without
		// going thru the most up-to-date validation; i should come back to this and manually re-trigger that here
		if (!errors.size) {
			// if there aren't any blocking changes then dispatch
			dispatch({
				type: actions.saveIngredient,
				payload: { saveIngredientMutation },
			});
		}
	}

	function restoreForm() {
		dispatch({ type: actions.resetIngredient });
	}

	const handleListChange = useCallback((type, listItem, fieldName) => {
		dispatch({
			type: actions.updateIngredient,
			payload: {
				fieldName,
				listAction: type,
				value: listItem,
			},
		});
	}, [ 'dispatch' ]);

	return {
		clearValidation,
		handleFormLoad,
		handleIngredientChange,
		handleIngredientSave,
		handleListChange,
		restoreForm,
		// TODO i get duplicate re-renders on empty errors
		validation, // form specific errors
		validationMessages, // list of current warning messages
		values, // form values
	};
}

export default useIngredientForm;
