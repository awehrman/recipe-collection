const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const colors = require('colors');
const expect = require('chai').expect;
const moment = require('moment');

const server = require('../../app');
const Ingredient = require('../../models/ingredientModel');

/**

	TODO:
	- should only create a new Ingredient when the name is not used on any other ingredients
	- additional tests for:
		- alt names
		- parsing expressions
		- related ingredients
		- substitutes
		- references

		- isRootIngredient
		- isValidated
	- when a name is updated to be a name referenced on the ingredient's relatedIngredients or substitutes sets,
		we need to trigger a merger with those records, come back to how this needs to be handled internally
	- flesh out type checking
	- adjust alternate names and parsing expressions to receive an object with singular/plural values
 */


describe('Ingredient Class ============================================='.magenta, function () {
	describe('Getters / Setters ============================================='.magenta, function () {
		it('[constructor] should create a new instance of Ingredient', function() {
			expect(() => new Ingredient()).to.throw('Invalid name parameter for Ingredient');
			expect(() => new Ingredient('')).to.throw('Invalid name parameter for Ingredient');
			expect(() => new Ingredient(null)).to.throw('Invalid name parameter for Ingredient');
			expect(() => new Ingredient(undefined)).to.throw('Invalid name parameter for Ingredient');

			const ing = new Ingredient('potato');
			//console.log(ing.getIngredient());

			expect(ing.ingredientID).to.exist;
			expect(ing.parentIngredientID).to.be.null;
			expect(ing.dateCreated).to.exist;
			expect(moment.isMoment(ing.dateCreated)).to.be.equal(true);
			expect(ing.dateUpdated).to.exist;
			expect(moment.isMoment(ing.dateUpdated)).to.be.equal(true);

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

			expect(ing.isRootIngredient).to.be.true;
			expect(ing.isValidated).to.be.false;
		});

		it('[ingredientID] should update with a valid UUID', function() {
			const ing = new Ingredient('potato');

			expect(() => {
				ing.ingredientID = '';
			}).to.throw('Invalid ingredientID parameter for Ingredient');
			expect(() => {
				ing.ingredientID = null;
			}).to.throw('Invalid ingredientID parameter for Ingredient');
			expect(() => {
				ing.ingredientID = 123;
			}).to.throw('Invalid ingredientID parameter for Ingredient');

			ing.ingredientID = "33db8400-3b65-11e8-91fe-f38e2e77f95e";
			expect(ing.ingredientID).to.equal("33db8400-3b65-11e8-91fe-f38e2e77f95e");
		});

		it('[parentIngredientID] should update with a valid UUID', function() {
			const ing = new Ingredient('potato');

			expect(() => {
				ing.parentIngredientID = '';
			}).to.throw('Invalid parentIngredientID parameter for Ingredient');
			expect(() => {
				ing.parentIngredientID = null;
			}).to.throw('Invalid parentIngredientID parameter for Ingredient');
			expect(() => {
				ing.parentIngredientID = 123;
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
				ing.dateUpdated = '';
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

			ing.relatedIngredients = new Set([{ ingredientID: '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5', name: 'yukon gold potato' }]);
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			ing.substitutes = new Set([{ ingredientID: '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5', name: 'yukon gold potato' }]);
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			ing.references = new Set([{ recipeID: '2aeb6dfc-a232-5d8b-a70b-7d13b1b9afd4', name: '2 fingerling potatoes' }]);
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

			//
			ing.isRootIngredient = true;
			expect(initialDate).to.not.equal(ing.dateUpdated);
			initialDate = ing.dateUpdated;

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
			ing.relatedIngredients = new Set([{ ingredientID: '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5', name: 'yukon gold potato' }]);
			ing.substitutes = new Set([{ ingredientID: '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd6', name: 'yam' }]);

			// name: potato => potatoes
			// needs to move 'potatoes' from plural to alt names
			ing.name = 'potatoes';
			expect(ing.name).to.equal('potatoes');
			expect(ing.plural).to.be.equal(null);
			expect(ing.alternateNames.has('potato')).to.be.true;
			expect(ing.alternateNames.has('spuds')).to.be.true;
			expect(ing.alternateNames.size).to.be.equal(2); // { 'spuds', 'potato' }

			// name: potatoes => spuds
			// needs to remove 'spuds' from alt names and move 'potatoes' to alt names
			ing.name = 'spuds';
			expect(ing.name).to.equal('spuds');
			expect(ing.alternateNames.has('potato')).to.be.true;
			expect(ing.alternateNames.has('potatoes')).to.be.true;
			expect(ing.alternateNames.size).to.be.equal(2); // { 'potato', 'potatoes' }

			// name: spuds => small potatoes
			// needs to remove 'small potatoes' from parsing expressions
			ing.name = 'small potatoes';
			expect(ing.name).to.equal('small potatoes');
			expect(ing.parsingExpressions).to.be.empty;
			expect(ing.alternateNames.has('potato')).to.be.true;
			expect(ing.alternateNames.has('potatoes')).to.be.true;
			expect(ing.alternateNames.has('spuds')).to.be.true;
			expect(ing.alternateNames.size).to.be.equal(3); // { 'potato', 'potatoes', 'spuds' }
			//console.log(ing.getIngredient());

			// name: potato => yukon gold potato
			// TODO ??? this signals a merger... come back to this

			// name: potato => yam
			// TODO ??? this signals a merger... come back to this
		});

		it('[plural] should update with a valid string', function() {
			const ing = new Ingredient('potato');

			ing.plural = 'potatoes';
			ing.alternateNames = new Set(['spuds']);
			ing.parsingExpressions = new Set(['small potatoes']);

			// TODO hmmm...
			ing.relatedIngredients = new Set([{ ingredientID: '3aeb6dfc-a232-4d8b-a70b-7d13b1b9afd5', name: 'yukon gold potato' }]);
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
			expect(ing.alternateNames.size).to.be.equal(1);

			// plural: spuds => small potatoes
			// needs to remove 'small potatoes' from parsing expressions, and re-add spuds to alt names
			ing.plural = 'small potatoes';
			expect(ing.parsingExpressions).to.be.empty;
			expect(ing.alternateNames.has('potatoes')).to.be.true;
			expect(ing.alternateNames.has('spuds')).to.be.true;
			expect(ing.alternateNames.size).to.be.equal(2);
		});

		it('[properties] should update with a valid object containing one or more matching property values', function() {
			const ing = new Ingredient('potato');

			// should throw an error if properties object is empty or invalid
			expect(() => {
				ing.properties = null;
			}).to.throw('Invalid properties object');
			expect(() => {
				ing.properties = '';
			}).to.throw('Invalid properties object');
			expect(() => {
				ing.properties = undefined;
			}).to.throw('Invalid properties object');

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
		});

		it.skip('[alternateNames] should update with a valid string', function() {
			// if the alt name is some non-string or empty (null, undefined, NaN, 123)
			// don't accept it

			// if the value is the same as the name
			// don't allow it, because we can't leave the name empty

			// if the value is the same as the plural
			// remove the plural
			// add it to alt name

			// if the value is the same as an instance within parsing expressions
			// remove the parse exp
			// add it ot the alt name

			// if the value is already in the alt names
			// it should de-duplicate

			// TODO come back to handling relatedIngredient matches
			// TODO come back to handling substitute matches

			// otherwise just accept the alt name

		});

		it.skip('[parsingExpressions] should update with a valid string', function() {
			// if the parsing exp is some non-string or empty (null, undefined, NaN, 123)
			// don't accept it

			// if the value is the same as the name
			// don't allow it, because we can't leave the name empty

			// if the value is the same as the plural
			// remove the plural
			// add it to parsing exp

			// if the value is the same as an instance within alternate names
			// remove the parse exp
			// add it ot the parsing exp

			// if the value is already in the parsing exps
			// it should de-duplicate

			// TODO come back to handling relatedIngredient matches
			// TODO come back to handling substitute matches

			// otherwise just accept the parsing exp
		});

		it.skip('[relatedIngredients] should update with a valid Ingredient reference', function() {

		});

		it.skip('[substitutes] should update with a valid Ingredient reference', function() {

		});

		it.skip('[references] sshould update with a valid Recipe reference', function() {

		});

		it.skip('[isRootIngredient] should update with a true/false value', function() {

		});

		it.skip('[isValidated] should update with a true/false value', function() {

		});
	});

	describe('Ingredient Methods ============================================='.magenta, function () {
		it.skip('TODO: getIngredient()', function() {

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