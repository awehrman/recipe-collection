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

/**

	TODO:
	- more type checking on passing an encoded ingredient into the constructor when fields are missing
	- should only create a new Ingredient when the name is not used on any other ingredients
	- additional tests for:
		- related ingredients
		- substitutes (convert to map)
		- references (convert to map)
	- when a name is updated to be a name referenced on the ingredient's relatedIngredients or substitutes sets,
		we need to trigger a merger with those records, come back to how this needs to be handled internally
	- adjust alternate names and parsing expressions to receive an object with singular/plural values
	- should alternateNames/parsingExprsesions be WeakSets? And related, substitutes, references WeakMaps?
		is this any down-side there? I'd like to run some heap dumps to really walk through this

 */


//undefined, '', NaN, null, 123, { key: value }


describe('Ingredient Class ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'ingredients' ];

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
			//console.log(ing.getIngredient());

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
			expect(ing.parsingExpressions).to.be.empty;
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
			  parsingExpressions: [ 'flour for dusting' ],
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
			expect(decoded.parsingExpressions.has('flour for dusting')).to.be.true;
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
				ing.parentIngredientID = null;
			}).to.throw('Invalid parentIngredientID parameter for Ingredient');
			expect(() => {
				ing.parentIngredientID = 123;
			}).to.throw('Invalid parentIngredientID parameter for Ingredient');
			expect(() => {
				ing.parentIngredientID = { parentIngredientID: 123 };
			}).to.throw('Invalid parentIngredientID parameter for Ingredient');

			ing.parentIngredientID = "33db8400-3b65-11e8-91fe-f38e2e77f95e";
			expect(ing.parentIngredientID).to.equal("33db8400-3b65-11e8-91fe-f38e2e77f95e");
		});

		it('[dateCreated] should be read only', function() {
			const ing = new Ingredient('potato');
			expect(ing.dateCreated).to.exist;
			expect(ing.dateCreated.isValid()).to.be.true;

			expect(() => {
				ing.dateCreated = moment();
			}).to.throw('Updating dateCreated is not allowed');
		});

		it('[dateUpdated] should update with a valid datestamp AND anytime another Ingredient property is updated', function() {
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

			ing.parsingExpressions = new Set(['small fingerling potato']);
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			const related = new Map();
			related.set('yukon gold potato', '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5');
			ing.relatedIngredients = related;
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			ing.substitutes = new Set([{ ingredientID: '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5', name: 'yukon gold potato' }]);
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			ing.references = new Set([{ recipeID: '2aeb6dfc-a232-5d8b-a70b-7d13b1b9afd4', name: '2 fingerling potatoes' }]);
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			//
			ing.isValidated = true;
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			//console.log(ing.getIngredient());
		});

		it('[name] should update with a valid string', function() {
			const ing = new Ingredient('potato');

			ing.plural = 'potatoes';
			ing.alternateNames = new Set(['spuds']);
			ing.parsingExpressions = new Set(['small potatoes']);

			// if 'name' gets updated to a value associated with a related or substitute, then this needs to trigger a merge
			const related = new Map();
			related.set('yukon gold potato', '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5');
			ing.relatedIngredients = related;

			ing.substitutes = new Set([{ ingredientID: '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd6', name: 'yam' }]);

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

			// name: spuds => small potatoes
			// needs to remove 'small potatoes' from parsing expressions
			ing.name = 'small potatoes';
			expect(ing.name).to.equal('small potatoes');
			expect(ing.parsingExpressions).to.be.empty;
			expect(ing.alternateNames.has('potato')).to.be.true;
			expect(ing.alternateNames.has('potatoes')).to.be.true;
			expect(ing.alternateNames.has('spuds')).to.be.true;
			expect(ing.alternateNames.size).to.equal(3); // { 'potato', 'potatoes', 'spuds' }
			//console.log(ing.getIngredient());

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
			ing.parsingExpressions = new Set(['small potatoes']);

			// TODO hmmm...
			const related = new Map();
			related.set('yukon gold potato', '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5');
			ing.relatedIngredients = related;

			ing.substitutes = new Set([{ ingredientID: '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd6', name: 'yam' }]);

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

			// plural: spuds => small potatoes
			// needs to remove 'small potatoes' from parsing expressions, and re-add spuds to alt names
			ing.plural = 'small potatoes';
			expect(ing.parsingExpressions).to.be.empty;
			expect(ing.alternateNames.has('potatoes')).to.be.true;
			expect(ing.alternateNames.has('spuds')).to.be.true;
			expect(ing.alternateNames.size).to.equal(2);

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
				ing.plural = null;
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

		it('[alternateNames] should update with a valid string', function() {
			const ing = new Ingredient('potato');
			// if the value is the same as the name
			// don't allow it, because we can't leave the name empty
			expect(() => {
				ing.alternateNames = new Set(['potato']);
			}).to.throw('Cannot assign current Ingredient name to alternateNames');

			// if the value is the same as the plural
			// remove the plural
			// add it to alt name
			ing.plural = 'potatoes';
			ing.alternateNames = new Set(['potatoes']);
			expect(ing.alternateNames.has('potatoes')).to.be.true;
			expect(ing.alternateNames.size).to.equal(1);
			expect(ing.plural).to.be.null;

			// if the value is the same as an instance within parsing expressions
			// remove the parse exp
			// add it ot the alt name
			ing.parsingExpressions = new Set(['small potatoes']);
			expect(ing.parsingExpressions.has('small potatoes')).to.be.true;
			expect(ing.parsingExpressions.size).to.equal(1);

			ing.alternateNames = new Set(['small potatoes']);
			expect(ing.plural).to.be.null;
			expect(ing.alternateNames.has('small potatoes')).to.be.true;
			expect(ing.alternateNames.size).to.equal(1);
			expect(ing.parsingExpressions.has('small potatoes')).to.be.false;
			expect(ing.parsingExpressions.size).to.equal(0);

			// if the value is already in the alt names
			// it should de-duplicate
			ing.alternateNames = new Set(['potatoes', 'potatoes']);
			expect(ing.alternateNames.has('potatoes')).to.be.true;
			expect(ing.alternateNames.size).to.equal(1);

			// TODO come back to handling relatedIngredient matches
			// TODO come back to handling substitute matches

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
		});

		it('[parsingExpressions] should update with a valid string', function() {
			const ing = new Ingredient('potato');
			// if the value is the same as the name
			// don't allow it, because we can't leave the name empty
			expect(() => {
				ing.parsingExpressions = new Set(['potato']);
			}).to.throw('Cannot assign current Ingredient name to parsingExpressions');

			// if the value is the same as the plural
			// remove the plural
			// add it to alt name
			ing.plural = 'potatoes';
			ing.parsingExpressions = new Set(['potatoes']);
			expect(ing.parsingExpressions.has('potatoes')).to.be.true;
			expect(ing.parsingExpressions.size).to.equal(1);
			expect(ing.plural).to.be.null;

			// if the value is the same as an instance within parsing expressions
			// remove the parse exp
			// add it ot the alt name
			ing.alternateNames = new Set(['spuds']);
			expect(ing.alternateNames.has('spuds')).to.be.true;
			expect(ing.alternateNames.size).to.equal(1);

			ing.parsingExpressions = new Set(['spuds']);
			expect(ing.plural).to.be.null;
			expect(ing.parsingExpressions.has('spuds')).to.be.true;
			expect(ing.parsingExpressions.size).to.equal(1);
			expect(ing.alternateNames.has('spuds')).to.be.false;
			expect(ing.alternateNames.size).to.equal(0);

			// if the value is already in the alt names
			// it should de-duplicate
			ing.parsingExpressions = new Set(['potatoes', 'potatoes']);
			expect(ing.parsingExpressions.has('potatoes')).to.be.true;
			expect(ing.parsingExpressions.size).to.equal(1);

			// TODO come back to handling relatedIngredient matches
			// TODO come back to handling substitute matches

			ing.parsingExpressions = new Set([ undefined ]);
			expect(ing.parsingExpressions.size).to.equal(0);
			ing.parsingExpressions = new Set([ '' ]);
			expect(ing.parsingExpressions.size).to.equal(0);
			ing.parsingExpressions = new Set([ NaN ]);
			expect(ing.parsingExpressions.size).to.equal(0);
			ing.parsingExpressions = new Set([ null ]);
			expect(ing.parsingExpressions.size).to.equal(0);
			ing.parsingExpressions = new Set([ 123 ]);
			expect(ing.parsingExpressions.size).to.equal(0);
			ing.parsingExpressions = new Set([ { name: 'small potatoes' } ]);
			expect(ing.parsingExpressions.size).to.equal(0);

			expect(() => {
				ing.parsingExpressions = undefined;
			}).to.throw('Invalid parsingExpressions parameter for Ingredient');
			expect(() => {
				ing.parsingExpressions = '';
			}).to.throw('Invalid parsingExpressions parameter for Ingredient');
			expect(() => {
				ing.parsingExpressions = NaN;
			}).to.throw('Invalid parsingExpressions parameter for Ingredient');
			expect(() => {
				ing.parsingExpressions = null;
			}).to.throw('Invalid parsingExpressions parameter for Ingredient');
			expect(() => {
				ing.parsingExpressions = 123;
			}).to.throw('Invalid parsingExpressions parameter for Ingredient');
			expect(() => {
				ing.parsingExpressions = { name: 'spud' };
			}).to.throw('Invalid parsingExpressions parameter for Ingredient');
			expect(() => {
				ing.parsingExpressions = 'spud';
			}).to.throw('Invalid parsingExpressions parameter for Ingredient');
		});

		it('[relatedIngredients] should update with a valid Ingredient reference', function() {
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

			// if we pass a null ingredientID
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


			// if we pass in an ingredientID that doesn't exist in our database
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
			reset();

			// update our yam ingredient with a plural value
			let yam = ingredientController.findIngredients('name', 'yam')[0];
			yam.plural = 'yams';
			yam.alternateNames = new Set([ 'sweet potato' ]);
			yam.parsingExpressions = new Set([ 'diced yams' ]);
			yam.saveIngredient();

			// if we pass in an ingredientID that doesn't exist in our database
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
			related.set('diced yams', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // ID DOESN'T EXIST - ONE ALT NAME MATCH
			ing.relatedIngredients = related;
			console.log(ing.relatedIngredients);
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
/*
			// if we...
			related.set('yam', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // DOESN'T EXIST
			related.set('yam', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b3'); // DOESN'T EXIST
			ing.relatedIngredients = related;
			refreshArrays();
			// TODO expects
			expect('allie to finish writing tests').to.be.true;

			reset();

			// if we...
			related.set('yam', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b2'); // EXISTS
			related.set('yam', 'dcbaa4a0-3aae-11e8-842e-95ab6a86b1b3'); // DOESN'T EXIST
			ing.relatedIngredients = related;
			refreshArrays();
			// TODO expects
			expect('allie to finish writing tests').to.be.true;

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

			// should ignore any entries with bad name values
			related.set('yam', undefined);
			ing.relatedIngredients = related;
			expect(ing.relatedIngredients).to.be.empty;
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
*/
		});

		it.skip('[substitutes] should update with a valid Ingredient reference', function() {
			const ing = new Ingredient('potato');

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
		});

		it.skip('[references] should update with a valid Recipe reference', function() {
			const ing = new Ingredient('potato');

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
				ing.references = { name: 'spud' };
			}).to.throw('Invalid references parameter for Ingredient');
			expect(() => {
				ing.references = 'spud';
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
		it('[getIngredient] should return all Ingredient properties on a given ingredient', function() {
			let ing = new Ingredient('potato');
			let response = ing.getIngredient();

			expect(response.hasOwnProperty('ingredientID')).to.be.true;
			expect(response.hasOwnProperty('parentIngredientID')).to.be.true;
			expect(response.hasOwnProperty('dateCreated')).to.be.true;
			expect(response.hasOwnProperty('dateUpdated')).to.be.true;
			expect(response.hasOwnProperty('name')).to.be.true;
			expect(response.hasOwnProperty('plural')).to.be.true;
			expect(response.hasOwnProperty('properties')).to.be.true;
			expect(response.hasOwnProperty('alternateNames')).to.be.true;
			expect(response.hasOwnProperty('parsingExpressions')).to.be.true;
			expect(response.hasOwnProperty('relatedIngredients')).to.be.true;
			expect(response.hasOwnProperty('substitutes')).to.be.true;
			expect(response.hasOwnProperty('references')).to.be.true;
			expect(response.hasOwnProperty('isValidated')).to.be.true;
		});

		it('[encodeIngredient] should convert the Ingredient to a JSON friendly format', function() {
			let ing = new Ingredient('potato');
			let encoded = ing.encodeIngredient();

			expect(typeof encoded).to.be.equal('object');
			expect(Array.isArray(encoded.alternateNames)).to.be.true;
			expect(Array.isArray(encoded.parsingExpressions)).to.be.true;
			expect(Array.isArray(encoded.relatedIngredients)).to.be.true;
			expect(Array.isArray(encoded.substitutes)).to.be.true;
			expect(Array.isArray(encoded.references)).to.be.true;
		});

		it('[saveIngredient] should save an ingredient to the database', function() {
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

			const ing = new Ingredient('bay leaf');
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

		});

		it.skip('TODO: addAlternateName()', function() {

		});

		it.skip('TODO: removeAlternateName()', function() {

		});

		it.skip('TODO: addParsingExpression()', function() {

		});

		it.skip('TODO: removeParsingExpression()', function() {

		});

		it.skip('TODO: addRelatedIngredient()', function() {

		});

		it.skip('TODO: removeRelatedIngredient()', function() {

		});

		it.skip('TODO: addSubstitute()', function() {

		});

		it.skip('TODO: removeSubstitute()', function() {

		});

		it.skip('TODO: addReference()', function() {

		});

		it.skip('TODO: removeReference()', function() {

		});
	});
});