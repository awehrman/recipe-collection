/*
import pluralize from 'pluralize';

export const determinePluralization = (value) => {
	// determine pluralization
	let name = pluralize.isSingular(value) ? value : null;
	let plural = pluralize.isPlural(value) ? value : null;

	if (!name) {
		// attempt to pluralize the ingredient name
		try {
			name = pluralize.singular(value);
		} catch (err) {
			name = value; // just use n otherwise;
		}
	}

	if (!plural) {
		// attempt to pluralize the ingredient name
		try {
			plural = pluralize.plural(value);
		} catch (err) {
			//
		}
	}

	plural = (plural === name) ? null : plural;

	return {
		name,
		plural,
	};
};

export default { determinePluralization };
*/
