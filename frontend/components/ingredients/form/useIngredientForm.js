import throttle from 'lodash/throttle';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { actions, getInitialState, reducer } from '../../../reducers/ingredient';
import IngredientsContext from '../../../lib/contexts/ingredientsContext';

const useIngredientForm = ({ id, name }) => {
	const [ state, dispatch ] = useReducer(reducer, getInitialState(id, name));
	const { view } = useContext(IngredientsContext);
	// if we're in the newly imported ingredient view, start the user off in edit mode
	const [ isEditMode, setEditMode ] = useState(Boolean(view === 'new'));
	const [ isSubmitting, setIsSubmitting ] = useState(false);

	const throttledValidation = useRef(
		throttle(
			(fieldName, value) => dispatch({
				type: actions.validateIngredient,
				payload: {
					fieldName,
					value,
				},
			}),
			1000,
		),
	);

	const handleValidation = (fieldName) => () => {
		const value = state.ingredient.get(fieldName) || '';
		const { reset } = state;
		// const altListHasSize = (fieldName === 'alternateNames') ? Boolean(value.size) : true;
		const isNotResetValue = (reset && reset.get(fieldName)) ? Boolean(reset.get(fieldName) !== value) : true;
		if (value && isNotResetValue) return throttledValidation.current(fieldName, value);
		return dispatch();
	};

	// watch for input changes and validate every soften
	useEffect(handleValidation('name'), [ state.ingredient ]);
	useEffect(handleValidation('plural'), [ state.ingredient ]);
	// TODO useEffect(handleValidation('alternateNames'), [ state.ingredient || [] ]);

	const onCancelClick = (e) => {
		e.persist();
		setEditMode(false);
		dispatch({ type: actions.resetIngredient });
	};

	const onChange = (e, passedFieldName = null, passedValue = null) => {
		e.persist();
		const { target: { value, name: fieldName } } = e;

		dispatch({
			type: actions.updateIngredient,
			payload: {
				fieldName: (passedFieldName || fieldName),
				value: (passedValue || value),
			},
		});
	};

	const onSubmit = (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		dispatch({ type: actions.saveIngredient });
	};

	return {
		dispatch,
		isEditMode,
		isSubmitting,
		onCancelClick,
		onChange,
		onSubmit,
		setEditMode,
		setIsSubmitting,
		state,
	};
};

export default useIngredientForm;
