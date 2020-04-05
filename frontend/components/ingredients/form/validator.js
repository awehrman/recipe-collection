import { fromJS } from 'immutable';

const validate = (fieldName = '', value = '', ingredient) => {
	const errors = {};
	const warnings = {};

	// clear out existing errors and warnings for this field
	if (errors[fieldName]) delete errors[fieldName];
	else if (warnings[fieldName]) delete warnings[fieldName];

	// if this value is used on another of this ingredient field (i.e. name and plural are the same)
	const clean = (v) => (typeof v === 'string') && !!v.length && v.toLowerCase().trim();
	const matchesOnName = (v) => ((fieldName !== 'name') && Boolean(clean(v) === clean(ingredient.get('name'))));
	const matchesOnPlural = (v) => ((fieldName !== 'plural') && Boolean(clean(v) === clean(ingredient.get('plural'))));
	console.log(ingredient.toJS().name, ingredient.toJS().plural);
	// TODO const matchesOnAlt = (v) => Boolean(state.alternateNames.find((n) => clean(v) === clean(n.name)));
	// eslint-disable-next-line object-curly-newline
	console.log('validate', { fieldName, value });

	if (value.length && (matchesOnName(value) || matchesOnPlural(value) /* || matchesOnAlt(value) */)) { // TODO update temp value with actual search
		// add error
		errors[fieldName] = `"${ value }" is already used on this ingredient.`;
		console.log({ errors });
	}

	// if this value is used on another ingredient then add a warning that it will trigger a merge
	if (value.length && (value === 'bread')) { // TODO update temp value with actual search
		// add warnings
		warnings[fieldName] = `"${ value }" is used on another ingredient.`;
		console.log({ warnings });
	}

	// otherwise update our warnings
	return {
		errors: fromJS(errors),
		warnings: fromJS(warnings),
	};
};

export default validate;
