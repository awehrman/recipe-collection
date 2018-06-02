const fs = require('fs');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

exports.loadErrors = () => {
	let errors = [];

	// load errors from flat file
	try {
		errors = JSON.parse(fs.readFileSync(`${DB_PATH}/errors.json`, 'utf8'));
	} catch (ex) {
		throw new Error('Error reading errors.json');
	}

	return errors;
};

exports.loadIngredients = (isEncodeObject = false) => {
	// this is purely to avoid a circular dependency
	// TODO this is probably a code smell so look into better patterns
	const Ingredient = require('../models/ingredientModel');

	let ingredients = [];

	// load ingredients from flat file
	try {
		ingredients = JSON.parse(fs.readFileSync(`${DB_PATH}/ingredients.json`, 'utf8'));
	} catch (ex) {
		throw new Error('Error reading ingredients.json');
	}

	if (!isEncodeObject) {
		ingredients = ingredients.map(ing => new Ingredient(ing));
	}

	return ingredients;
};

exports.findIngredients = (key = null, value = null) => {
	let ingredients = this.loadIngredients();

	// possible keys to filter search by
	const searchExpressions = {
		// lookup by ingredientID
		ingredientID: () => ingredients.filter(i => i.ingredientID === value),

		// lookup by name
		name: () => ingredients.filter(i => i.name === value),

		// lookup by any exact matches on all fields
		exact: () => ingredients.filter(i =>
			i.name === value
			|| i.plural === value
			|| i.alternateNames.has(value)
			|| i.parsingExpressions.has(value)),

		// lookup by any partial mathces on all fields
		partial: () => ingredients.filter(i =>
			i.name.includes(value)
			|| (i.plural && i.plural.includes(value))
			|| [ ...i.alternateNames ].find(n => n.includes(value))
			|| [ ...i.parsingExpressions ].find(n => n.includes(value))),

		// lookup all ingredients connected by the name or ingredientID provided
		related: () => ingredients.filter(i => {
			// match directly on name or ID
			if (i.name === value) { return true; }
			if (i.ingredientID === value) { return true; }
			// find any matches linked within
			const related = [ ...i.relatedIngredients].filter(n => n[0] === value || n[1] === value);
			if (related.length > 0) { return true; }
			return false;
		})
	};

	if (key !== null && value !== null) {
		return searchExpressions[key]();
	}

	return ingredients;
};
