const fs = require('fs');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

exports.loadCategories = () => {
	// this is purely to avoid a circular dependency
	// TODO this is probably a code smell so look into better patterns
	const Category = require('../models/categoryModel');

	let categories = [];
	const converted = [];

	// load categories from flat file
	try {
		categories = JSON.parse(fs.readFileSync(`${DB_PATH}/categories.json`, 'utf8'));
	} catch (ex) {
		throw new Error('Error reading categories.json');
	}

	for (let cat of categories) {
		// convert 'encoded' ingredient to Ingredient object
		converted.push(new Category(cat));
	}

	return converted;
};

exports.findCategories = (key = null, value = null) => {
	let categories = this.loadCategories();

	// possible keys to filter search by
	const searchExpressions = {
		// lookup by categoryID
		categoryID: () => categories.filter(i => i.categoryID === value),

		// lookup by evernoteGUID
		evernoteGUID: () => categories.filter(i => i.evernoteGUID === value),

		// lookup by name
		name: () => categories.filter(i => i.name === value)
		// TODO add in category relations to search by child/parent categories
	};

	if (key !== null && value !== null) {
		return searchExpressions[key]();
	}

	return categories;
};
