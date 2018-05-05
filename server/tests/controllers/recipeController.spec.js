const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const colors = require('colors');
const expect = require('chai').expect;
const fs = require('fs');
const moment = require('moment');

const server = require('../../app');
const Recipe = require('../../models/recipeModel');
const recipeController = require('../../controllers/recipeController');

describe('Recipe Controller ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'recipes' ];

		// load presets for each database
		for (let db of databases) {
			let preset;

			try {
				preset = fs.readFileSync(`tests/data/presets/recipeController_${db}.json`, 'utf8');
			} catch (ex) {
				throw new Error(`Error reading ${db}.json`);
			}

			fs.writeFileSync(`tests/data/${db}.json`, preset, 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${db} preset data`);
			});
		}
	});

	describe('Recipe Methods ============================================='.magenta, function () {
		it.skip('[loadRecipes] should return an array of Recipe objects', function() {
			// TODO
		});

		it.skip('[findRecipes] should return an array of recipes matching the search key and value', function() {
			// TODO
		});
	});
});