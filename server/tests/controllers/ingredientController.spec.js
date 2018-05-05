const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const colors = require('colors');
const expect = require('chai').expect;
const fs = require('fs');
const moment = require('moment');

const server = require('../../app');
const Ingredient = require('../../models/ingredientModel');
const ingredientController = require('../../controllers/ingredientController');

/*
		// populating preset data
		// NOTE: this is going to generate new IDs everytime so if you re-run you're going to have to update the
		// ingredientIDs in the tests below

		let ing1 = new Ingredient('potato');
		ing1.plural = 'potatoes';

		let ing2 = new Ingredient('flour');
		let ing3 = new Ingredient('bread flour');

		ing2.properties = { 'gluten': true };
		ing2.alternateNames = new Set(['all-purpose flour']);
		ing2.parsingExpressions = new Set(['flour for dusting']);

		let ing2Map = new Map();
		ing2Map.set(ing3.name, ing3.ingredientID);

		let ing3Map = new Map();
		ing3Map.set(ing2.name, ing2.ingredientID);

		ing2.relatedIngredients = ing2Map;
		ing3.relatedIngredients = ing3Map;
		ing3.properties = { 'gluten': true };

		// encode maps/sets to arrays for storing

		let db = [];
		db.push(ing1.encodeIngredient());
		db.push(ing2.encodeIngredient());
		db.push(ing3.encodeIngredient());

		fs.writeFileSync(`tests/data/presets/ingredientController_ingredients.json`, `[\n${db}\n]`, 'utf-8', (err) => {
			if (err) throw new Error(`An error occurred while writing ${db} preset data`);
		});
*/

describe('Ingredient Controller ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'ingredients' ];

		// load presets for each database
		for (let db of databases) {
			let preset;

			try {
				preset = fs.readFileSync(`tests/data/presets/ingredientController_${db}.json`, 'utf8');
			} catch (ex) {
				throw new Error(`Error reading ${db}.json`);
			}

			fs.writeFileSync(`tests/data/${db}.json`, preset, 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${db} preset data`);
			});
		}
	});

	describe('Ingredient Methods ============================================='.magenta, function () {
		it('[loadIngredients] should return an array of Ingredient objects', function() {
			let ingredients = ingredientController.loadIngredients();
			for (let ing of ingredients) {
				expect(typeof ing === 'object').to.be.true;
			}
		});

		it('[findIngredients] should return an array of ingredients matching the search key and value', function() {
			let ingredients = [];

			// should return all ingredients
			ingredients = ingredientController.findIngredients();
			expect(ingredients.length).to.equal(3);
			ingredients = [];

			// exact match on ingredientID
			ingredients = ingredientController.findIngredients('ingredientID', '0eef23d0-3f35-11e8-9692-3d22a379ab33');
			expect(ingredients[0].ingredientID === '0eef23d0-3f35-11e8-9692-3d22a379ab33');
			expect(ingredients.length).to.equal(1);
			ingredients = [];

			// exact match on ingredientID with no results
			ingredients = ingredientController.findIngredients('ingredientID', '11111111-3f35-11e8-9692-3d22a379ab33');
			expect(ingredients.length).to.equal(0);
			ingredients = [];

			// exact match on name
			ingredients = ingredientController.findIngredients('name', 'potato');
			expect(ingredients.length).to.equal(1);
			expect(ingredients[0].name).to.equal('potato');
			ingredients = [];

			// exact match on name with no results
			ingredients = ingredientController.findIngredients('name', 'apple');
			expect(ingredients.length).to.equal(0);
			ingredients = [];

			// exact match on name
			ingredients = ingredientController.findIngredients('exact', 'flour');
			expect(ingredients.length).to.equal(1);
			expect(ingredients[0].name).to.equal('flour');
			ingredients = [];

			// exact match on plural
			ingredients = ingredientController.findIngredients('exact', 'potatoes');
			expect(ingredients.length).to.equal(1);
			expect(ingredients[0].plural).to.equal('potatoes');
			ingredients = [];

			// exact match on alternateNames
			ingredients = ingredientController.findIngredients('exact', 'all-purpose flour');
			expect(ingredients.length).to.equal(1);
			expect(ingredients[0].alternateNames.has('all-purpose flour')).to.be.true;
			ingredients = [];

			// exact match on parsingExpressions
			ingredients = ingredientController.findIngredients('exact', 'flour for dusting');
			expect(ingredients.length).to.equal(1);
			expect(ingredients[0].parsingExpressions.has('flour for dusting')).to.be.true;
			ingredients = [];

			// exact match with no results
			ingredients = ingredientController.findIngredients('exact', 'apple');
			expect(ingredients.length).to.equal(0);
			ingredients = [];

			// loose match on name, plural, alternateNames, parsingExpressions
			ingredients = ingredientController.findIngredients('partial', 'flour');
			expect(ingredients.length).to.equal(2);
			ingredients = [];

			// loose match with no results
			ingredients = ingredientController.findIngredients('partial', 'apple');
			expect(ingredients.length).to.equal(0);
			ingredients = [];

			// related ingredients by ingredientID
			ingredients = ingredientController.findIngredients('related', '0eef4ae0-3f35-11e8-9692-3d22a379ab33');
			expect(ingredients.length).to.equal(2);
			ingredients = [];

			// related ingredients by name
			ingredients = ingredientController.findIngredients('related', 'flour');
			expect(ingredients.length).to.equal(2);
			ingredients = [];

			// exact match with no results
			ingredients = ingredientController.findIngredients('related', 'apple');
			expect(ingredients.length).to.equal(0);
			ingredients = [];
		});

	});
});