import { Map as ImmutableMap } from 'immutable';
import throttle from 'lodash/throttle';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { reducer as validationReducer, actions } from '../../../reducers/validation/ingredient';

function useValidation({ ingredient, reset }) {
	console.log('>> >> >> useValidation');
	const initialState = () => ({
		errors: ImmutableMap({}),
		warnings: ImmutableMap({}),
	});

	const [ values, dispatch ] = useReducer(validationReducer, initialState());

	// current state variables
	const name = ingredient.get('name');

	const throttledValidation = useRef(
		throttle(
			(fieldName, value) => dispatch({
				type: actions.validate,
				payload: {
					// TODO ingredients,
					fieldName,
					value,
				},
			}),
			1000,
		),
	);

	const handleValidation = (fieldName, value) => () => {
		// const altListHasSize = (fieldName === 'alternateNames') ? Boolean(value.size) : true;
		const isNotResetValue = (reset && reset.get(fieldName)) ? Boolean(reset.get(fieldName) !== value) : true;
		if (value && isNotResetValue) return throttledValidation.current(fieldName, value);
		return dispatch();
	};

	// watch for input changes and validate every soften
	useEffect(() => {
		console.log('useEffect', name);
		handleValidation('name', name);
	}, [ name ]);
	// useEffect(handleValidation('plural'), [state.ingredient]);
	// TODO useEffect(handleValidation('alternateNames'), [ state.ingredient || [] ]);

	function handleFormLoad({ ing }) {
		console.log('  >> handleFormLoad');
		dispatch({
			type: actions.loadIngredient,
			payload: { data: { ingredient: ing } },
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
	}, ['dispatch']);

	function handleIngredientSave() {
		console.log('  >> handleIngredientSave');

		dispatch({ type: actions.saveIngredient });
	}

	function handleQueryError() {
		console.log('  >> handleQueryError');
		// TODO
	}

	return {
		handleFormLoad,
		handleIngredientChange,
		handleIngredientSave,
		handleQueryError,
		// validation: {}, // form errors
		values, // form values
	};
}

export default useValidation;
