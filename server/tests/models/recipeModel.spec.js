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

describe('Recipe Class ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'recipes' ];

		// load presets for each database
		for (let db of databases) {
			let preset;

			try {
				preset = fs.readFileSync(`tests/data/presets/recipeModel_${db}.json`, 'utf8');
			} catch (ex) {
				throw new Error(`Error reading ${db}.json`);
			}

			fs.writeFileSync(`tests/data/${db}.json`, preset, 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${db} preset data`);
			});
		}
	});

	describe('Getters / Setters ============================================='.magenta, function () {
		it.skip('[constructor] should create a new instance of Recipe', function() {
			// TODO
		});

		it.skip('[recipeID] should update with a valid UUID', function() {
			// TODO
		});

		it.skip('[dateCreated] should be read only', function() {
			// TODO
		});

		it.skip('[dateUpdated] should update with a valid datetime', function() {
			// TODO
		});

		it.skip('[title] should update with a valid string', function() {
			// TODO
		});

		it.skip('[source] should update with a valid string', function() {
			// TODO
		});

		it.skip('[image] should update with a valid string for an image path', function() {
			// TODO
		});

		it.skip('[categories] should update with a valid Map with name/id pairs', function() {
			// TODO
		});

		it.skip('[tags] should update with a valid Map with name/id pairs', function() {
			// TODO
		});

		it.skip('[ingredients] TODO', function() {
			// TODO
		});

		it.skip('[instructions] TODO', function() {
			// TODO
		});
	});

	describe('Recipe Methods ============================================='.magenta, function () {
		it.skip('[getRecipe] should return a Recipe object', function() {
			// TODO
		});

		it.skip('[encodeRecipe] should encode the Recipe object into writeable JSON', function() {
			// TODO
		});

		it.skip('[saveRecipe] should write the Recipe to the database', function() {
			// TODO
		});

		it.skip('[addCategory] should add a valid string and UUID pair to the categories Map', function() {
			// TODO
		});

		it.skip('[removeCategory] should remove a matching string and UUID pair from the categories Map', function() {
			// TODO
		});

		it.skip('[addTag] should add a valid string and UUID pair to the tags Map', function() {
			// TODO
		});

		it.skip('[removeTag]should remove a matching string and UUID pair from the tags Map', function() {
			// TODO
		});

		it.skip('[addIngredient] TODO', function() {
			// TODO
		});

		it.skip('[removeIngredient] TODO', function() {
			// TODO
		});

		it.skip('[addInstruction] TODO', function() {
			// TODO
		});

		it.skip('[removeInstruction] TODO', function() {
			// TODO
		});
	});
});