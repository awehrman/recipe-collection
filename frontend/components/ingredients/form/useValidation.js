import throttle from 'lodash/throttle';
import { useContext, useEffect, useReducer, useRef } from 'react';
import { reducer as validationReducer, actions } from '../../../reducers/validation/ingredient';
import ValidationContext from '../../../lib/contexts/ingredients/validationContext';
import { noValidationMessages, noValidationWarnings } from './constants';

function useValidation({ currentIngredientState, values }) {
	// console.log('>> >> >> useValidation', { currentIngredientState: currentIngredientState.toJS() });
	const { ingredient, reset } = values; // ImmutableMaps
	const validationList = useContext(ValidationContext);

	const [ validation, dispatch ] = useReducer(validationReducer, noValidationWarnings);
	const { errors, warnings } = validation;
	const validationMessages = Object.values({
		...errors.toJS(),
		...warnings.toJS(),
	});

	// current state variables
	const name = ingredient.get('name');
	const plural = ingredient.get('plural');
	// const alternateNames = ingredient.get('alternateNames');

	const throttledValidation = useRef(
		throttle(
			(fieldName, ing, list, value) => dispatch({
				type: actions.validate,
				payload: {
					fieldName,
					ingredient: ing,
					validationList: list,
					value,
				},
			}),
			1000,
		),
	);

	const handleValidation = (fieldName, value) => () => {
		// const altListHasSize = (fieldName === 'alternateNames') ? Boolean(value.size) : true;
		const originalValue = reset && reset.get(fieldName);
		const isNewValue = (originalValue) ? Boolean(originalValue !== value) : true;
		if (value && isNewValue) return throttledValidation.current(fieldName, currentIngredientState, validationList, value);
		return dispatch();
	};

	// watch for input changes and validate every soften
	useEffect(handleValidation('name', name), [ name ]);
	useEffect(handleValidation('plural', plural), [ plural ]);
	// TODO useEffect(handleValidation('alternateNames'), [ state.ingredient || [] ]);

	function clearValidation() {
		dispatch({ type: actions.clearValidation });
	}

	return {
		clearValidation,
		validation: (!validationMessages.length) ? noValidationWarnings : validation,
		validationMessages: (!validationMessages.length) ? noValidationMessages : validationMessages, // idk maybe memoize this still?
	};
}

export default useValidation;
