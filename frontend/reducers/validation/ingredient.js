// import { Map as ImmutableMap } from 'immutable';
// import validate from '../../components/ingredients/form/validator';

export const actions = {
	validate: 'VALIDATE_INGREDIENT',
	//
};

export const reducer = (state, action) => {
	if (!action) return state;
	const { payload, type } = action || {};
	const { fieldName, value } = payload || {};
	console.log('>>> VALIDATION reducer', payload, type);

	if (type === actions.validate) {
		console.log('VALIDATING!!', fieldName, value);
		// TODO
	}


	return state;
};

export default reducer;
