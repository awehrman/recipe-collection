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
const Recipe = require('../../models/recipeModel');
const recipeController = require('../../controllers/recipeController');

/**

	TODO:
	- consider associated descriptors found in references
	- adjust alternate names to receive an object with singular/plural values
	- more type checking on passing an encoded ingredient into the constructor when fields are missing
	- should only create a new Ingredient when the name is not used on any other ingredients
	- additional tests for:
		- references (convert to map)
	- when a name is updated to be a name referenced on the ingredient's relatedIngredients or substitutes sets,
		we need to trigger a merger with those records, come back to how this needs to be handled internally

 */

describe('Ingredient Class ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'ingredients', 'recipes' ];

		// load presets for each database
		for (let db of databases) {
			let preset;

			try {
				preset = fs.readFileSync(`tests/data/presets/ingredientModel_${db}.json`, 'utf8');
			} catch (ex) {
				throw new Error(`Error reading ${db}.json`);
			}

			fs.writeFileSync(`tests/data/${db}.json`, preset, 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${db} preset data`);
			});
		}
	});

	describe('Getters / Setters ============================================='.magenta, function () {
		it('[constructor] should create a new instance of Ingredient', function() {
			expect(() => new Ingredient()).to.throw('Invalid constructor for Ingredient');
			expect(() => new Ingredient('')).to.throw('Invalid constructor for Ingredient');
			expect(() => new Ingredient(NaN)).to.throw('Invalid constructor for Ingredient');
			expect(() => new Ingredient(null)).to.throw('Invalid constructor for Ingredient');
			expect(() => new Ingredient(123)).to.throw('Invalid constructor for Ingredient');

			const ing = new Ingredient('potato');

			expect(ing.ingredientID).to.exist;
			expect(ing.parentIngredientID).to.be.null;
			expect(ing.dateCreated).to.exist;
			expect(moment.isMoment(ing.dateCreated)).to.equal(true);
			expect(ing.dateUpdated).to.exist;
			expect(moment.isMoment(ing.dateUpdated)).to.equal(true);

			expect(ing.name).to.equal('potato');
			expect(ing.plural).to.equal(null);
			expect(ing.properties).to.deep.equal({
				'meat': false,
			  'poultry': false,
			  'fish': false,
			  'dairy': false,
			  'soy': false,
			  'gluten': false
			});

			expect(ing.alternateNames).to.be.empty;
			expect(ing.relatedIngredients).to.be.empty;
			expect(ing.substitutes).to.be.empty;
			expect(ing.references).to.be.empty;

			expect(ing.isValidated).to.be.false;

			// we should also be able to pass an 'encoded' ingredient object into the constructor
			// in order to a full Ingredient back

			const decoded = new Ingredient({
				ingredientID: '0eef4ae0-3f35-11e8-9692-3d22a379ab33',
			  parentIngredientID: null,
			  dateCreated: '2018-04-13T16:09:35.118Z',
			  dateUpdated: '2018-04-13T16:09:35.119Z',
			  name: 'flour',
			  plural: null,
			  properties:
			   { meat: false,
			     poultry: false,
			     fish: false,
			     dairy: false,
			     soy: false,
			     gluten: true },
			  alternateNames: [ 'all-purpose flour' ],
			  relatedIngredients: [ [ 'bread flour', '0eef4ae2-3f35-11e8-9692-3d22a379ab33' ] ],
			  substitutes: [],
			  references: [],
			  isValidated: false
			});

			expect(decoded.ingredientID).to.exist;
			expect(decoded.parentIngredientID).to.be.null;
			expect(decoded.dateCreated).to.exist;
			expect(moment.isMoment(decoded.dateCreated)).to.equal(true);
			expect(decoded.dateUpdated).to.exist;
			expect(moment.isMoment(decoded.dateUpdated)).to.equal(true);

			expect(decoded.name).to.equal('flour');
			expect(decoded.plural).to.equal(null);
			expect(decoded.properties).to.deep.equal({
				'meat': false,
			  'poultry': false,
			  'fish': false,
			  'dairy': false,
			  'soy': false,
			  'gluten': true
			});

			expect(decoded.alternateNames.has('all-purpose flour')).to.be.true;
			expect(decoded.relatedIngredients.has('bread flour')).to.be.true;
			expect(decoded.substitutes).to.be.empty;
			expect(decoded.references).to.be.empty;

			expect(decoded.isValidated).to.be.false;
		});

		it('[ingredientID] should update with a valid UUID', function() {
			const ing = new Ingredient('potato');

			expect(() => {
				ing.ingredientID = undefined;
			}).to.throw('Invalid ingredientID parameter for Ingredient');
			expect(() => {
				ing.ingredientID = '';
			}).to.throw('Invalid ingredientID parameter for Ingredient');
			expect(() => {
				ing.ingredientID = NaN;
			}).to.throw('Invalid ingredientID parameter for Ingredient');
			expect(() => {
				ing.ingredientID = null;
			}).to.throw('Invalid ingredientID parameter for Ingredient');
			expect(() => {
				ing.ingredientID = 123;
			}).to.throw('Invalid ingredientID parameter for Ingredient');
			expect(() => {
				ing.ingredientID = { ingredientID: 123 };
			}).to.throw('Invalid ingredientID parameter for Ingredient');

			ing.ingredientID = "33db8400-3b65-11e8-91fe-f38e2e77f95e";
			expect(ing.ingredientID).to.equal("33db8400-3b65-11e8-91fe-f38e2e77f95e");
		});

		it('[parentIngredientID] should update with a valid UUID', function() {
			const ing = new Ingredient('potato');

			expect(() => {
				ing.parentIngredientID = undefined;
			}).to.throw('Invalid parentIngredientID parameter for Ingredient');
			expect(() => {
				ing.parentIngredientID = '';
			}).to.throw('Invalid parentIngredientID parameter for Ingredient');
			expect(() => {
				ing.parentIngredientID = NaN;
			}).to.throw('Invalid parentIngredientID parameter for Ingredient');
			expect(() => {
				ing.parentIngredientID = 123;
			}).to.throw('Invalid parentIngredientID parameter for Ingredient');
			expect(() => {
				ing.parentIngredientID = { parentIngredientID: 123 };
			}).to.throw('Invalid parentIngredientID parameter for Ingredient');

			ing.parentIngredientID = "33db8400-3b65-11e8-91fe-f38e2e77f95e";
			expect(ing.parentIngredientID).to.equal("33db8400-3b65-11e8-91fe-f38e2e77f95e");

			ing.parentIngredientID = null;
			expect(ing.parentIngredientID).to.equal(null);
		});

		it('[dateCreated] should be read only', function() {
			const ing = new Ingredient('potato');
			expect(ing.dateCreated).to.exist;
			expect(ing.dateCreated.isValid()).to.be.true;

			expect(() => {
				ing.dateCreated = moment();
			}).to.throw('Updating dateCreated is not allowed');
		});

		it('[dateUpdated] should update with a valid datestamp', function() {
			const ing = new Ingredient('potato');
			let initialDate = ing.dateUpdated;

			ing.dateUpdated = moment();
			expect(initialDate).to.exist;
			expect(initialDate.isValid()).to.be.true;

			// TODO expand date validation for date-like strings
			// moment will accept these, but OH BOY IT ACCEPTS A LOT OF JUNK

			expect(() => {
				ing.dateUpdated = undefined;
			}).to.throw('Invalid dateUpdated parameter for Ingredient');
			expect(() => {
				ing.dateUpdated = '';
			}).to.throw('Invalid dateUpdated parameter for Ingredient');
			expect(() => {
				ing.dateUpdated = NaN;
			}).to.throw('Invalid dateUpdated parameter for Ingredient');
			expect(() => {
				ing.dateUpdated = null;
			}).to.throw('Invalid dateUpdated parameter for Ingredient');

			ing.ingredientID = '5c8c62c0-3b65-11e8-91fe-f38e2e77f95e';
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			ing.parentIngredientID = '33db8400-3b65-11e8-91fe-f38e2e77f95e';
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			//
			ing.name = 'fingerling potato';
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			ing.plural = 'fingerling potatoes';
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			ing.properties = {
				'meat': true,
			  'poultry': false,
			  'fish': false,
			  'dairy': false,
			  'soy': false,
			  'gluten': false
			};
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			//
			ing.alternateNames = new Set(['baby boomer potato']);
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			const related = new Map();
			related.set('yukon gold potato', '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5');
			ing.relatedIngredients = related;
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			const substitutes = new Map();
			substitutes.set('yukon gold potato', '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5');
			ing.substitutes = substitutes;
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			const references = new Map();
			references.set('2aeb6dfc-a232-5d8b-a70b-7d13b1b9afd4', '2 fingerling potatoes');
			ing.references = references;
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			ing.isValidated = true;
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;
		});

		// TODO add matching rel and sub tests
		it('[name] should update with a valid string', function() {
			const ing = new Ingredient('potato');

			ing.plural = 'potatoes';
			ing.alternateNames = new Set(['spuds']);

			// if 'name' gets updated to a value associated with a related or substitute, then this needs to trigger a merge
			const related = new Map();
			related.set('yukon gold potato', '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5');
			ing.relatedIngredients = related;

			const substitutes = new Map();
			substitutes.set('yam', '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd6');
			ing.substitutes = substitutes;
			//ing.substitutes = new Set([{ ingredientID: '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd6', name: 'yam' }]);

			// name: potato => potatoes
			// needs to move 'potatoes' from plural to alt names
			ing.name = 'potatoes';
			expect(ing.name).to.equal('potatoes');
			expect(ing.plural).to.equal(null);
			expect(ing.alternateNames.has('potato')).to.be.true;
			expect(ing.alternateNames.has('spuds')).to.be.true;
			expect(ing.alternateNames.size).to.equal(2); // { 'spuds', 'potato' }

			// name: potatoes => spuds
			// needs to remove 'spuds' from alt names and move 'potatoes' to alt names
			ing.name = 'spuds';
			expect(ing.name).to.equal('spuds');
			expect(ing.alternateNames.has('potato')).to.be.true;
			expect(ing.alternateNames.has('potatoes')).to.be.true;
			expect(ing.alternateNames.size).to.equal(2); // { 'potato', 'potatoes' }

			// name: potato => yukon gold potato
			// TODO ??? this signals a merger... come back to this

			// name: potato => yam
			// TODO ??? this signals a merger... come back to this
			expect(() => {
				ing.name = undefined;
			}).to.throw('Invalid name parameter for Ingredient');
			expect(() => {
				ing.name = '';
			}).to.throw('Invalid name parameter for Ingredient');
			expect(() => {
				ing.name = NaN;
			}).to.throw('Invalid name parameter for Ingredient');
			expect(() => {
				ing.name = null;
			}).to.throw('Invalid name parameter for Ingredient');
			expect(() => {
				ing.name = 123;
			}).to.throw('Invalid name parameter for Ingredient');
			expect(() => {
				ing.name = { name: 'name' };
			}).to.throw('Invalid name parameter for Ingredient');
		});

		it('[plural] should update with a valid string', function() {
			const ing = new Ingredient('potato');

			ing.plural = 'potatoes';
			ing.alternateNames = new Set(['spuds']);

			const related = new Map();
			related.set('yukon gold potato', '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5');
			ing.relatedIngredients = related;

			const substitutes = new Map();
			substitutes.set('yam', '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd6');
			ing.substitutes = substitutes;

			// plural: potatoes => potato
			// this would leave out name value null, which we never want so don't allow this
			expect(() => {
				ing.plural = 'potato';
			}).to.throw('Cannot assign current name value to plural');
			// these shouldn't change
			expect(ing.plural).to.equal('potatoes');
			expect(ing.name).to.equal('potato');

			// plural: potatoes => spuds
			// needs to remove 'spuds' from alt names and add 'potatoes' to alt names
			ing.plural = 'spuds';
			expect(ing.plural).to.equal('spuds');
			expect(ing.alternateNames.has('potatoes')).to.be.true;
			expect(ing.alternateNames.size).to.equal(1);

			expect(() => {
				ing.plural = undefined;
			}).to.throw('Invalid plural parameter for Ingredient');
			expect(() => {
				ing.plural = '';
			}).to.throw('Invalid plural parameter for Ingredient');
			expect(() => {
				ing.plural = NaN;
			}).to.throw('Invalid plural parameter for Ingredient');
			expect(() => {
				ing.plural = 123;
			}).to.throw('Invalid plural parameter for Ingredient');
			expect(() => {
				ing.plural = { plural: 'plural' };
			}).to.throw('Invalid plural parameter for Ingredient');
		});

		it('[properties] should update with a valid object containing one or more matching property values', function() {
			const ing = new Ingredient('potato');

			// should throw an error if properties object is empty or invalid
			expect(() => {
				ing.properties = null;
			}).to.throw('Invalid properties parameter for Ingredient');
			expect(() => {
				ing.properties = '';
			}).to.throw('Invalid properties parameter for Ingredient');
			expect(() => {
				ing.properties = undefined;
			}).to.throw('Invalid properties parameter for Ingredient');

			// should accept a valid properties object
			ing.properties = {
				'meat': true,
			  'poultry': false,
			  'fish': false,
			  'dairy': false,
			  'soy': false,
			  'gluten': false
			};

			expect(ing.properties.meat).to.be.true;

			// should merge a partial properties object
			ing.properties = { 'fish': true };
			expect(ing.properties.meat).to.be.true;
			expect(ing.properties.poultry).to.be.false;
			expect(ing.properties.fish).to.be.true;
			expect(ing.properties.dairy).to.be.false;
			expect(ing.properties.soy).to.be.false;
			expect(ing.properties.gluten).to.be.false;

			// should ignore junk properties
			ing.properties = { 'tasty': false };
			expect(ing.properties.hasOwnProperty('tasty')).to.be.false;

			// expect no new changes if you pass an empty object
			ing.properties = {};
			expect(ing.properties.meat).to.be.true;
			expect(ing.properties.poultry).to.be.false;
			expect(ing.properties.fish).to.be.true;
			expect(ing.properties.dairy).to.be.false;
			expect(ing.properties.soy).to.be.false;
			expect(ing.properties.gluten).to.be.false;

			expect(() => {
				ing.properties = undefined;
			}).to.throw('Invalid properties parameter for Ingredient');
			expect(() => {
				ing.properties = '';
			}).to.throw('Invalid properties parameter for Ingredient');
			expect(() => {
				ing.properties = NaN;
			}).to.throw('Invalid properties parameter for Ingredient');
			expect(() => {
				ing.properties = null;
			}).to.throw('Invalid properties parameter for Ingredient');
			expect(() => {
				ing.properties = 123;
			}).to.throw('Invalid properties parameter for Ingredient');
			expect(() => {
				ing.properties = 'meat';
			}).to.throw('Invalid properties parameter for Ingredient');
		});

		it('[alternateNames] should update with a valid Set containing string values', function() {
			const ing = new Ingredient('potato');

			// don't accept non-sense
			ing.alternateNames = new Set([ undefined ]);
			expect(ing.alternateNames.size).to.equal(0);
			ing.alternateNames = new Set([ '' ]);
			expect(ing.alternateNames.size).to.equal(0);
			ing.alternateNames = new Set([ NaN ]);
			expect(ing.alternateNames.size).to.equal(0);
			ing.alternateNames = new Set([ null ]);
			expect(ing.alternateNames.size).to.equal(0);
			ing.alternateNames = new Set([ 123 ]);
			expect(ing.alternateNames.size).to.equal(0);
			ing.alternateNames = new Set([ { name: 'spuds' } ]);
			expect(ing.alternateNames.size).to.equal(0);

			expect(() => {
				ing.alternateNames = undefined;
			}).to.throw('Invalid alternateNames parameter for Ingredient');
			expect(() => {
				ing.alternateNames = '';
			}).to.throw('Invalid alternateNames parameter for Ingredient');
			expect(() => {
				ing.alternateNames = NaN;
			}).to.throw('Invalid alternateNames parameter for Ingredient');
			expect(() => {
				ing.alternateNames = null;
			}).to.throw('Invalid alternateNames parameter for Ingredient');
			expect(() => {
				ing.alternateNames = 123;
			}).to.throw('Invalid alternateNames parameter for Ingredient');
			expect(() => {
				ing.alternateNames = { name: 'spud' };
			}).to.throw('Invalid alternateNames parameter for Ingredient');
			expect(() => {
				ing.alternateNames = 'spud';
			}).to.throw('Invalid alternateNames parameter for Ingredient');

			// ignore any entries that match our extisting name
			ing.alternateNames = new Set(['potato']);
			expect(ing.alternateNames.size).to.be.equal(0);
			expect(ing.alternateNames.has('potato')).to.be.false;

			// anytime we pass in a completely new set, we want that to override the existing set


			// if the value is the same as the plural
			// remove the plural
			// add it to alt name
			ing.plural = 'potatoes';
			ing.alternateNames = new Set(['potatoes']);
			expect(ing.alternateNames.has('potatoes')).to.be.true;
			expect(ing.alternateNames.size).to.equal(1);
			expect(ing.plural).to.be.null;


			// if the value is already in the alt names
			// it should de-duplicate
			ing.alternateNames = new Set(['potatoes', 'potatoes']);
			expect(ing.alternateNames.has('potatoes')).to.be.true;
			expect(ing.alternateNames.size).to.equal(1);
		});

		it('[relatedIngredients] should update with a valid Map containing name/id pairs', function() {
			const ing = new Ingredient('potato');
			let related = new Map();
			let keys, values, uniqueKeys, uniqueValues = [];

			const reset = function() {
				related = new Map();
				keys = [];
				values = [];
			}

			const refreshArrays = function(map) {
				keys = [ ...ing.relatedIngredients.keys() ]; // names
				values = [ ...ing.relatedIngredients.values() ]; // ids
				uniqueKeys = [ ...new Set([keys])];
				uniqueValues = [ ...new Set([values])];
			}

			// if we pass a name with a null ingredientID
			// we should get a new Ingredient created with its ingredientID populated
			related.set('yam', null);
			ing.relatedIngredients = related;
			refreshArrays();
			expect(ing.relatedIngredients.size).to.equal(1);
			expect(keys.includes('yam')).to.be.true;
			expect(values[0]).to.be.not.null;

			// expect yam to exist as an ingredient
			let newIng = ingredientController.findIngredients('name', 'yam');
			expect(newIng.length).to.equal(1);
			expect(newIng[0].name).to.equal('yam');
			reset();

			// if we pass multiple null ingredientIDs
			// we still expect to get new Ingredients back for each instance
			related.set('baby boomer potato', null);
			related.set('yukon gold potato', null);
			ing.relatedIngredients = related;
			refreshArrays();
			expect(ing.relatedIngredients.size).to.equal(2);
			expect(keys.includes('baby boomer potato')).to.be.true;
			expect(values[0]).to.be.not.null;
			expect(keys.includes('yukon gold potato')).to.be.true;
			expect(values[1]).to.be.not.null;

			newIng = ingredientController.findIngredients('name', 'baby boomer potato');
			expect(newIng.length).to.equal(1);
			expect(newIng[0].name).to.equal('baby boomer potato');

			newIng = ingredientController.findIngredients('name', 'yukon gold potato');
			expect(newIng.length).to.equal(1);
			expect(newIng[0].name).to.equal('yukon gold potato');
			reset();

			// if we pass the same ingredient twice, the map should handle this de-duplication for us
			related.set('fingerling potato', null);
			related.set('fingerling potato', null);
			expect(related.size).to.equal(1);
			ing.relatedIngredients = related;
			refreshArrays();
			expect(ing.relatedIngredients.size).to.equal(1);
			expect(keys.includes('fingerling potato')).to.be.true;
			expect(values[0]).to.be.not.null;

			newIng = ingredientController.findIngredients('name', 'fingerling potato');
			expect(newIng.length).to.equal(1);
			expect(newIng[0].name).to.equal('fingerling potato');
			reset();

			// if we pass in multiple instances of the same name with bogus ids
			related.set('kennebec potato', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // DOESN'T EXIST
			related.set('kennebec potato', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b3'); // DOESN'T EXIST
			ing.relatedIngredients = related;
			refreshArrays();
			// expect it to put kennebec potato in our array
			expect(ing.relatedIngredients.size).to.equal(1);
			expect(keys.includes('kennebec potato')).to.be.true; // make sure we save the name field
			expect(values[0]).to.be.not.null;
			// expect to only have a single kennebec potato in our database
			let kennebec = ingredientController.findIngredients('exact', 'kennebec potato');
			expect(kennebec.length).to.equal(1);
			expect(kennebec[0].name).to.equal('kennebec potato');
			reset();

			// if we pass in an ingredientID that doesn't exist in our database
			// along with a name that doesn't exist
			// go ahead and create the ingredient
			related.set('purple potato', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // ID DOESN'T EXIST - NO NAME MATCHES
			ing.relatedIngredients = related;
			refreshArrays();
			expect(ing.relatedIngredients.size).to.be.equal(1);
			expect(ing.relatedIngredients.get('purple potato')).to.be.not.equal('dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			reset();

			// if we pass in an ingredientID that doesn't exist in our database, but the name does
			related.set('yam', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // ID DOESN'T EXIST - ONE NAME MATCH
			ing.relatedIngredients = related;
			refreshArrays();
			expect(ing.relatedIngredients.size).to.equal(1);
			expect(keys.includes('yam')).to.be.true;
			expect(values[0]).to.be.not.null;

			// expect yam to exist as an ingredient
			newIng = ingredientController.findIngredients('name', 'yam');
			expect(newIng.length).to.equal(1);
			expect(newIng[0].name).to.equal('yam');
			expect(newIng[0].ingredientID).to.not.equal('dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			reset();

			// fill-in our yam ingredient for the next set of tests...
			let yam = ingredientController.findIngredient('name', 'yam');
			yam.plural = 'yams';
			yam.alternateNames = new Set([ 'sweet potato' ]);
			yam.saveIngredient();

			yam = ingredientController.findIngredient('name', 'yam');

			// if we pass in an ingredientID that doesn't exist in our database
			// along with the plural name of an ingredient that does exist
			related.set('yams', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // ID DOESN'T EXIST - ONE PLURAL NAME MATCH
			ing.relatedIngredients = related;
			refreshArrays();
			// expect it to put yam in our array
			expect(ing.relatedIngredients.size).to.equal(1);
			expect(keys.includes('yam')).to.be.true; // make sure we save the name field
			expect(values[0]).to.be.not.null;
			// expect to only have a single yam in our database
			yam = ingredientController.findIngredients('exact', 'yam');
			expect(yam.length).to.equal(1);
			expect(yam[0].name).to.equal('yam');
			reset();

			// if we pass in an ingredientID that doesn't exist in our database
			// along with a used alternate name
			related.set('sweet potato', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // ID DOESN'T EXIST - ONE ALT NAME MATCH
			ing.relatedIngredients = related;
			refreshArrays();
			// expect it to put yam in our array
			expect(ing.relatedIngredients.size).to.equal(1);
			expect(keys.includes('yam')).to.be.true; // make sure we save the name field
			expect(values[0]).to.be.not.null;
			// expect to only have a single yam in our database
			yam = ingredientController.findIngredients('exact', 'yam');
			expect(yam.length).to.equal(1);
			expect(yam[0].name).to.equal('yam');
			reset();

			// if we pass in an ingredientID that doesn't exist in our database
			// along with a used alternate name
			related.set('sweet potato', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // ID DOESN'T EXIST - ONE ALT NAME MATCH
			ing.relatedIngredients = related;
			refreshArrays();
			// expect it to put yam in our array
			expect(ing.relatedIngredients.size).to.equal(1);
			expect(keys.includes('yam')).to.be.true; // make sure we save the name field
			expect(values[0]).to.be.not.null;
			// expect to only have a single yam in our database
			yam = ingredientController.findIngredients('exact', 'yam');
			expect(yam.length).to.equal(1);
			expect(yam[0].name).to.equal('yam');
			reset();

			// if we pass in multiple instances of the same name with at least one legit id
			related.set('yam', yam[0].ingredientID); // EXISTS
			related.set('yam', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b3'); // DOESN'T EXIST
			ing.relatedIngredients = related;
			refreshArrays();
			// expect it to put yam in our array
			expect(ing.relatedIngredients.size).to.equal(1);
			expect(keys.includes('yam')).to.be.true; // make sure we save the name field
			expect(values[0]).to.be.not.null;
			// expect to only have a single yam in our database
			yam = ingredientController.findIngredients('exact', 'yam');
			expect(yam.length).to.equal(1);
			expect(yam[0].name).to.equal('yam');
			reset();

			// should ignore any entries with bad name values
			related.set(undefined, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.relatedIngredients = related;
			expect(ing.relatedIngredients).to.be.empty;
			related.set('', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.relatedIngredients = related;
			expect(ing.relatedIngredients).to.be.empty;
			related.set(NaN, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.relatedIngredients = related;
			expect(ing.relatedIngredients).to.be.empty;
			related.set(123, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.relatedIngredients = related;
			expect(ing.relatedIngredients).to.be.empty;
			related.set({ name: 'yam' }, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.relatedIngredients = related;
			expect(ing.relatedIngredients).to.be.empty;

			reset();

			// should ignore any entries with bad ingredientID values
			related.set('yam', '');
			ing.relatedIngredients = related;
			expect(ing.relatedIngredients).to.be.empty;
			related.set('yam', NaN);
			ing.relatedIngredients = related;
			expect(ing.relatedIngredients).to.be.empty;
			related.set('yam', 123);
			ing.relatedIngredients = related;
			expect(ing.relatedIngredients).to.be.empty;
			related.set('yam', { ingredientID: 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2' });
			ing.relatedIngredients = related;
			expect(ing.relatedIngredients).to.be.empty;

			reset();

			// should throw an error if we pass in something other than a Map
			expect(() => {
				ing.relatedIngredients = undefined;
			}).to.throw('Invalid relatedIngredients parameter for Ingredient');
			expect(() => {
				ing.relatedIngredients = '';
			}).to.throw('Invalid relatedIngredients parameter for Ingredient');
			expect(() => {
				ing.relatedIngredients = NaN;
			}).to.throw('Invalid relatedIngredients parameter for Ingredient');
			expect(() => {
				ing.relatedIngredients = null;
			}).to.throw('Invalid relatedIngredients parameter for Ingredient');
			expect(() => {
				ing.relatedIngredients = 123;
			}).to.throw('Invalid relatedIngredients parameter for Ingredient');
			expect(() => {
				ing.relatedIngredients = { name: 'spud' };
			}).to.throw('Invalid relatedIngredients parameter for Ingredient');
			expect(() => {
				ing.relatedIngredients = 'spud';
			}).to.throw('Invalid relatedIngredients parameter for Ingredient');
			expect(() => {
				ing.relatedIngredients = new Set();
			}).to.throw('Invalid relatedIngredients parameter for Ingredient');
		});

		it('[substitutes] should update with a valid Map containing name/id pairs', function() {
			const ing = new Ingredient('vegetable stock');
			let substitutes = new Map();
			let keys, values, uniqueKeys, uniqueValues = [];

			const reset = function() {
				substitutes = new Map();
				keys = [];
				values = [];
			}

			const refreshArrays = function(map) {
				keys = [ ...ing.substitutes.keys() ]; // names
				values = [ ...ing.substitutes.values() ]; // ids
				uniqueKeys = [ ...new Set([keys])];
				uniqueValues = [ ...new Set([values])];
			}

			// if we pass a name with a null ingredientID
			// we should get a new Ingredient created with its ingredientID populated
			substitutes.set('chicken stock', null);
			ing.substitutes = substitutes;
			refreshArrays();
			expect(ing.substitutes.size).to.equal(1);
			expect(keys.includes('chicken stock')).to.be.true;
			expect(values[0]).to.be.not.null;

			// expect chicken stock to exist as an ingredient
			let newIng = ingredientController.findIngredients('name', 'chicken stock');
			expect(newIng.length).to.equal(1);
			expect(newIng[0].name).to.equal('chicken stock');
			reset();

			// if we pass multiple null ingredientIDs
			// we still expect to get new Ingredients back for each instance
			substitutes.set('chicken broth', null);
			substitutes.set('vegetable broth', null);
			ing.substitutes = substitutes;
			refreshArrays();
			expect(ing.substitutes.size).to.equal(2);
			expect(keys.includes('chicken broth')).to.be.true;
			expect(values[0]).to.be.not.null;
			expect(keys.includes('vegetable broth')).to.be.true;
			expect(values[1]).to.be.not.null;

			newIng = ingredientController.findIngredients('name', 'chicken broth');
			expect(newIng.length).to.equal(1);
			expect(newIng[0].name).to.equal('chicken broth');

			newIng = ingredientController.findIngredients('name', 'vegetable broth');
			expect(newIng.length).to.equal(1);
			expect(newIng[0].name).to.equal('vegetable broth');
			reset();

			// if we pass the same ingredient twice, the map should handle this de-duplication for us
			substitutes.set('stock', null);
			substitutes.set('stock', null);
			expect(substitutes.size).to.equal(1);
			ing.substitutes = substitutes;
			refreshArrays();
			expect(ing.substitutes.size).to.equal(1);
			expect(keys.includes('stock')).to.be.true;
			expect(values[0]).to.be.not.null;

			newIng = ingredientController.findIngredients('name', 'stock');
			expect(newIng.length).to.equal(1);
			expect(newIng[0].name).to.equal('stock');
			reset();

			// if we pass in multiple instances of the same name with bogus ids
			substitutes.set('beef broth', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // DOESN'T EXIST
			substitutes.set('beef broth', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b3'); // DOESN'T EXIST
			ing.substitutes = substitutes;
			refreshArrays();
			// expect it to put beef broth in our array
			expect(ing.substitutes.size).to.equal(1);
			expect(keys.includes('beef broth')).to.be.true; // make sure we save the name field
			expect(values[0]).to.be.not.null;
			// expect to only have a single beef broth in our database
			let broth = ingredientController.findIngredients('exact', 'beef broth');
			expect(broth.length).to.equal(1);
			expect(broth[0].name).to.equal('beef broth');
			reset();

			// if we pass in an ingredientID that doesn't exist in our database
			// along with a name that doesn't exist
			// go ahead and create the ingredient
			substitutes.set('beef stock', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // ID DOESN'T EXIST - NO NAME MATCHES
			ing.substitutes = substitutes;
			refreshArrays();
			expect(ing.substitutes.size).to.be.equal(1);
			expect(ing.substitutes.get('beef stock')).to.be.not.equal('dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			reset();

			// if we pass in an ingredientID that doesn't exist in our database, but the name does
			substitutes.set('chicken stock', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // ID DOESN'T EXIST - ONE NAME MATCH
			ing.substitutes = substitutes;
			refreshArrays();
			expect(ing.substitutes.size).to.equal(1);
			expect(keys.includes('chicken stock')).to.be.true;
			expect(values[0]).to.be.not.null;

			// expect chicken stock to exist as an ingredient
			newIng = ingredientController.findIngredients('name', 'chicken stock');
			expect(newIng.length).to.equal(1);
			expect(newIng[0].name).to.equal('chicken stock');
			expect(newIng[0].ingredientID).to.not.equal('dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			reset();

			// fill-in our chicken stock ingredient for the next set of tests...
			let stock = ingredientController.findIngredients('name', 'chicken stock')[0];
			stock.plural = 'chicken stocks';
			stock.alternateNames = new Set([ 'chicken wing stock' ]);
			stock.saveIngredient();

			// if we pass in an ingredientID that doesn't exist in our database
			// along with the plural name of an ingredient that does exist
			substitutes.set('chicken stocks', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // ID DOESN'T EXIST - ONE PLURAL NAME MATCH
			ing.substitutes = substitutes;
			refreshArrays();
			// expect it to put chicken stock in our array
			expect(ing.substitutes.size).to.equal(1);
			expect(keys.includes('chicken stock')).to.be.true; // make sure we save the name field
			expect(values[0]).to.be.not.null;
			// expect to only have a single chicken stock in our database
			stock = ingredientController.findIngredients('exact', 'chicken stock');
			expect(stock.length).to.equal(1);
			expect(stock[0].name).to.equal('chicken stock');
			reset();

			// if we pass in an ingredientID that doesn't exist in our database
			// along with a used alternate name
			substitutes.set('chicken wing stock', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // ID DOESN'T EXIST - ONE PLURAL NAME MATCH
			ing.substitutes = substitutes;
			refreshArrays();
			// expect it to put chicken stock in our array
			expect(ing.substitutes.size).to.equal(1);
			expect(keys.includes('chicken stock')).to.be.true; // make sure we save the name field
			expect(values[0]).to.be.not.null;
			// expect to only have a single chicken stock in our database
			stock = ingredientController.findIngredients('exact', 'chicken stock');
			expect(stock.length).to.equal(1);
			expect(stock[0].name).to.equal('chicken stock');
			reset();

			// if we pass in an ingredientID that doesn't exist in our database
			// along with a used alternate name
			substitutes.set('can of chicken stock', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // ID DOESN'T EXIST - ONE PLURAL NAME MATCH
			ing.substitutes = substitutes;
			refreshArrays();
			// expect it to put chicken stock in our array
			expect(ing.substitutes.size).to.equal(1);
			expect(keys.includes('can of chicken stock')).to.be.true; // make sure we save the name field
			expect(values[0]).to.be.not.null;
			// expect to only have a single chicken stock in our database
			stock = ingredientController.findIngredients('exact', 'chicken stock');
			expect(stock.length).to.equal(1);
			expect(stock[0].name).to.equal('chicken stock');
			reset();

			// if we pass in multiple instances of the same name with at least one legit id
			// expect it to put chicken stock in our array
			// expect to only have a single chicken stock in our database
			substitutes.set('chicken stock', stock[0].ingredientID); // EXISTS
			substitutes.set('chicken stock', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b3'); // DOESN'T EXIST
			ing.substitutes = substitutes;
			refreshArrays();
			// expect it to put chicken stock in our array
			expect(ing.substitutes.size).to.equal(1);
			expect(keys.includes('chicken stock')).to.be.true; // make sure we save the name field
			expect(values[0]).to.be.not.null;
			// expect to only have a single chicken stock in our database
			stock = ingredientController.findIngredients('exact', 'chicken stock');
			expect(stock.length).to.equal(1);
			expect(stock[0].name).to.equal('chicken stock');
			reset();

			// should ignore any entries with bad name values
			substitutes.set(undefined, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.substitutes = substitutes;
			expect(ing.substitutes).to.be.empty;
			substitutes.set('', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.substitutes = substitutes;
			expect(ing.substitutes).to.be.empty;
			substitutes.set(NaN, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.substitutes = substitutes;
			expect(ing.substitutes).to.be.empty;
			substitutes.set(123, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.substitutes = substitutes;
			expect(ing.substitutes).to.be.empty;
			substitutes.set({ name: 'yam' }, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.substitutes = substitutes;
			expect(ing.substitutes).to.be.empty;

			reset();

			// should ignore any entries with bad ingredientID values
			substitutes.set('yam', '');
			ing.substitutes = substitutes;
			expect(ing.substitutes).to.be.empty;
			substitutes.set('yam', NaN);
			ing.substitutes = substitutes;
			expect(ing.substitutes).to.be.empty;
			substitutes.set('yam', 123);
			ing.substitutes = substitutes;
			expect(ing.substitutes).to.be.empty;
			substitutes.set('yam', { ingredientID: 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2' });
			ing.substitutes = substitutes;
			expect(ing.substitutes).to.be.empty;

			reset();

			// should throw an error if we pass in something other than a Map
			expect(() => {
				ing.substitutes = undefined;
			}).to.throw('Invalid substitutes parameter for Ingredient');
			expect(() => {
				ing.substitutes = '';
			}).to.throw('Invalid substitutes parameter for Ingredient');
			expect(() => {
				ing.substitutes = NaN;
			}).to.throw('Invalid substitutes parameter for Ingredient');
			expect(() => {
				ing.substitutes = null;
			}).to.throw('Invalid substitutes parameter for Ingredient');
			expect(() => {
				ing.substitutes = 123;
			}).to.throw('Invalid substitutes parameter for Ingredient');
			expect(() => {
				ing.substitutes = { name: 'spud' };
			}).to.throw('Invalid substitutes parameter for Ingredient');
			expect(() => {
				ing.substitutes = 'spud';
			}).to.throw('Invalid substitutes parameter for Ingredient');
			expect(() => {
				ing.substitutes = new Set();
			}).to.throw('Invalid substitutes parameter for Ingredient');
		});

		it('[references] should update with a valid Map containing recipe references', function() {
			let ing = new Ingredient('apple');
			let references = new Map();
			let keys, values, uniqueKeys, uniqueValues = [];

			const reset = function() {
				references = new Map();
				keys = [];
				values = [];
			}

			const refreshArrays = function(map) {
				keys = [ ...ing.references.keys() ]; // names
				values = [ ...ing.references.values() ]; // ids
				uniqueKeys = [ ...new Set([keys])];
				uniqueValues = [ ...new Set([values])];
			}

			const rp = new Recipe();
			rp.saveRecipe();

			// should accept a valid map
			references.set('1 cup apples', rp.recipeID);
			ing.references = references;
			refreshArrays();
			expect(ing.references.size).to.equal(1);
			expect(keys.includes('1 cup apples')).to.be.true;

			reset();

			// should ignore any entries with bad line values
			references.set(undefined, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.references = references;
			expect(ing.references).to.be.empty;
			references.set('', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.references = references;
			expect(ing.references).to.be.empty;
			references.set(NaN, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.references = references;
			expect(ing.references).to.be.empty;
			references.set(123, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.references = references;
			expect(ing.references).to.be.empty;
			references.set({ line: '1 cup apples' }, 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2');
			ing.references = references;
			expect(ing.references).to.be.empty;

			reset();

			// should ignore any entries with bad recipeID values
			references.set('1 cup apples', '');
			ing.references = references;
			expect(ing.references).to.be.empty;
			references.set('1 cup apples', NaN);
			ing.references = references;
			expect(ing.references).to.be.empty;
			references.set('1 cup apples', 123);
			ing.references = references;
			expect(ing.references).to.be.empty;
			references.set('1 cup apples', { recipeID: 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2' });
			ing.references = references;
			expect(ing.references).to.be.empty;

			reset();

			// should throw an error if we pass in something other than a Map
			expect(() => {
				ing.references = undefined;
			}).to.throw('Invalid references parameter for Ingredient');
			expect(() => {
				ing.references = '';
			}).to.throw('Invalid references parameter for Ingredient');
			expect(() => {
				ing.references = NaN;
			}).to.throw('Invalid references parameter for Ingredient');
			expect(() => {
				ing.references = null;
			}).to.throw('Invalid references parameter for Ingredient');
			expect(() => {
				ing.references = 123;
			}).to.throw('Invalid references parameter for Ingredient');
			expect(() => {
				ing.references = { line: '1 cup apples' };
			}).to.throw('Invalid references parameter for Ingredient');
			expect(() => {
				ing.references = '1 cup apples';
			}).to.throw('Invalid references parameter for Ingredient');
			expect(() => {
				ing.references = new Set();
			}).to.throw('Invalid references parameter for Ingredient');
		});

		it('[isValidated] should update with a true/false value', function() {
			const ing = new Ingredient('potato');
			expect(ing.isValidated).to.be.false;

			ing.isValidated = true;
			expect(ing.isValidated).to.be.true;

			ing.isValidated = false;
			expect(ing.isValidated).to.be.false;

			expect(() => {
				ing.isValidated = 1;
			}).to.throw('Invalid isValidated parameter for Ingredient');
			expect(() => {
				ing.isValidated = 'true';
			}).to.throw('Invalid isValidated parameter for Ingredient');

			expect(() => {
				ing.isValidated = undefined;
			}).to.throw('Invalid isValidated parameter for Ingredient');
			expect(() => {
				ing.isValidated = NaN;
			}).to.throw('Invalid isValidated parameter for Ingredient');
			expect(() => {
				ing.isValidated = null;
			}).to.throw('Invalid isValidated parameter for Ingredient');
		});
	});

	describe('Ingredient Methods ============================================='.magenta, function () {
		it('[getIngredient] should return an Ingredient object', function() {
			let ing = new Ingredient('potato');
			let obj = ing.getIngredient();

			expect(obj.hasOwnProperty('ingredientID')).to.be.true;
			expect(obj.hasOwnProperty('parentIngredientID')).to.be.true;
			expect(obj.hasOwnProperty('dateCreated')).to.be.true;
			expect(obj.hasOwnProperty('dateUpdated')).to.be.true;
			expect(obj.hasOwnProperty('name')).to.be.true;
			expect(obj.hasOwnProperty('plural')).to.be.true;
			expect(obj.hasOwnProperty('properties')).to.be.true;
			expect(obj.hasOwnProperty('alternateNames')).to.be.true;
			expect(obj.hasOwnProperty('relatedIngredients')).to.be.true;
			expect(obj.hasOwnProperty('substitutes')).to.be.true;
			expect(obj.hasOwnProperty('references')).to.be.true;
			expect(obj.hasOwnProperty('isValidated')).to.be.true;
		});

		it('[encodeIngredient] should encode the Ingredient object into writeable JSON', function() {
			let ing = new Ingredient('potato');
			let encoded = ing.encodeIngredient();

			expect(typeof encoded).to.be.equal('object');
			expect(Array.isArray(encoded.alternateNames)).to.be.true;
			expect(Array.isArray(encoded.relatedIngredients)).to.be.true;
			expect(Array.isArray(encoded.substitutes)).to.be.true;
			expect(Array.isArray(encoded.references)).to.be.true;
		});

		it('[saveIngredient] should write the Ingredient to the database', function() {
			let ingredients = [];
			let foundIngredient = false;
			let numIngredients = 0;

			// expect to not find our ingredient on the first go
			try {
				ingredients = JSON.parse(fs.readFileSync('tests/data/ingredients.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading ingredients.json');
			}

			for (let ing of ingredients) {
				if (ing.name === 'bay leaf') { foundIngredient = true; }
			}
			expect(foundIngredient).to.be.false;
			numIngredients = ingredients.length;

			let ing = new Ingredient('bay leaf');
			ing.saveIngredient();

			try {
				ingredients = JSON.parse(fs.readFileSync('tests/data/ingredients.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading ingredients.json');
			}

			for (let ing of ingredients) {
				if (ing.name === 'bay leaf') { foundIngredient = true; }
			}
			// should find it in the second pass after we save it
			expect(foundIngredient).to.be.true;
			expect((ingredients.length - numIngredients)).to.equal(1);
			numIngredients = ingredients.length;

			// should not be allowed to save the same ingredient twice
			ing.plural = 'bay leaves';
			ing.saveIngredient();
			try {
				ingredients = JSON.parse(fs.readFileSync('tests/data/ingredients.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading ingredients.json');
			}
			expect((ingredients.length - numIngredients)).to.equal(0);

			// should be allowed to save subsequent ingredients on different ingredients
			const ing2 = new Ingredient('sugar');
			ing2.saveIngredient();
			foundIngredient = false;

			try {
				ingredients = JSON.parse(fs.readFileSync('tests/data/ingredients.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading ingredients.json');
			}

			for (let ing of ingredients) {
				if (ing.name === 'sugar') { foundIngredient = true; }
			}
			expect(foundIngredient).to.be.true;
			expect((ingredients.length - numIngredients)).to.equal(1);

			ing = new Ingredient('potato');
			let related = new Map();
			related.set('yam', null);
			ing.relatedIngredients = related;

			// if we save our ingredient 'potato', with a related ingredient of 'yam'
			// we should expect to see not only the yam as a related ingredient to the potato
			// but also 'potato' as a related ingredient of 'yam'
			ing.saveIngredient();
			let yam = ingredientController.findIngredients('name', 'yam')[0];
			let potato = ingredientController.findIngredients('name', 'potato')[0];

			expect(yam.relatedIngredients.size).to.be.equal(1);
			expect(potato.relatedIngredients.size).to.be.equal(1);
		});

		it('[removeIngredient] should remove the Ingredient from the database', function() {
			let ing = new Ingredient('maple syrup');
			ing.saveIngredient();

			let foundIng = ingredientController.findIngredients('name', 'maple syrup');
			expect(foundIng.length).to.equal(1);

			ing.removeIngredient();

			foundIng = ingredientController.findIngredients('name', 'maple syrup');
			expect(foundIng.length).to.equal(0);
		});

		it('[addAlternateName] should add a new alternate name to the set', function() {
			const ing = new Ingredient('new potato');

			// don't allow non-sense
			expect(() => ing.addAlternateName()).to.throw('Invalid alternateNames parameter for Ingredient');
			expect(() => ing.addAlternateName('')).to.throw('Invalid alternateNames parameter for Ingredient');
			expect(() => ing.addAlternateName(NaN)).to.throw('Invalid alternateNames parameter for Ingredient');
			expect(() => ing.addAlternateName(null)).to.throw('Invalid alternateNames parameter for Ingredient');
			expect(() => ing.addAlternateName(123)).to.throw('Invalid alternateNames parameter for Ingredient');

			// don't allow alternate names matching an existing ingredient
			expect(() => ing.addAlternateName('yam')).to.throw('Alternate name is already in use');

			// don't allow alternate names matching an existing ingredient's plural name
			expect(() => ing.addAlternateName('yams')).to.throw('Alternate name is already in use');

			// don't allow alternate names matching an existing ingredient's alternate name
			expect(() => ing.addAlternateName('sweet potato')).to.throw('Alternate name is already in use');

			// allow any other valid, unused string
			ing.addAlternateName('starchy potato');
			expect(ing.alternateNames.size).to.equal(1);
			expect(ing.alternateNames.has('starchy potato')).to.be.true;

			// if matching an existing alt name, de-duplicate
			ing.addAlternateName('starchy potato');
			expect(ing.alternateNames.size).to.be.equal(1);
			expect(ing.alternateNames.has('starchy potato')).to.be.true;

			// don't allow any strings matching the current name of the un-saved ingredient
			expect(() => ing.addAlternateName('new potato')).to.throw('Cannot assign current Ingredient name to alternateNames');

			// if matching the existing plural name, should remove the plural and accept as alt name
			ing.plural = 'new potatoes';
			ing.addAlternateName('new potatoes');
			expect(ing.plural).to.be.null;
			expect(ing.alternateNames.has('new potatoes')).to.be.true;

		});

		it('[removeAlternateName] should remove a given alternate name from the set', function() {
			const ing = new Ingredient('potato');
			ing.alternateNames = new Set([ 'new potatoes' ]);
			expect(ing.alternateNames.has('new potatoes')).to.be.true;
			expect(ing.alternateNames.size).to.equal(1);

			// don't do anything if we don't find a match
			ing.removeAlternateName('non-existing potato');
			expect(ing.alternateNames.size).to.equal(1);

			// remove any matching names
			ing.removeAlternateName('new potatoes');
			expect(ing.alternateNames.size).to.equal(0);
			expect(ing.alternateNames.has('new potatoes')).to.be.false;
		});

		it('[addRelatedIngredient] should add a valid related ingredient to the map', function() {
			const ing = new Ingredient('chicken');

			// don't allow nonsense
			expect(() => ing.addRelatedIngredient()).to.throw('Invalid relatedIngredients parameter for Ingredient');
			expect(() => ing.addRelatedIngredient('')).to.throw('Invalid relatedIngredients parameter for Ingredient');
			expect(() => ing.addRelatedIngredient(NaN)).to.throw('Invalid relatedIngredients parameter for Ingredient');
			expect(() => ing.addRelatedIngredient(null)).to.throw('Invalid relatedIngredients parameter for Ingredient');
			expect(() => ing.addRelatedIngredient(123)).to.throw('Invalid relatedIngredients parameter for Ingredient');

			// if the ingredient doesn't exist, add it
			let thigh = ingredientController.findIngredients('exact', 'chicken thigh');
			expect(thigh.length).to.equal(0);

			ing.addRelatedIngredient('chicken thigh');
			thigh = ingredientController.findIngredients('exact', 'chicken thigh');
			expect(thigh.length).to.equal(1);
			expect(thigh[0].name).to.equal('chicken thigh');
			expect(ing.relatedIngredients.size).to.equal(1);
			let keys = [ ...ing.relatedIngredients.keys() ];
			expect(keys.includes('chicken thigh')).to.be.true;

			// clear out
			ing.relatedIngredients = new Map();

			// if the ingredient exists add it
			let newIng = new Ingredient('chicken wing');
			newIng.saveIngredient();
			newIng = null;
			newIng = ingredientController.findIngredients('exact', 'chicken wing');
			expect(newIng.length).to.equal(1);
			ing.addRelatedIngredient('chicken wing');
			expect(ing.relatedIngredients.size).to.equal(1);
			keys = [ ...ing.relatedIngredients.keys() ];
			expect(keys.includes('chicken wing')).to.be.true;

			// clear out
			ing.relatedIngredients = new Map();

			// if the ingredient already exists in the map, don't duplicate
			ing.addRelatedIngredient('chicken wing');
			expect(ing.relatedIngredients.size).to.equal(1);
			keys = [ ...ing.relatedIngredients.keys() ];
			expect(keys.includes('chicken wing')).to.be.true;
		});

		it('[removeRelatedIngredient] should remove a given related ingredient from the map', function() {
			const ing = new Ingredient('whole wheat flour');
			ing.addRelatedIngredient('flour');
			expect(ing.relatedIngredients.has('flour')).to.be.true;
			expect(ing.relatedIngredients.size).to.equal(1);
			ing.saveIngredient();

			let flour = ingredientController.findIngredients('exact', 'flour')[0];
			expect(flour.relatedIngredients.has('whole wheat flour')).to.be.true;
			expect(flour.relatedIngredients.size).to.equal(1);

			// don't do anything if we don't find a match
			ing.removeRelatedIngredient('non-existing flour');
			expect(ing.relatedIngredients.size).to.equal(1);

			// remove any matching names
			ing.removeRelatedIngredient('flour');
			expect(ing.relatedIngredients.size).to.equal(0);
			expect(ing.relatedIngredients.has('flour')).to.be.false;

			// should not affect our other ingredient relations
			flour = ingredientController.findIngredients('exact', 'flour')[0];
			expect(flour.relatedIngredients.has('whole wheat flour')).to.be.true;
			expect(flour.relatedIngredients.size).to.equal(1);
		});

		it('[addReference] should add a new substitute ingredient to the map', function() {
			const ing = new Ingredient('oil');

			// don't allow nonsense
			expect(() => ing.addSubstitute()).to.throw('Invalid substitutes parameter for Ingredient');
			expect(() => ing.addSubstitute('')).to.throw('Invalid substitutes parameter for Ingredient');
			expect(() => ing.addSubstitute(NaN)).to.throw('Invalid substitutes parameter for Ingredient');
			expect(() => ing.addSubstitute(null)).to.throw('Invalid substitutes parameter for Ingredient');
			expect(() => ing.addSubstitute(123)).to.throw('Invalid substitutes parameter for Ingredient');

			// if the ingredient doesn't exist, add it
			let oil = ingredientController.findIngredients('exact', 'vegetable oil');
			expect(oil.length).to.equal(0);

			ing.addSubstitute('vegetable oil');
			oil = ingredientController.findIngredients('exact', 'vegetable oil');
			expect(oil.length).to.equal(1);
			expect(oil[0].name).to.equal('vegetable oil');
			expect(ing.substitutes.size).to.equal(1);
			let keys = [ ...ing.substitutes.keys() ];
			expect(keys.includes('vegetable oil')).to.be.true;
			// clear out
			ing.substitutes = new Map();

			// if the ingredient exists add it
			let newIng = new Ingredient('canola oil');
			newIng.saveIngredient();
			newIng = null;
			newIng = ingredientController.findIngredients('exact', 'canola oil');
			expect(newIng.length).to.equal(1);
			ing.addSubstitute('canola oil');
			expect(ing.substitutes.size).to.equal(1);
			keys = [ ...ing.substitutes.keys() ];
			expect(keys.includes('canola oil')).to.be.true;

			// clear out
			ing.substitutes = new Map();

			// if the ingredient already exists in the map, don't duplicate
			ing.addSubstitute('canola oil');
			expect(ing.substitutes.size).to.equal(1);
			keys = [ ...ing.substitutes.keys() ];
			expect(keys.includes('canola oil')).to.be.true;
		});

		it('[removeSubstitute] should remove a given substitute ingredient from the map', function() {
			const ing = new Ingredient('apple cider vinegar');
			ing.addSubstitute('vinegar');
			expect(ing.substitutes.has('vinegar')).to.be.true;
			expect(ing.substitutes.size).to.equal(1);
			ing.saveIngredient();

			// don't do anything if we don't find a match
			ing.removeSubstitute('non-existing vinegar');
			expect(ing.substitutes.size).to.equal(1);

			// remove any matching names
			ing.removeSubstitute('vinegar');
			expect(ing.substitutes.size).to.equal(0);
			expect(ing.substitutes.has('vinegar')).to.be.false;
		});

		it('[addReference] should add a new recipe reference to the map', function() {
			const ing = new Ingredient('chicken');

			// setup a recipe
			const recipe = new Recipe();
			recipe.saveRecipe();

			// don't allow nonsense
			expect(() => ing.addReference()).to.throw('Invalid reference parameter for Ingredient');
			expect(() => ing.addReference('')).to.throw('Invalid reference parameter for Ingredient');
			expect(() => ing.addReference(NaN)).to.throw('Invalid reference parameter for Ingredient');
			expect(() => ing.addReference(null)).to.throw('Invalid reference parameter for Ingredient');
			expect(() => ing.addReference(123)).to.throw('Invalid reference parameter for Ingredient');

			// don't add a line without an id
			ing.addReference('1 cup shredded chicken', null);
			expect(ing.references.size).to.equal(0);

			// add valid recipe line reference
			ing.addReference('1 cup shredded chicken', recipe.recipeID);
			expect(ing.references.size).to.equal(1);
			keys = [ ...ing.references.keys() ];
			expect(keys.includes('1 cup shredded chicken')).to.be.true;

			// don't allow duplicate lines from the same recipe
			ing.addReference('1 cup shredded chicken', recipe.recipeID);
			expect(ing.references.size).to.equal(1);
			keys = [ ...ing.references.keys() ];
			expect(keys.includes('1 cup shredded chicken')).to.be.true;
		});

		it('[removeReference] should remove a given recipe reference from the map', function() {
			const ing = new Ingredient('apple cider vinegar');

			// setup a recipe
			const recipe = new Recipe();
			recipe.saveRecipe();

			ing.addReference('splash apple ciper vinegar', recipe.recipeID);
			expect(ing.references.has('splash apple ciper vinegar')).to.be.true;
			expect(ing.references.size).to.equal(1);
			ing.saveIngredient();

			// don't do anything if we don't find a match
			ing.removeReference('non-existing vinegar line', recipe.recipeID);
			expect(ing.references.size).to.equal(1);

			// remove any matching names
			ing.removeReference('splash apple ciper vinegar', recipe.recipeID);
			expect(ing.references.size).to.equal(0);
			expect(ing.references.has('splash apple ciper vinegar')).to.be.false;
		});
	});
});