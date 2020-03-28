import throttle from 'lodash/throttle';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { actions, initialState, reducer } from '../../../reducers/ingredient';
import IngredientsContext from '../../../lib/contexts/ingredientsContext';

const useIngredientForm = ({ id, name }) => {
	const [ state, dispatch ] = useReducer(reducer, initialState(id, name));
	const { view } = useContext(IngredientsContext);
	// if we're in the newly imported ingredient view, start the user off in edit mode
	const [ isEditMode, setEditMode ] = useState(Boolean(view === 'new'));
	const [ isSubmitting, setIsSubmitting ] = useState(false);
	const resetValidation = {
		errors: {},
		warnings: {},
	};
	const [ validationWarnings, setValidationWarnings ] = useState(resetValidation);
	/*
		errors: {
			name: '"anchovies" is already assigned on this ingredient.',
			plural: '"anchovies" is already assigned on this ingredient.',
		}
	*/

	const validate = (fieldName = '', value = '') => {
		console.log('validate!', fieldName, value);
		const { errors, warnings } = validationWarnings;
		const updatedErrors = { ...errors };
		const updatedWarnings = { ...warnings };

		// clear out existing errors and warnings for this field
		if (updatedErrors[fieldName]) delete updatedErrors[fieldName];
		else if (updatedWarnings[fieldName]) delete updatedWarnings[fieldName];

		// if this value is used on another of this ingredient field (i.e. name and plural are the same)
		if (value.length && (value === 'anchovies')) { // TODO update temp value with actual search
			// add error
			updatedErrors[fieldName] = `"${ value }" is already used on this ingredient.`;
		}

		// if this value is used on another ingredient then add a warning that it will trigger a merge
		if (value.length && (value === 'bread')) { // TODO update temp value with actual search
			// add warnings
			updatedWarnings[fieldName] = `"${ value }" is used on another ingredient.`;
		}

		/* TODO right now this is causing re-renders, but at least the validation is keeping up
			 i need to spend some time on this
		const isSameError = (JSON.stringify(errors) === JSON.stringify(updatedErrors));
		const isSameWarning = (JSON.stringify(warnings) === JSON.stringify(updatedWarnings));
		if (isSameError && isSameWarning) {
			console.log('A');
			// if nothing has changed just return an empty function
			return () => {};
		}
		*/

		// otherwise update our warnings
		return setValidationWarnings({
			errors: updatedErrors,
			warnings: updatedWarnings,
		});
	};

	const throttledValidation = useRef(
		throttle(
			(fieldName, value) => validate(fieldName, value),
			1000,
		),
	);

	const handleValidation = (fieldName) => () => {
		const value = state[fieldName] || '';
		const { reset } = state;
		if (value && reset) return throttledValidation.current(fieldName, value);
		return setValidationWarnings(resetValidation);
	};

	// watch for input changes and validate every soften
	useEffect(handleValidation('name'), [ state.name ]);
	useEffect(handleValidation('plural'), [ state.plural ]);
	useEffect(handleValidation('alternateNames'), [ state.alternateNames ]);

	const onCancelClick = (e) => {
		e.persist();
		setEditMode(false);
		dispatch({ type: actions.resetIngredient });
	};

	// TODO useCallback?
	const onChange = (e) => {
		e.persist();
		const { target: { value, name: fieldName } } = e;

		dispatch({
			type: actions.updateIngredient,
			payload: {
				fieldName,
				value,
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
		setValidationWarnings,
		state,
		validationWarnings,
	};
};

export default useIngredientForm;
