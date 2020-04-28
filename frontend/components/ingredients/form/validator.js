import { fromJS, Map as ImmutableMap } from 'immutable';

const noErrors = ImmutableMap();
const noWarnings = ImmutableMap();

const validate = (fieldName = '', value = '', ingredient = ImmutableMap(), validationList = []) => {
	// console.log('VALIDATE', { fieldName, value, ingredient: ingredient.toJS(), validationList });
	const errors = {};
	const warnings = {};

	// clear out existing errors and warnings for this field
	if (errors[fieldName]) delete errors[fieldName];
	else if (warnings[fieldName]) delete warnings[fieldName];

	// if this value is used on another of this ingredient field (i.e. name and plural are the same)
	const clean = (v) => (typeof v === 'string') && !!v.length && v.toLowerCase().trim();
	const matchesOnName = (v) => ((fieldName !== 'name') && Boolean(clean(v) === clean(ingredient.get('name'))));
	const matchesOnPlural = (v) => ((fieldName !== 'plural') && Boolean(clean(v) === clean(ingredient.get('plural'))));
	// TODO const matchesOnAlt = (v) => Boolean(state.alternateNames.find((n) => clean(v) === clean(n.name))); TODO validate altNames

	if (value.length && (matchesOnName(value) || matchesOnPlural(value) /* || matchesOnAlt(value) */)) { // TODO update temp value with actual search
		// add error
		errors[fieldName] = `"${ value }" is already used on this ingredient.`;
	} else if (value.length && validationList.find((i) => clean(i) === clean(value))) { // TODO update temp value with actual search
		// if this value is used on another ingredient then add a warning that it will trigger a merge
		// see if this value is used on any other ingredients

		// add warnings
		warnings[fieldName] = `"${ value }" is used on another ingredient.`;
	}

	// otherwise update our warnings
	return {
		errors: (Object.values(errors).length) ? fromJS(errors) : noErrors,
		warnings: (Object.values(warnings).length) ? fromJS(warnings) : noWarnings,
	};
};

export default validate;
