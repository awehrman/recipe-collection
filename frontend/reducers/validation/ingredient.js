import validate from '../../components/ingredients/form/validator';
import { noValidationWarnings } from '../../components/ingredients/form/constants';

export const actions = {
	clearValidation: 'CLEAR_VALIDATION',
	validate: 'VALIDATE_INGREDIENT',
};

export const reducer = (state, action) => {
	if (!action) return state;
	const { payload, type } = action || {};
	const { fieldName, ingredient, validationList, value } = payload || {};

	if (type === actions.clearValidation) {
		console.log('#########', { noValidationWarnings });
		return noValidationWarnings;
	}

	if (type === actions.validate) {
		const validation = validate(fieldName, value, ingredient, validationList);
		return validation;
	}

	return state;
};

export default reducer;
