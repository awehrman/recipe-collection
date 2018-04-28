const fs = require('fs');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

exports.loadRecipes = () => {
	// this is purely to avoid a circular dependency
	// TODO this is probably a code smell so look into better patterns
	const Recipe = require('../models/recipeModel');

	let recipes = [];
	const converted = [];

	// load recipes from flat file
	try {
		recipes = JSON.parse(fs.readFileSync(`${DB_PATH}/recipes.json`, 'utf8'));
	} catch (ex) {
		throw new Error('Error reading recipes.json');
	}

	for (let rp of recipes) {
		// convert 'encoded' recipe to Recipe object
		converted.push(new Recipe(rp));
	}

	return converted;
}

exports.findRecipes = (key = null, value = null) => {
	let recipes = this.loadRecipes();

	// possible keys to filter search by
	const searchExpressions = {
		// lookup by recipeID
		recipeID: () => recipes.filter(i => i.recipeID === value)

		// TODO extend this
	};

	if (key !== null && value !== null) {
		return searchExpressions[key]();
	}

	return recipes;
};

