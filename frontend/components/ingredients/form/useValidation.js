import { Map as ImmutableMap } from 'immutable';
import throttle from 'lodash/throttle';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { reducer as validationReducer, actions } from '../../../reducers/validation/ingredient';

function useValidation({ values }) {
	// console.log('>> >> >> useValidation', values);
	const { ingredient, reset } = values; // ImmutableMaps
	const initialState = () => ({
		errors: ImmutableMap({}),
		warnings: ImmutableMap({}),
	});

	const [ validation, dispatch ] = useReducer(validationReducer, initialState());

	// current state variables
	const name = ingredient.get('name');

	const throttledValidation = useRef(
		throttle(
			(fieldName, value) => dispatch({
				type: actions.validate,
				payload: {
					// TODO ingredients, // gonna need to feed a validation source
					fieldName,
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
		if (value && isNewValue) return throttledValidation.current(fieldName, value);
		return dispatch();
	};

	// watch for input changes and validate every soften
	useEffect(handleValidation('name', name), [ name ]);
	// useEffect(handleValidation('plural'), [state.ingredient]);
	// TODO useEffect(handleValidation('alternateNames'), [ state.ingredient || [] ]);


	return { validation }; // errors and warnings
}

export default useValidation;
