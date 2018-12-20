const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const colors = require('colors');
const expect = require('chai').expect;
const fs = require('fs');
const moment = require('moment');
const uuid = require('uuid');

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

const restoreTestDatabases = () => {
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
};

describe('Ingredient Controller ============================================='.magenta, function () {
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

	describe.skip('Ingredient Methods ============================================='.magenta, function () {
		it('[saveIngredient] should update the ingredient based on its ingredient, parent, and error values', function() {
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

			// exact match with no results
			ingredients = ingredientController.findIngredients('exact', 'apple');
			expect(ingredients.length).to.equal(0);
			ingredients = [];

			// loose match on name, plural, alternateNames
			ingredients = ingredientController.findIngredients('partial', 'flour');
			expect(ingredients.length).to.equal(4); // some of this has changed with more data
			ingredients = [];

			// loose match with no results
			ingredients = ingredientController.findIngredients('partial', 'apple');
			expect(ingredients.length).to.equal(0);
			ingredients = [];

			// related ingredients by ingredientID
			ingredients = ingredientController.findIngredients('related', '0eef4ae0-3f35-11e8-9692-3d22a379ab33');
			expect(ingredients.length).to.equal(1);
			ingredients = [];

			// related ingredients by name
			ingredients = ingredientController.findIngredients('related', 'flour');
			expect(ingredients.length).to.equal(1);
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

		it('[updateIngredient] should throw errors for bad input', function() {
			let ing, alt;

			// # passing an invalid ing param should through an error
			expect(() => ingredientController.updateIngredient()).to.throw('No ingredient to update');
			expect(() => ingredientController.updateIngredient(null)).to.throw('No ingredient to update');

			// # ensure basic properties transfer on merge
			// exists: 'chicken breast', new parent: 'chicken'
			// new: 'chicken cutlet' => update to 'chicken breast'

			// chicken
			alt = new Ingredient('chicken');
			alt.properties = {
				'meat': false,
			  'poultry': true,
			  'fish': false,
			  'dairy': false,
			  'soy': false,
			  'gluten': false
			};
			alt.isValidated = true;
			alt.saveIngredient();


			// chicken breast
			ing = ingredientController.findIngredient('name', 'chicken breast');
			ing.parentIngredientID = alt.ingredientID;
			ing.properties = {
				'meat': false,
			  'poultry': true,
			  'fish': false,
			  'dairy': false,
			  'soy': false,
			  'gluten': false
			};
			ing.isValidated = true;
			ing.saveIngredient();

			alt = ingredientController.findIngredient('name', 'chicken breast');


			// chicken cutlet
			ing = new Ingredient('chicken cutlet');
			ing.saveIngredient();

			expect(ing.name).to.equal('chicken cutlet');
			expect(ing.properties.poultry).to.equal(false);
			expect(ing.isValidated).to.equal(false);
			expect(ing.references.size).to.equal(0);

			// if we rename 'chicken cutlet' to 'chicken breast' (an existing value)
			// we expect those records to merge
			ing.name = 'chicken breast'; 
			ing = ingredientController.updateIngredient(ing);

			// ... parentIngredientID
			expect(ing.parentIngredientID).to.equal(alt.parentIngredientID);

			// ... properties
			expect(ing.properties.poultry).to.equal(alt.properties.poultry);

			// ... isValidated
			expect(ing.isValidated).to.equal(alt.isValidated);
			
			// ... references
			expect(ing.references.size).to.equal(alt.references.size);


			// # updates on an ingredient should update each property

			alt = ingredientController.findIngredient('name', 'lamb');

			ing = new Ingredient('lamb joint');
			ing.saveIngredient();

			ing.name = 'lamb shank';
			ing.parentIngredientID = alt.parentIngredientID;
			ing.plural = 'lamb shanks';
			ing.properties = {
				'meat': true,
			  'poultry': false,
			  'fish': false,
			  'dairy': false,
			  'soy': false,
			  'gluten': false
			};
			ing.addAlternateName('lamb leg');
			ing.addRelatedIngredient('lamb');
			ing.addSubstitute('lamb');
			ing.isValidated = true;

			ing = ingredientController.updateIngredient(ing);

			expect(ing.name).to.equal('lamb shank');
			expect(ing.plural).to.equal('lamb shanks');
			expect(ing.parentIngredientID).to.equal(alt.parentIngredientID);
			expect(ing.properties.meat).to.equal(true);
			expect(ing.alternateNames.has('lamb leg')).to.equal(true);
			expect(ing.relatedIngredients.has('lamb')).to.equal(true);
			expect(ing.substitutes.has('lamb')).to.equal(true);
			expect(ing.isValidated).to.equal(true);
		});

		it('[updateIngredient] name updates', function() {
			// updating an ingredient with a plural value...

			// ... not in use elsewhere

			// ... in use as a 'name' value on another ingredient

			// ... in use as a 'plural' value on another ingredient

			// ... in use as an 'alternate name' value on another ingredient

			// ... in use as a 'related ingredient' value on another ingredient

			// ... in use as a 'substitute' value on another ingredient
			let ing, alt;

			ing = ingredientController.findIngredient('name', 'green chilly');
			expect(ing).to.exist;

			alt = ingredientController.findIngredient('name', 'red chilliy');
			expect(alt).to.exist;

			// name is a used value on the old ing (plural), but not on the new
			ing.name = 'green chillies';
			ing.alternateNames = new Set();
			ing = ingredientController.updateIngredient(ing);
			expect(ing.name).to.equal('green chillies');
			expect(ing.alternateNames.has('green chilly')).to.be.false;

			// name is a used value on the old ing (alt), but not on the new
			// name: 'green chillies'
			// alt: 'green chilli'
			ing.addAlternateName('green chilli');
			ing.saveIngredient();
			ing.name = 'green chilli';
			ing.alternateNames = new Set();
			ing = ingredientController.updateIngredient(ing);
			expect(ing.name).to.equal('green chilli');
			expect(ing.alternateNames.has('green chillies')).to.be.false;

			// name is a used value on another ingredient (name)
			alt = new Ingredient('jalapeno');
			alt.saveIngredient();
			ing.name = 'jalapeno';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.name).to.equal('jalapeno');

			// name is a used value on another ingredient (plural)
			ing.name = 'red chilliies';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.name).to.equal('red chilliies');

			// name is a used value on another ingredient (alt name)
			alt = new Ingredient('green chili');
			alt.addAlternateName('green chile');
			alt.saveIngredient();

			// ing.name prev: 'red chilliies'
			// ing.alt prev: 'red chilliy'

			ing.name = 'green chile';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.name).to.equal('green chile');
			expect(ing.alternateNames.has('green chili')).to.be.true;
			expect(ing.alternateNames.has('red chilliy')).to.be.true;
			expect(ing.alternateNames.has('red chilliies')).to.be.false;

			// name is a used value on the old ing as a related
			alt = new Ingredient('red chili');
			alt.saveIngredient();
			
			alt = new Ingredient('green chile');
			alt.addRelatedIngredient('red chili');
			alt.saveIngredient();
			
			
			ing.name = 'red chili';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.name).to.equal('red chili');
			expect(ing.relatedIngredients.has('green chile')).to.be.true;

			// name is a used value on the old ing as a substitute
			alt = new Ingredient('orange chili');
			alt.saveIngredient();
			
			alt = new Ingredient('yellow chile');
			alt.addSubstitute('orange chili');
			alt.saveIngredient();

			alt = ingredientController.findIngredient('name', 'orange chili');
			
			ing.name = 'orange chili';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.name).to.equal('orange chili');
			expect(ing.substitutes.has('yellow chile')).to.be.false; // substitutes don't go both ways

			// double check references get copied over
			ing.name = 'sriracha';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.name).to.equal(
				'sriracha');
			expect(ing.references.size).to.equal(2);
		});

		it('[updateIngredient] plural updates', function() {
			restoreTestDatabases();
			let ing, alt;

			// updating an ingredient with a plural value...
			ing = new Ingredient('scallion');
			ing.saveIngredient();

			// ... not in use elsewhere
			ing.plural = 'scallions';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.plural).to.equal('scallions');

			// ... in use as a 'name' value on another ingredient
			// name: green onion
			// plural: green onions
			alt = ingredientController.findIngredient('name', 'green onion');
			expect(alt).to.exist;

			ing.plural = 'green onion';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.plural).to.equal('green onion');
			expect(ing.alternateNames.has('green onions')).to.be.true;

			// ... in use as a 'plural' value on another ingredient
			restoreTestDatabases();
			ing = new Ingredient('scallion');
			ing.saveIngredient();

			ing.plural = 'green onions';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.plural).to.equal('green onions');
			expect(ing.alternateNames.has('green onion')).to.be.true;


			// ... in use as an 'alternate name' value on another ingredient
			restoreTestDatabases();
			ing = new Ingredient('scallion');
			ing.saveIngredient();

			alt = ingredientController.findIngredient('name', 'green onion');
			alt.addAlternateName('scallions');
			alt.saveIngredient();
			expect(alt.alternateNames.has('scallions')).to.be.true;

			ing.plural = 'scallions';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.plural).to.equal('scallions');
			expect(ing.alternateNames.has('green onion')).to.be.true;
			expect(ing.alternateNames.has('green onions')).to.be.true;


			// ... in use as a 'related ingredient' value on another ingredient
			restoreTestDatabases();

			ing = new Ingredient('scallion');
			ing.saveIngredient();

			alt = ingredientController.findIngredient('name', 'green onion');
			alt.addRelatedIngredient('scallion', ing.ingredientID);
			alt.saveIngredient();
			expect(alt.relatedIngredients.has('scallion')).to.be.true;

			ing = new Ingredient('spring onion');
			ing.saveIngredient();
			ing.plural = 'scallion';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.plural).to.equal('scallion');

			// ... in use as a 'substitute' value on another ingredient
			restoreTestDatabases();

			ing = new Ingredient('scallion');
			ing.saveIngredient();

			alt = ingredientController.findIngredient('name', 'green onion');
			alt.addSubstitute('scallion', ing.ingredientID);
			alt.saveIngredient();
			expect(alt.substitutes.has('scallion')).to.be.true;

			ing = new Ingredient('spring onion');
			ing.saveIngredient();
			ing.plural = 'scallion';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.plural).to.equal('scallion');
		});

		it('[updateIngredient] alternate name updates', function() {
			// updating an ingredient with an alternate name value...

			let ing, alt;
			ing = new Ingredient('endive');
			ing.saveIngredient();

			// ... not in use elsewhere
			ing.addAlternateName('chicory');
			ing = ingredientController.updateIngredient(ing);
			expect(ing.alternateNames.has('chicory')).to.be.true;
			

			// ... in use as a 'name' value on another ingredient
			alt = ingredientController.findIngredient('name', 'eggplant');
			expect(alt).to.exist;

			ing.addAlternateName('eggplant', false);
			ing = ingredientController.updateIngredient(ing);
			expect(ing.alternateNames.has('eggplant')).to.be.true;

			alt = ingredientController.findIngredient('name', 'eggplant');
			expect(alt).to.not.exist;

			// ... in use as a 'plural' value on another ingredient
			alt = ingredientController.findIngredient('exact', 'potatoes');
			expect(alt).to.exist;

			ing.addAlternateName('potatoes', false);
			ing = ingredientController.updateIngredient(ing);
			expect(ing.alternateNames.has('potatoes')).to.be.true;

			// make sure to lookup by name otherwise 'exact' will return the same ingredient
			alt = ingredientController.findIngredient('name', 'potato');
			expect(alt).to.not.exist;

			// ... in use as an 'alternate name' value on another ingredient
			alt = ingredientController.findIngredient('name', 'flour');
			expect(alt.alternateNames.has('all-purpose flour')).to.be.true;

			ing.addAlternateName('all-purpose flour', false);
			ing = ingredientController.updateIngredient(ing);
			expect(ing.alternateNames.has('all-purpose flour')).to.be.true;
			expect(ing.alternateNames.has('flour')).to.be.true;

			alt = ingredientController.findIngredient('name', 'flour');
			expect(alt).to.not.exist;

			// ... in use as a 'related ingredient' value on another ingredient

			alt = new Ingredient('escarole');
			alt.addRelatedIngredient('endive');
			alt.saveIngredient();
			let oldID = alt.ingredientID;

			ing = ingredientController.findIngredient('name', 'endive');
			expect([ ... ing.relatedIngredients.values() ].filter(i => i === oldID).length).to.equal(1);

			alt = new Ingredient('curly endive');
			alt.saveIngredient(true);

			// update 'curly endive' to 'escarole'
			// 'escarole' id should update on 'endive'
			alt.name = 'escarole';
			alt = ingredientController.updateIngredient(alt);

			expect(alt.name).to.equal('escarole');
			expect(alt.ingredientID).to.not.equal(oldID);
			expect(alt.relatedIngredients.has('endive')).to.be.true;

			ing = ingredientController.findIngredient('name', 'endive');
			expect([ ... ing.relatedIngredients.values() ].filter(i => i === oldID).length).to.equal(0);
			expect([ ... ing.relatedIngredients.values() ].filter(i => i === alt.ingredientID).length).to.equal(1);
			expect(ing.relatedIngredients.has('escarole')).to.be.true;

			// ... in use as a 'substitute' value on another ingredient
			restoreTestDatabases();
			ing = new Ingredient('chicken stock');
			ing.saveIngredient();

			alt = new Ingredient('vegetable stock');
			alt.addSubstitute('chicken stock');
			alt.saveIngredient();
			
			// ing: chicken stock ==> chicken broth
			// alt: veg stock -> sub: chicken stock ===> chicken broth

			ing.name = 'chicken broth';
			ing = ingredientController.updateIngredient(ing);
			expect(ing.name).to.equal('chicken broth');

			alt = ingredientController.findIngredient('name', 'vegetable stock');
			expect(alt.substitutes.has('chicken broth'));
		});

	});
});