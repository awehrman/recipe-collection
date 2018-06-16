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
const recipeController = require('../../controllers/recipeController');

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

describe.only('Ingredient Controller ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'equipment', 'errors', 'ingredients', 'recipes' ];

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
		it.skip('[saveIngredient] should update the ingredient based on its ingredient, parent, and error values', function() {

		});
	});

	describe('Ingredient Methods ============================================='.magenta, function () {
		it('[findIngredient] should return a matching Ingredient object or null', function() {
			// no matches should return null
			let ing = ingredientController.findIngredient('name', 'apple');
			expect(ing).to.be.null;			

			// singular match by ingredient ID should return an Ingredient
			ing = ingredientController.findIngredient('ingredientID', '0eef23d0-3f35-11e8-9692-3d22a379ab33');
			expect(ing.name).to.equal('potato');

			// singular match by name should return an Ingredient
			ing = ingredientController.findIngredient('name', 'potato');
			expect(ing.name).to.equal('potato');
		});

		it('[findIngredients] should return an array of ingredients matching the search key and value', function() {
			let ingredients = [];

			// should return all ingredients
			ingredients = ingredientController.findIngredients();
			expect(ingredients.length > 0).to.be.true;
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
			expect(ingredients.length).to.equal(4); // some of this has changed with more data
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

		it('[loadErrors] should return an array of ingredient errors', function() {
			const errors = ingredientController.loadErrors();

			for (let ing of errors) {
				expect(typeof ing === 'object').to.be.true;
			}
		});

		it('[loadIngredients] should return an array of Ingredient objects', function() {
			const ingredients = ingredientController.loadIngredients();
			for (let ing of ingredients) {
				expect(typeof ing === 'object').to.be.true;
			}
		});

		it('[saveError] should save an ingredient error', function() {
			// [ 'parsing', 'data', 'semantic', 'instruction', 'equipment' ]
			let errors = ingredientController.loadErrors();
			let count = errors.length;
			let associated, associatedMatch, ing, match, name, ref, rp, recipeID, type;

			// # passing an invalid error param should through an error
			expect(() => ingredientController.saveError()).to.throw('Invalid error parameter passed to saveError');
			expect(() => ingredientController.saveError(1)).to.throw('Invalid error parameter passed to saveError');
			expect(() => ingredientController.saveError('123')).to.throw('Invalid error parameter passed to saveError');
			expect(() => ingredientController.saveError(null)).to.throw('Invalid error parameter passed to saveError');

			// # optional associated, required type
			expect(() => ingredientController.saveError({})).to.throw('Invalid error parameter passed to saveError');

			// # passing no ingredient param should throw an error
			expect(() => ingredientController.saveError({ type: 'data' })).to.throw('Invalid ingredient parameter passed to saveError');
			expect(() => ingredientController.saveError({ type: 'data' }, null)).to.throw('Invalid ingredient parameter passed to saveError');
			expect(() => ingredientController.saveError({ type: 'data' }, 1)).to.throw('Invalid ingredient parameter passed to saveError');
			expect(() => ingredientController.saveError({ type: 'data' }, 'apple')).to.throw('Invalid ingredient parameter passed to saveError');

			const expectErrorIncrease = (count, match, name, recipeID, ref, type) => {
				// expect the error count to increase by 1
				errors = ingredientController.loadErrors();
				expect(errors.length).to.be.equal(count + 1);

				match = errors.find(e => e.line === ref);
				expect(match).to.exist;
				expect(match.line).to.equal(ref);
				expect(match.recipeID).to.equal(recipeID);
				expect(match.type).to.equal(type);
				expect(match.value).to.equal(name);
				
				return errors.length;
			}


			// # should accept a parsing error for a new ingredient
			// ... setup the ingredient with the unparsable line
			name = '3cups';
			ref = '3cups';
			recipeID = "db0fc1c0-6fca-11e8-bea9-bb0c411e990f"
			type = 'parsing';

			ing = new Ingredient(ref);
			ing.addReference(ref, recipeID);
			expect(ing.references.size).to.equal(1);

			ingredientController.saveError({ type: type }, ing.encodeIngredient());

			// ... expect our error count to increase and this line to be logged
			count = expectErrorIncrease(count, match, name, recipeID, ref, type);



			// # should accept an DATA error for an existing ingredient
			// ... setup
			name = 'for sprinkling';
			ref = 'for sprinkling:';
			recipeID = "5f3d93e0-717a-11e8-acd0-d7ee6bf24d37"
			type = 'data';

			ing = ingredientController.findIngredient('name', name);
			expect(ing).to.exist;

			ingredientController.saveError({ type: type }, ing.encodeIngredient());

			// ... expect our error count to increase and this line to be logged
			count = expectErrorIncrease(count, match, name, recipeID, ref, type);

			// ... expect any connected recipes to remove this line from the ingredient lines
			rp = recipeController.findRecipe('recipeID', recipeID);
			values = [ ...rp.ingredientLines.values() ];
			values = values.filter(l => l.reference === ref);
			expect(values.length).to.equal(0);

			// ... expect this ingredient to be removed
			ing = ingredientController.findIngredient('name', name);
			expect(ing).to.be.null;



			// # should accept an SEMANTIC error for an existing ingredient 
			//   and an associated ingredient that DOES NOT exist
			// ... setup
			name = 'lamb 1 large';
			ref = 'whole shoulder of lamb 1 large (2.5kg-3kg)';
			recipeID = "e966fb00-7176-11e8-acd0-d7ee6bf24d37"
			type = 'semantic';
			associated = 'lamb';

			ing = ingredientController.findIngredient('name', name);
			expect(ing).to.exist;

			associatedMatch = ingredientController.findIngredient('name', associated);
			expect(associatedMatch).to.not.exist;

			ingredientController.saveError({ associated: [ associated ], type: type }, ing.encodeIngredient());

			// ... expect our error count to increase and this line to be logged
			count = expectErrorIncrease(count, match, name, recipeID, ref, type);

			// ... create the associated ingredient and assign recipeID and reference of ingredient
			associatedMatch = ingredientController.findIngredient('name', associated);
			expect(associatedMatch).to.exist;
			expect(associatedMatch.references.has(ref)).to.equal(true);
			
			// ... expect any connected recipes to
			rp = recipeController.findRecipe('recipeID', recipeID);
			values = [ ...rp.ingredientLines.values() ];
			values = values.filter(l => l.reference === ref);
			// 			- mark this line as unparsed
			// 			- add ingredient association
			expect(values[0].isParsed).to.equal(false);
			expect(values[0].ingredients[0].ingredientID).to.equal(associatedMatch.ingredientID);
	
			// ... expect this ingredient to be removed
			ing = ingredientController.findIngredient('name', 'lamb 1 large');
			expect(ing).to.not.exist;



			// # should accept an SEMANTIC error for an existing ingredient 
			//   and an associated ingredient that DOES exist
			// ... setup
			name = '1 lemon';
			ref = 'Finely grated rind of 1 lemon';
			recipeID = "5f3d93e0-717a-11e8-acd0-d7ee6bf24d37";
			type = 'semantic';
			associated = 'lemon';

			ing = ingredientController.findIngredient('name', name);
			expect(ing).to.exist;

			associatedMatch = ingredientController.findIngredient('name', associated);
			expect(associatedMatch).to.exist;

			ingredientController.saveError({ associated: [ associated ], type: type }, ing.encodeIngredient());

			// ... expect our error count to increase and this line to be logged
			count = expectErrorIncrease(count, match, name, recipeID, ref, type);

			// ... create the associated ingredient and assign recipeID and reference of ingredient
			associatedMatch = ingredientController.findIngredient('name', associated);
			expect(associatedMatch).to.exist;
			//console.log(associatedMatch.references);
			expect(associatedMatch.references.has(ref)).to.equal(true);
			
			// ... expect any connected recipes to
			rp = recipeController.findRecipe('recipeID', recipeID);
			values = [ ...rp.ingredientLines.values() ];
			values = values.filter(l => l.reference === ref);
			// 			- mark this line as unparsed
			// 			- add ingredient association
			expect(values[0].isParsed).to.equal(false);
			expect(values[0].ingredients[0].ingredientID).to.equal(associatedMatch.ingredientID);
	
			// ... expect this ingredient to be removed
			ing = ingredientController.findIngredient('name', 'lamb 1 large');
			expect(ing).to.not.exist;



			// # should accept an INSTRUCTION error
			// ... setup
			name = 'ginger beer';
			ref = "ginger beer should be drank as a step one.";
			recipeID = "e966fb00-7176-11e8-acd0-d7ee6bf24d37";
			type = 'instruction';

			ing = ingredientController.findIngredient('name', name);
			expect(ing).to.exist;

			ingredientController.saveError({ type: type }, ing.encodeIngredient());

			// ... expect our error count to increase and this line to be logged
			count = expectErrorIncrease(count, match, name, recipeID, ref, type);
			
			// ... expect any connected recipes to move this line into the instructions section
			rp = recipeController.findRecipe('recipeID', recipeID);
			values = [ ...rp.ingredientLines.values() ];
			values = values.filter(l => l.reference === ref);
			expect(values.length === 0).to.equal(true);

			values = [ ...rp.instructions.values() ];
			values = values.filter(l => l.reference === ref);
			expect(values.length === 1).to.equal(true);

			// ... expect this ingredient to be removed
			ing = ingredientController.findIngredient('name', name);
			expect(ing).to.not.exist;


			// # should accept an EQUIPMENT error
			// ... setup
			name = 'kitchen string';
			ref = "kitchen string";
			recipeID = "5f3d93e0-717a-11e8-acd0-d7ee6bf24d37";
			type = 'equipment';

			ing = ingredientController.findIngredient('name', name);
			expect(ing).to.exist;

			ingredientController.saveError({ type: type }, ing.encodeIngredient());

			// ... expect our error count to increase and this line to be logged
			count = expectErrorIncrease(count, match, name, recipeID, ref, type);

			// ... expect any connected recipes to remove this line
			rp = recipeController.findRecipe('recipeID', recipeID);
			values = [ ...rp.ingredientLines.values() ];
			values = values.filter(l => l.reference === ref);
			expect(values.length).to.equal(0);

			// ... expect this ingredient to be removed
			ing = ingredientController.findIngredient('name', name);
			expect(ing).to.not.exist;

			// ... expect this equipment item to be added to db
			// TODO

			// # TODO should accept a SEMANTIC error with a grammar addition
			// ex: 6 wt oz tomato puree - add 'wt oz' to unit 


		});

		it.skip('[updateIngredient] should update any new Ingredient properties', function() {
			// TODO
		});
	});
});